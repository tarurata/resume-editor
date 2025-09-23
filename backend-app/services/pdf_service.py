"""
PDF Generation Service using Playwright
Handles server-side PDF generation with size and time limits
"""

import asyncio
import io
import os
from typing import Dict, Any, Optional, Tuple
from pathlib import Path
from playwright.async_api import async_playwright, Browser, Page
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

class PDFGenerationError(Exception):
    """Custom exception for PDF generation errors"""
    pass

class PDFService:
    """Service for generating PDFs using Playwright"""
    
    def __init__(self):
        self.max_pdf_size = 1.5 * 1024 * 1024  # 1.5MB in bytes
        self.max_generation_time = 30  # 30 seconds timeout
        self.template_path = Path(__file__).parent.parent / "templates" / "resume_template.html"
        
    async def generate_pdf_from_html(
        self, 
        html_content: str, 
        options: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Generate PDF from HTML content using Playwright
        
        Args:
            html_content: The HTML content to convert to PDF
            options: Optional PDF generation options
            
        Returns:
            bytes: The generated PDF as bytes
            
        Raises:
            PDFGenerationError: If PDF generation fails
            HTTPException: If size or time limits are exceeded
        """
        if not html_content.strip():
            raise PDFGenerationError("HTML content cannot be empty")
        
        # Set default options
        pdf_options = {
            'format': 'A4',
            'margin': {
                'top': '0.75in',
                'right': '0.5in',
                'bottom': '0.75in',
                'left': '0.5in'
            },
            'print_background': True,
            'prefer_css_page_size': True,
            'display_header_footer': True,
            'header_template': '',
            'footer_template': '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
        }
        
        if options:
            pdf_options.update(options)
        
        try:
            # Run PDF generation with timeout
            pdf_bytes = await asyncio.wait_for(
                self._generate_pdf_with_playwright(html_content, pdf_options),
                timeout=self.max_generation_time
            )
            
            # Check size limit
            if len(pdf_bytes) > self.max_pdf_size:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail={
                        "error": "PDF_TOO_LARGE",
                        "message": f"Generated PDF exceeds size limit of {self.max_pdf_size / (1024*1024):.1f}MB",
                        "actual_size_mb": len(pdf_bytes) / (1024*1024),
                        "max_size_mb": self.max_pdf_size / (1024*1024),
                        "suggestion": "Consider reducing content or using a more compact layout"
                    }
                )
            
            return pdf_bytes
            
        except asyncio.TimeoutError:
            raise HTTPException(
                status_code=status.HTTP_408_REQUEST_TIMEOUT,
                detail={
                    "error": "PDF_GENERATION_TIMEOUT",
                    "message": f"PDF generation timed out after {self.max_generation_time} seconds",
                    "suggestion": "Try with simpler content or contact support if the issue persists"
                }
            )
        except Exception as e:
            logger.error(f"PDF generation failed: {str(e)}")
            raise PDFGenerationError(f"Failed to generate PDF: {str(e)}")
    
    async def generate_pdf_from_resume(
        self, 
        resume_data: Dict[str, Any], 
        theme_options: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Generate PDF from resume data using the HTML template
        
        Args:
            resume_data: Resume data dictionary
            theme_options: Optional theme customization options
            
        Returns:
            bytes: The generated PDF as bytes
        """
        try:
            # Load and render the HTML template
            html_content = await self._render_resume_template(resume_data, theme_options)
            
            # Generate PDF from the rendered HTML
            return await self.generate_pdf_from_html(html_content)
            
        except Exception as e:
            logger.error(f"Resume PDF generation failed: {str(e)}")
            raise PDFGenerationError(f"Failed to generate resume PDF: {str(e)}")
    
    async def _generate_pdf_with_playwright(
        self, 
        html_content: str, 
        pdf_options: Dict[str, Any]
    ) -> bytes:
        """Generate PDF using Playwright browser automation"""
        async with async_playwright() as p:
            # Launch browser with optimized settings
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            )
            
            try:
                # Create new page
                page = await browser.new_page()
                
                # Set viewport for consistent rendering
                await page.set_viewport_size({"width": 1200, "height": 800})
                
                # Set content and wait for fonts to load
                await page.set_content(html_content, wait_until="networkidle")
                
                # Wait for fonts to be loaded
                await page.wait_for_load_state("networkidle")
                
                # Generate PDF
                pdf_bytes = await page.pdf(**pdf_options)
                
                return pdf_bytes
                
            finally:
                await browser.close()
    
    async def _render_resume_template(
        self, 
        resume_data: Dict[str, Any], 
        theme_options: Optional[Dict[str, Any]] = None
    ) -> str:
        """Render the resume HTML template with data"""
        try:
            # Read the template file
            if not self.template_path.exists():
                raise FileNotFoundError(f"Template file not found: {self.template_path}")
            
            with open(self.template_path, 'r', encoding='utf-8') as f:
                template_content = f.read()
            
            # Simple template rendering (in production, use Jinja2 or similar)
            html_content = template_content
            
            # Replace template variables
            html_content = html_content.replace('{{ title }}', resume_data.get('title', ''))
            html_content = html_content.replace('{{ summary }}', resume_data.get('summary', ''))
            
            # Handle experience section
            if 'experience' in resume_data and resume_data['experience']:
                experience_html = self._render_experience_section(resume_data['experience'])
                html_content = html_content.replace('{% if experience %}', '')
                html_content = html_content.replace('{% endif %}', '')
                html_content = html_content.replace('{% for exp in experience %}', '')
                html_content = html_content.replace('{% endfor %}', '')
                html_content = html_content.replace('{{ exp.role }}', '{{ exp.role }}')
                html_content = html_content.replace('{{ exp.organization }}', '{{ exp.organization }}')
                html_content = html_content.replace('{{ exp.location }}', '{{ exp.location }}')
                html_content = html_content.replace('{{ exp.startDate }}', '{{ exp.startDate }}')
                html_content = html_content.replace('{{ exp.endDate or \'Present\' }}', '{{ exp.endDate or \'Present\' }}')
                html_content = html_content.replace('{% for bullet in exp.bullets %}', '')
                html_content = html_content.replace('{% endfor %}', '')
                html_content = html_content.replace('{{ bullet }}', '{{ bullet }}')
            else:
                # Remove experience section if no data
                html_content = self._remove_template_section(html_content, 'experience')
            
            # Handle skills section
            if 'skills' in resume_data and resume_data['skills']:
                skills_html = self._render_skills_section(resume_data['skills'])
                # Replace the entire skills section with rendered HTML
                skills_section_start = html_content.find('{% if skills %}')
                skills_section_end = html_content.find('{% endif %}', skills_section_start) + len('{% endif %}')
                if skills_section_start != -1 and skills_section_end != -1:
                    # Find the content between the if and endif tags
                    content_start = html_content.find('>', skills_section_start) + 1
                    content_end = html_content.rfind('<', skills_section_start, skills_section_end)
                    if content_start != -1 and content_end != -1:
                        # Replace the template content with our rendered HTML
                        html_content = html_content[:content_start] + skills_html + html_content[content_end:]
                    else:
                        # Fallback: replace the entire section
                        html_content = html_content[:skills_section_start] + f'<section class="resume-section"><h2 class="section-title">Technical Skills</h2>{skills_html}</section>' + html_content[skills_section_end:]
            else:
                # Remove skills section if no data
                html_content = self._remove_template_section(html_content, 'skills')
            
            # Remove summary section if no data
            if not resume_data.get('summary'):
                html_content = self._remove_template_section(html_content, 'summary')
            
            return html_content
            
        except Exception as e:
            logger.error(f"Template rendering failed: {str(e)}")
            raise PDFGenerationError(f"Failed to render template: {str(e)}")
    
    def _render_experience_section(self, experience_data: list) -> str:
        """Render experience section HTML"""
        html_parts = []
        for exp in experience_data:
            end_date = exp.get('endDate') or 'Present'
            location = f" • {exp.get('location', '')}" if exp.get('location') else ""
            
            bullets_html = ""
            if exp.get('bullets'):
                bullets_html = "<ul class='experience-bullets'>"
                for bullet in exp['bullets']:
                    bullets_html += f"<li>{bullet}</li>"
                bullets_html += "</ul>"
            
            exp_html = f"""
            <div class="experience-item">
                <div class="experience-header">
                    <div>
                        <div class="experience-role">{exp.get('role', '')}</div>
                        <div class="experience-organization">{exp.get('organization', '')}</div>
                        {f'<div class="experience-location">{exp.get("location", "")}</div>' if exp.get('location') else ''}
                    </div>
                    <div class="experience-dates">
                        {exp.get('startDate', '')} - {end_date}
                    </div>
                </div>
                {bullets_html}
            </div>
            """
            html_parts.append(exp_html)
        
        return ''.join(html_parts)
    
    def _render_skills_section(self, skills_data: list) -> str:
        """Render skills section HTML with subsections"""
        if not skills_data:
            return ""
        
        subsections_html = []
        for subsection in skills_data:
            if isinstance(subsection, dict) and 'name' in subsection and 'skills' in subsection:
                # New SkillSubsection format
                skills_list = subsection.get('skills', [])
                if skills_list:
                    skills_html = ''.join([f'<span class="skill-item">{skill}</span>' for skill in skills_list])
                    subsection_html = f'''
                    <div class="skill-subsection">
                        <div class="skill-subsection-title">{subsection['name']}</div>
                        <div class="skill-list">{skills_html}</div>
                    </div>
                    '''
                    subsections_html.append(subsection_html)
            else:
                # Fallback for old string format
                subsection_html = f'<span class="skill-item">{subsection}</span>'
                subsections_html.append(subsection_html)
        
        return f'<div class="skills-container">{"".join(subsections_html)}</div>'
    
    def _remove_template_section(self, html_content: str, section_name: str) -> str:
        """Remove a template section if no data is available"""
        # This is a simple implementation - in production, use proper template engine
        if section_name == 'summary':
            # Remove summary section
            start_marker = '<!-- Summary -->'
            end_marker = '<!-- /Summary -->'
            start_idx = html_content.find(start_marker)
            end_idx = html_content.find(end_marker)
            if start_idx != -1 and end_idx != -1:
                html_content = html_content[:start_idx] + html_content[end_idx + len(end_marker):]
        
        return html_content

# Global instance
pdf_service = PDFService()
