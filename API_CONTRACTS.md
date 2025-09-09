# Resume Editor API Contracts

This document defines the request/response contracts for the Resume Editor API endpoints.

## Base URL
```
http://localhost:8001/api/v1
```

## Authentication
Currently no authentication is required. This will be added in future versions.

## Data Models

### Resume
Complete resume data structure with validation rules.

```json
{
  "title": "Senior Software Engineer",
  "summary": "Experienced full-stack developer with 5+ years building scalable web applications using React, Node.js, and cloud technologies.",
  "experience": [
    {
      "role": "Senior Software Engineer",
      "organization": "TechCorp Inc.",
      "location": "San Francisco, CA",
      "startDate": "2021-03",
      "endDate": null,
      "bullets": [
        "Led development of microservices architecture serving 1M+ daily active users",
        "Improved application performance by 40% through code optimization and caching strategies"
      ]
    }
  ],
  "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS"],
  "factsInventory": {
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "organizations": ["TechCorp Inc.", "StartupXYZ"],
    "roles": ["Senior Software Engineer", "Software Engineer"],
    "dates": [
      {"start": "2021-03", "end": null},
      {"start": "2019-06", "end": "2021-02"}
    ],
    "certifications": ["AWS Certified Developer"]
  }
}
```

### ExperienceEntry
Individual work experience entry with validation.

**Required Fields:**
- `role`: Job title (1-100 characters)
- `organization`: Company name (1-100 characters)  
- `startDate`: Start date in YYYY-MM format
- `bullets`: Array of achievements (1-10 items, max 200 chars each)

**Optional Fields:**
- `location`: Work location (max 100 characters)
- `endDate`: End date in YYYY-MM format (null for current position)

### FactsInventory
Validated data for guardrails and consistency checks.

**Required Fields:**
- `skills`: Array of validated skills
- `organizations`: Array of validated organization names
- `roles`: Array of validated job roles/titles
- `dates`: Array of validated date ranges

**Optional Fields:**
- `certifications`: Array of validated certifications

## API Endpoints

### Edit Operations

#### POST /api/v1/edit
Edit a specific section of a resume.

**Request Body:**
```json
{
  "sectionId": "experience_0",
  "sectionType": "experience",
  "originalContent": "Led development of microservices architecture serving 1M+ daily active users",
  "newContent": "Led development of microservices architecture serving 2M+ daily active users",
  "rationale": "Updated user count to reflect current metrics",
  "action": "accept"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Edit applied successfully",
  "sectionId": "experience_0",
  "updatedContent": "Led development of microservices architecture serving 2M+ daily active users",
  "timestamp": "2024-01-15T10:30:00Z",
  "changeId": "chg_1234567890"
}
```

#### GET /api/v1/edit/history/{section_id}
Get the edit history for a specific section.

**Response:**
```json
[
  {
    "success": true,
    "message": "Edit applied successfully",
    "sectionId": "experience_0",
    "updatedContent": "Updated content",
    "timestamp": "2024-01-15T10:30:00Z",
    "changeId": "chg_1234567890"
  }
]
```

#### POST /api/v1/edit/restore/{change_id}
Restore a previous edit by its change ID.

**Response:**
```json
{
  "success": true,
  "message": "Edit restored successfully",
  "sectionId": "experience_0",
  "updatedContent": "Restored content",
  "timestamp": "2024-01-15T10:30:00Z",
  "changeId": "chg_1234567890"
}
```

### Export Operations

#### POST /api/v1/export/pdf
Export resume to PDF format.

**Request Body:** Complete Resume object

**Response:** PDF file with appropriate headers

#### POST /api/v1/export/html
Export resume to HTML format.

**Request Body:** Complete Resume object

**Response:** HTML file with print-optimized styles

#### POST /api/v1/export/json
Export resume to JSON format.

**Request Body:** Complete Resume object

**Response:**
```json
{
  "title": "Senior Software Engineer",
  "summary": "Experienced full-stack developer...",
  "experience": [...],
  "skills": [...],
  "factsInventory": {...}
}
```

## Validation Rules

### Date Format
- All dates must be in `YYYY-MM` format
- Use `null` for current/ongoing positions

### String Lengths
- `title`: 1-100 characters
- `summary`: 1-500 characters
- `role`: 1-100 characters
- `organization`: 1-100 characters
- `location`: max 100 characters
- `bullets`: 1-200 characters each
- `skills`: 1-50 characters each, must be unique

### Array Constraints
- `experience`: minimum 1 entry
- `skills`: minimum 1 entry, unique values
- `bullets`: 1-10 items per experience entry

## Error Responses

### Validation Error (422)
```json
{
  "detail": [
    {
      "loc": ["field_name"],
      "msg": "error message",
      "type": "error_type"
    }
  ]
}
```

### Server Error (500)
```json
{
  "detail": "Internal server error message"
}
```

## OpenAPI Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`
- OpenAPI JSON: `http://localhost:8001/openapi.json`

## Example Usage

### cURL Examples

**Edit a resume section:**
```bash
curl -X POST "http://localhost:8001/api/v1/edit" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": "experience_0",
    "sectionType": "experience",
    "originalContent": "Original content",
    "newContent": "Updated content",
    "rationale": "Reason for change",
    "action": "accept"
  }'
```

**Export resume to JSON:**
```bash
curl -X POST "http://localhost:8001/api/v1/export/json" \
  -H "Content-Type: application/json" \
  -d @sample-resume.json
```

**Get section history:**
```bash
curl "http://localhost:8001/api/v1/edit/history/experience_0"
```

## Testing

The API includes comprehensive validation and can be tested with the provided sample data in `fixtures/sample-resume.json`.

Run the test suite:
```bash
python3.11 test_models.py
```

Start the development server:
```bash
python3.11 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```
