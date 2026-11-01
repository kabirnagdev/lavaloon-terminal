# Deployment Guide — Financial Intelligence Terminal

## Prerequisites
- Node.js 18+ (tested on Node v20/22/26)
- Python 3.10+ (tested on Python 3.11/3.12/3.13)
- Docker & Docker Compose (optional for containerized deployment)

## Environment Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your Groq API key (free at https://console.groq.com/keys):
   ```bash
   GROQ_API_KEY="gsk_..."
   ```

## Running Locally

### 1. Backend Service
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be accessible at `http://localhost:8000/docs`.

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Workstation Terminal will be accessible at `http://localhost:3000`.

## Docker Compose Deployment
```bash
docker-compose up --build -d
```
Runs both services in isolated containers:
- Frontend on `http://localhost:3000`
- Backend API on `http://localhost:8000`

