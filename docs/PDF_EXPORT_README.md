# Server-Side PDF Export Feature

This document describes the server-side PDF export functionality implemented for the Resume Editor.

## Overview

The PDF export feature provides consistent, pixel-stable PDF generation using Playwright for server-side rendering. This ensures that PDFs look identical across different environments and browsers.

## Features

- **Server-side PDF generation** using Playwright
- **Consistent rendering** across all environments
- **Font embedding** for professional typography
- **Size and time limits** to prevent resource exhaustion
- **Error handling** with clear JSON error responses
- **Two export methods**: Resume data → PDF and HTML → PDF

## Architecture

### Backend Components

1. **PDF Service** (`backend-app/services/pdf_service.py`)
   - Handles PDF generation using Playwright
   - Manages size and time limits
   - Provides template rendering

2. **HTML Template** (`backend-app/templates/resume_template.html`)
   - Professional resume template with @page rules
   - Font embedding for consistent typography
   - Print-optimized CSS

3. **API Endpoints** (`backend-app/api/export.py`)
   - `POST /api/v1/export/pdf` - Export resume data to PDF
   - `POST /api/v1/export/pdf-from-html` - Export HTML content to PDF

### Frontend Components

1. **API Client** (`src/lib/api.ts`)
   - `pdfExportApi.exportResumeToPDF()` - Export resume to PDF
   - `pdfExportApi.exportHTMLToPDF()` - Export HTML to PDF
   - `pdfExportApi.downloadPDF()` - Download PDF blob

2. **Print View Component** (`src/components/editor/PrintView.tsx`)
   - Updated with server-side PDF export option
   - Fallback to browser-based PDF export
   - Error handling and loading states

## API Endpoints

### Export Resume to PDF

```http
POST /api/v1/export/pdf
Content-Type: application/json

{
  "title": "Senior Software Engineer",
  "summary": "Experienced developer...",
  "experience": [...],
  "skills": [...]
}
```

**Response:**
- `200 OK` - PDF file with `Content-Type: application/pdf`
- `413 Payload Too Large` - PDF exceeds size limit
- `408 Request Timeout` - PDF generation timeout
- `500 Internal Server Error` - Generation failed

### Export HTML to PDF

```http
POST /api/v1/export/pdf-from-html
Content-Type: application/json

{
  "html_content": "<html>...</html>",
  "filename": "resume.pdf",
  "theme_options": {}
}
```

**Response:**
- `200 OK` - PDF file with `Content-Type: application/pdf`
- `400 Bad Request` - Missing HTML content
- `413 Payload Too Large` - PDF exceeds size limit
- `408 Request Timeout` - PDF generation timeout
- `500 Internal Server Error` - Generation failed

## Configuration

### Size and Time Limits

- **Maximum PDF size**: 1.5MB (configurable in `PDFService`)
- **Generation timeout**: 30 seconds (configurable in `PDFService`)

### PDF Options

Default PDF generation options:
```python
{
    'format': 'A4',
    'margin': {
        'top': '0.75in',
        'right': '0.5in',
        'bottom': '0.75in',
        'left': '0.5in'
    },
    'print_background': True,
    'prefer_css_page_size': True,
    'display_header_footer': True
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browsers
python -m playwright install chromium
```

### 2. Run Setup Script

```bash
python scripts/setup_pdf_export.py
```

### 3. Start Backend Server

```bash
python -m uvicorn backend_app.main:app --reload
```

### 4. Test the Feature

```bash
# Run integration tests
python -m pytest tests/test_pdf_export.py -v

# Run manual test
python scripts/test_pdf_export.py
```

## Error Handling

The API returns structured error responses:

```json
{
  "error": "PDF_TOO_LARGE",
  "message": "Generated PDF exceeds size limit of 1.5MB",
  "actual_size_mb": 2.1,
  "max_size_mb": 1.5,
  "suggestion": "Consider reducing content or using a more compact layout"
}
```

### Error Types

- `PDF_GENERATION_FAILED` - PDF generation process failed
- `PDF_TOO_LARGE` - Generated PDF exceeds size limit
- `PDF_GENERATION_TIMEOUT` - Generation process timed out
- `MISSING_HTML_CONTENT` - HTML content not provided
- `INTERNAL_SERVER_ERROR` - Unexpected server error

## Frontend Integration

### Using the PDF Export API

```typescript
import { pdfExportApi } from '@/lib/api'

// Export resume to PDF
try {
  const pdfBlob = await pdfExportApi.exportResumeToPDF(resume)
  pdfExportApi.downloadPDF(pdfBlob, 'resume.pdf')
} catch (error) {
  console.error('PDF export failed:', error)
}
```

### Print View Component

The `PrintView` component now includes:
- **Server PDF** button for server-side generation
- **Browser PDF** button for client-side generation
- Loading states and error handling
- Fallback to browser-based export

## Testing

### Integration Tests

The test suite (`tests/test_pdf_export.py`) includes:

- PDF generation from resume data
- PDF generation from HTML content
- Size limit enforcement
- Error handling validation
- Template rendering verification

### Manual Testing

1. **Backend API Testing**:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/export/pdf" \
     -H "Content-Type: application/json" \
     -d '{"title": "Test", "summary": "Test summary", "experience": [], "skills": []}'
   ```

2. **Frontend Testing**:
   - Open the resume editor
   - Click "Export PDF" to open Print View
   - Use "Server PDF" for server-side generation
   - Use "Browser PDF" for client-side generation

## Performance Considerations

- **Memory Usage**: Playwright browsers consume memory; consider connection pooling for production
- **Concurrent Requests**: Limit concurrent PDF generation to prevent resource exhaustion
- **Caching**: Consider caching generated PDFs for identical content
- **Monitoring**: Monitor PDF generation times and failure rates

## Troubleshooting

### Common Issues

1. **Playwright Installation**:
   ```bash
   python -m playwright install chromium
   ```

2. **Permission Errors**:
   - Ensure proper file permissions for template directory
   - Check browser executable permissions

3. **Memory Issues**:
   - Reduce concurrent PDF generation
   - Increase server memory allocation

4. **Font Loading**:
   - Verify internet connectivity for Google Fonts
   - Consider local font fallbacks

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

- [ ] PDF template customization
- [ ] Batch PDF generation
- [ ] PDF watermarking
- [ ] Advanced theme options
- [ ] PDF optimization
- [ ] Caching layer
- [ ] Metrics and monitoring

## Dependencies

- **Playwright**: Browser automation for PDF generation
- **FastAPI**: Web framework for API endpoints
- **PyPDF2**: PDF content verification in tests
- **aiofiles**: Async file operations

## License

This feature is part of the Resume Editor project and follows the same license terms.
