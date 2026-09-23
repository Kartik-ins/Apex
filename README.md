# Apex - AI-Powered Fitness & Nutrition Coach

Apex is a high-performance, full-stack AI coaching platform designed for busy executives and knowledge workers. It combines daily physiological diagnostic data (sleep duration, stress index, morning energy) and real-time pantry inventory into a multi-node **LangGraph** orchestration workflow powered by the dynamic **OpenRouter Free Router** (`openrouter/free`).

---

## Key Features

- **Multi-Agent LangGraph Workflow**:
  - **Habit Analyst Agent**: Analyzes recovery indicators (sleep, stress, energy), calculates an accurate Recovery Score (0–100), evaluates fatigue state, and prescribes an individualized workout circuit with sets, reps, and practical coaching form cues.
  - **Meal Planner Agent**: Synthesizes high-protein recipes strictly utilizing available pantry items, matching single-meal protein targets and client time budgets.
  - **Briefing Synthesizer Agent**: Condenses readiness metrics, training directives, and fueling protocols into an actionable daily directive.
- **Dynamic Free Routing (`openrouter/free`)**:
  - Dynamically routes requests across online free models on OpenRouter, preventing single-model 404 deprecations or rate limit blocks.
  - Supports reasoning models (e.g. DeepSeek R1, Qwen) with automated `<think>` block sanitization.
- **Omnivore & Indian Vegetarian Nutrition Engine**:
  - Comprehensive dietary protocols: **Omnivore**, **High-Protein Vegetarian**, **Eggetarian**, **Lacto-Vegetarian**, **Satvik**, and **Vegan**.
  - Curated pantry staples across poultry, seafood, dairy, lentils, and grains (e.g. Chicken Breast, Eggs, Paneer, Soya Chunks, Curd/Dahi, Moong Dal, Palak, Ghee, Basmati Rice).
- **Cinetik-Inspired Clean UI**:
  - High-clarity light interface with pure white cards (`bg-white`), subtle borders (`border-slate-200`), royal blue accents (`#2563eb`), and modern typography (`Inter` & `JetBrains Mono`).
  - Interactive sliders, quick-select pills, custom ingredient tagging, and 1-click **"Prefill Sample Data"** for instant evaluation.

---

## Architecture & Directory Layout

Apex is built as a clean, decoupled monorepo:

```
Apex/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entrypoint, CORS, endpoints
│   │   ├── schemas.py          # Pydantic v2 schemas & validations
│   │   └── graph.py            # LangGraph multi-agent workflow
│   ├── tests/
│   │   └── test_api.py         # Automated pytest suite (100% passing)
│   ├── pyproject.toml          # uv-managed dependencies
│   ├── ruff.toml               # Strict modern Ruff linting & formatting rules
│   ├── .python-version         # Pinned to Python 3.12
│   ├── .env.example            # Environment template
│   └── .env                    # Local environment config (git-ignored)
├── frontend/
│   ├── src/
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript data types
│   │   ├── components/
│   │   │   ├── CheckinForm.tsx # Diagnostic check-in, pantry pills, sliders
│   │   │   └── CoachResult.tsx # Daily directive, metric cards, recipe breakdown
│   │   ├── App.tsx             # Main dashboard shell & API key modal
│   │   ├── main.tsx            # React 18 root mount
│   │   └── index.css           # Tailwind design system & utilities
│   ├── index.html              # HTML shell & font definitions
│   ├── package.json
│   ├── tsconfig.json           # Strict TypeScript configuration
│   ├── vite.config.ts          # Vite configuration with /api backend proxy
│   └── tailwind.config.js      # Clean Cinetik light design palette
├── .gitignore                  # Comprehensive root gitignore (secrets, venvs, dist)
└── README.md
```

---

## Prerequisites

1. **Python 3.12+** and the [**uv**](https://docs.astral.sh/uv/) package manager
2. **Node.js 18+** and **npm**
3. Free API Key from [OpenRouter](https://openrouter.ai/keys)

---

## Quickstart

### 1. Backend Setup

```bash
cd backend

# 1. Sync dependencies with uv (creates virtual environment using .python-version)
uv sync

# 2. Configure environment variables
cp .env.example .env
# Edit backend/.env and paste your OPENROUTER_API_KEY

# 3. Start FastAPI server
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be live at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## OpenRouter Configuration

Apex is configured out-of-the-box to route all completions through `openrouter/free`:

In `backend/.env`:
```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_MODEL=openrouter/free
```

> **Client Key Override**: Users can also click the **"API Key Configured"** / **"Connect API Key"** button in the dashboard header to connect their key directly in the browser. Keys stored locally in the browser take priority, while automatically falling back to `backend/.env`.

---

## Code Quality & Testing

### Backend Formatting & Linting (`ruff`)

Ruff enforces strict Python standards configured in `backend/ruff.toml`:

```bash
cd backend

# Check for lint issues
uv run ruff check .

# Apply automatic fixes
uv run ruff check --fix .

# Code formatting
uv run ruff format .
```

### Backend Automated Tests (`pytest`)

```bash
cd backend
uv run pytest
```

### Frontend Build & Typechecking

```bash
cd frontend
npm run build
```

---

## Production Deployment Guide

Apex is configured for deployment to **FastAPI Cloud** for the backend and **Netlify** for the frontend.

### 1. Deploy Backend to FastAPI Cloud

FastAPI Cloud provides one-command deployment powered by the official `fastapi-cli`:

```bash
cd backend

# 1. Login to your FastAPI Cloud account (opens browser authentication)
uv run fastapi login

# 2. Deploy your FastAPI application directly to FastAPI Cloud
uv run fastapi deploy
```

#### Set Environment Variables on FastAPI Cloud:
In your FastAPI Cloud application dashboard:
- Set `OPENROUTER_API_KEY` to your OpenRouter API key (`sk-or-v1-...`).
- Set `OPENROUTER_MODEL` to `openrouter/free`.

Once deployed, copy your production API URL (e.g. `https://apex-api.fastapi.cloud`).

---

### 2. Deploy Frontend to Netlify

The frontend is configured with [`frontend/netlify.toml`](file:///home/kartik/Projects/Apex/frontend/netlify.toml) and [`frontend/public/_redirects`](file:///home/kartik/Projects/Apex/frontend/public/_redirects) for client-side SPA routing and Vite asset bundling.

#### Method A: Continuous Deployment via GitHub (Recommended)
1. Go to [app.netlify.com](https://app.netlify.com) and click **"Add new site" > "Import an existing project"**.
2. Select your GitHub repository.
3. Configure site build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. In **Site configuration > Environment variables**, add:
   - `VITE_API_BASE_URL`: Paste your FastAPI Cloud URL (e.g. `https://apex-api.fastapi.cloud`).
5. Click **Deploy Site**. Netlify will build and distribute the app with global CDN caching and automatic HTTPS.

#### Method B: Deploy via Netlify CLI
```bash
cd frontend

# Deploy directly from terminal
npx netlify-cli deploy --build --prod
```

---

## Pushing to GitHub

To push this repository to GitHub, follow these steps:

```bash
# 1. Initialize git repository (from project root /Apex)
git init

# 2. Verify git status (ensure .env and node_modules are ignored)
git status

# 3. Stage all tracked files
git add .

# 4. Commit changes
git commit -m "feat: initial commit of Apex AI coach with LangGraph and OpenRouter"

# 5. Connect your GitHub remote repository
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push to main branch
git branch -M main
git push -u origin main
```

> **Security Note**: Ensure that `backend/.env` is never committed. The provided `.gitignore` automatically prevents `.env`, virtual environments (`.venv`), build directories (`dist/`), and caches from being staged.
