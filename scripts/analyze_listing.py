import re
import json

def analyze_listing(filename):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    print(f"Analyzing {filename} ({len(content)} bytes)...")
    
    # Extract Title (og:title or twitter:title usually valid)
    t_match = re.search(r'<meta property="og:title" content="(.*?)"', content)
    title = t_match.group(1) if t_match else "Unknown"

    # Extract Rating Check (aggregateRating schema)
    # Pattern: "ratingValue":4.84
    r_match = re.search(r'"ratingValue":([\d\.]+)', content)
    rating = r_match.group(1) if r_match else "N/A"
    
    # Extract Review Count
    c_match = re.search(r'"reviewCount":"?(\d+)"?', content)
    count = c_match.group(1) if c_match else "0"

    # Superhost
    # Pattern: "isSuperhost":true
    sh_match = re.search(r'"isSuperhost":(true|false)', content)
    is_superhost = sh_match.group(1) if sh_match else "UNKNOWN"
    
    # Currency
    curr_match = re.search(r'"serverDeterminedCurrency":"(.*?)"', content)
    currency = curr_match.group(1) if curr_match else "UNKNOWN"

    # Listing Status (isActive)
    active_match = re.search(r'"isActive":(true|false)', content)
    is_active = active_match.group(1) if active_match else "UNKNOWN"
    
    # Guest Satisfaction (sub-rating)
    # "guestSatisfactionOverall":4.84
    gs_match = re.search(r'"guestSatisfactionOverall":([\d\.]+)', content)
    guest_sat = gs_match.group(1) if gs_match else "N/A"

    print("\n--- Listing Intelligence Report ---")
    print(f"Title:       {title}")
    print(f"Rating:      {rating} ({count} reviews)")
    print(f"Superhost:   {is_superhost}")
    print(f"Currency:    {currency}")
    print(f"Status:      {is_active}")
    print(f"Guest Sat:   {guest_sat}")

analyze_listing("airbnb_dump.html")
