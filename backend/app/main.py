from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np

app = FastAPI()

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def safe_get(df, key, default=0):
    """Safely extract the most recent value from a yfinance DataFrame."""
    try:
        if key in df.index:
            # Get the most recent column (usually the first one in yfinance)
            val = df.loc[key].iloc[0]
            # Handle NaN or None
            if pd.isna(val) or val is None:
                return default
            return float(val)
    except:
        pass
    return default


def extract_series(df, key, limit=5):
    """Return a list of {period, value} for the given row key across columns."""
    if df is None or df.empty or key not in df.index:
        return []

    series = []
    for col in df.columns[:limit]:
        try:
            raw_val = df.loc[key].get(col, None)
            val = None if pd.isna(raw_val) else float(raw_val)
        except Exception:
            val = None

        # Normalize period label
        if hasattr(col, "year"):
            period = str(col.year)
        else:
            period = str(col)

        series.append({"period": period, "value": val})
    return series

@app.get("/api/health")
def health_check():
    return {"status": "operational", "theme": "Bombay Ledger"}

@app.get("/api/analyze/{ticker}")
def analyze_supplier(ticker: str):
    print(f"Analyzing: {ticker}")
    try:
        stock = yf.Ticker(ticker)
        
        # Fetch all statements
        bs = stock.balance_sheet
        inc = stock.financials
        cf = stock.cashflow
        
        # Check if data exists
        if bs.empty or inc.empty:
            # Try fetching info to see if ticker is valid but just missing financials
            try:
                info = stock.info
                if not info:
                    raise ValueError("No info")
            except:
                raise HTTPException(status_code=404, detail="Ticker not found or no data available.")
            
            # If we are here, ticker exists but financials might be empty/restricted
            raise HTTPException(status_code=404, detail="Financial statements unavailable via API for this ticker.")

        # --- 1. DATA EXTRACTION ---
        
        # Income Statement
        revenue = safe_get(inc, "Total Revenue")
        cogs = safe_get(inc, "Cost Of Revenue")
        gross_profit = safe_get(inc, "Gross Profit")
        # Try different keys for EBITDA as it varies
        ebitda = safe_get(inc, "EBITDA") or safe_get(inc, "Normalized EBITDA")
        interest_expense = safe_get(inc, "Interest Expense")
        net_income = safe_get(inc, "Net Income")
        op_expenses = safe_get(inc, "Total Operating Expenses")
        
        # Balance Sheet
        total_assets = safe_get(bs, "Total Assets")
        current_assets = safe_get(bs, "Current Assets")
        current_liab = safe_get(bs, "Current Liabilities")
        inventory = safe_get(bs, "Inventory")
        receivables = safe_get(bs, "Accounts Receivable")
        payables = safe_get(bs, "Accounts Payable")
        total_debt = safe_get(bs, "Total Debt")
        equity = safe_get(bs, "Stockholders Equity")
        retained_earnings = safe_get(bs, "Retained Earnings")
        
        # Cash Flow
        ocf = safe_get(cf, "Operating Cash Flow")
        capex = safe_get(cf, "Capital Expenditure")

        # Multi-period series (last 5 periods)
        income_series = {
          "revenue": extract_series(inc, "Total Revenue"),
          "gross_profit": extract_series(inc, "Gross Profit"),
          "ebitda": extract_series(inc, "EBITDA"),
          "net_income": extract_series(inc, "Net Income"),
        }

        balance_series = {
          "total_assets": extract_series(bs, "Total Assets"),
          "total_liabilities": extract_series(bs, "Total Liabilities"),
          "equity": extract_series(bs, "Stockholders Equity"),
          "total_debt": extract_series(bs, "Total Debt"),
        }

        cash_series = {
          "operating_cash_flow": extract_series(cf, "Operating Cash Flow"),
          "capital_expenditure": extract_series(cf, "Capital Expenditure"),
        }

        # Derive free cash flow per period where possible
        ocf_series = cash_series["operating_cash_flow"]
        capex_series = cash_series["capital_expenditure"]
        free_cf = []
        for idx in range(min(len(ocf_series), len(capex_series))):
            ocf_val = ocf_series[idx]["value"]
            capex_val = capex_series[idx]["value"]
            period = ocf_series[idx]["period"]
            if ocf_val is None or capex_val is None:
                free_cf.append({"period": period, "value": None})
            else:
                # Capex is typically negative; add to reflect OCF - Capex
                free_cf.append({"period": period, "value": ocf_val + capex_val})
        cash_series["free_cash_flow"] = free_cf

        # --- 2. CALCULATIONS ---
        
        # Liquidity
        current_ratio = round(current_assets / current_liab, 2) if current_liab else 0
        
        # Efficiency (Days)
        # Avoid division by zero
        inv_days = round((inventory / cogs) * 365) if cogs and cogs > 0 else 0
        rec_days = round((receivables / revenue) * 365) if revenue and revenue > 0 else 0
        pay_days = round((payables / cogs) * 365) if cogs and cogs > 0 else 0 
        ccc = inv_days + rec_days - pay_days
        
        # Solvency
        debt_to_equity = round(total_debt / equity, 2) if equity and equity > 0 else 0
        interest_coverage = round(ebitda / interest_expense, 2) if interest_expense and interest_expense > 0 else 100.0 
        
        # Profitability Quality
        gross_margin = round((gross_profit / revenue) * 100, 2) if revenue and revenue > 0 else 0
        ocf_to_profit = ocf - net_income # Discrepancy check

        # Altman Z-Score (Simplified for Emerging Markets/Manufacturing)
        # Z = 1.2A + 1.4B + 3.3C + 0.6D + 1.0E
        z_score = 0
        try:
            if total_assets > 0 and total_debt > 0:
                A = (current_assets - current_liab) / total_assets # Working Capital / TA
                B = retained_earnings / total_assets
                C = (ebitda - interest_expense) / total_assets # Proxy for EBIT / TA
                D = equity / total_debt # Book Value Equity / Total Liabilities
                E = revenue / total_assets
                
                z_score = round((1.2 * A) + (1.4 * B) + (3.3 * C) + (0.6 * D) + (1.0 * E), 2)
        except:
            z_score = 0

        # --- 3. AI INSIGHT GENERATION (Rule-Based) ---
        insights = []
        
        # Solvency
        if z_score < 1.8:
            insights.append(f"CRITICAL: Altman Z-Score of {z_score} indicates high distress probability.")
        elif interest_coverage < 1.5:
            insights.append("WARNING: Operating profit barely covers interest payments (Debt Trap Risk).")
        
        # Cash Reality
        if ocf < 0 and net_income > 0:
            insights.append("RED FLAG: Company reports profit but is bleeding cash (Negative OCF).")
        
        # Supply Chain
        if pay_days > 120:
            insights.append("STRESS: Taking over 4 months to pay their own suppliers.")

        if not insights:
            insights.append("Stable: Financial metrics are within healthy manufacturing ranges.")

        return {
            "statements": {
                "income_statement": income_series,
                "balance_sheet": balance_series,
                "cash_flow": cash_series
            },
            "meta": {
                "ticker": ticker,
                "currency": "INR",
                "period": "TTM / Last Fiscal Year"
            },
            "score": {
                "altman_z": z_score,
                "risk_level": "High" if z_score < 1.8 else "Moderate" if z_score < 3 else "Safe"
            },
            "liquidity": {
                "current_ratio": current_ratio,
                "ccc_days": ccc,
                "inv_days": inv_days,
                "rec_days": rec_days
            },
            "solvency": {
                "debt_to_equity": debt_to_equity,
                "interest_coverage": interest_coverage,
                "total_debt": total_debt
            },
            "quality": {
                "gross_margin": gross_margin,
                "ocf": ocf,
                "net_income": net_income,
                "quality_gap": ocf_to_profit
            },
            "ai_summary": " ".join(insights)
        }
    except Exception as e:
        print(f"Error processing {ticker}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
