import requests
import json

PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://api-piped.mha.fi',
    'https://pipedapi.adminforge.de',
    'https://pipedapi.lunar.icu'
]

video_id = "fLexgOxsZu0" # Bruno Mars - Lazy Song

for inst in PIPED_INSTANCES:
    try:
        url = f"{inst}/streams/{video_id}"
        print(f"Trying {url}...")
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            data = r.json()
            streams = data.get('audioStreams', [])
            if streams:
                streams.sort(key=lambda x: 1 if 'mp4' in x.get('mimeType', '') else 0, reverse=True)
                print("SUCCESS! Best Audio URL:")
                print(streams[0]['url'])
                break
    except Exception as e:
        print("Failed:", e)
