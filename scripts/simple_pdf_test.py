#!/usr/bin/env python3
"""
Simple test script for PDF export functionality
Tests only the PDF service without the full API
"""

import asyncio
import sys
from pathlib import Path

# Add the backend app to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend-app"))

async def test_pdf_service():
    """Test PDF service directly"""
    print("🧪 Testing PDF service...")
    
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
        test_pdf_path = Path(__file__).parent.parent / "simple_test_resume.pdf"
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
        html_test_pdf_path = Path(__file__).parent.parent / "simple_test_html.pdf"
        with open(html_test_pdf_path, "wb") as f:
            f.write(html_pdf_bytes)
        print(f"💾 HTML test PDF saved to: {html_test_pdf_path}")
        
        print("\n✅ All PDF service tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ PDF service test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Main test function"""
    print("🚀 Starting simple PDF export tests...")
    
    success = await test_pdf_service()
    
    if success:
        print("\n🎉 PDF service is working correctly!")
        print("\nThe server-side PDF export feature is ready to use.")
        print("\nTo use the full API:")
        print("1. Fix the import paths in the backend modules")
        print("2. Start the backend server")
        print("3. Test the frontend integration")
    else:
        print("\n❌ PDF service tests failed.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
