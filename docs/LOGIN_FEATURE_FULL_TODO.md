# Login Feature Full TODO List

This document outlines all remaining tasks required to implement the login feature, covering both frontend and backend development.

## 1. Backend API Implementation

These tasks focus on creating the necessary backend infrastructure for user authentication.

-   [x] **Database Changes:**
    -   Add `hashed_password` to the `users` table in the database. (This requires a migration script if the database is already deployed).
-   [x] **Post-Migration Cleanup:**
    -   [x] Update the existing user(s) with a real hashed password. The user created before this migration has a placeholder password 'NOT_A_VALID_PASSWORD'.
    -   [x] Once all users are updated, create a new migration to remove the `DEFAULT` value from the `hashed_password` column to enforce password creation at the application level.
-   [x] **Create Pydantic Models for User:**
    -   In `backend-app/models/user.py` (or similar), define `User` (for database representation) and `UserCreate` (for registration input).
-   [x] **Implement Password Hashing Utility:**
    -   In `backend-app/core/security.py` (or similar), create functions for securely hashing and verifying passwords (e.g., using `passlib` and `cryptography`).
-   [x] **Create Backend API Endpoints for User Registration:**
    -   Define a new endpoint (e.g., in `backend-app/api/auth.py`) that accepts `UserCreate` data.
    -   Hash the password and save the new user to the `users` table.
-   [x] **Create Backend API Endpoints for User Login:**
    -   Define a new endpoint that accepts credentials (e.g., email and password).
    -   Verify the password against the stored hash.
    -   Generate and return a JWT upon successful authentication.
-   [ ] **Create Backend API Endpoints for User Logout:**
    -   Implement a mechanism to invalidate JWTs or manage sessions.
-   [ ] **Implement JWT-based Authentication for Securing API Endpoints:**
    -   Add middleware or decorators to protect existing and new API endpoints, requiring a valid JWT for access.
-   [ ] **Update Existing Resume-Related Backend Endpoints to be User-Specific:**
    -   Modify endpoints to filter data based on the authenticated `user_id` from the JWT.

## 2. Frontend Development and Debugging

These tasks address the immediate frontend accessibility issues and then focus on fully integrating the authentication flow.

-   [ ] **Debug Login/Register Page Accessibility:**
    -   [ ] **Temporarily Disable Authentication HOC:**
        -   Revert the changes in `app/resumes/page.tsx` and `app/personal-info/page.tsx` to remove the `withAuth` wrapper.
        -   This will help determine if the issue is with the authentication HOC or the pages themselves.
    -   [ ] **Review `withAuth` HOC Logic:**
        -   Examine `src/lib/withAuth.tsx`.
        -   Modify the logic to explicitly *not* redirect if the user is already on the `/login` or `/register` pages. This will prevent redirect loops.
        -   Example of how to achieve this (you will need to import `usePathname` from `next/navigation`):
        ```javascript
        // Inside the withAuth HOC's useEffect
        const router = useRouter();
        const { isAuthenticated } = useAuth();
        const pathname = usePathname();

        useEffect(() => {
          if (!isAuthenticated && pathname !== '/login' && pathname !== '/register') {
            router.push('/login');
          }
        }, [isAuthenticated, pathname, router]);
        ```
    -   [ ] **Verify File Paths and Content:**
        -   Ensure `app/login/page.tsx` and `app/register/page.tsx` are correctly named and located.
        -   Check for any syntax errors or issues in these files.
    -   [ ] **Re-apply Authentication HOC:**
        -   Once the `/login` and `/register` pages are accessible, re-apply the `withAuth` HOC to the protected routes (`/resumes`, `/personal-info`, etc.).

-   [ ] **Implement Client-Side Authentication Logic:**
    -   [ ] **Update `AuthContext`:**
        -   In `src/lib/AuthContext.tsx`, modify the `login` function to accept a JWT and store it in `localStorage`.
        -   Modify the `logout` function to remove the JWT from `localStorage`.
        -   Update the `isAuthenticated` state to be derived from the presence of a valid token in `localStorage`. This should also be checked when the `AuthProvider` first mounts.
    -   [ ] **Integrate with Login/Register Pages:**
        -   In `app/login/page.tsx` and `app/register/page.tsx`, update the form submission handlers to call the backend API.
        -   On successful login, call the `login` function from `AuthContext` with the received JWT.
        -   On logout (e.g., from the Navbar), call the `logout` function.

## 3. Testing

-   [ ] Write unit and integration tests for new backend authentication endpoints.
-   [ ] Write end-to-end tests for the login and registration flows on the frontend.
-   [ ] Verify that resume data is correctly segregated by user.

## 4. Frontend Implementation (Untracked Files)

The following files are part of the frontend implementation for the login feature. They are currently untracked and need to be committed.

-   [x] `app/login/`
-   [x] `app/register/`
-   [x] `docs/FRONTEND_LOGIN_TODO.md`
-   [x] `src/components/common/Navbar.tsx`
-   [x] `src/lib/AuthContext.tsx`
-   [x] `src/lib/withAuth.tsx`

