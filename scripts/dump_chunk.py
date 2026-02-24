import re

def dump_chunk(filename):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Find the first StaySearchResult
    start = content.find('{"__typename":"StaySearchResult"')
    if start == -1:
        print("StaySearchResult not found")
        return

    # Dump 10000 chars
    chunk = content[start:start+10000]
    
    with open("debug_chunk.json", "w", encoding="utf-8") as f:
        f.write(chunk)
    
    print("Dumped 10000 chars to debug_chunk.json")

dump_chunk("airbnb_dump.html")
