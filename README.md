# Supplier Stability Analyzer

A robust financial analysis tool for Indian Public Suppliers, featuring a "Bombay Ledger" aesthetic.

## Architecture
- **Backend:** Python (FastAPI) with `yfinance` for data.
- **Frontend:** React (Vite) with Tailwind CSS.
- **Data Source:** NSE India (via yfinance wrapper and generated JSON list).

## Setup Instructions

### 1. Backend
Open your PowerShell/Terminal in the `backend` directory.

```bash
# Create Virtual Environment
python -m venv venv

# Activate (PowerShell)
.\venv\Scripts\Activate.ps1

# Install Dependencies
pip install -r requirements.txt

# Generate Company List (Required for Search Bar)
python scripts/generate_list.py

# Run Server
uvicorn app.main:app --reload