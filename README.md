# GitVerse 🌌

**AI-Powered 3D Visualization of GitHub Developer Activity as a Cosmic Universe**

GitVerse transforms GitHub profiles into immersive, interactive galaxies. Your activity drives physics and visuals — commits become moons, repositories orbit as planets, and AI classifies your developer archetype.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-R3F-green?logo=threedotjs)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql)

---

## Cosmic Metaphor

| GitHub Concept | Cosmic Entity | Visual Driver |
|----------------|--------------|---------------|
| **User** | Central Star | Brightness = activity streak |
| **Repository** | Planet | Size = codebase size (log-scaled) |
| **Commits** | Moons | Orbit frequency = commit velocity |
| **Issues / PRs** | Asteroid Belt | Density = open/closed ratio |
| **Organizations** | Nebulae | Color = org type |
| **Tech Stack** | Constellations | Lines connecting repos by language overlap |
| **Timeline** | Orbital Motion | Rotation speed = period of activity |

Every galaxy receives an AI-generated **archetype** (e.g. *"The Rapid Builder"*, *"The Precision Coder"*) and a poetic cosmic description.

---

## Architecture

```
[Client Browser]
      | (HTTPS)
[Next.js App Server] <--- [PostgreSQL + Prisma]
      |                    |
      |--- [Redis Cache]
      |
[Python AI Worker] <------- [OpenRouter / LLM]
```

### Monorepo Structure

```
/gitverse
  /apps
    /web          — Next.js 14 (App Router, Server Components)
    /api          — FastAPI Python AI microservice
  /packages
    /database     — Prisma schema & shared DB client
    /ui           — Shared React components (cosmic themed)
    /types        — Shared TypeScript types & Zod schemas
  /docker
    Dockerfile.web
    Dockerfile.api
    docker-compose.yml
```

---

## Tech Stack

### Frontend
- **Next.js 14** — App Router, Server Components, Server Actions
- **TypeScript** — Strict mode, no `any` types
- **Three.js / React Three Fiber / Drei** — 3D rendering engine
- **Tailwind CSS** + **Framer Motion** — Styling & UI transitions
- **Zustand** — Scene & user state management
- **GSAP** — Timeline animation orchestration

### Backend
- **Next.js API Routes** — Galaxy data endpoints
- **FastAPI** — Python AI microservice
- **PostgreSQL** + **Prisma** — Database & ORM
- **Redis** — GitHub API rate limit buffering & Celery broker
- **NextAuth.js v5** — GitHub OAuth authentication

### AI Layer
- **LangChain** — LLM orchestration via OpenRouter
- **Celery** — Async galaxy analysis job queue
- **Custom scoring** — Velocity, Depth, Maintenance, Diversity metrics

---

## Getting Started

### Prerequisites
- Node.js >= 20
- Python >= 3.11
- PostgreSQL database
- Redis instance
- GitHub OAuth App credentials
- OpenRouter API key (optional, for AI features)

### 1. Clone & Install

```bash
git clone https://github.com/mohanprasath-dev/gitverse.git
cd gitverse
npm install
```

### 2. Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/gitverse
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
NEXTAUTH_SECRET=generate_a_random_secret
NEXTAUTH_URL=http://localhost:3000
OPENROUTER_API_KEY=your_openrouter_key  # optional
REDIS_URL=redis://localhost:6379
```

### 3. Database Setup

```bash
npm run db:generate
npm run db:push
npm run db:seed    # Seed with test data
```

### 4. Start Development

```bash
# Start the full stack
npm run dev

# Or start individually
cd apps/web && npm run dev    # Next.js on :3000
cd apps/api && uvicorn app.main:app --reload --port 8000
```

### 5. Python AI Service

```bash
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Start Celery worker (optional, for async analysis)
celery -A app.worker worker --loglevel=info
```

---

## Docker

Run the entire stack with Docker Compose:

```bash
docker-compose -f docker/docker-compose.yml up --build
```

Services:
| Service | Port |
|---------|------|
| Web (Next.js) | 3000 |
| API (FastAPI) | 8000 |
| PostgreSQL | 5432 |
| Redis | 6379 |

---

## 3D Engine Details

- **Renderer:** WebGLRenderer, antialias enabled, high-performance power preference
- **Camera:** PerspectiveCamera FOV 60, OrbitControls (min 5, max 500)
- **Stars:** Custom GLSL shaders with pulsation, core glow, and rim lighting
- **Planets:** Spheres with wireframe overlays, Kepler-inspired orbits with eccentricity
- **Asteroid Belts:** InstancedMesh (dodecahedron) with animated orbital motion
- **Constellations:** Dashed lines connecting repos sharing primary languages
- **Performance:** Web Workers for orbital calculations, FPS target 60

---

## AI Features

### Developer Archetypes
1. **The Architect** — Heavy planning, high system design, low churn
2. **The Rapid Builder** — High commit velocity, many PRs, varied libs
3. **The Precision Coder** — Few commits, high impact, heavy review cycles
4. **The Librarian** — Documentation heavy, issue management focused
5. **The Polymath** — High diversity in languages/repos

### Skill Scoring
- **Velocity** — Commits per week (normalized 0–100)
- **Depth** — Average disk usage per repo
- **Maintenance** — Issue/PR closure rates
- **Diversity** — Shannon entropy of language usage

---

## Testing

```bash
# Web (Vitest)
npm run test --filter=web

# API (pytest)
cd apps/api
python -m pytest tests/
```

---

## CI/CD

GitHub Actions pipeline runs on every push:
1. **Lint** — ESLint with `next/core-web-vitals`
2. **Type Check** — `tsc --noEmit`
3. **Test** — Vitest (web) + pytest (API)
4. **Build** — Next.js production build
5. **Docker** — Build & push images on release

---

## Security

- CORS configured for production origins
- Rate limiting on API routes (60 req/min)
- Security headers (CSP, X-Frame-Options, XSS Protection)
- GitHub API rate limit buffering via Redis
- Zod validation on all API payloads

---

## License

MIT — See [LICENSE](LICENSE) for details.