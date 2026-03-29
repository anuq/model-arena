# ⚔️ Model Arena

A side-by-side LLM comparison tool powered by [OpenRouter](https://openrouter.ai). Send the same prompt to multiple models simultaneously, compare responses, latency, and throughput — then rate them to build your personal leaderboard.

![Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## Features

- 🔀 Compare 2–4 models side-by-side from 10+ providers
- ⏱️ Real-time latency, token count, and tokens/sec metrics
- 🏆 Personal leaderboard that tracks your ratings over time
- 🔒 API key stored server-side via environment variable
- 🐳 One-command Docker deployment

## Quick Start (Local)

### Prerequisites
- Python 3.11+
- Node.js 18+
- An [OpenRouter API key](https://openrouter.ai/keys)

### 1. Clone & configure
```bash
git clone https://github.com/YOUR_USERNAME/model-arena.git
cd model-arena
cp .env.example .env
# Edit .env and add your OpenRouter API key
```

### 2. Run the backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Run the frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Docker Deployment (Raspberry Pi or Cloud)

### Build & run with Docker Compose
```bash
cp .env.example .env
# Edit .env with your OPENROUTER_API_KEY

docker compose up -d --build
```

The app will be available at `http://localhost:3000` (or your server's IP).

### Raspberry Pi Notes
- Works on Pi 4 (4GB+) or Pi 5
- Use 64-bit Raspberry Pi OS for best compatibility
- First build takes ~5-10 minutes, subsequent starts are instant
- Consider setting up a reverse proxy (Caddy/nginx) for HTTPS

### Free Cloud Deployment

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Render
1. Connect your GitHub repo at [render.com](https://render.com)
2. Create a new "Web Service" pointing to the repo
3. Set build command: `docker compose build`
4. Set start command: `docker compose up`
5. Add `OPENROUTER_API_KEY` as an environment variable

#### Fly.io
```bash
fly launch
fly secrets set OPENROUTER_API_KEY=sk-or-your-key
fly deploy
```

## Project Structure
```
model-arena/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # Pydantic schemas
│   ├── openrouter_client.py # OpenRouter API client
│   ├── leaderboard.py       # Rating storage
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models` | List available models |
| POST | `/api/compete` | Send prompt to a single model |
| POST | `/api/rate` | Rate a model response |
| GET | `/api/leaderboard` | Get current leaderboard |
| DELETE | `/api/leaderboard` | Reset leaderboard |

## License

MIT
