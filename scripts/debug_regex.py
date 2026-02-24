def inspect_context(filename, keyword, context_len=100):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    start = content.find(keyword)
    if start == -1:
        print(f"Keyword '{keyword}' not found.")
        return

    snippet = content[max(0, start - context_len):min(len(content), start + context_len + len(keyword))]
    print(f"--- Context for '{keyword}' ---")
    print(snippet)

inspect_context("airbnb_dump.html", "13741668", 200)
