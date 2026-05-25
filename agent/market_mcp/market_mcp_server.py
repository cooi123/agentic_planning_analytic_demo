#!/usr/bin/env python3
"""
Market Data MCP Server
Exposes external commodity and input price data as MCP tools.
Includes sensitivity analysis and scenario modelling for Ironfield Resources FY26.

Usage:
    python market_mcp_server.py

Requirements:
    pip install -r requirements.txt
"""

import json
import os
from pathlib import Path
from typing import Any

import pandas as pd
from mcp.server.fastmcp import FastMCP

MARKET_DATA_DIR = Path(__file__).parent.parent.parent / "market-data"

mcp = FastMCP(
    name="Market Data",
    instructions=(
        "Tools for external commodity and input price data relevant to Ironfield Resources. "
        "Use get_commodity_prices to retrieve historical and forecast prices for gold, copper, "
        "diesel, electricity, and other mining inputs. "
        "Use get_price_sensitivity to understand how unit price changes affect NPAT and AISC. "
        "Use run_scenario_analysis to model the combined P&L impact of simultaneous price moves."
    ),
)


# ─── Tools ─────────────────────────────────────────────────────────────────────

@mcp.tool()
def get_commodity_prices(
    commodity: str | None = None,
    fy_quarter: str | None = None,
    fy_year: str | None = None,
) -> dict[str, Any]:
    """
    Retrieve monthly market price data for mining output and input commodities.

    Available commodity columns:
      Gold_USD_oz          — Gold spot price (US$/oz)
      Gold_AUD_oz          — Gold spot price (A$/oz)
      Copper_LME_USD_t     — LME copper price (US$/t)
      Copper_AUD_t_net     — Net realised copper (A$/t, after TC/RC)
      AUDUSD               — AUD/USD exchange rate
      Diesel_AUD_L         — Australian diesel wholesale (A$/litre)
      Electricity_AUD_MWh  — WA industrial electricity (A$/MWh)
      ANFO_AUD_t           — ANFO explosives (A$/t)
      Cyanide_AUD_t        — Sodium cyanide (A$/t)
      SteelBalls_AUD_t     — Grinding media steel balls (A$/t)
      Brent_USD_bbl        — Brent crude oil (US$/barrel)

    Args:
        commodity:  Column name to return, e.g. "Diesel_AUD_L". Returns all columns if omitted.
        fy_quarter: Filter to a single quarter, e.g. "FY26-Q1".
        fy_year:    Filter to a fiscal year, e.g. "FY26". Ignored if fy_quarter is set.
    """
    df = pd.read_csv(MARKET_DATA_DIR / "commodity-prices.csv")

    if fy_quarter:
        df = df[df["FY_Quarter"] == fy_quarter]
    elif fy_year:
        df = df[df["FY_Year"] == fy_year]

    meta_cols = ["Month", "FY_Year", "FY_Quarter"]
    price_cols = [c for c in df.columns if c not in meta_cols]

    if commodity:
        if commodity not in price_cols:
            return {
                "error": f"Unknown commodity '{commodity}'.",
                "valid_columns": price_cols,
            }
        cols = meta_cols + [commodity]
    else:
        cols = list(df.columns)

    df = df[cols]
    return {
        "commodity": commodity or "all",
        "filter": fy_quarter or fy_year or "all periods",
        "row_count": len(df),
        "columns": cols,
        "data": df.where(pd.notnull(df), None).to_dict(orient="records"),
    }


@mcp.tool()
def get_price_sensitivity(driver: str | None = None) -> dict[str, Any]:
    """
    Return the sensitivity of Ironfield Resources' financial results to unit
    changes in commodity and input prices.

    Each entry shows the quarterly and full-year NPAT impact (A$000) and
    AISC change (A$/oz) for one unit move in a price driver.

    Args:
        driver: Filter by driver name, e.g. "Diesel", "Gold", "Electricity", "Copper".
                Returns all drivers if omitted.
    """
    with open(MARKET_DATA_DIR / "sensitivity-matrix.json") as f:
        matrix = json.load(f)

    sensitivities = matrix["sensitivities"]
    if driver:
        sensitivities = [
            s for s in sensitivities if driver.lower() in s["driver"].lower()
        ]

    return {
        "basis": matrix["basis"],
        "driver_filter": driver or "all",
        "sensitivity_count": len(sensitivities),
        "sensitivities": sensitivities,
    }


@mcp.tool()
def get_scenario_presets() -> dict[str, Any]:
    """
    Return pre-built combined price scenarios (Bull Case, Bear Case, Fuel Shock,
    Energy Transition Pressure) with their assumptions and estimated P&L impacts.
    """
    with open(MARKET_DATA_DIR / "sensitivity-matrix.json") as f:
        matrix = json.load(f)

    return {
        "basis": matrix["basis"],
        "scenarios": matrix["combined_scenarios"],
    }


@mcp.tool()
def run_scenario_analysis(
    gold_delta_aud_oz: float = 0,
    copper_delta_usd_t: float = 0,
    audusd_delta: float = 0,
    diesel_delta_aud_l: float = 0,
    electricity_delta_aud_mwh: float = 0,
) -> dict[str, Any]:
    """
    Calculate the combined quarterly and full-year NPAT impact and AISC change
    from simultaneous movements in multiple price drivers.

    All inputs are *changes* from the FY26 planning base case.

    Args:
        gold_delta_aud_oz:         Gold price change in A$/oz   e.g. +200 or -150
        copper_delta_usd_t:        Copper LME change in US$/t   e.g. +500 or -800
        audusd_delta:              AUD/USD change               e.g. +0.02 (AUD strengthens)
        diesel_delta_aud_l:        Diesel change in A$/litre    e.g. +0.15 or -0.10
        electricity_delta_aud_mwh: Electricity change in A$/MWh e.g. +20 or -10
    """
    with open(MARKET_DATA_DIR / "sensitivity-matrix.json") as f:
        matrix = json.load(f)

    basis = matrix["basis"]

    # (NPAT_A$000 per unit, AISC_A$/oz per unit)
    UNIT = {
        "gold_AUD_oz":         (28.70,   0.00),
        "copper_USD_t":        ( 1.316, -0.046),
        "audusd_001":          (-338.0,   0.00),   # per 0.001 move (scaled below)
        "diesel_AUD_01L":      (-476.0,  1.70),    # per A$0.01/L (scaled below)
        "elec_AUD_MWh":        (-30.80,  0.11),    # per A$1/MWh (scaled below)
    }

    gold_npat   = gold_delta_aud_oz         * UNIT["gold_AUD_oz"][0]
    gold_aisc   = gold_delta_aud_oz         * UNIT["gold_AUD_oz"][1]
    cu_npat     = copper_delta_usd_t        * UNIT["copper_USD_t"][0]
    cu_aisc     = copper_delta_usd_t        * UNIT["copper_USD_t"][1]
    fx_npat     = (audusd_delta / 0.001)    * UNIT["audusd_001"][0]
    fx_aisc     = (audusd_delta / 0.001)    * UNIT["audusd_001"][1]
    fuel_npat   = (diesel_delta_aud_l / 0.01) * UNIT["diesel_AUD_01L"][0]
    fuel_aisc   = (diesel_delta_aud_l / 0.01) * UNIT["diesel_AUD_01L"][1]
    elec_npat   = electricity_delta_aud_mwh * UNIT["elec_AUD_MWh"][0]
    elec_aisc   = electricity_delta_aud_mwh * UNIT["elec_AUD_MWh"][1]

    total_npat_qtr = gold_npat + cu_npat + fx_npat + fuel_npat + elec_npat
    total_aisc     = gold_aisc + cu_aisc + fx_aisc + fuel_aisc + elec_aisc

    def r(v: float) -> float:
        return round(v, 1)

    return {
        "inputs": {
            "gold_delta_AUD_oz":         gold_delta_aud_oz,
            "copper_delta_USD_t":        copper_delta_usd_t,
            "audusd_delta":              audusd_delta,
            "diesel_delta_AUD_L":        diesel_delta_aud_l,
            "electricity_delta_AUD_MWh": electricity_delta_aud_mwh,
        },
        "base_case": {
            "gold_price_AUD_oz": basis["base_gold_price_AUD_oz"],
            "AISC_AUD_oz":       basis["base_AISC_AUD_oz"],
            "NPAT_AUD000_qtr":   basis["base_NPAT_AUD000_qtr"],
        },
        "scenario": {
            "implied_gold_price_AUD_oz": basis["base_gold_price_AUD_oz"] + gold_delta_aud_oz,
            "implied_AISC_AUD_oz":       round(basis["base_AISC_AUD_oz"] + total_aisc),
            "implied_NPAT_AUD000_qtr":   round(basis["base_NPAT_AUD000_qtr"] + total_npat_qtr),
        },
        "impact": {
            "total_NPAT_AUD000_qtr":       r(total_npat_qtr),
            "total_NPAT_AUD000_full_year": r(total_npat_qtr * 4),
            "total_AISC_change_AUD_oz":    r(total_aisc),
            "breakdown": {
                "gold_price":   {"NPAT_qtr": r(gold_npat),  "AISC": r(gold_aisc)},
                "copper_price": {"NPAT_qtr": r(cu_npat),    "AISC": r(cu_aisc)},
                "audusd":       {"NPAT_qtr": r(fx_npat),    "AISC": r(fx_aisc)},
                "diesel":       {"NPAT_qtr": r(fuel_npat),  "AISC": r(fuel_aisc)},
                "electricity":  {"NPAT_qtr": r(elec_npat),  "AISC": r(elec_aisc)},
            },
        },
    }


# ─── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    mcp.run(transport="stdio")
