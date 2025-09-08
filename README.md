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

### Docker (Production-Ready)

```bash
# Build the Docker image
docker build -t resume-editor .

# Run the container
docker run -p 3000:3000 resume-editor

# Or run with custom port
docker run -p 8080:3000 resume-editor

# Check health status
curl http://localhost:3000/health
```

The Docker setup includes:
- Multi-stage build for optimized image size
- Health check endpoint at `/health`
- Non-root user for security
- Production-ready configuration

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

### M2 - Python Backend (Planned)
- Real /edit with guardrails + diffHtml
- /export server PDF renderer
- Basic logs, healthcheck
- End-to-end edit suggestions within target latency

## 📖 Documentation

- **[Product Requirements Document (PRD)](docs/PRD.md)** - Complete feature specifications and acceptance criteria
- **[Schema Documentation](docs/SCHEMA.md)** - Resume data model and JSON schema
- **[Issue Templates](.github/ISSUE_TEMPLATE/)** - Bug reports and feature requests

## 🛠️ Technology Stack

- **Frontend:** Next.js 13+, React, TypeScript
- **Styling:** Tailwind CSS
- **Storage:** Browser localStorage (M1), Database (M2)
- **Export:** Print-css → PDF (M1), Server-side PDF (M2)

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
