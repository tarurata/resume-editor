# Login Feature TODO List

This document outlines the tasks required to implement the login feature, allowing each user to manage their own resume data.

## Database Changes

- [ ] Add `users` table to the database. (Already present, needs alteration)
- [ ] Add `user_id` to the `resumes` table. (Already present in `resume_versions` table)
- [ ] Create a migration script to add `hashed_password` to the `users` table.

## Backend API

- [ ] Create backend API endpoints for user registration.
- [ ] Create backend API endpoints for user login.
- [ ] Create backend API endpoints for user logout.
- [ ] Implement JWT-based authentication for securing API endpoints.
- [ ] Update existing resume-related backend endpoints to be user-specific.

## Frontend Development

- [ ] Create login page/component.
- [ ] Create registration page/component.
- [ ] Implement client-side authentication state management (e.g., using React Context or a global store).
- [ ] Update frontend API service calls to include JWT in headers for authenticated requests.
- [ ] Protect frontend routes, redirecting unauthenticated users to the login page.
- [ ] Display user information and a logout option when authenticated.

## Testing

- [ ] Write unit and integration tests for new backend authentication endpoints.
- [ ] Write end-to-end tests for the login and registration flows on the frontend.
- [ ] Verify that resume data is correctly segregated by user.
