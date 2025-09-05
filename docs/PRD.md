# Resume Section Editor (MVP)

## Overview
A web-based resume editor that allows users to create, edit, and export professional resumes. The application uses HTML/JSON as the canonical format, renders to HTML for preview, and exports to PDF.

## M1 Scope - Core Editor (Frontend Only)
**Technology Stack:** Next.js (React), TypeScript, Tailwind CSS
**Backend:** None in M1 (Python backend in M2)

### Core Features (M1)
- ✅ Create from template or paste → build resume.json
- ✅ Select & edit sections with presets and constraints
- ✅ View inline diff; accept/reject; per-section history
- ✅ Export to PDF (print-css)
- ✅ Real-time HTML preview
- ✅ JSON data persistence (localStorage)

### Out of Scope (M1)
- ❌ Backend API endpoints
- ❌ User authentication
- ❌ Cloud storage/sync
- ❌ Server-side PDF rendering
- ❌ Advanced AI suggestions

## M1.5 Scope - PDF Import Beta
- ✅ Upload text-based PDF → segmented sections
- ✅ Verify sections UI (split/merge/label)
- ✅ PDF parsing and section detection
- ✅ User correction interface for misclassified sections

## M2 Scope - Python Backend
- ✅ Real /edit with guardrails + diffHtml
- ✅ /export server PDF renderer
- ✅ Basic logs, healthcheck
- ✅ End-to-end edit suggestions within target latency
- ✅ No unreviewed fabrications

## Technical Architecture
- **Canonical Format:** resume.json
- **M1 Rendering:** JSON → React Components → HTML → PDF (print-css)
- **M2 Rendering:** JSON → Server-side HTML → PDF
- **Storage:** Browser localStorage (M1), Database (M2)

## M1 Acceptance Criteria
- [ ] User can go from blank → edited resume → exported PDF without backend
- [ ] User can create resume from template or paste existing content
- [ ] User can select and edit sections with presets and constraints
- [ ] User can view inline diff and accept/reject changes
- [ ] User can access per-section history
- [ ] User can export to PDF using print-css
- [ ] All functionality works offline (no backend required)

## M1.5 Acceptance Criteria
- [ ] Typical 1-column resumes segment with ≥80% accuracy
- [ ] User can correct the rest of misclassified sections
- [ ] User can upload text-based PDF files
- [ ] User can split/merge/label sections in verification UI
- [ ] PDF parsing works for standard resume formats

## M2 Acceptance Criteria
- [ ] End-to-end edit suggestions within target latency
- [ ] No unreviewed fabrications in suggestions
- [ ] Server-side PDF rendering via /export endpoint
- [ ] Real-time editing with guardrails via /edit endpoint
- [ ] Basic logging and healthcheck endpoints

## Quick Start
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Links
- [PRD](docs/PRD.md)
- [GitHub Issues](https://github.com/tarurata/resume-editor/issues)
