# ⚔️ Model Arena

Compare LLMs side-by-side using [OpenRouter](https://openrouter.ai). Built with FastAPI + React + Docker.

## Quick Start

### Local Development
```bash
cp .env.example .env
# Add your OpenRouter API key to .env

docker compose up --build
```
Visit http://localhost:3000

### Production (Railway)
See [DEPLOYMENT.md](DEPLOYMENT.md) for Railway setup instructions.

## Required
- [OpenRouter API key](https://openrouter.ai/keys)
- Docker & Docker Compose
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
