#!/usr/bin/env python3
"""
Planning Analytics MCP Server
Exposes TM1/PA cube data as MCP tools consumable by watsonx Orchestrate agents.

Usage (stdio — default for Claude Desktop / WxO):
    python pa_mcp_server.py

Usage (SSE — for remote WxO agent connections):
    python pa_mcp_server.py --transport sse --port 8090

Environment (loaded from planning-analytics/.env):
    TM1_ADDRESS, TM1_PORT, TM1_USER, TM1_PASSWORD, TM1_SSL, TM1_NAMESPACE, TM1_TIMEOUT
"""

import os
from pathlib import Path
from typing import Any

import pandas as pd
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from TM1py import TM1Service
from TM1py.Utils import Utils

# ─── Environment ───────────────────────────────────────────────────────────────
load_dotenv(Path(__file__).parent / ".env")


def _bool(name: str, default: bool = False) -> bool:
    v = os.getenv(name)
    return default if v is None else v.strip().lower() in {"true", "1", "yes"}

TM1_CONFIG = {
    "address":  "jp-tok.services.cloud.techzone.ibm.com",
    "port":      38631,
    "user":     "pm",
    "password":  "IBMDem0s",
    "ssl":       False,
    "namespace": "Harmony LDAP",
    "timeout":   120,
    "verify":    False,
}

MAX_ROWS = int(os.getenv("MAX_RETURN_ROWS", "50"))

# ─── MCP Server ────────────────────────────────────────────────────────────────
mcp = FastMCP(
    name="Planning Analytics",
    instructions=(
        "Tools for querying IBM Planning Analytics (TM1) cubes. "
        "Use list_cubes to discover available cubes, list_views to see "
        "available views per cube, then query_cube or execute_mdx to retrieve data. "
        "The demo contains four cubes: FinancialPerformance, ProductionKPI, "
        "CapexPlanning, and CashFlow — all covering Ironfield Resources FY26 planning data."
    ),
)

# ─── Helpers ───────────────────────────────────────────────────────────────────

def _cellset_to_df(cellset: dict[Any, Any]) -> pd.DataFrame:
    df = Utils.build_pandas_dataframe_from_cellset(cellset)
    df = df.reset_index()
    if "Values" in df.columns and "Value" not in df.columns:
        df = df.rename(columns={"Values": "Value"})
    return df


def _df_to_records(df: pd.DataFrame, top_n: int) -> tuple[list[dict], int]:
    total = len(df)
    df = df.head(min(top_n, MAX_ROWS))
    df = df.where(pd.notnull(df), None)
    return df.to_dict(orient="records"), total


# ─── Tools ─────────────────────────────────────────────────────────────────────

@mcp.tool()
def list_cubes() -> dict[str, Any]:
    """
    List all business cubes available in Planning Analytics.
    Returns cube names (system cubes starting with } are excluded).
    """
    with TM1Service(**TM1_CONFIG) as tm1:
        names = [n for n in tm1.cubes.get_all_names() if not n.startswith("}")]
    return {"cube_count": len(names), "cubes": names}


@mcp.tool()
def list_views(cube_name: str) -> dict[str, Any]:
    """
    List all public views defined for a cube.

    Args:
        cube_name: Exact TM1 cube name, e.g. "FinancialPerformance"
    """
    with TM1Service(**TM1_CONFIG) as tm1:
        _, public_views = tm1.cubes.views.get_all_names(cube_name=cube_name)
    return {"cube": cube_name, "view_count": len(public_views), "views": public_views}


@mcp.tool()
def get_cube_dimensions(cube_name: str) -> dict[str, Any]:
    """
    Return the ordered list of dimensions for a cube.
    Useful before writing MDX or understanding what filters are available.

    Args:
        cube_name: Exact TM1 cube name.
    """
    with TM1Service(**TM1_CONFIG) as tm1:
        cube = tm1.cubes.get(cube_name)
    return {"cube": cube_name, "dimensions": cube.dimensions}


@mcp.tool()
def get_dimension_elements(
    dimension_name: str,
    hierarchy_name: str | None = None,
    element_type: str | None = None,
) -> dict[str, Any]:
    """
    Return elements from a dimension hierarchy.
    Useful for knowing valid filter values before querying.

    Args:
        dimension_name: Dimension name, e.g. "Account", "Version", "Period".
        hierarchy_name: Hierarchy name (defaults to same as dimension_name).
        element_type:   Filter by element type — "Numeric", "Consolidated", or None for all.
    """
    hier = hierarchy_name or dimension_name
    with TM1Service(**TM1_CONFIG) as tm1:
        elements = tm1.elements.get_elements(
            dimension_name=dimension_name,
            hierarchy_name=hier,
        )

    result = []
    for el in elements:
        if element_type and el.element_type.name.lower() != element_type.lower():
            continue
        result.append({"name": el.name, "type": el.element_type.name})

    return {
        "dimension": dimension_name,
        "hierarchy": hier,
        "element_count": len(result),
        "elements": result,
    }


@mcp.tool()
def query_cube(
    cube_name: str,
    view_name: str | None = None,
    filter_expr: str | None = None,
    sort_by: str | None = None,
    sort_order: str = "desc",
    top_n: int = 20,
) -> dict[str, Any]:
    """
    Query a TM1 cube via a named public view. Supports pandas-style filtering and sorting.

    Args:
        cube_name:   Exact cube name, e.g. "FinancialPerformance".
        view_name:   Public view name. If omitted, the first available view is used.
        filter_expr: pandas DataFrame.query() expression, e.g.
                     "Version == 'Actual' and Value > 1000"
                     "Account in ['Gold Revenue', 'AISC'] and Period == 'FY26-Q1'"
        sort_by:     Column name to sort by, typically "Value".
        sort_order:  "asc" or "desc" (default "desc").
        top_n:       Max rows to return (capped at server MAX_RETURN_ROWS).

    Returns:
        columns, row_count, returned_row_count, data (list of records).
    """
    with TM1Service(**TM1_CONFIG) as tm1:
        # Resolve view
        _, public_views = tm1.cubes.views.get_all_names(cube_name=cube_name)
        if not public_views:
            return {"error": f"No public views found for cube '{cube_name}'."}

        target_view = view_name if view_name in public_views else public_views[0]
        cellset = tm1.cubes.cells.execute_view(cube_name, target_view, private=False)

    df = _cellset_to_df(cellset)

    filter_error = None
    if filter_expr and filter_expr.strip():
        try:
            df = df.query(filter_expr)
        except Exception as exc:
            filter_error = str(exc)

    if sort_by and sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=(sort_order.lower() == "asc"), na_position="last")

    records, total = _df_to_records(df, top_n)
    return {
        "cube": cube_name,
        "view": target_view,
        "filter_error": filter_error,
        "columns": list(df.columns),
        "row_count": total,
        "returned_row_count": len(records),
        "data": records,
    }


@mcp.tool()
def execute_mdx(
    mdx: str,
    top_n: int = 50,
    skip_zeros: bool = True,
) -> dict[str, Any]:
    """
    Execute a native TM1 MDX query against Planning Analytics.
    Use this for precise cross-dimensional queries that view-based filtering cannot express.

    MDX quick reference for this PA instance:
      - Cubes: FinancialPerformance, ProductionKPI, CapexPlanning, CashFlow
      - Dimensions (FinancialPerformance): [Version], [Period], [Account]
      - Dimensions (ProductionKPI): [Version], [Period], [Source], [KPI]
      - Dimensions (CapexPlanning): [Version], [Period], [CapexCategory]
      - Dimensions (CashFlow): [Version], [Period], [CashFlowLine]

    Example — quarterly P&L Actual vs Budget:
      SELECT
        {[Account].[Gold Revenue],[Account].[Copper Revenue],
         [Account].[Mining Costs],[Account].[Processing Costs]}
        ON ROWS,
        CROSSJOIN(
          {[Version].[Actual],[Version].[Budget]},
          {[Period].[FY26-Q1],[Period].[FY26-Q2]}
        ) ON COLUMNS
      FROM [FinancialPerformance]

    Example — AISC by quarter:
      SELECT
        {[KPI].[AISC]} ON ROWS,
        CROSSJOIN(
          {[Version].[Actual],[Version].[Budget]},
          {[Period].[FY26-Q1],[Period].[FY26-Q2]}
        ) ON COLUMNS
      FROM [ProductionKPI]
      WHERE ([Source].[Total Kalgara])

    Args:
        mdx:        Full MDX SELECT statement.
        top_n:      Max rows to return (capped at server MAX_RETURN_ROWS).
        skip_zeros: Suppress zero-value cells (default True).
    """
    with TM1Service(**TM1_CONFIG) as tm1:
        cellset = tm1.cells.execute_mdx(
            mdx=mdx,
            top=min(top_n, MAX_ROWS),
            skip_zeros=skip_zeros,
        )

    df = _cellset_to_df(cellset)
    if df.empty:
        return {"columns": [], "row_count": 0, "returned_row_count": 0, "data": []}

    records, total = _df_to_records(df, top_n)
    return {
        "columns": list(df.columns),
        "row_count": total,
        "returned_row_count": len(records),
        "data": records,
    }


@mcp.tool()
def get_financial_summary(
    version: str = "Actual",
    period: str | None = None,
) -> dict[str, Any]:
    """
    Retrieve the P&L summary for a given version and period (or all periods).
    Returns Revenue, Cost of Sales, Gross Profit, EBIT, NPAT, and EBITDA lines.

    Args:
        version: Planning version — "Actual", "Budget", "Latest Forecast", or "Last Year".
        period:  Quarter to filter to, e.g. "FY26-Q1". If omitted returns all quarters.
    """
    key_accounts = [
        "Gold Revenue", "Copper Revenue", "Silver & Other Revenue",
        "Mining Costs", "Processing Costs", "Site Services",
        "Depreciation & Amort.", "Exploration Expense", "Corporate G&A",
        "Finance Income", "Finance Costs", "Income Tax Expense",
    ]
    account_set = "{" + ",".join(f"[Account].[{a}]" for a in key_accounts) + "}"

    if period:
        period_set = f"{{[Period].[{period}]}}"
    else:
        period_set = (
            "{[Period].[FY26-Q1],[Period].[FY26-Q2],"
            "[Period].[FY26-Q3],[Period].[FY26-Q4]}"
        )

    mdx = f"""
    SELECT
      {account_set} ON ROWS,
      {period_set} ON COLUMNS
    FROM [FinancialPerformance]
    WHERE ([Version].[{version}])
    """

    with TM1Service(**TM1_CONFIG) as tm1:
        cellset = tm1.cells.execute_mdx(mdx=mdx, skip_zeros=False)

    df = _cellset_to_df(cellset)
    if df.empty:
        return {"version": version, "period": period, "data": []}

    df = df.where(pd.notnull(df), None)
    return {
        "version": version,
        "period": period or "all quarters",
        "columns": list(df.columns),
        "data": df.to_dict(orient="records"),
    }


@mcp.tool()
def get_production_summary(
    version: str = "Actual",
    period: str | None = None,
) -> dict[str, Any]:
    """
    Retrieve key production KPIs for a given version and period.
    Covers Gold Produced, AISC, C1 Cash Cost, Ore Milled, Au Recovery, and Gold Revenue.

    Args:
        version: Planning version — "Actual", "Budget", "Latest Forecast", or "Last Year".
        period:  Quarter, e.g. "FY26-Q1". If omitted returns all quarters.
    """
    key_kpis = [
        "Gold Produced", "Copper Produced",
        "Ore Milled", "Mill Head Grade — Au", "Au Recovery",
        "AISC", "C1 Cash Cost",
        "Avg Realised Gold Price", "Avg Realised Copper Price",
    ]
    kpi_set = "{" + ",".join(f"[KPI].[{k}]" for k in key_kpis) + "}"

    if period:
        period_set = f"{{[Period].[{period}]}}"
    else:
        period_set = (
            "{[Period].[FY26-Q1],[Period].[FY26-Q2],"
            "[Period].[FY26-Q3],[Period].[FY26-Q4]}"
        )

    mdx = f"""
    SELECT
      {kpi_set} ON ROWS,
      {period_set} ON COLUMNS
    FROM [ProductionKPI]
    WHERE ([Version].[{version}],[Source].[Total Kalgara])
    """

    with TM1Service(**TM1_CONFIG) as tm1:
        cellset = tm1.cells.execute_mdx(mdx=mdx, skip_zeros=False)

    df = _cellset_to_df(cellset)
    if df.empty:
        return {"version": version, "period": period, "data": []}

    df = df.where(pd.notnull(df), None)
    return {
        "version": version,
        "period": period or "all quarters",
        "columns": list(df.columns),
        "data": df.to_dict(orient="records"),
    }


@mcp.tool()
def get_capex_summary(
    version: str = "Actual",
    period: str | None = None,
) -> dict[str, Any]:
    """
    Retrieve capital expenditure by project and category.

    Args:
        version: Planning version — "Actual", "Budget", or "Latest Forecast".
        period:  Quarter, e.g. "FY26-Q1". If omitted returns all quarters.
    """
    if period:
        period_set = f"{{[Period].[{period}]}}"
    else:
        period_set = (
            "{[Period].[FY26-Q1],[Period].[FY26-Q2],"
            "[Period].[FY26-Q3],[Period].[FY26-Q4]}"
        )

    # Include project rollup nodes (Kalgara Mine, Creston Project, Resource Development)
    mdx = f"""
    SELECT
      {{[CapexCategory].[Kalgara Mine],
        [CapexCategory].[Kalgara Sustaining — Maintenance],
        [CapexCategory].[Kalgara Sustaining — Underground Dev.],
        [CapexCategory].[Kalgara Sustaining — Fleet Rebuild],
        [CapexCategory].[Kalgara Growth — TSF Stage 2],
        [CapexCategory].[Kalgara Growth — North Pit Pre-strip],
        [CapexCategory].[Kalgara Growth — UG Growth Dev.],
        [CapexCategory].[Kalgara Growth — Fleet Expansion],
        [CapexCategory].[Creston Project],
        [CapexCategory].[Creston — Decline Tunnelling],
        [CapexCategory].[Creston — Civil & Portal Works],
        [CapexCategory].[Creston — Blind Bore & Ventilation],
        [CapexCategory].[Creston — EPCM & Owner Costs],
        [CapexCategory].[Resource Development],
        [CapexCategory].[Resource Dev — West Pit Drilling],
        [CapexCategory].[Resource Dev — LKU Drilling],
        [CapexCategory].[Resource Dev — Satellite Deposits]}} ON ROWS,
      {period_set} ON COLUMNS
    FROM [CapexPlanning]
    WHERE ([Version].[{version}])
    """

    with TM1Service(**TM1_CONFIG) as tm1:
        cellset = tm1.cells.execute_mdx(mdx=mdx, skip_zeros=False)

    df = _cellset_to_df(cellset)
    if df.empty:
        return {"version": version, "period": period, "data": []}

    df = df.where(pd.notnull(df), None)
    return {
        "version": version,
        "period": period or "all quarters",
        "columns": list(df.columns),
        "data": df.to_dict(orient="records"),
    }


@mcp.tool()
def get_cash_flow_summary(
    version: str = "Actual",
    period: str | None = None,
) -> dict[str, Any]:
    """
    Retrieve the cash flow waterfall for a given version and period.

    Args:
        version: Planning version — "Actual", "Budget", or "Latest Forecast".
        period:  Quarter, e.g. "FY26-Q1". If omitted returns all quarters.
    """
    if period:
        period_set = f"{{[Period].[{period}]}}"
    else:
        period_set = (
            "{[Period].[FY26-Q1],[Period].[FY26-Q2],"
            "[Period].[FY26-Q3],[Period].[FY26-Q4]}"
        )

    mdx = f"""
    SELECT
      {{[CashFlowLine].[Opening Cash Balance],
        [CashFlowLine].[Operating Cash Flow],
        [CashFlowLine].[Total Investing Cash Flow],
        [CashFlowLine].[Total Financing Cash Flow],
        [CashFlowLine].[Net Change in Cash],
        [CashFlowLine].[Closing Cash Balance]}} ON ROWS,
      {period_set} ON COLUMNS
    FROM [CashFlow]
    WHERE ([Version].[{version}])
    """

    with TM1Service(**TM1_CONFIG) as tm1:
        cellset = tm1.cells.execute_mdx(mdx=mdx, skip_zeros=False)

    df = _cellset_to_df(cellset)
    if df.empty:
        return {"version": version, "period": period, "data": []}

    df = df.where(pd.notnull(df), None)
    return {
        "version": version,
        "period": period or "all quarters",
        "columns": list(df.columns),
        "data": df.to_dict(orient="records"),
    }


# ─── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    mcp.run(transport="stdio")
