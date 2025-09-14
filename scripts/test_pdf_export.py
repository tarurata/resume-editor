#!/usr/bin/env python3
"""
Test script for PDF export functionality
Tests the API endpoints and verifies PDF generation
"""

import asyncio
import sys
import json
from pathlib import Path

# Add the backend app to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend-app"))

async def test_pdf_export():
    """Test PDF export functionality"""
    print("🧪 Testing PDF export functionality...")
    
    try:
        from services.pdf_service import PDFService
        
        # Sample resume data
        sample_resume = {
            "title": "Senior Software Engineer",
            "summary": "Experienced software engineer with 5+ years of experience in full-stack development, specializing in Python, JavaScript, and cloud technologies.",
            "experience": [
                {
                    "role": "Senior Software Engineer",
                    "organization": "TechCorp Inc.",
                    "location": "San Francisco, CA",
                    "startDate": "2022-01",
                    "endDate": None,
                    "bullets": [
                        "Led development of microservices architecture serving 1M+ users",
                        "Implemented CI/CD pipelines reducing deployment time by 60%",
                        "Mentored junior developers and conducted code reviews"
                    ]
                }
            ],
            "skills": ["Python", "JavaScript", "TypeScript", "React", "FastAPI", "PostgreSQL", "Docker", "AWS"]
        }
        
        # Test PDF service
        pdf_service = PDFService()
        
        print("📄 Testing PDF generation from resume data...")
        pdf_bytes = await pdf_service.generate_pdf_from_resume(sample_resume)
        print(f"✅ PDF generated successfully ({len(pdf_bytes)} bytes)")
        
        # Save test PDF
        test_pdf_path = Path(__file__).parent.parent / "test_resume_export.pdf"
        with open(test_pdf_path, "wb") as f:
            f.write(pdf_bytes)
        print(f"💾 Test PDF saved to: {test_pdf_path}")
        
        # Test HTML to PDF
        print("\n📄 Testing HTML to PDF conversion...")
        sample_html = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @page { size: A4; margin: 0.75in 0.5in; }
                body { font-family: Arial, sans-serif; }
                .header { text-align: center; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Test Resume</h1>
            </div>
            <p>This is a test PDF generation from HTML.</p>
        </body>
        </html>
        """
        
        html_pdf_bytes = await pdf_service.generate_pdf_from_html(sample_html)
        print(f"✅ HTML to PDF conversion successful ({len(html_pdf_bytes)} bytes)")
        
        # Save HTML test PDF
        html_test_pdf_path = Path(__file__).parent.parent / "test_html_export.pdf"
        with open(html_test_pdf_path, "wb") as f:
            f.write(html_pdf_bytes)
        print(f"💾 HTML test PDF saved to: {html_test_pdf_path}")
        
        print("\n✅ All PDF export tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ PDF export test failed: {str(e)}")
        return False

async def test_api_endpoints():
    """Test API endpoints using FastAPI test client"""
    print("\n🌐 Testing API endpoints...")
    
    try:
        from fastapi.testclient import TestClient
        import os
        import sys
        
        # Change to backend-app directory
        backend_dir = Path(__file__).parent.parent / "backend-app"
        os.chdir(backend_dir)
        sys.path.insert(0, str(backend_dir))
        
        from main import app
        
        client = TestClient(app)
        
        # Test resume PDF export endpoint
        sample_resume = {
            "title": "Test Engineer",
            "summary": "Test summary",
            "experience": [],
            "skills": ["Python", "Testing"]
        }
        
        print("📡 Testing /api/v1/export/pdf endpoint...")
        response = client.post("/api/v1/export/pdf", json=sample_resume)
        
        if response.status_code == 200:
            print("✅ Resume PDF export endpoint working")
            print(f"📊 Response size: {len(response.content)} bytes")
        else:
            print(f"❌ Resume PDF export failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
        
        # Test HTML to PDF endpoint
        print("\n📡 Testing /api/v1/export/pdf-from-html endpoint...")
        html_request = {
            "html_content": "<html><body><h1>Test</h1></body></html>",
            "filename": "test.pdf"
        }
        
        response = client.post("/api/v1/export/pdf-from-html", json=html_request)
        
        if response.status_code == 200:
            print("✅ HTML to PDF export endpoint working")
            print(f"📊 Response size: {len(response.content)} bytes")
        else:
            print(f"❌ HTML to PDF export failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
        
        print("\n✅ All API endpoint tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ API endpoint test failed: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting PDF export tests...")
    
    # Test PDF service directly
    service_success = await test_pdf_export()
    
    # Test API endpoints
    api_success = await test_api_endpoints()
    
    if service_success and api_success:
        print("\n🎉 All tests passed! PDF export functionality is working correctly.")
        print("\nNext steps:")
        print("1. Start the backend server: python -m uvicorn backend_app.main:app --reload")
        print("2. Test the frontend integration")
        print("3. Run the full test suite: python -m pytest tests/test_pdf_export.py -v")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
