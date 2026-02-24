import requests

url = "https://www.airbnb.com.co/rooms/1203904337465819503"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}

try:
    response = requests.get(url, headers=headers)
    with open("airbnb_dump.html", "w", encoding="utf-8") as f:
        f.write(response.text)
    print("Downloaded airbnb_dump.html")
except Exception as e:
    print(f"Error: {e}")
