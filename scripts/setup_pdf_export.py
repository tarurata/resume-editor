#!/usr/bin/env python3
"""
Setup script for PDF export functionality
Installs Playwright browsers and tests PDF generation
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the backend app to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend-app"))

async def setup_playwright():
    """Install Playwright browsers"""
    print("Installing Playwright browsers...")
    
    try:
        from playwright.async_api import async_playwright
        import subprocess
        
        # Install Playwright browsers
        result = subprocess.run([
            sys.executable, "-m", "playwright", "install", "chromium"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Playwright browsers installed successfully")
        else:
            print(f"❌ Failed to install Playwright browsers: {result.stderr}")
            return False
            
    except ImportError:
        print("❌ Playwright not installed. Please run: pip install playwright")
        return False
    except Exception as e:
        print(f"❌ Error installing Playwright: {str(e)}")
        return False
    
    return True

async def test_pdf_generation():
    """Test PDF generation with sample data"""
    print("\nTesting PDF generation...")
    
    try:
        from services.pdf_service import PDFService
        
        # Sample HTML for testing
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
            <p>This is a test PDF generation.</p>
        </body>
        </html>
        """
        
        pdf_service = PDFService()
        pdf_bytes = await pdf_service.generate_pdf_from_html(sample_html)
        
        print(f"✅ PDF generated successfully ({len(pdf_bytes)} bytes)")
        
        # Save test PDF
        test_pdf_path = Path(__file__).parent.parent / "test_output.pdf"
        with open(test_pdf_path, "wb") as f:
            f.write(pdf_bytes)
        
        print(f"✅ Test PDF saved to: {test_pdf_path}")
        return True
        
    except Exception as e:
        print(f"❌ PDF generation test failed: {str(e)}")
        return False

async def main():
    """Main setup function"""
    print("🚀 Setting up PDF export functionality...")
    
    # Install Playwright browsers
    if not await setup_playwright():
        sys.exit(1)
    
    # Test PDF generation
    if not await test_pdf_generation():
        sys.exit(1)
    
    print("\n✅ PDF export setup completed successfully!")
    print("\nNext steps:")
    print("1. Start the backend server: python -m uvicorn app.main:app --reload")
    print("2. Test the API endpoints:")
    print("   - POST /api/v1/export/pdf")
    print("   - POST /api/v1/export/pdf-from-html")
    print("3. Run integration tests: python -m pytest tests/test_pdf_export.py -v")

if __name__ == "__main__":
    asyncio.run(main())
