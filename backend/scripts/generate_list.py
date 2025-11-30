import pandas as pd
import json
import os
import requests
import io

# Robust path resolution regardless of where the script is run from
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Navigate up from backend/scripts to project root, then down to frontend/public
OUTPUT_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', 'frontend', 'public', 'companies.json'))

def generate_companies_json():
    print("Attempting to fetch NSE Equity List...")
    
    # Official NSE CSV URL
    url = "https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            df = pd.read_csv(io.StringIO(response.content.decode('utf-8')))
            print(f"Successfully downloaded list. Found {len(df)} companies.")
        else:
            raise Exception(f"NSE Status Code: {response.status_code}")
            
    except Exception as e:
        print(f"Direct download failed ({str(e)}). Using Nifty 50 fallback list.")
        # Fallback data so the app is always playable
        data = {
            'SYMBOL': ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK', 'TATAMOTORS', 'TATASTEEL', 'AXISBANK', 'LT', 'BAJFINANCE', 'MARUTI', 'ASIANPAINT', 'HCLTECH', 'TITAN', 'WIPRO', 'ADANIENT', 'ADANIPORTS', 'APOLLOHOSP', 'BAJAJFINSV', 'BPCL', 'BRITANNIA', 'CIPLA', 'COALINDIA', 'DIVISLAB', 'DRREDDY', 'EICHERMOT', 'GRASIM', 'HDFCLIFE', 'HEROMOTOCO', 'HINDALCO', 'INDUSINDBK', 'JSWSTEEL', 'LTIM', 'M&M', 'NESTLEIND', 'NTPC', 'ONGC', 'POWERGRID', 'SBILIFE', 'SUNPHARMA', 'TATACONSUM', 'TECHM', 'ULTRACEMCO', 'UPL'],
            'NAME OF COMPANY': ['Reliance Industries Ltd', 'Tata Consultancy Services', 'HDFC Bank', 'Infosys', 'ICICI Bank', 'Hindustan Unilever', 'ITC Ltd', 'State Bank of India', 'Bharti Airtel', 'Kotak Mahindra Bank', 'Tata Motors', 'Tata Steel', 'Axis Bank', 'Larsen & Toubro', 'Bajaj Finance', 'Maruti Suzuki', 'Asian Paints', 'HCL Technologies', 'Titan Company', 'Wipro Ltd', 'Adani Enterprises', 'Adani Ports', 'Apollo Hospitals', 'Bajaj Finserv', 'BPCL', 'Britannia', 'Cipla', 'Coal India', 'Divis Labs', 'Dr Reddys', 'Eicher Motors', 'Grasim', 'HDFC Life', 'Hero MotoCorp', 'Hindalco', 'IndusInd Bank', 'JSW Steel', 'LTIMindtree', 'Mahindra & Mahindra', 'Nestle India', 'NTPC', 'ONGC', 'Power Grid Corp', 'SBI Life', 'Sun Pharma', 'Tata Consumer', 'Tech Mahindra', 'UltraTech Cement', 'UPL Ltd']
        }
        df = pd.DataFrame(data)

    # Process Data for Fuse.js
    company_list = []
    
    for _, row in df.iterrows():
        symbol = row['SYMBOL']
        name = row.get('NAME OF COMPANY', symbol)
        
        # Create a search key that includes symbol and name for better matching
        search_key = f"{symbol} {name} India".upper()
        
        company_list.append({
            "name": name,
            "symbol": symbol,
            "ticker": f"{symbol}.NS", # Format for yfinance
            "search_key": search_key
        })

    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(company_list, f)
        
    print(f"Success! Generated {len(company_list)} companies in {OUTPUT_PATH}")

if __name__ == "__main__":
    generate_companies_json()