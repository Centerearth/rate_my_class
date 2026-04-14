write unit tests for delete reviews - finished, update api and accountpage to display reviews, then implement deletion
Write unit tests for classes, Put classes and their descriptions in the backend, Implement ability to add a new class (where from?)
Change into a search bar
Submitting an invalid class review doesn't display an error message, it just auto redirects
Maybe add an overall rating?
Make sure no ports are hardcoded
Modernize the look, fix styling
Deploy?


---

## Implementation Plan

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

---
