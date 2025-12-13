# Frontend Login Feature - Debugging and Completion Plan

This document outlines the steps to debug the login/registration page accessibility issue and complete the frontend implementation for the login feature.

## 1. Debug Login/Register Page Accessibility

The immediate priority is to fix the issue preventing access to the `/login` and `/register` pages.

-   [ ] **Temporarily Disable Authentication HOC:**
    -   Revert the changes in `app/resumes/page.tsx` and `app/personal-info/page.tsx` to remove the `withAuth` wrapper.
    -   This will help determine if the issue is with the authentication HOC or the pages themselves.

-   [ ] **Review `withAuth` HOC Logic:**
    -   Examine `src/lib/withAuth.tsx`.
    -   Modify the logic to explicitly *not* redirect if the user is already on the `/login` or `/register` pages. This will prevent redirect loops.
    -   Example of how to achieve this:

    ```javascript
    // Inside the withAuth HOC's useEffect
    import { usePathname } from 'next/navigation'; // Make sure to import this
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

## 2. Implement Client-Side Authentication Logic

After debugging, the next step is to make the authentication flow functional on the client side.

-   [ ] **Update `AuthContext`:**
    -   In `src/lib/AuthContext.tsx`, modify the `login` function to accept a JWT and store it in `localStorage`.
    -   Modify the `logout` function to remove the JWT from `localStorage`.
    -   Update the `isAuthenticated` state to be derived from the presence of a valid token in `localStorage`. This should also be checked when the `AuthProvider` first mounts.

-   [ ] **Integrate with Login/Register Pages:**
    -   In `app/login/page.tsx` and `app/register/page.tsx`, update the form submission handlers to call the backend API (once it's ready).
    -   On successful login, call the `login` function from `AuthContext` with the received JWT.
    -   On logout (e.g., from the Navbar), call the `logout` function.

## 3. Backend Integration (Future Step)

These frontend tasks will prepare the application for integration with the backend authentication endpoints once they are developed.

-   [ ] Connect the `login` and `register` form submissions to the actual backend API endpoints.
-   [ ] Implement error handling for API responses (e.g., displaying "Invalid credentials" to the user).
