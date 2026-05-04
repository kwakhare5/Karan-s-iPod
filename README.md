# 🎵 Karan's iPod

> **Return to the golden era of portable music.** 

![Karan's iPod Preview](screenshots/ipod_preview.png)

A beautifully-crafted, retro iPod-inspired music streaming interface built with modern web technologies. Navigate your music library with the classic click wheel, stream directly from YouTube Music, and enjoy a nostalgic UI that looks perfect on both mobile and desktop.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%2019-61dafb.svg?logo=react)
![Python](https://img.shields.io/badge/Backend-Python%20Flask-3776AB.svg?logo=python)

### 🚀 [Live Demo](https://karan-s-ipod.vercel.app/) (Deployed on Vercel)

---

## ✨ Features

- **Classic Click Wheel Navigation:** Relive the nostalgia with fully functional scroll-and-click UI mechanics.
- **YouTube Music Integration:** Search, browse, and stream your favorite songs seamlessly.
- **Responsive Design:** Optimized for both desktop displays and mobile touch screens.
- **Library Management:** Create playlists, save favorite songs, and manage your library just like the original device.
- **Extras included:** Features a built-in clock, minimal contacts app, notes, and custom settings.
- **Cold-Start Protection:** Setup guide included (`KEEP-AWAKE-INSTRUCTIONS.md`) to run a Google Apps Script that keeps the Render free-tier backend awake 24/7 without a credit card.

## 🎮 How to Navigate

The iPod interface is designed to be intuitive and tactile.

- **Scroll (Click Wheel)**: Move your mouse (or finger on mobile) in a circular motion around the wheel to scroll through lists.
- **Menu (Top Button)**: Go back to the previous screen.
- **Select (Center Button)**: Enter a menu or play a song.
- **Play/Pause (Bottom Button)**: Toggle music playback.
- **Skip/Previous (Side Buttons)**: Jump between tracks.


## 🛠️ Technology Stack

We paired the best of modern tools to deliver a smooth retro experience:

| **Domain** | **Technology** |
|:--- |:---|
| **Frontend** | React 19, TypeScript, Vite |
| **Backend** | Python 3.11, Flask |
| **API Integration** | YouTube Music via `ytmusicapi` |
| **Streaming Engine** | `yt-dlp` |
| **Deployment** | Render, Vercel |

---

## 💻 Local Development

Want to run this project on your own machine? It takes just a few steps.

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/downloads/) (v3.11 or higher)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kwakhare5/Karan-s-Ipod.git
   cd Karan-s-Ipod
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Environment Variables:**
   Copy the example environment file and customize it.
   ```bash
   cp .env.example .env.local
   # Don't forget to add your GEMINI_API_KEY inside .env.local!
   ```

### Running the App

You'll need two terminal windows to run the frontend and backend simultaneously:

**Terminal 1 (Backend - Flask)**
```bash
# We run from the root so the backend can find the static files in public/
python backend/server.py
```

**Terminal 2 (Frontend - Vite)**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the app running!

---

## 🗂️ Project Architecture

A quick look at how the repository is organized:

```text
Karan's iPod/
├── backend/              # Unified Python Backend
│   ├── scripts/          # Library automation & maintenance
│   └── server.py         # Main Flask API
├── src/                  # Frontend Source (React + TS)
│   ├── components/       # Reusable UI (ClickWheel, Screen, etc.)
│   ├── hooks/            # Logic & State (useMusicPlayer, etc.)
│   └── utils/            # API & Formatting utilities
├── public/               # Static assets & seed data
├── render.yaml           # Backend deployment config (Render)
└── package.json          # Frontend dependencies & scripts
```

## 📸 Including Images

To add images to this README (like screenshots of the app), follow these steps:

1.  **Upload the image** to your GitHub repository (e.g., in a `screenshots/` folder).
2.  **Use the standard Markdown syntax**:
    `![Alt Text](path/to/image.png)`
3.  **For centered images with specific width**, use HTML:
    `<img src="path/to/image.png" width="400" alt="iPod Screenshot">`


---

## 🚀 Deployment

This project is configured to be deployed easily on platforms like Render or Vercel.

**Render (Recommended):** The repository includes a `render.yaml` file that automatically configures the web service, installs both Python and Node.js dependencies, builds the frontend, and starts the Flask server.

**Vercel:** A `vercel.json` is also included if you prefer hosting the front-end independently.

---

## 🛡️ Maintenance

Both services are configured for **Auto-Deployment** on GitHub push:
- **Render**: Handles the Python backend and keep-alive strategy.
- **Vercel**: Hosts the high-performance React frontend.


---

## 📄 License & Acknowledgments

- This project is licensed under the [MIT License](LICENSE).
- Visually inspired by the classic Apple iPod device.
- Built with ❤️ by Karan.

---
