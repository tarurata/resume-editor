from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import Response, StreamingResponse
from app.models.resume import Resume
from app.services.pdf_service import pdf_service, PDFGenerationError
from typing import Dict, Any, Optional
import json
import io
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/export/pdf", response_class=Response)
async def export_resume_pdf(resume: Resume, request: Request) -> Response:
    """
    Export resume to PDF format using server-side rendering.
    
    Takes a complete resume object and returns a PDF file.
    The PDF is generated using Playwright for consistent, pixel-stable output.
    """
    try:
        # Convert resume to dictionary for template rendering
        resume_data = resume.model_dump()
        
        # Generate PDF using the PDF service
        pdf_bytes = await pdf_service.generate_pdf_from_resume(resume_data)
        
        # Create filename from resume title
        filename = f"{resume.title.replace(' ', '_').lower()}_resume.pdf"
        
        # Return PDF as streaming response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(pdf_bytes)),
                "Cache-Control": "no-cache"
            }
        )
        
    except PDFGenerationError as e:
        logger.error(f"PDF generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "PDF_GENERATION_FAILED",
                "message": str(e),
                "suggestion": "Please check your resume data and try again"
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error during PDF export: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred during PDF generation",
                "suggestion": "Please try again or contact support if the issue persists"
            }
        )


@router.post("/export/pdf-from-html", response_class=Response)
async def export_pdf_from_html(request: Request) -> Response:
    """
    Export PDF from HTML content with optional theme customization.
    
    Accepts HTML content and minimal theme options, returns a PDF file.
    Useful for custom HTML templates or advanced formatting.
    """
    try:
        # Parse request body
        body = await request.json()
        html_content = body.get("html_content")
        theme_options = body.get("theme_options", {})
        filename = body.get("filename", "document.pdf")
        
        if not html_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "MISSING_HTML_CONTENT",
                    "message": "HTML content is required",
                    "suggestion": "Please provide valid HTML content in the request body"
                }
            )
        
        # Generate PDF from HTML
        pdf_bytes = await pdf_service.generate_pdf_from_html(html_content, theme_options)
        
        # Return PDF as streaming response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(pdf_bytes)),
                "Cache-Control": "no-cache"
            }
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except PDFGenerationError as e:
        logger.error(f"PDF generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "PDF_GENERATION_FAILED",
                "message": str(e),
                "suggestion": "Please check your HTML content and try again"
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error during HTML to PDF export: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred during PDF generation",
                "suggestion": "Please try again or contact support if the issue persists"
            }
        )


@router.post("/export/html", response_class=Response)
async def export_resume_html(resume: Resume) -> Response:
    """
    Export resume to HTML format.
    
    Takes a complete resume object and returns an HTML file with print-optimized styles.
    This can be used for browser-based PDF generation or direct HTML viewing.
    """
    try:
        # Generate HTML from resume data
        html_content = generate_resume_html(resume)
        
        return Response(
            content=html_content,
            media_type="text/html",
            headers={"Content-Disposition": "attachment; filename=resume.html"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export HTML: {str(e)}"
        )


@router.post("/export/json", response_class=Response)
async def export_resume_json(resume: Resume) -> Response:
    """
    Export resume to JSON format.
    
    Takes a complete resume object and returns a JSON file.
    This is useful for data backup and transfer between systems.
    """
    try:
        resume_json = resume.model_dump_json(indent=2)
        
        return Response(
            content=resume_json,
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=resume.json"}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export JSON: {str(e)}"
        )


def generate_resume_html(resume: Resume) -> str:
    """Generate HTML content from resume data"""
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{resume.title} - Resume</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }}
            .title {{
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }}
            .summary {{
                font-size: 16px;
                margin-bottom: 30px;
                text-align: justify;
            }}
            .section {{
                margin-bottom: 25px;
            }}
            .section-title {{
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 15px;
                border-bottom: 1px solid #ccc;
                padding-bottom: 5px;
            }}
            .experience-item {{
                margin-bottom: 20px;
            }}
            .role {{
                font-weight: bold;
                font-size: 16px;
            }}
            .organization {{
                font-style: italic;
                color: #666;
            }}
            .dates {{
                color: #666;
                font-size: 14px;
            }}
            .bullets {{
                margin-top: 10px;
                padding-left: 20px;
            }}
            .bullets li {{
                margin-bottom: 5px;
            }}
            .skills {{
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }}
            .skill {{
                background-color: #f0f0f0;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 14px;
            }}
            .skill-subsection {{
                margin-bottom: 15px;
            }}
            .skill-subsection h4 {{
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: bold;
                color: #555;
            }}
            @media print {{
                body {{
                    margin: 0;
                    padding: 20px;
                }}
                .no-print {{
                    display: none;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">{resume.title}</div>
        </div>
        
        <div class="summary">
            {resume.summary}
        </div>
        
        <div class="section">
            <div class="section-title">Experience</div>
            {generate_experience_html(resume.experience)}
        </div>
        
        <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills">
                {generate_skills_html(resume.skills)}
            </div>
        </div>
    </body>
    </html>
    """
    return html


def generate_experience_html(experience) -> str:
    """Generate HTML for experience section"""
    html = ""
    for exp in experience:
        end_date = exp.endDate if exp.endDate else "Present"
        location = f" • {exp.location}" if exp.location else ""
        
        html += f"""
        <div class="experience-item">
            <div class="role">{exp.role}</div>
            <div class="organization">{exp.organization}{location}</div>
            <div class="dates">{exp.startDate} - {end_date}</div>
            <ul class="bullets">
        """
        
        for bullet in exp.bullets:
            html += f"<li>{bullet}</li>"
        
        html += """
            </ul>
        </div>
        """
    
    return html


def generate_skills_html(skills) -> str:
    """Generate HTML for skills section with subsections"""
    html = ""
    for subsection in skills:
        if hasattr(subsection, 'name') and hasattr(subsection, 'skills'):
            # New structure with subsections
            html += f'<div class="skill-subsection"><h4>{subsection.name}</h4><div class="skills">'
            for skill in subsection.skills:
                html += f'<span class="skill">{skill}</span>'
            html += '</div></div>'
        else:
            # Fallback for old structure (string skills)
            html += f'<span class="skill">{subsection}</span>'
    return html
