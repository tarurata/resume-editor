# Resume Editor API Endpoints

This document describes all the FastAPI endpoints available in the Resume Editor backend.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Currently no authentication is required. This will be added in future versions.

## Endpoints Overview

### Health Check
- `GET /health` - Check API health status

### Personal Information
- `POST /personal-info/` - Create personal information
- `GET /personal-info/{user_id}` - Get personal information by user ID
- `PUT /personal-info/{user_id}` - Update personal information
- `DELETE /personal-info/{user_id}` - Delete personal information

### Education Management
- `POST /education/` - Create education entry
- `GET /education/user/{user_id}` - Get all education entries for user
- `GET /education/{education_id}` - Get specific education entry
- `PUT /education/{education_id}` - Update education entry
- `DELETE /education/{education_id}` - Delete education entry

### Certifications Management
- `POST /certifications/` - Create certification entry
- `GET /certifications/user/{user_id}` - Get all certifications for user
- `GET /certifications/{certification_id}` - Get specific certification
- `PUT /certifications/{certification_id}` - Update certification
- `DELETE /certifications/{certification_id}` - Delete certification

### Resume Versions (Multi-Company Management)
- `POST /resume-versions/?user_id={user_id}` - Create resume version
- `GET /resume-versions/user/{user_id}` - Get all resume versions for user
- `GET /resume-versions/{version_id}` - Get specific resume version
- `PUT /resume-versions/{version_id}` - Update resume version
- `DELETE /resume-versions/{version_id}` - Delete resume version
- `POST /resume-versions/{version_id}/activate?user_id={user_id}` - Set active version
- `GET /resume-versions/user/{user_id}/active` - Get active resume version

### Applications Tracking
- `POST /applications/` - Create job application
- `GET /applications/user/{user_id}` - Get all applications for user
- `GET /applications/{application_id}` - Get specific application
- `PUT /applications/{application_id}` - Update application
- `PATCH /applications/{application_id}/status` - Update application status
- `DELETE /applications/{application_id}` - Delete application
- `GET /applications/user/{user_id}/status/{status}` - Get applications by status
- `GET /applications/user/{user_id}/company/{company}` - Get applications by company

### Templates Management
- `POST /templates/` - Create template (Not implemented)
- `GET /templates/` - Get all templates (Not implemented)
- `GET /templates/{template_id}` - Get specific template (Not implemented)
- `PUT /templates/{template_id}` - Update template (Not implemented)
- `DELETE /templates/{template_id}` - Delete template (Not implemented)
- `GET /templates/industry/{industry}` - Get templates by industry (Not implemented)
- `GET /templates/public/` - Get public templates (Not implemented)

## Data Models

### PersonalInfo
```json
{
  "user_id": "string",
  "full_name": "string",
  "email": "string",
  "phone": "string (optional)",
  "location": "string (optional)",
  "linkedin_url": "string (optional)",
  "portfolio_url": "string (optional)"
}
```

### Education
```json
{
  "user_id": "string",
  "degree": "string",
  "institution": "string",
  "field_of_study": "string",
  "graduation_date": "string (YYYY-MM format)",
  "gpa": "number (optional, 0.0-4.0)",
  "location": "string (optional)"
}
```

### Certification
```json
{
  "user_id": "string",
  "name": "string",
  "issuer": "string",
  "issue_date": "string (YYYY-MM format)",
  "expiry_date": "string (optional, YYYY-MM format)",
  "credential_id": "string (optional)"
}
```

### ResumeVersion
```json
{
  "company_name": "string",
  "company_email": "string",
  "job_title": "string",
  "job_description": "string (optional)",
  "resume_data": "object",
  "is_active": "boolean"
}
```

### Application
```json
{
  "resume_version_id": "string",
  "company": "string",
  "position": "string",
  "application_date": "string (YYYY-MM-DD format)",
  "status": "string (applied|interview|rejected|offer|withdrawn)",
  "notes": "string (optional)",
  "follow_up_date": "string (optional, YYYY-MM-DD format)"
}
```

## Example Usage

### Create Personal Information
```bash
curl -X POST "http://localhost:8000/api/v1/personal-info/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123",
    "location": "San Francisco, CA"
  }'
```

### Create Education Entry
```bash
curl -X POST "http://localhost:8000/api/v1/education/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "degree": "Bachelor of Science",
    "institution": "University of California",
    "field_of_study": "Computer Science",
    "graduation_date": "2020-06",
    "gpa": 3.8
  }'
```

### Create Resume Version
```bash
curl -X POST "http://localhost:8000/api/v1/resume-versions/?user_id=user123" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "TechCorp Inc.",
    "company_email": "hr@techcorp.com",
    "job_title": "Senior Software Engineer",
    "resume_data": {
      "title": "Senior Software Engineer",
      "summary": "Experienced developer...",
      "experience": [],
      "skills": ["Python", "JavaScript"]
    }
  }'
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content (for DELETE operations)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

Error responses include a JSON object with error details:
```json
{
  "detail": "Error message describing what went wrong"
}
```

## Testing

Run the test script to verify all endpoints:
```bash
python test_api_endpoints.py
```

Make sure the API server is running first:
```bash
python -m uvicorn app.main:app --reload
```

## API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
