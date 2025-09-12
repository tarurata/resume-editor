# Resume Editor Database

SQLite database implementation for the Resume Editor M1 project.

## Overview

This database provides persistent storage for resume data, supporting multi-company resume management and application tracking. It's designed to work with the existing frontend-only M1 scope while preparing for M2 backend integration.

## Database Schema

### Core Tables

- **users**: User accounts (for M2)
- **personal_info**: Contact information
- **education**: Education history
- **certifications**: Professional certifications
- **resume_versions**: Multi-company resume management
- **resume_history**: Change tracking
- **applications**: Job application tracking
- **templates**: Resume templates

### Key Features

- **Multi-Company Support**: Each resume version is tailored for a specific company
- **Change Tracking**: Full history of resume modifications
- **Application Management**: Track job applications and their status
- **Data Validation**: Pydantic models ensure data integrity
- **Migration Support**: Easy migration from localStorage

## Usage

### Initialize Database

```python
from database.database import DatabaseService

# Create database service
db = DatabaseService("resume_editor.db")

# Database is automatically initialized with schema
```

### Basic Operations

```python
# Create personal info
personal_info = PersonalInfo(
    user_id="user123",
    full_name="John Doe",
    email="john@example.com",
    phone="+1234567890",
    location="San Francisco, CA"
)
db.create_personal_info(personal_info)

# Create resume version
resume_version = ResumeVersionCreate(
    company_name="TechCorp Inc.",
    company_email="jobs@techcorp.com",
    job_title="Senior Software Engineer",
    job_description="We're looking for...",
    resume_data={"title": "Senior Software Engineer", ...}
)
db.create_resume_version(resume_version, "user123")

# Track application
application = ApplicationCreate(
    resume_version_id="version123",
    company="TechCorp Inc.",
    position="Senior Software Engineer",
    application_date=date.today(),
    status="applied"
)
db.create_application(application)
```

### Migration from localStorage

```python
from database.migration import DatabaseMigration

# Migrate existing data
migration = DatabaseMigration(db)
results = migration.migrate_from_localStorage(localStorage_data, "user123")

# Export back to localStorage format
export_data = migration.export_to_localStorage_format("user123")
```

## File Structure

```
database/
├── __init__.py          # Package initialization
├── schema.sql           # Database schema
├── models.py            # Pydantic models
├── database.py          # Database service layer
├── migration.py         # Migration utilities
├── requirements.txt     # Database dependencies
└── README.md           # This file
```

## Integration with Frontend

The database is designed to work seamlessly with the existing frontend:

1. **M1**: Use migration script to import localStorage data
2. **M2**: Direct database integration with API endpoints
3. **Export**: Convert database data back to localStorage format for frontend

## Data Flow

1. **Import**: localStorage → Database (via migration)
2. **Edit**: Frontend → API → Database
3. **Export**: Database → localStorage format → Frontend
4. **Backup**: Database → JSON file

## Benefits of SQLite

- **File-based**: No server setup required for M1
- **Lightweight**: Perfect for single-user applications
- **ACID compliant**: Data integrity guaranteed
- **Easy backup**: Single file contains all data
- **Fast**: Excellent performance for resume data
- **Portable**: Easy to migrate between systems

## Future Enhancements (M2+)

- User authentication integration
- Cloud storage synchronization
- Advanced search and filtering
- Resume analytics and insights
- ATS integration
- Multi-user support
