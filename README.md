DevPulse — Developer Activity Dashboard
A backend system that connects to GitHub OAuth, tracks developer commit activity, stores historical snapshots, and exposes analytics APIs — built with production-grade patterns like Redis caching, automated cron jobs, and Docker.
Live Demo
API Base URL: https://devpulse-backend.onrender.com
Health Check: https://devpulse-backend.onrender.com/health
Tech Stack
Node.js · Express.js · MongoDB · Redis · GitHub REST API · node-cron · Docker
Features

GitHub OAuth login with JWT authentication
Commit streak tracking and top language analytics via GitHub REST API
Redis caching (1-hour TTL) to handle GitHub API rate limits — serves cached data in <1ms vs ~300ms API call
Nightly cron jobs that automatically snapshot daily activity into MongoDB
Automated email digests via Nodemailer sent every morning
Public shareable developer profiles — /api/dashboard/public/:slug
Dockerized with docker-compose for one-command local setup

Architecture
User → GitHub OAuth → JWT Token
         ↓
GitHub REST API → Redis Cache (1hr TTL)
         ↓
MongoDB  ←  Cron Job (11 PM nightly)
         ↓
REST APIs → Dashboard / Public Profile
API Endpoints
MethodEndpointAuthDescriptionGET/healthNoneServer health checkGET/api/auth/githubNoneGitHub OAuth loginGET/api/auth/github/callbackNoneOAuth callbackGET/api/auth/meJWTCurrent user infoGET/api/github/statsJWTLive GitHub stats (cached)GET/api/dashboard/historyJWTLast 30 daily snapshotsGET/api/dashboard/public/:slugNonePublic developer profile
Local Setup
Prerequisites: Node.js, Docker Desktop
bash# Clone the repo
git clone https://github.com/bhuvana2983/devpulse-backend.git
cd devpulse-backend

# Install dependencies
npm install

# Start Redis via Docker
docker run -d --name devpulse-redis -p 6379:6379 redis:7

# Create .env file (see Environment Variables below)
# Then run
npm run dev
Environment Variables
envPORT=5000
MONGO_URI=your_mongodb_atlas_uri
REDIS_URL=your_upstash_redis_url
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your_gmail
EMAIL_PASS=your_gmail_app_password
Docker
bash# Run entire stack (app + Redis) with one command
docker-compose up
Key Engineering Decisions
Redis Cache-Aside Pattern — On every GitHub API call, the service checks Redis first. On a cache hit, data is returned instantly without touching GitHub's API. On a miss, data is fetched, stored in Redis with a TTL, then returned. This handles GitHub's 5000 req/hour rate limit gracefully.
Compound Index on Snapshots — ActivitySnapshot has a unique compound index on (userId, date) preventing duplicate daily snapshots even if the cron job fires twice accidentally.
Upsert Strategy — Cron uses findOneAndUpdate with upsert: true so re-running it on the same day updates the existing snapshot rather than creating duplicates.
Per-user Error Isolation — The cron job wraps each user's processing in its own try/catch so one user's expired GitHub token doesn't stop the entire batch.
