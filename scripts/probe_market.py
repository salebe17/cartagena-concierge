import re
import json

def extract_listings(filename):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    print(f"Analyzing {filename} ({len(content)} bytes)...")
    
    # Strategy: Split by StaySearchResult and regex within each block
    
    # Split content by the start key
    chunks = content.split('{"__typename":"StaySearchResult"')
    
    listings = []
    seen_ids = set()
    
    print("\n--- Detected Competitors (Method: Result Chunking) ---")
    print(f"{'ID':<20} | {'Rating':<10} | {'Price':<25} | {'Title'}")
    print("-" * 120)

    # Skip first chunk as it's header/preamble
    for chunk in chunks[1:]:
        # Limit chunk size to avoid overlap/garbage
        chunk = chunk[:5000]
        
        # ID from Hosting-XXXX URL
        id_match = re.search(r'Hosting-(\d+)', chunk)
        if not id_match: continue
        lid = id_match.group(1)
        
        if lid in seen_ids: continue
        
        # Rating
        r_match = re.search(r'"avgRatingLocalized":"(.*?)"', chunk)
        rating = r_match.group(1) if r_match else "N/A"
        
        # Title - be careful with greedy matching
        t_match = re.search(r'"title":"(.*?)"', chunk)
        title = t_match.group(1) if t_match else "N/A"
        
        # Price - Look for discountedPrice or originalPrice
        p_match = re.search(r'"discountedPrice":"(.*?)"', chunk)
        if not p_match:
             p_match = re.search(r'"originalPrice":"(.*?)"', chunk)
        
        price = p_match.group(1) if p_match else "N/A"
        
        # Clean up html entities often in titles
        title = title.replace("\\u00f1", "ñ").replace("\\u00e1", "á").replace("\\u00fa", "ú")

        listings.append({
            "id": lid,
            "rating": rating,
            "price": price,
            "title": title
        })
        seen_ids.add(lid)
        print(f"{lid:<20} | {rating:<10} | {price:<25} | {title[:40]}")

    return listings

listings = extract_listings("airbnb_dump.html")
print(f"\nTotal unique competitors found: {len(listings)}")
