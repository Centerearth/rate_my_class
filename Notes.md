Add the whole error modal thing?
Modernize the look, fix styling
Make sure no ports are hardcoded
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

### 8. Write Frontend Unit Tests

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
