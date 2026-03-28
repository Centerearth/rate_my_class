Make authentication be a context not a cookie
Write unit tests
not found page never gets accessed because it assumes everything is a class name
Autofill name in review class request
Protect the React routes so that unauthorized users cannot post
Change into a search bar
Add more classes
Add the option to add a new class with a new description - need to store it in the database?
Modernize the look, fix styling
Merge branch, conserve old one?
Deploy?

---

## Implementation Plan

### 1. Fix the 404 / NotFoundPage Routing Bug

**Problem:** The catch-all route `/*` in `router.jsx` matches every unknown URL, including invalid class names. Since `/:classNum` is a dynamic route, paths like `/foobar` resolve to `ClassReviewPage` instead of `NotFoundPage`. The 404 page is effectively unreachable.

**Solution:**
- Move `NotFoundPage` to the end of the route list, but change the `/:classNum` route to only match known class identifiers. Do this by keeping the wildcard `/*` as the true 404 catch-all and adding validation _inside_ `ClassReviewPage`: on mount, check if `classNum` matches a known class (either from `class-descriptions.json` or a database query). If it doesn't match, render the `NotFoundPage` component directly (or redirect to `/not-found`).
- Alternatively, fetch the list of valid class IDs from the backend and use a loader/guard in the router to reject unknown class slugs before `ClassReviewPage` even renders.

---

### 2. Migrate Frontend Auth to a Fully-Integrated React Context

**Problem:** `AuthContext.jsx` exists but isn't the single source of truth. The `Header` component re-calls `getUser()` independently rather than reading from the context. Login/logout in other pages also manage state inconsistently.

**Solution:**
- Ensure `AuthContext` is the _only_ place that calls `getUser()` (on initial app load).
- `login()` and `logout()` in context should update the `user` state immediately on success, so no additional API calls are needed elsewhere.
- Remove any direct `getUser()` calls from `Header`, `AccountPage`, or any other component — they should all consume `useAuth()`.
- The backend cookie stays as-is (HTTP-only cookies are the correct security model). "Context not a cookie" means the _frontend_ should never inspect the cookie directly — auth state lives entirely in React Context.

---

### 3. Protect React Routes for Unauthorized Users

**Problem:** `ReviewMakerPage` and `AccountPage` are accessible to unauthenticated users. Any visitor can navigate to `/review-maker` directly.

**Solution:**
- Create a `ProtectedRoute` wrapper component in `src/components/ProtectedRoute.jsx`. It reads `user` and `isAuthLoading` from `useAuth()`. While loading, show a spinner. If `user` is null after loading, redirect to `/login` with React Router's `<Navigate>`. If authenticated, render `<Outlet />`.
- In `router.jsx`, wrap `/review-maker` and `/account` inside this `ProtectedRoute` component.
- Also protect the backend: the `POST /api/review/:class` endpoint should be moved behind the `secureApiRouter` middleware so unauthenticated POST requests are rejected with a 401.

---

### 4. Autofill Reviewer Name in ReviewMakerPage

**Problem:** The review form requires users to manually type their name, even though the app knows who is logged in.

**Solution:**
- In `ReviewMakerPage`, call `useAuth()` to get the current `user` object.
- Pre-populate the name field's `defaultValue` (or controlled `value`) with `user.name` when the component mounts.
- Keep the field editable in case the user wants to post anonymously or under a different name.
- As a follow-up, consider storing `userId` alongside the review in MongoDB so reviews are traceable to accounts (useful for future edit/delete features).

---

### 5. Replace Class Dropdown with a Search Bar

**Problem:** The `HomePage` uses a `<select>` dropdown to browse classes. This doesn't scale and is slow to navigate with many classes.

**Solution:**
- Replace the `<select>` with a text `<input>` that filters a displayed list in real time.
- On each keystroke, filter `class-descriptions.json` entries where the class name, number, or description contains the search string (case-insensitive).
- Render the filtered results as a clickable list below the input (a simple unstyled `<ul>`). Clicking an entry navigates to `/:classNum`.
- If the class list moves to the database (see item 6), fetch the full list once on mount and filter client-side, or debounce and call a `GET /api/classes?q=...` endpoint.

---

### 6. Add More Classes & Allow Users to Submit New Classes

**Problem:** Classes are hard-coded in `src/data/class-descriptions.json`. Adding a new class requires a code change and re-deploy.

**Solution:**

**Database migration:**
- Create a new `classes` MongoDB collection with documents shaped as: `{ classId: "cs260", name: "Web Programming", description: "...", department: "CS", credits: 3 }`.
- Seed the collection with the existing 15 entries from `class-descriptions.json`.
- Add a `GET /api/classes` backend route that returns all class documents. The frontend fetches this on app load (or on `HomePage` mount) instead of importing the JSON file.

**User-submitted classes:**
- Add a `POST /api/classes` endpoint (protected — requires auth) that accepts `{ classId, name, description, department, credits }`.
- On `HomePage`, show an "Add a class" button (visible only to logged-in users) that opens a modal or navigates to a `/add-class` page with a short form.
- Validate that `classId` is unique before inserting. Return a helpful error if it already exists.
- Consider a moderation flag (`approved: boolean`) so new classes appear only after an admin reviews them, preventing spam.

---

### 7. Modernize the UI / Fix Styling

**Problem:** The app uses plain Bootstrap without a consistent visual language. The current look is functional but dated.

**Suggested changes:**
- Define a color palette in `index.css` using CSS custom properties (e.g., BYU navy `#002E5D` and white). Apply them as Bootstrap overrides via Sass variables or direct `style` overrides.
- Replace the plain `<select>` on `HomePage` with the new search bar (see item 5) styled as a centered hero section with a prominent heading.
- Convert review tables in `ClassReviewPage` from plain Bootstrap tables to card-based layouts or styled rows with star/grade badges.
- Add a loading skeleton or spinner while reviews are fetching, rather than showing an empty table.
- Make `Header` responsive: collapse nav links into a hamburger menu on mobile (Bootstrap's `navbar-toggler` is already available).
- Standardize button styles, spacing, and typography across all pages so they feel cohesive.
- Remove the unused Tailwind CSS dependency from `package.json` (it is installed but never configured or used).

---

### 8. Write Unit Tests

**Problem:** There are zero tests. Regressions are caught only by manual testing.

**Recommended test setup:**
- Add Vitest (compatible with Vite) for both frontend and backend unit tests.
- Add React Testing Library for component tests.

**Priority test cases:**

_Frontend (Vitest + React Testing Library):_
- `AuthContext`: verify `login()` sets `user`, `logout()` clears it, and the initial `isAuthLoading` state resolves correctly.
- `ProtectedRoute`: verify unauthenticated users are redirected and authenticated users see the child component.
- `ClassReviewPage`: verify that an unknown `classNum` renders the 404 state, and a valid one renders reviews.
- `ReviewMakerPage`: verify the name field is pre-filled from context when a user is logged in.

_Backend (Vitest or Jest):_
- `database.js`: mock the MongoDB client and verify `addUser`, `getUser`, `addReview`, `getReviews` call the correct collection methods with the right arguments.
- `auth.js`: verify that `POST /api/auth/login` with valid credentials sets a cookie, and with invalid credentials returns 401.
- `reviews.js`: verify that `POST /api/review/:class` without a valid auth cookie returns 401 (once that protection is added in item 3).

---

### 9. Branch Strategy & Deployment

**Branches:**
- Keep the current `cleanup` branch for all the changes above.
- Merge into `main` only when features are tested and stable.
- Tag the last "old" state of `main` with `git tag v0-original` before merging, so the original version is preserved without needing to keep a separate branch alive.

**Deployment (existing AWS setup):**
- The existing `deployService.sh` and `ratemyclass260.link` setup can continue to be used.
- Once the `classes` collection is added to MongoDB, run the seed script once on the server before deploying the new backend.
- Confirm environment variables (`MONGOUSER`, `MONGOPASSWORD`, `MONGOHOSTNAME`) are set in the server environment and not committed to version control. Consider moving `.env` values to AWS Secrets Manager or an EC2 instance profile if the project grows.
- After deploying protected routes, verify the `/review-maker` path returns a redirect (not a 401 raw response) for unauthenticated browser users.

---

## Change Log

### 2026-03-27

**#1 — Fixed 404 routing bug (`ClassReviewPage.jsx`)**
- Added a `if (!description) return <NotFoundPage />` guard inside `ClassReviewPage`. Unknown class slugs (e.g. `/foobar`) now correctly render the 404 page instead of crashing. The `useEffect` check was placed before the early return to comply with React's Rules of Hooks.

**#2 — Migrated frontend auth to React Context**
- `main.jsx`: Wrapped `<RouterProvider>` in `<AuthProvider>` so the context is available app-wide.
- `Header.jsx`: Replaced direct `getUser()` API call with `useAuth()`. The component now reads `user` from context and uses context's `logout()` instead of the raw API function.
- `AccountPage.jsx`: Removed `useEffect`/`getUser()` call; now reads `user` from `useAuth()`. Calls `clearUser()` from context after account deletion.
- `LoginPage.jsx`: After successful login, fetches user data and calls `login(userData)` to update context state.
- `SignUpPage.jsx`: Same pattern as LoginPage — calls `login(userData)` after successful registration.

**#3 — Protected React routes**
- Created `src/components/ProtectedRoute.jsx`: reads `user` and `isAuthLoading` from context. Shows a spinner while loading, redirects to `/login` if unauthenticated, renders `<Outlet />` if authenticated.
- `router.jsx`: Wrapped `/account` and `/review-maker` inside a `ProtectedRoute` parent route using nested `children`.
- `backend/modules/reviews.js`: Moved `POST /review/:class` from the public router to a new `secureRouter` (exported separately). GET remains public.
- `backend/index.js`: Updated imports to use the new named exports from `reviews.js`; mounted `reviewsSecureRouter` on `secureApiRouter` so the POST endpoint requires auth.

**#4 — Autofill name in ReviewMakerPage**
- `ReviewMakerPage.jsx`: Added `useAuth()` import; initialized `userName` state with `user?.name ?? ''` so the name field is pre-populated for logged-in users.

**#5 — Replaced class dropdown with search bar on HomePage**
- `HomePage.jsx`: Replaced the `<select>` dropdown and GO button with a live-filter text `<input>`. On each keystroke, the list of classes is filtered by ID, label, or description (case-insensitive). Results render as a clickable `<ul class="list-group">` — clicking any entry navigates to `/:classNum`.
