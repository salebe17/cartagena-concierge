import json
import re

try:
    with open('market_scan.json', 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
    # JSON might be mixed with console logs. Find the array [ ... ]
    match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
    if match:
        json_str = match.group(0)
        data = json.loads(json_str)
        ids = [item['id'] for item in data]
        print(" ".join(ids))
    else:
        print("No JSON array found in file.")
except Exception as e:
    print(f"Error: {e}")
