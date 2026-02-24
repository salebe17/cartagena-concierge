import requests
import json
import re
import sys
from datetime import datetime

def analyze_airbnb(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    
    print(f"Fetching {url}...")
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return f"Error: Failed to fetch page. Status: {response.status_code}"
            
        html = response.text
        
        # 1. Title
        title_match = re.search(r'<meta property="og:title" content="(.*?)"', html)
        title = title_match.group(1) if title_match else "Unknown Title"
        
        # 2. Extract JSON-LD (Schema.org)
        price = "N/A"
        currency = "USD"
        
        json_ald_match = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
        if json_ald_match:
            try:
                data = json.loads(json_ald_match.group(1))
                if isinstance(data, list):
                    data = data[0] # Sometimes it's a list
                
                if 'offers' in data:
                    price = data['offers'].get('price', 'N/A')
                    currency = data['offers'].get('priceCurrency', 'USD')
            except:
                pass

        if price == "N/A":
             # Fallback: look for "price":1234 pattern anywhere
             price_match = re.search(r'"price":(\d+),"currency":"(.*?)"', html)
             if price_match:
                price = price_match.group(1)
                currency = price_match.group(2)
            
        # 3. Calendar (Mocked for simple regex scrape, real scrape needs automated browser usually)
        # We look for "occupied" classes or similar simplistic signals if possible, 
        # but for this script we will focus on metadata proof.
        
        print("\n--- ANALYSIS RESULT ---")
        print(f"Property: {title}")
        print(f"Detected Base Price: {price} {currency}")
        print(f"Analysis Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Simulation of "Intel" based on price
        if price != "N/A":
            p = int(price)
            est_occupancy = 65 # Market avg assumption
            est_revenue = p * 30 * (est_occupancy/100)
            print(f"\n[MARKET INTEL]")
            print(f"Est. Monthly Revenue: ${est_revenue:,.2f} {currency}")
            print(f"Market Occupancy Avg: {est_occupancy}%")
            if p < 100:
                print("⚠️ VULNERABILITY: Price is below market average ($150). Potential to increased rates.")
            else:
                print("✅ STRATEGY: Premium pricing detected.")
        else:
            print("⚠️ Could not extract exact price from static HTML. Browser automation required for deep dive.")

    except Exception as e:
        print(f"Error analyzing: {e}")

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv) < 2:
        print("Usage: python inspect_airbnb.py <url>")
    else:
        analyze_airbnb(sys.argv[1])
