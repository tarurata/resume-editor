# Resume Data Model Schema

## Overview

This document describes the canonical JSON schema for `resume.json` files used in the Resume Editor application.

## Schema Location

- **Schema File:** `schemas/resume-schema.json`
- **Version:** Draft 7 JSON Schema
- **Validation:** Use `npm run validate-schema` to test fixtures

## Core Structure

### Required Fields

- `title` (string): Professional headline or resume title
- `summary` (string): Professional summary or objective
- `experience` (array): Work experience entries
- `skills` (array): Skills and competencies

### Experience Entry Structure

Each experience entry requires:
- `role` (string): Job title or role
- `organization` (string): Company or organization name
- `startDate` (string): Start date in YYYY-MM format

Optional fields:
- `location` (string): Work location
- `endDate` (string|null): End date in YYYY-MM format, null for current position
- `bullets` (array): Achievement/description bullets (1-10 items)

### Skills Format

Skills are stored as an array of strings with:
- Minimum 1 item required
- Maximum 50 characters per skill
- Unique items only (no duplicates)

### Facts Inventory

The `factsInventory` object contains validated data for guardrails:
- `skills`: Validated skills list
- `organizations`: Validated organization names
- `roles`: Validated job roles/titles
- `dates`: Validated date ranges
- `certifications`: Validated certifications

## Sample Data

- **Sample Resume:** `fixtures/sample-resume.json`
- **ATS-Clean Template:** `fixtures/templates/ats-clean.json`
- **Compact Template:** `fixtures/templates/compact.json`
- **Sample Job Description:** `fixtures/sample-jd.txt`

## Validation

Run schema validation on all fixtures:

```bash
npm run validate-schema
```

## Design Decisions

### Skills as Array
Skills are stored as an array of strings rather than a single content string to:
- Enable individual skill validation
- Support skill-based filtering and search
- Allow for future skill categorization
- Maintain consistency with other list fields

### Date Format
Dates use YYYY-MM format to:
- Support partial date precision (month/year only)
- Enable chronological sorting
- Avoid timezone complications
- Match common resume practices

### Facts Inventory
Separate facts inventory enables:
- AI guardrails and validation
- Data consistency checks
- Future ML training data
- User input validation
