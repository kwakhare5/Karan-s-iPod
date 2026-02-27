<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎵 Karan's iPod

A retro iPod-inspired music streaming interface built with React + Flask.

**Live Demo**: [Deploy on Render](https://karan-ipod.onrender.com)

## Features

- 🎨 Classic iPod click wheel navigation
- 🎵 YouTube Music integration
- 📱 Responsive design (mobile + desktop)
- 🎧 Playlist management
- ⭐ Favorites system
- 📝 Built-in notes + contacts
- 🕐 Clock + settings customization

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Flask + Python 3.11 |
| Music API | YouTube Music (ytmusicapi) |
| Streaming | yt-dlp |
| Deployment | Render |

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Gemini API key (for AI features)

### Installation

```bash
# Clone repository
git clone https://github.com/kwakhare5/Karan-s-Ipod.git
cd Karan-s-Ipod

# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
```

### Run Locally

```bash
# Terminal 1: Backend
python server.py

# Terminal 2: Frontend
npm run dev
```

Access at `http://localhost:5173`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run test` | Run Playwright E2E tests |
| `python server.py` | Start Flask backend |
| `python scripts/data/seed_library.py` | Seed music library |

## Project Structure

```
Karan's iPod - Copy/
├── .github/workflows/    # CI/CD workflows
├── .husky/               # Git hooks
├── .vscode/              # VS Code settings
├── api/                  # Flask backend API
├── components/           # React UI components
├── hooks/                # Custom React hooks
├── public/               # Static assets (served directly)
├── scripts/              # Python utility scripts
│   ├── data/            # Data fetching & seeding
│   ├── maintenance/     # Library maintenance
│   └── utils/           # Utility scripts
├── src/                  # Frontend TypeScript source
│   ├── App.tsx          # Main application component
│   ├── index.tsx        # Entry point
│   ├── index.css        # Global styles
│   ├── types.ts         # TypeScript types
│   ├── constants.ts     # App constants
│   └── utils/           # Frontend utilities
├── tests/                # Test files
│   ├── e2e/             # Playwright E2E tests
│   └── backend/         # Python backend tests
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── requirements.txt
├── server.py             # Flask backend entry
├── tsconfig.json
└── vite.config.ts
```

## Deployment

### Render

Auto-deploys from `main` branch. See `render.yaml` for configuration:

```yaml
services:
  - type: web
    name: karan-ipod
    env: python
    buildCommand: pip install -r requirements.txt && npm install && npm run build
    startCommand: python server.py
```

### Vercel

Alternative deployment. See `vercel.json`.

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
GEMINI_API_KEY=your_api_key_here
PORT=5001
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Code style and formatting
- Commit message conventions
- Testing requirements
- Folder ownership

## License

MIT

## Acknowledgments

- Inspired by the classic Apple iPod design
- Built with ❤️ using modern web technologies
