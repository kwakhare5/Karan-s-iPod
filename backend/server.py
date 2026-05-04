import concurrent.futures
import json
import os
import threading
import time
import traceback
import uuid

from flask import (
    Flask,
    Response,
    jsonify,
    request,
    stream_with_context,
)
from flask_cors import CORS
import requests
import yt_dlp
from ytmusicapi import YTMusic

app = Flask(__name__)
CORS(app)

# -- Backend Setup --
_ytmusic_instance = None

def get_ytmusic():
    global _ytmusic_instance
    if _ytmusic_instance is None:
        import ytmusicapi
        _ytmusic_instance = ytmusicapi.YTMusic()
    return _ytmusic_instance

search_cache = {}  # query -> [song results]

# Reusable YoutubeDL instance (for fallback only)
ydl_opts = {
    'format': 'bestaudio/best',
    'noplaylist': True,
    'quiet': True,
    'no_warnings': True,
    'extract_flat': False,
    'source_address': '0.0.0.0',
    'force_ipv4': True,
}
_ydl_instance = None
_ydl_lock = threading.Lock()

def get_ydl():
    global _ydl_instance
    if _ydl_instance is None:
        import yt_dlp
        _ydl_instance = yt_dlp.YoutubeDL(ydl_opts)
    return _ydl_instance

COMMON_HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/122.0.0.0 Safari/537.36'
    ),
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
}


# ================================================
#                  SEARCH
# ================================================


@app.route('/api/search')
def search():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'results': []})

    if q in search_cache:
        return jsonify({'results': search_cache[q]})

    try:
        results = get_ytmusic().search(
            q, filter='songs', limit=15
        )
        songs = []
        for r in results:
            if r.get('resultType') != 'song':
                continue
            vid = r.get('videoId')
            if not vid:
                continue

            title = r.get('title', '')
            artists = r.get('artists', [{}])
            artist = artists[0].get('name', 'Unknown')
            thumbs = r.get('thumbnails', [{}])

            songs.append({
                'videoId': vid,
                'title': title,
                'artist': artist,
                'duration': (
                    r.get('duration_seconds', 0) or 0
                ),
                'thumbnailUrl': (
                    thumbs[-1].get('url', '')
                ),
                'thumbnailUrlBackup': (
                    thumbs[0].get('url', '')
                ),
            })

        final_results = songs[:10]
        search_cache[q] = final_results
        return jsonify({'results': final_results})
    except Exception as e:
        print(f"[Search Error] {e}")
        return jsonify(
            {'results': [], 'error': str(e)}
        ), 500





# ================================================
#             PLAYLISTS & LIBRARY
# ================================================

PLAYLISTS_FILE = "public/playlists.json"


def load_playlists():
    if not os.path.exists(PLAYLISTS_FILE):
        return []
    try:
        with open(
            PLAYLISTS_FILE, 'r', encoding='utf-8'
        ) as f:
            return json.load(f)
    except Exception:
        return []


def save_playlists(playlists):
    os.makedirs(
        os.path.dirname(PLAYLISTS_FILE),
        exist_ok=True,
    )
    with open(
        PLAYLISTS_FILE, 'w', encoding='utf-8'
    ) as f:
        json.dump(
            playlists, f,
            indent=2, ensure_ascii=False,
        )


@app.route('/api/playlists', methods=['GET', 'POST'])
def handle_playlists():
    playlists = load_playlists()
    if request.method == 'GET':
        return jsonify(playlists)
    if request.method == 'POST':
        name = request.json.get('name')
        if not name:
            return jsonify(
                {'error': 'Name required'}
            ), 400
        new_playlist = {
            'id': str(uuid.uuid4()),
            'name': name,
            'songIds': [],
        }
        playlists.append(new_playlist)
        save_playlists(playlists)
        return jsonify(new_playlist)
    return jsonify({'error': 'Bad request'}), 400


@app.route(
    '/api/playlists/<playlist_id>/add',
    methods=['POST'],
)
def add_to_playlist(playlist_id):
    playlists = load_playlists()
    song_id = request.json.get('songId')
    if not song_id:
        return jsonify(
            {'error': 'songId required'}
        ), 400
    for p in playlists:
        if p['id'] == playlist_id:
            if song_id not in p.get('songIds', []):
                p.setdefault(
                    'songIds', []
                ).append(song_id)
            save_playlists(playlists)
            return jsonify(p)
    return jsonify(
        {'error': 'Playlist not found'}
    ), 404


@app.route(
    '/api/playlists/<playlist_id>',
    methods=['PUT', 'DELETE'],
)
def update_or_delete_playlist(playlist_id):
    playlists = load_playlists()
    if request.method == 'DELETE':
        playlists = [
            p for p in playlists
            if p['id'] != playlist_id
        ]
        save_playlists(playlists)
        return jsonify({'success': True})
    if request.method == 'PUT':
        name = request.json.get('name')
        if not name:
            return jsonify(
                {'error': 'Name required'}
            ), 400
        for p in playlists:
            if p['id'] == playlist_id:
                p['name'] = name
                save_playlists(playlists)
                return jsonify(p)
    return jsonify(
        {'error': 'Playlist not found'}
    ), 404


@app.route('/api/genres')
def get_genres():
    try:
        if os.path.exists('public/genres.json'):
            with open(
                'public/genres.json', 'r',
                encoding='utf-8',
            ) as f:
                return jsonify(json.load(f))
        songs_path = "public/top_songs.json"
        if os.path.exists(songs_path):
            with open(
                songs_path, 'r', encoding='utf-8'
            ) as f:
                songs = json.load(f)
            genres = sorted(list(set(
                s.get('genre')
                for s in songs
                if s.get('genre')
            )))
            return jsonify([
                {'id': g, 'name': g}
                for g in genres
            ])
        return jsonify([])
    except Exception:
        return jsonify([])


@app.route('/api/library/artists')
def get_library_artists():
    path = "public/top_artists.json"
    if os.path.exists(path):
        with open(
            path, 'r', encoding='utf-8'
        ) as f:
            return jsonify(json.load(f))
    return jsonify([])


@app.route('/api/library/songs')
def get_library_songs():
    path = "public/top_songs.json"
    if os.path.exists(path):
        with open(
            path, 'r', encoding='utf-8'
        ) as f:
            return jsonify(json.load(f))
    return jsonify([])


# ================================================
#              STATUS & UTILITIES
# ================================================


@app.route('/')
def api_status():
    return jsonify({
        'status': 'online',
        'message': (
            "Karan's iPod API "
            "(v5 Direct YouTube Proxy Streaming)"
        ),
        'endpoints': {
            'search': '/api/search?q=query',
            'stream_info': '/api/stream-info/<id>',
            'stream': '/api/stream/<id>',
            'ping': '/api/ping',
        },
    })


@app.route('/api/ping')
def ping():
    return jsonify({
        'status': 'ok',
        'timestamp': time.time(),
        'v': '5.0',
    })


@app.route('/favicon.ico')
def favicon():
    return '', 204


@app.route('/top_songs.json')
def serve_top_songs():
    path = "public/top_songs.json"
    if os.path.exists(path):
        with open(
            path, 'r', encoding='utf-8'
        ) as f:
            return jsonify(json.load(f))
    return jsonify([])


@app.route('/top_artists.json')
def serve_top_artists():
    path = "public/top_artists.json"
    if os.path.exists(path):
        with open(
            path, 'r', encoding='utf-8'
        ) as f:
            return jsonify(json.load(f))
    return jsonify([])


@app.route('/<path:path>')
def serve_catch_all(path):
    return jsonify({
        'error': 'Not Found',
        'path': path,
    }), 404


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(
        f"Starting iPod backend v5 on port {port}..."
    )
    app.run(host='0.0.0.0', port=port, debug=False)
