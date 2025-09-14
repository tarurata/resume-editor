#!/bin/bash

# Docker setup script for PDF export feature
# This script builds and runs the Resume Editor with PDF export support

set -e

echo "🐳 Setting up Resume Editor with PDF Export in Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build the backend image with PDF support
echo "🔨 Building backend image with PDF export support..."
docker build -f Dockerfile.backend -t resume-editor-backend-pdf .

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "✅ Backend image built successfully"
else
    echo "❌ Backend image build failed"
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data
mkdir -p backend-app/templates

# Copy templates if they exist
if [ -d "backend-app/templates" ]; then
    echo "📋 Templates directory found"
else
    echo "⚠️  Templates directory not found. PDF generation may not work properly."
fi

# Run the backend container
echo "🚀 Starting backend container with PDF export support..."
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

# Wait for the container to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Check if the container is running
if docker ps | grep -q resume-editor-backend-pdf; then
    echo "✅ Backend container is running"
else
    echo "❌ Backend container failed to start"
    docker logs resume-editor-backend-pdf
    exit 1
fi

# Test the PDF export endpoint
echo "🧪 Testing PDF export endpoint..."
sleep 5

# Test health endpoint
if curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo "✅ Health endpoint is responding"
else
    echo "❌ Health endpoint is not responding"
    docker logs resume-editor-backend-pdf
    exit 1
fi

# Test PDF export endpoint
echo "📄 Testing PDF export endpoint..."
curl -X POST "http://localhost:8000/api/v1/export/pdf" \
    -H "Content-Type: application/json" \
    -d '{"title": "Test Engineer", "summary": "Test summary", "experience": [], "skills": ["Python", "Testing"]}' \
    --output test_docker_pdf.pdf

if [ -f "test_docker_pdf.pdf" ] && [ -s "test_docker_pdf.pdf" ]; then
    echo "✅ PDF export is working! Test PDF saved as test_docker_pdf.pdf"
    echo "📊 PDF size: $(ls -lh test_docker_pdf.pdf | awk '{print $5}')"
else
    echo "❌ PDF export test failed"
    docker logs resume-editor-backend-pdf
    exit 1
fi

echo ""
echo "🎉 Resume Editor with PDF Export is now running in Docker!"
echo ""
echo "📋 Available endpoints:"
echo "  - Health: http://localhost:8000/api/v1/health"
echo "  - API Docs: http://localhost:8000/docs"
echo "  - PDF Export: http://localhost:8000/api/v1/export/pdf"
echo "  - HTML to PDF: http://localhost:8000/api/v1/export/pdf-from-html"
echo ""
echo "🔧 Management commands:"
echo "  - View logs: docker logs resume-editor-backend-pdf"
echo "  - Stop: docker stop resume-editor-backend-pdf"
echo "  - Remove: docker rm resume-editor-backend-pdf"
echo "  - Restart: docker restart resume-editor-backend-pdf"
echo ""
echo "🧪 Test the PDF export:"
echo "  curl -X POST 'http://localhost:8000/api/v1/export/pdf' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"title\": \"Your Name\", \"summary\": \"Your summary\", \"experience\": [], \"skills\": [\"Python\"]}' \\"
echo "    --output resume.pdf"
