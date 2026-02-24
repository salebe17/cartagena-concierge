import re

def search_keys(filename, keys):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    print(f"File size: {len(content)} bytes")
    
    for key in keys:
        print(f"--- Searching for '{key}' ---")
        matches = [m.start() for m in re.finditer(re.escape(key), content)]
        print(f"Found {len(matches)} matches")
        for start in matches[:5]: # Show first 5
            snippet = content[max(0, start - 100):min(len(content), start + 100)]
            print(f"Context: ...{snippet}...")
            print("-" * 20)

keys = ["cleaning_fee", "min_nights", "cancellation_policy", "amenity_names", "house_rules", "response_time_shown", "guest_controls"]
search_keys("airbnb_dump.html", keys)
