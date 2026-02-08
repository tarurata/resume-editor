---
name: Bug
about: Something is broken
labels: type:bug
---
## Expected Behavior
- `create_education` should correctly construct an `Education` object and save it to the database.
- `update_education` should correctly perform a partial update on the specified fields only.

## Actual Behavior
1.  **`POST /api/education` (Create Education):**
    *   The endpoint incorrectly calls the database service, passing a `EducationCreate` model instead of the expected `Education` model. This causes a `TypeError` at runtime.

2.  **`PUT /api/education/{education_id}` (Update Education):**
    *   The endpoint passes an `EducationUpdate` model to the database service, which expects a full `Education` object.
    *   The database service's `update_education` function does not support partial updates. It overwrites all fields, which can lead to data loss if a client only sends the fields they want to change.

These issues are similar to bugs recently fixed in the `personal-info` API.

## Steps to Reproduce
1. Send a `POST` request to `/api/education` with valid data. The request will fail.
2. Send a `PUT` request to `/api/education/{education_id}` with partial data (e.g., only a new `degree`). The request will likely fail or nullify other fields in the database record.


## Acceptance Criteria for Fix
- [ ] `create_education` works as expected.
- [ ] `update_education` performs partial updates correctly.
- [ ] No regression in existing functionality.

## M1/M1.5/M2 Scope
- [x] M2 (Python Backend)

## Screenshots/Logs
N/A
