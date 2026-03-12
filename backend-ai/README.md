# Sentinel AI Security Gateway - Backend

FastAPI backend for Sentinel, the "Cloudflare for AI".

## Setup

1. Create virtual environment: `python -m venv venv`
2. Activate: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and configure.
5. Run server: `uvicorn app.main:app --reload`
