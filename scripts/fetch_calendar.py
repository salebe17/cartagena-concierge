import requests
import json

def fetch_calendar(listing_id):
    url = "https://www.airbnb.com/api/v3/PdpAvailabilityCalendar"
    
    # Common public client ID
    client_id = "d306zoyjsyarp7ifhu67rjxn52tv0t20"
    
    # Query variables
    variables = {
        "request": {
            "listingId": listing_id,
            "count": 6,
            "startDate": "2026-02-01"
        }
    }
    
    # Extensions with Hash
    extensions = {
        "persistedQuery": {
            "version": 1,
            "sha256Hash": "8f0884d3d954bf4e85764375b0606114a2f8c050d5f47844070a68d812328406"
        }
    }
    
    params = {
        "operationName": "PdpAvailabilityCalendar",
        "locale": "en",
        "currency": "COP",
        "variables": json.dumps(variables),
        "extensions": json.dumps(extensions)
    }
    
    headers = {
        "x-airbnb-api-key": client_id,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    print(f"Fetching calendar for {listing_id}...")
    try:
        response = requests.get(url, params=params, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            # Inspect structure
            if "data" in data and "merlin" in data["data"]:
                 print("SUCCESS: Calendar data found!")
                 # Print first few days
                 calendar = data["data"]["merlin"]["pdpAvailabilityCalendar"]["calendarMonths"][0]
                 print(f"Month: {calendar['name']}")
                 booked = 0
                 total = 0
                 for day in calendar["days"]:
                     total += 1
                     if not day["available"]:
                         booked += 1
                 
                 print(f"Occupancy (Month 1): {booked}/{total} days booked ({booked/total*100:.1f}%)")
            else:
                 print("Response JSON structure unknown:")
                 print(str(data)[:500])
        else:
            print("Failed.")
            print(response.text[:500])
            
    except Exception as e:
        print(f"Error: {e}")

fetch_calendar("1306660878963671518")
