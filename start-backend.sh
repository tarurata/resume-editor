#!/bin/bash

# Resume Editor Backend Startup Script
echo "🚀 Starting Resume Editor Backend API..."

# Check if we're in the right directory
if [ ! -f "backend-app/main.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "backend-app/venv" ]; then
    echo "📦 Creating virtual environment..."
    cd backend-app
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source backend-app/venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
cd backend-app
pip install -r requirements.txt
cd ..

# Set environment variables (matching frontend LLM config)
export LLM_API_KEY=${LLM_API_KEY:-""}
export LLM_PROVIDER=${LLM_PROVIDER:-"openai"}
export LLM_BASE_URL=${LLM_BASE_URL:-"https://api.openai.com/v1"}
export LLM_MODEL=${LLM_MODEL:-"gpt-4o-mini"}
export LLM_TIMEOUT=${LLM_TIMEOUT:-"30000"}
export LLM_MAX_RETRIES=${LLM_MAX_RETRIES:-"3"}
export LLM_RETRY_DELAY=${LLM_RETRY_DELAY:-"1000"}
export LLM_MAX_TOKENS=${LLM_MAX_TOKENS:-"4000"}

# Start the FastAPI server
echo "🌟 Starting FastAPI server..."
echo "📖 API Documentation: http://localhost:8000/docs"
echo "🔗 API Base URL: http://localhost:8000"
echo "🤖 AI Features: Available at /api/ai/*"
echo "📄 Resume Management: Available at /api/resumes/*"
echo ""
echo "Environment Variables:"
echo "  LLM_API_KEY: ${LLM_API_KEY:+[SET]}${LLM_API_KEY:-[NOT SET]}"
echo "  LLM_PROVIDER: $LLM_PROVIDER"
echo "  LLM_MODEL: $LLM_MODEL"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd backend-app
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload