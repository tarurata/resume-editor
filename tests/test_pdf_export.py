"""
Integration tests for PDF export functionality
Tests server-side PDF generation with sample HTML and verifies text presence
"""

import pytest
import asyncio
import io
from fastapi.testclient import TestClient
from backend_app.main import app
from backend_app.services.pdf_service import PDFService, PDFGenerationError
import PyPDF2
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = TestClient(app)

# Sample resume data for testing
SAMPLE_RESUME_DATA = {
    "title": "Senior Software Engineer",
    "summary": "Experienced software engineer with 5+ years of experience in full-stack development, specializing in Python, JavaScript, and cloud technologies. Proven track record of delivering scalable solutions and leading development teams.",
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
        },
        {
            "role": "Software Engineer",
            "organization": "StartupXYZ",
            "location": "Remote",
            "startDate": "2020-06",
            "endDate": "2021-12",
            "bullets": [
                "Developed REST APIs using FastAPI and PostgreSQL",
                "Built responsive frontend components with React and TypeScript",
                "Collaborated with product team to define technical requirements"
            ]
        }
    ],
    "skills": [
        "Python", "JavaScript", "TypeScript", "React", "FastAPI", 
        "PostgreSQL", "Docker", "AWS", "Git", "Agile"
    ]
}

# Sample HTML content for testing
SAMPLE_HTML_CONTENT = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Resume</title>
    <style>
        @page {
            size: A4;
            margin: 0.75in 0.5in;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Test Resume</div>
    </div>
    
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <p>This is a test resume for PDF generation validation.</p>
    </div>
    
    <div class="section">
        <div class="section-title">Experience</div>
        <p>Software Engineer at Test Company (2020-2023)</p>
        <ul>
            <li>Developed web applications using Python and JavaScript</li>
            <li>Implemented automated testing and CI/CD pipelines</li>
            <li>Collaborated with cross-functional teams</li>
        </ul>
    </div>
    
    <div class="section">
        <div class="section-title">Skills</div>
        <p>Python, JavaScript, React, FastAPI, PostgreSQL, Docker</p>
    </div>
</body>
</html>
"""

class TestPDFExport:
    """Test class for PDF export functionality"""
    
    def test_export_resume_pdf_endpoint(self):
        """Test the /export/pdf endpoint with sample resume data"""
        response = client.post("/api/v1/export/pdf", json=SAMPLE_RESUME_DATA)
        
        # Check response status
        assert response.status_code == 200
        
        # Check content type
        assert response.headers["content-type"] == "application/pdf"
        
        # Check content disposition
        assert "attachment" in response.headers["content-disposition"]
        assert "resume.pdf" in response.headers["content-disposition"]
        
        # Verify PDF content
        pdf_content = response.content
        assert len(pdf_content) > 0
        
        # Check PDF size is reasonable (not too large)
        assert len(pdf_content) < 1.5 * 1024 * 1024  # 1.5MB limit
        
        # Verify PDF can be parsed and contains expected text
        self._verify_pdf_content(pdf_content, ["Senior Software Engineer", "TechCorp Inc.", "Python", "JavaScript"])
    
    def test_export_pdf_from_html_endpoint(self):
        """Test the /export/pdf-from-html endpoint with sample HTML"""
        request_data = {
            "html_content": SAMPLE_HTML_CONTENT,
            "filename": "test_resume.pdf",
            "theme_options": {}
        }
        
        response = client.post("/api/v1/export/pdf-from-html", json=request_data)
        
        # Check response status
        assert response.status_code == 200
        
        # Check content type
        assert response.headers["content-type"] == "application/pdf"
        
        # Check content disposition
        assert "attachment" in response.headers["content-disposition"]
        assert "test_resume.pdf" in response.headers["content-disposition"]
        
        # Verify PDF content
        pdf_content = response.content
        assert len(pdf_content) > 0
        
        # Verify PDF can be parsed and contains expected text
        self._verify_pdf_content(pdf_content, ["Test Resume", "Professional Summary", "Experience", "Skills"])
    
    def test_pdf_export_error_handling(self):
        """Test error handling for invalid requests"""
        # Test with empty HTML content
        response = client.post("/api/v1/export/pdf-from-html", json={"html_content": ""})
        assert response.status_code == 400
        
        error_data = response.json()
        assert error_data["error"] == "MISSING_HTML_CONTENT"
        assert "HTML content is required" in error_data["message"]
    
    def test_pdf_size_limit(self):
        """Test PDF size limit enforcement"""
        # Create HTML with excessive content to trigger size limit
        large_html = SAMPLE_HTML_CONTENT
        # Repeat content to make it large
        for _ in range(100):
            large_html += SAMPLE_HTML_CONTENT
        
        request_data = {
            "html_content": large_html,
            "filename": "large_resume.pdf"
        }
        
        response = client.post("/api/v1/export/pdf-from-html", json=request_data)
        
        # Should either succeed with reasonable size or fail with size limit error
        if response.status_code == 200:
            pdf_content = response.content
            assert len(pdf_content) <= 1.5 * 1024 * 1024  # 1.5MB limit
        else:
            assert response.status_code == 413  # Payload Too Large
            error_data = response.json()
            assert error_data["error"] == "PDF_TOO_LARGE"
    
    def test_pdf_service_direct(self):
        """Test PDF service directly"""
        pdf_service = PDFService()
        
        # Test PDF generation from HTML
        pdf_bytes = asyncio.run(pdf_service.generate_pdf_from_html(SAMPLE_HTML_CONTENT))
        assert len(pdf_bytes) > 0
        self._verify_pdf_content(pdf_bytes, ["Test Resume", "Professional Summary"])
        
        # Test PDF generation from resume data
        pdf_bytes = asyncio.run(pdf_service.generate_pdf_from_resume(SAMPLE_RESUME_DATA))
        assert len(pdf_bytes) > 0
        self._verify_pdf_content(pdf_bytes, ["Senior Software Engineer", "TechCorp Inc."])
    
    def _verify_pdf_content(self, pdf_bytes: bytes, expected_texts: list):
        """Verify that PDF contains expected text content"""
        try:
            # Create PDF reader from bytes
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
            
            # Extract text from all pages
            full_text = ""
            for page in pdf_reader.pages:
                full_text += page.extract_text()
            
            # Check that all expected texts are present
            for expected_text in expected_texts:
                assert expected_text in full_text, f"Expected text '{expected_text}' not found in PDF"
            
            logger.info(f"PDF verification successful. Found {len(expected_texts)} expected texts.")
            
        except Exception as e:
            pytest.fail(f"Failed to verify PDF content: {str(e)}")

# Additional test for template rendering
class TestTemplateRendering:
    """Test template rendering functionality"""
    
    def test_resume_template_exists(self):
        """Test that the resume template file exists and is readable"""
        from pathlib import Path
        template_path = Path("backend-app/templates/resume_template.html")
        assert template_path.exists(), "Resume template file not found"
        
        # Read template content
        with open(template_path, 'r', encoding='utf-8') as f:
            template_content = f.read()
        
        # Check for key template elements
        assert "{{ title }}" in template_content
        assert "{{ summary }}" in template_content
        assert "@page" in template_content
        assert "font-family" in template_content

if __name__ == "__main__":
    # Run tests directly
    pytest.main([__file__, "-v"])
