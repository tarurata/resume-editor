# Docker Setup for PDF Export Feature

This document describes how to run the Resume Editor with PDF export functionality using Docker.

## Overview

The PDF export feature has been fully dockerized and includes:
- **Playwright browser automation** for consistent PDF generation
- **Font embedding** for professional typography
- **Size and time limits** for resource protection
- **Error handling** with clear JSON responses

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run the automated setup script
./scripts/docker-setup-pdf.sh
```

This script will:
- Build the Docker image with PDF support
- Start the backend container
- Test the PDF export functionality
- Provide management commands

### Option 2: Manual Setup

```bash
# Build the backend image
docker build -f Dockerfile.backend -t resume-editor-backend-pdf .

# Run the container
docker run -d \
  --name resume-editor-backend-pdf \
  -p 8000:8000 \
  -v "$(pwd)/data:/app/data" \
  -v "$(pwd)/resume_editor.db:/app/resume_editor.db" \
  -v "$(pwd)/backend-app/templates:/app/templates" \
  -e HOST=0.0.0.0 \
  -e PORT=8000 \
  -e PYTHONPATH=/app \
  resume-editor-backend-pdf
```

### Option 3: Docker Compose

```bash
# Use the PDF-specific docker-compose file
docker-compose -f docker-compose.pdf.yml up -d
```

## Docker Configuration

### Backend Dockerfile (`Dockerfile.backend`)

The backend Dockerfile includes:

1. **System Dependencies**:
   - Playwright browser requirements
   - Font libraries
   - Graphics libraries for PDF rendering

2. **Python Dependencies**:
   - FastAPI and related packages
   - Playwright for PDF generation
   - aiofiles for async file operations

3. **Playwright Browser Installation**:
   - Chromium browser for PDF generation
   - Optimized for headless operation

### Docker Compose (`docker-compose.pdf.yml`)

Features:
- **Resource limits** for PDF generation (2GB memory limit)
- **Volume mounts** for templates and data persistence
- **Health checks** for service monitoring
- **Environment variables** for configuration

## API Endpoints

Once running, the following endpoints are available:

### Health Check
```bash
curl http://localhost:8000/api/v1/health
```

### PDF Export from Resume Data
```bash
curl -X POST "http://localhost:8000/api/v1/export/pdf" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Engineer",
    "summary": "Experienced developer with 5+ years...",
    "experience": [
      {
        "role": "Senior Software Engineer",
        "organization": "TechCorp Inc.",
        "location": "San Francisco, CA",
        "startDate": "2022-01",
        "endDate": null,
        "bullets": [
          "Led development of microservices architecture",
          "Implemented CI/CD pipelines"
        ]
      }
    ],
    "skills": ["Python", "JavaScript", "React", "FastAPI"]
  }' \
  --output resume.pdf
```

### PDF Export from HTML
```bash
curl -X POST "http://localhost:8000/api/v1/export/pdf-from-html" \
  -H "Content-Type: application/json" \
  -d '{
    "html_content": "<html><body><h1>Test Resume</h1></body></html>",
    "filename": "test.pdf"
  }' \
  --output test.pdf
```

## Management Commands

### View Logs
```bash
docker logs resume-editor-backend-pdf
```

### Stop Container
```bash
docker stop resume-editor-backend-pdf
```

### Remove Container
```bash
docker rm resume-editor-backend-pdf
```

### Restart Container
```bash
docker restart resume-editor-backend-pdf
```

### Access Container Shell
```bash
docker exec -it resume-editor-backend-pdf /bin/bash
```

## Testing

### Automated Test
```bash
# Run the setup script which includes testing
./scripts/docker-setup-pdf.sh
```

### Manual Test
```bash
# Test health endpoint
curl http://localhost:8000/api/v1/health

# Test PDF export
curl -X POST "http://localhost:8000/api/v1/export/pdf" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "summary": "Test summary", "experience": [], "skills": ["Python"]}' \
  --output test.pdf

# Check PDF was created
ls -la test.pdf
```

## Configuration

### Environment Variables

- `HOST=0.0.0.0` - Bind to all interfaces
- `PORT=8000` - Server port
- `PYTHONPATH=/app` - Python module path
- `DEBUG=false` - Disable debug mode

### Volume Mounts

- `./data:/app/data` - Data persistence
- `./resume_editor.db:/app/resume_editor.db` - Database file
- `./backend-app/templates:/app/templates` - PDF templates

### Resource Limits

- **Memory**: 2GB limit (1GB reservation)
- **CPU**: No specific limit (uses host resources)

## Troubleshooting

### Common Issues

1. **Container won't start**:
   ```bash
   docker logs resume-editor-backend-pdf
   ```

2. **PDF generation fails**:
   - Check if Playwright browsers are installed
   - Verify template files are mounted
   - Check memory usage

3. **Permission issues**:
   ```bash
   sudo chown -R $USER:$USER data/
   ```

4. **Port already in use**:
   ```bash
   docker stop resume-editor-backend-pdf
   # or change port in docker run command
   ```

### Debug Mode

Run container with debug logging:
```bash
docker run -d \
  --name resume-editor-backend-pdf \
  -p 8000:8000 \
  -e DEBUG=true \
  -e LOG_LEVEL=DEBUG \
  resume-editor-backend-pdf
```

## Production Considerations

### Security
- Run as non-root user
- Use secrets for sensitive data
- Enable HTTPS in production

### Performance
- Increase memory limits for high load
- Use connection pooling
- Consider caching strategies

### Monitoring
- Set up health check monitoring
- Monitor PDF generation metrics
- Track error rates

## Development

### Local Development with Docker
```bash
# Build and run for development
docker build -f Dockerfile.backend -t resume-editor-backend-pdf .
docker run -p 8000:8000 -v "$(pwd)/backend-app:/app" resume-editor-backend-pdf
```

### Hot Reload
For development with hot reload, use the local setup instead of Docker:
```bash
cd backend-app
python -m uvicorn main:app --reload
```

## File Structure

```
resume-editor/
├── Dockerfile.backend              # Backend Docker configuration
├── docker-compose.pdf.yml         # PDF-specific compose file
├── requirements.docker.txt        # Docker-specific dependencies
├── scripts/
│   └── docker-setup-pdf.sh       # Automated setup script
├── backend-app/
│   ├── templates/
│   │   └── resume_template.html   # PDF template
│   ├── services/
│   │   └── pdf_service.py        # PDF generation service
│   └── api/
│       └── export.py             # PDF export endpoints
└── DOCKER_PDF_EXPORT.md          # This documentation
```

## Support

For issues with the Docker setup:
1. Check the logs: `docker logs resume-editor-backend-pdf`
2. Verify all dependencies are installed
3. Ensure proper volume mounts
4. Check resource limits

The PDF export feature is fully containerized and ready for production use! 🐳📄
