# Resume Editor MVP

A modern, web-based resume editor that allows you to create, edit, and export professional resumes. Built with Next.js and designed for simplicity and ease of use.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Production (Standalone)

```bash
# Build the application
npm run build

# Start production server with static assets
npm run start:standalone

# Open http://localhost:3000 in your browser
```

### Docker (Frontend Only)

```bash
# Build the frontend Docker image
docker build -f Dockerfile.frontend -t resume-editor-frontend .

# Run the frontend container
docker run -p 3000:3000 resume-editor-frontend

# Check health status
curl http://localhost:3000/health
```

### Docker (Backend Only)

```bash
# Build the backend Docker image
docker build -f Dockerfile.backend -t resume-editor-backend .

# Run the backend container
docker run -p 8000:8000 resume-editor-backend

# Check health status
curl http://localhost:8000/api/v1/health
```

### Docker Compose (Full Stack)

```bash
# Run both frontend and backend
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down
```

The Docker setup includes:
- Multi-stage build for optimized image size
- Health check endpoints at `/health` (frontend) and `/api/v1/health` (backend)
- Non-root user for security
- Production-ready configuration

## 🐍 FastAPI Backend

### Local Development

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload

# Or run directly with Python
python -m app.main

# The API will be available at http://localhost:8000
# Health check: http://localhost:8000/api/v1/health
```

### Environment Variables

Create a `.env` file in the project root to customize settings:

```bash
# Server settings
HOST=0.0.0.0
PORT=8000
DEBUG=false

# API settings
API_V1_PREFIX=/api/v1
```

## 📋 Scope

### M1 - Core Editor (Current)
**Frontend-only core editor**
- ✅ Create from template or paste → build resume.json
- ✅ Select & edit sections with presets and constraints
- ✅ View inline diff; accept/reject; per-section history
- ✅ Export to PDF (print-css)
- ✅ Real-time HTML preview
- ❌ PDF import (planned for M1.5)
- ❌ Backend API (planned for M2)

### M1.5 - PDF Import Beta (Planned)
- Upload text-based PDF → segmented sections
- Verify sections UI (split/merge/label)
- Typical 1-column resumes segment with ≥80% accuracy
- User can correct misclassified sections

### M2 - Python Backend (Current)
- ✅ FastAPI service with health check
- ✅ Containerized with Docker
- ✅ Pydantic settings for environment variables
- 🔄 Real /edit with guardrails + diffHtml (in progress)
- 🔄 /export server PDF renderer (planned)
- 🔄 End-to-end edit suggestions within target latency (planned)

## 📖 Documentation

- **[Product Requirements Document (PRD)](docs/PRD.md)** - Complete feature specifications and acceptance criteria
- **[Schema Documentation](docs/SCHEMA.md)** - Resume data model and JSON schema
- **[Issue Templates](.github/ISSUE_TEMPLATE/)** - Bug reports and feature requests

## 🛠️ Technology Stack

- **Frontend:** Next.js 13+, React, TypeScript
- **Backend:** FastAPI, Python 3.12, Uvicorn
- **Styling:** Tailwind CSS
- **Storage:** Browser localStorage (M1), Database (M2)
- **Export:** Print-css → PDF (M1), Server-side PDF (M2)
- **Containerization:** Docker

## 📊 Data Model

The application uses a canonical JSON format for resume data:

```bash
# Validate resume schema
npm run validate-schema

# View sample data
cat fixtures/sample-resume.json
```

**Schema Location:** `schemas/resume-schema.json`
**Sample Data:** `fixtures/` directory

## 🎯 Roadmap

- **M1 (Current):** Core editor (frontend-only)
- **M1.5 (Next):** PDF import beta with section verification
- **M2 (Future):** Python backend with AI suggestions

## 🤝 Contributing

1. Check the [PRD](docs/PRD.md) for feature specifications
2. Review the [Schema Documentation](docs/SCHEMA.md) for data model details
3. Use the [issue templates](.github/ISSUE_TEMPLATE/) for bug reports and feature requests
4. Follow the [Cursor rules](.cursorrules) for development guidelines

## 📄 License

MIT License - see LICENSE file for details
