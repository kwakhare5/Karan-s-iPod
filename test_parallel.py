import requests
import concurrent.futures

PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://api-piped.mha.fi',
    'https://pipedapi.adminforge.de',
    'https://pipedapi.lunar.icu',
    'https://api.piped.projectsegfau.lt',
]

COMMON_HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/122.0.0.0 Safari/537.36'
    ),
    'Accept': '*/*, application/json',
}

def fetch_fastest(video_id):
    def fetch_instance(inst):
        try:
            url = f"{inst}/streams/{video_id}"
            r = requests.get(url, timeout=4, headers=COMMON_HEADERS)
            if r.status_code == 200:
                data = r.json()
                streams = data.get('audioStreams', [])
                if streams:
                    streams.sort(key=lambda x: 1 if 'mp4' in x.get('mimeType', '') else 0, reverse=True)
                    return streams
        except Exception:
            pass
        return None

    # Run all requests simultaneously
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(PIPED_INSTANCES)) as executor:
        # Submit all tasks
        future_to_url = {executor.submit(fetch_instance, inst): inst for inst in PIPED_INSTANCES}
        
        # As soon as the FASTEST task completes successfully, return it!
        for future in concurrent.futures.as_completed(future_to_url):
            result = future.result()
            if result:
                # We found a working stream, cancel/ignore the rest
                return result
    return []

if __name__ == '__main__':
    print("Testing parallel fetch...")
    import time
    start = time.time()
    res = fetch_fastest("fLexgOxsZu0")
    print(f"Got {len(res)} streams in {time.time() - start:.2f}s")
