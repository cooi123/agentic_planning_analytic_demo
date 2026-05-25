#!/usr/bin/env python3
"""
TM1py ingestion script — Ironfield Resources PA Demo
Builds dimensions, cubes, and loads planning data from CSV files.

Requirements:
    pip install TM1py pandas python-dotenv

Usage:
    Credentials are read from .env in the same directory. Then run:
        python load_to_tm1.py

Cubes created:
    FinancialPerformance  — [Version × Period × Account]
    ProductionKPI         — [Version × Period × Source × KPI]
    CapexPlanning         — [Version × Period × CapexCategory]
    CashFlow              — [Version × Period × CashFlowLine]
"""

import json
import os
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv

from TM1py import TM1Service
from TM1py.Objects import (
    Cube,
    Dimension,
    Hierarchy,
    Element,
    ElementAttribute,
)

# ─── SERVER CONFIG ─────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
DIM_DIR  = BASE_DIR / "dimensions"
DATA_DIR = BASE_DIR / "data"

load_dotenv(BASE_DIR / ".env")

TM1_CONFIG = {
    "address":   os.environ["TM1_ADDRESS"],
    "port":      int(os.environ["TM1_PORT"]),
    "user":      os.environ["TM1_USER"],
    "password":  os.environ["TM1_PASSWORD"],
    "ssl":       os.getenv("TM1_SSL", "False").strip().lower() == "true",
    "namespace": os.getenv("TM1_NAMESPACE", ""),
    "timeout":   int(os.getenv("TM1_TIMEOUT", "60")),
    "verify":    False,
}


# ─── HELPERS ───────────────────────────────────────────────────────────────────

def load_json(filename: str) -> dict:
    with open(DIM_DIR / filename) as f:
        return json.load(f)


def ensure_dimension(tm1: TM1Service, dim: Dimension) -> None:
    """Create dimension if new, update in-place if already used by other cubes."""
    if tm1.dimensions.exists(dim.name):
        tm1.dimensions.update(dim)
        print(f"  Updated dimension: {dim.name}")
    else:
        tm1.dimensions.create(dim)
        print(f"  Created dimension: {dim.name}")


def set_attr(tm1: TM1Service, dimension: str, element: str, attribute: str, value: str) -> None:
    """Write an element attribute value via the }ElementAttributes system cube."""
    tm1.cells.write_value(
        value=value,
        cube_name=f"}}ElementAttributes_{dimension}",
        element_tuple=(element, attribute),
    )


def ensure_cube(tm1: TM1Service, cube: Cube) -> None:
    """Create or replace a cube (no data, no rules)."""
    if tm1.cubes.exists(cube.name):
        print(f"  Deleting existing cube: {cube.name}")
        tm1.cubes.delete(cube.name)
    tm1.cubes.create(cube)
    print(f"  Created cube: {cube.name}")


# ─── DIMENSION BUILDERS ────────────────────────────────────────────────────────

def build_version_dimension(tm1: TM1Service) -> None:
    """Flat dimension — one N element per planning version."""
    spec = load_json("versions.json")
    dim  = Dimension(name="Version")
    hier = Hierarchy(name="Version", dimension_name="Version")

    for m in spec["members"]:
        hier.add_element(m["name"], "Numeric")

    # Alias attribute so users can display the short code
    hier.add_element_attribute("Alias", "String")

    dim.add_hierarchy(hier)
    ensure_dimension(tm1, dim)

    # Write alias values
    for m in spec["members"]:
        set_attr(tm1, "Version", m["name"], "Alias", m["alias"])


def build_period_dimension(tm1: TM1Service) -> None:
    """
    Hierarchical: FY (C) → Half (C) → Quarter (N — leaf, data written here)
    Quarters are Numeric so TM1 accepts cell writes at that level.
    Halves and full years roll up automatically in PA.
    """
    spec  = load_json("periods.json")
    dim   = Dimension(name="Period")
    hier  = Hierarchy(name="Period", dimension_name="Period")

    for fy in spec["hierarchies"]:
        hier.add_element(fy["name"], "Consolidated")
        for half in fy.get("children", []):
            hier.add_element(half["name"], "Consolidated")
            hier.add_edge(parent=fy["name"], component=half["name"], weight=1)
            for qtr in half.get("children", []):
                hier.add_element(qtr["name"], "Numeric")
                hier.add_edge(parent=half["name"], component=qtr["name"], weight=1)

    dim.add_hierarchy(hier)
    ensure_dimension(tm1, dim)


def build_account_dimension(tm1: TM1Service) -> None:
    """
    P&L account hierarchy.
    Simple aggregate groups (Revenue, Cost of Sales, etc.) are Consolidated.
    Calculated lines (EBIT, NPAT, EBITDA, etc.) are written as Numeric leaf
    elements — add TM1 Rules to compute them from input accounts.
    """
    spec = load_json("accounts.json")
    dim  = Dimension(name="Account")
    hier = Hierarchy(name="Account", dimension_name="Account")

    # All input aggregates with their children
    for node in spec["hierarchy"]:
        if node.get("type") == "Aggregate":
            hier.add_element(node["name"], "Consolidated")
            for child in node.get("members", []):
                hier.add_element(child["name"], "Numeric")
                hier.add_edge(parent=node["name"], component=child["name"], weight=1)
        elif node.get("type") in ("Calc", "Input"):
            # Calc lines (EBIT, NPAT, EBITDA…) kept as Numeric; populate via Rules
            hier.add_element(node["name"], "Numeric")

    dim.add_hierarchy(hier)
    ensure_dimension(tm1, dim)


def build_kpi_dimension(tm1: TM1Service) -> None:
    """Flat KPI dimension with a Unit string attribute."""
    spec = load_json("production-kpis.json")
    dim  = Dimension(name="KPI")
    hier = Hierarchy(name="KPI", dimension_name="KPI")

    hier.add_element_attribute("Unit", "String")
    hier.add_element_attribute("Group", "String")

    members_meta = {}
    for group in spec["measures"]:
        for m in group["members"]:
            hier.add_element(m["name"], "Numeric")
            members_meta[m["name"]] = {"unit": m["unit"], "group": group["group"]}

    dim.add_hierarchy(hier)
    ensure_dimension(tm1, dim)

    for name, meta in members_meta.items():
        set_attr(tm1, "KPI", name, "Unit",  meta["unit"])
        set_attr(tm1, "KPI", name, "Group", meta["group"])


def build_source_dimension(tm1: TM1Service) -> None:
    """Flat Source dimension: Open Pit / Underground / Total Kalgara."""
    spec     = load_json("production-kpis.json")
    dim      = Dimension(name="Source")
    hier     = Hierarchy(name="Source", dimension_name="Source")
    for s in spec["sources"]:
        hier.add_element(s, "Numeric")
    dim.add_hierarchy(hier)
    ensure_dimension(tm1, dim)


def build_capex_dimension(tm1: TM1Service) -> None:
    """
    CapexCategory dimension with Project as consolidated parent.
    Structure: Project (C) → Category (N)
    """
    spec = load_json("capex-categories.json")
    dim  = Dimension(name="CapexCategory")
    hier = Hierarchy(name="CapexCategory", dimension_name="CapexCategory")

    hier.add_element_attribute("Type", "String")
    hier.add_element_attribute("Project", "String")

    type_map = {}
    proj_map = {}

    for project in spec["hierarchy"]:
        hier.add_element(project["project"], "Consolidated")
        for cat in project["categories"]:
            hier.add_element(cat["name"], "Numeric")
            hier.add_edge(parent=project["project"], component=cat["name"], weight=1)
            type_map[cat["name"]] = cat["type"]
            proj_map[cat["name"]] = project["project"]

    dim.add_hierarchy(hier)
    ensure_dimension(tm1, dim)

    for name in type_map:
        set_attr(tm1, "CapexCategory", name, "Type",    type_map[name])
        set_attr(tm1, "CapexCategory", name, "Project", proj_map[name])


def build_cashflow_dimension(tm1: TM1Service) -> None:
    """
    Cash flow waterfall dimension.
    Subtotals (Operating CF, Total Investing, Total Financing, Net Change)
    are Consolidated so they roll up from their component lines.
    Opening / Closing Balance are Numeric.
    """
    dim  = Dimension(name="CashFlowLine")
    hier = Hierarchy(name="CashFlowLine", dimension_name="CashFlowLine")

    # Operating section
    operating_leaves = [
        "Receipts from Customers",
        "Payments to Suppliers and Employees",
        "Royalties Paid",
        "Interest Received",
        "Interest and Financing Costs Paid",
        "Income Tax Paid",
    ]
    hier.add_element("Operating Cash Flow", "Consolidated")
    for leaf in operating_leaves:
        hier.add_element(leaf, "Numeric")
        hier.add_edge(parent="Operating Cash Flow", component=leaf, weight=1)

    # Investing section
    investing_leaves = [
        "Sustaining Capex",
        "Growth Capex — Kalgara",
        "Growth Capex — Creston",
        "Resource Development Capex",
    ]
    hier.add_element("Total Investing Cash Flow", "Consolidated")
    for leaf in investing_leaves:
        hier.add_element(leaf, "Numeric")
        hier.add_edge(parent="Total Investing Cash Flow", component=leaf, weight=1)

    # Financing section
    financing_leaves = [
        "Proceeds from Borrowings",
        "Repayment of Borrowings",
        "Lease Payments",
        "Dividends Paid",
    ]
    hier.add_element("Total Financing Cash Flow", "Consolidated")
    for leaf in financing_leaves:
        hier.add_element(leaf, "Numeric")
        hier.add_edge(parent="Total Financing Cash Flow", component=leaf, weight=1)

    # Standalone items
    for standalone in ["Opening Cash Balance", "Net Change in Cash", "Closing Cash Balance"]:
        hier.add_element(standalone, "Numeric")

    dim.add_hierarchy(hier)
    ensure_dimension(tm1, dim)


# ─── CUBE BUILDERS ────────────────────────────────────────────────────────────

def build_cubes(tm1: TM1Service) -> None:
    cubes = [
        Cube(name="FinancialPerformance", dimensions=["Version", "Period", "Account"]),
        Cube(name="ProductionKPI",        dimensions=["Version", "Period", "Source", "KPI"]),
        Cube(name="CapexPlanning",        dimensions=["Version", "Period", "CapexCategory"]),
        Cube(name="CashFlow",             dimensions=["Version", "Period", "CashFlowLine"]),
    ]
    for cube in cubes:
        ensure_cube(tm1, cube)


# ─── DATA LOADERS ─────────────────────────────────────────────────────────────

def load_financial_performance(tm1: TM1Service) -> None:
    """Load financial P&L data into FinancialPerformance cube."""
    df = pd.read_csv(DATA_DIR / "financial-performance.csv")
    # Drop Year column — Period element (FY26-Q1 etc.) is sufficient in TM1
    df = df.drop(columns=["Year"])
    df.columns = ["Version", "Period", "Account", "Value"]
    df["Value"] = pd.to_numeric(df["Value"], errors="coerce").fillna(0)

    cellset = {}
    for _, row in df.iterrows():
        key = (row["Version"], row["Period"], row["Account"])
        cellset[key] = row["Value"]

    tm1.cells.write_values(cube_name="FinancialPerformance", cellset_as_dict=cellset)
    print(f"  Loaded {len(cellset):,} cells → FinancialPerformance")


def load_production_kpi(tm1: TM1Service) -> None:
    """Load production KPI data into ProductionKPI cube."""
    df = pd.read_csv(DATA_DIR / "production-kpi.csv")
    df = df.drop(columns=["Year", "Unit"])
    df.columns = ["Version", "Period", "Source", "KPI", "Value"]
    df["Value"] = pd.to_numeric(df["Value"], errors="coerce").fillna(0)

    cellset = {}
    for _, row in df.iterrows():
        key = (row["Version"], row["Period"], row["Source"], row["KPI"])
        cellset[key] = row["Value"]

    tm1.cells.write_values(cube_name="ProductionKPI", cellset_as_dict=cellset)
    print(f"  Loaded {len(cellset):,} cells → ProductionKPI")


def load_capex(tm1: TM1Service) -> None:
    """Load capex data into CapexPlanning cube."""
    df = pd.read_csv(DATA_DIR / "capital-expenditure.csv")
    df = df.drop(columns=["Year", "Project"])
    df.columns = ["Version", "Period", "Category", "Value"]
    df["Value"] = pd.to_numeric(df["Value"], errors="coerce").fillna(0)

    cellset = {}
    for _, row in df.iterrows():
        key = (row["Version"], row["Period"], row["Category"])
        cellset[key] = row["Value"]

    tm1.cells.write_values(cube_name="CapexPlanning", cellset_as_dict=cellset)
    print(f"  Loaded {len(cellset):,} cells → CapexPlanning")


def load_cash_flow(tm1: TM1Service) -> None:
    """
    Load cash flow data into CashFlow cube.
    Consolidated subtotals (Operating CF / Total Investing / Total Financing)
    are skipped — TM1 calculates them from their leaf children.
    Opening Balance, Net Change, and Closing Balance are Numeric and written directly.
    """
    # These are Consolidated elements — TM1 sums their children automatically
    consolidated_lines = {
        "Operating Cash Flow",
        "Total Investing Cash Flow",
        "Total Financing Cash Flow",
    }

    df = pd.read_csv(DATA_DIR / "cash-flow.csv")
    df = df.drop(columns=["Year"])
    df.columns = ["Version", "Period", "LineItem", "Value"]
    df["Value"] = pd.to_numeric(df["Value"], errors="coerce").fillna(0)
    df = df[~df["LineItem"].isin(consolidated_lines)]

    cellset = {}
    for _, row in df.iterrows():
        key = (row["Version"], row["Period"], row["LineItem"])
        cellset[key] = row["Value"]

    tm1.cells.write_values(cube_name="CashFlow", cellset_as_dict=cellset)
    print(f"  Loaded {len(cellset):,} cells → CashFlow")


# ─── MAIN ─────────────────────────────────────────────────────────────────────

TARGET_CUBES = [
    "FinancialPerformance",
    "ProductionKPI",
    "CapexPlanning",
    "CashFlow",
]


def drop_target_cubes(tm1: TM1Service) -> None:
    """Delete our cubes first so their dimensions can be safely replaced."""
    print("─── Dropping existing cubes (if any) ─────────────────")
    for name in TARGET_CUBES:
        if tm1.cubes.exists(name):
            tm1.cubes.delete(name)
            print(f"  Deleted cube: {name}")
        else:
            print(f"  Skipped (not found): {name}")


def main() -> None:
    print("Connecting to TM1 server …")
    with TM1Service(**TM1_CONFIG) as tm1:
        info = tm1.server.get_server_name()
        print(f"Connected to: {info}\n")

        # 0. Drop cubes first so their dimensions are not locked
        drop_target_cubes(tm1)

        # 1. Dimensions
        print("\n─── Building dimensions ───────────────────────────────")
        build_version_dimension(tm1)
        build_period_dimension(tm1)
        build_account_dimension(tm1)
        build_kpi_dimension(tm1)
        build_source_dimension(tm1)
        build_capex_dimension(tm1)
        build_cashflow_dimension(tm1)

        # 2. Cubes
        print("\n─── Building cubes ────────────────────────────────────")
        build_cubes(tm1)

        # 3. Data
        print("\n─── Loading data ───────────────────────────────────────")
        load_financial_performance(tm1)
        load_production_kpi(tm1)
        load_capex(tm1)
        load_cash_flow(tm1)

        print("\nDone.")


if __name__ == "__main__":
    main()
