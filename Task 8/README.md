# Tunescape — Spotify Wrapped, On Demand

**Tunescape** is a frontend-only React Single Page Application (SPA) that acts as an "on-demand Spotify Wrapped." Built for Task 8, it extends a React Router application with **Firebase Authentication**, **Firestore database integration**, and **Redux Toolkit** for global state management and robust API caching.

The app allows users to securely log in, connect their Spotify account, browse their top tracks across three time ranges, analyze audio features, and export a shareable PDF report.

---

## 🛠 Tech Stack & Architecture

- **Core:** React 19, Vite, React Router v7
- **Authentication:** Firebase Auth (Email/Password & Google) + Spotify OAuth (PKCE)
- **Database:** Firebase Firestore (for user favorites & Spotify token linking)
- **State & Caching:** Redux Toolkit (RTK)
- **External APIs:** Spotify Web API, ReccoBeats API
- **Styling:** Custom Vanilla CSS (Glassmorphism, Cassette/Vinyl aesthetics)

### Project Structure

- `src/pages/` — Route-level components (lazy-loaded).
- `src/components/` — Reusable UI, layouts, and route guards.
- `src/services/` — API abstractions (Auth, Firestore, Spotify Link).
- `src/store/` — Redux Toolkit configuration (`store.js`), memoized selectors, and feature slices.
- `src/context/` — Global authentication state (`AuthContext`).
- `src/hooks/` — Local UI hooks (e.g., debounce, service worker).

---

## 🔒 Authentication & Routing

The app uses a **Two-Layer Authentication** system:

1. **App Identity:** Managed by Firebase (Email/Password or Google).
2. **Data Connection:** Managed by Spotify OAuth PKCE.

### Route Protection

Public routes include Home, About, and Tracks. The Profile and Report pages are wrapped in a `DemoRestrictedRoute`, meaning guests in "Demo Mode" are shown a friendly fallback UI, while unauthenticated users are redirected to `/login`.

```jsx
// Example: src/components/DemoRestrictedRoute.jsx
export default function DemoRestrictedRoute() {
  const { demoMode, loading } = useAuth()
  if (loading) return <LoadingState label="Checking session…" />
  if (!demoMode) return <Outlet />

  return (
    <section className="view">
      <div className="report-card">
        <h2>Unavailable in Demo Mode</h2>
        <p>Please log in or create an account to access this feature.</p>
        <Link to="/login" className="btn btn-primary">Log in</Link>
      </div>
    </section>
  )
}
```

### Spotify Link Constraint

To prevent a single Spotify account from being linked to multiple Tunescape accounts, the app uses a dedicated `spotifyLinks` collection in Firestore. The document ID is the **Spotify User ID**, ensuring atomic, secure claims.

---

## ⚡ State Management & Caching Strategy

The application uses **Redux Toolkit** as the single source of truth for server state. **React Query has been entirely removed** to prevent duplicated state. Redux handles the caching, loading states, and race condition prevention.

### Redux Toolkit Architecture (Task 8)

#### Slices (`src/store/slices/`)

- **`tracksSlice`:** Manages aggregated top tracks. Uses a `condition` in its thunk to prevent unnecessary API requests if data is already loaded for the current user scope.
- **`favoritesSlice`:** Manages the user's saved favorites.
- **`audioFeaturesSlice`:** Acts as a cache for ReccoBeats audio features, storing them by track ID to avoid redundant requests when viewing track details.

#### Async Thunks (`createAsyncThunk`)

- **`fetchTracks` (List Fetching):** Aggregates top tracks from short, medium, and long-term ranges. Uses `AbortSignal` to cancel stale requests if the user navigates away mid-fetch.
- **`fetchFeatures` (Details Fetching):** Fetches audio features for a specific track.
- **`createFavorite` / `deleteFavorite` (Mutations):** Handles Firestore CRUD. Upon a `fulfilled` status, it immediately dispatches `getFavorites` to refresh the affected data, ensuring the UI is never stale.

#### Memoized Selectors (`src/store/selectors.js`)

- **`selectAllTracks`:** Basic selector for raw track data.
- **`selectFilteredAndSortedTracks`:** Memoized with `createSelector` to efficiently filter by search/range and sort by popularity/duration without triggering unnecessary re-renders.
- **`selectPaginatedTracks`:** Memoized to slice the filtered array into pagination chunks.
- **`selectFilteredAndSortedFavorites`:** Memoized to handle search and sorting for the Favorites list.

#### Lifecycle Handling (`extraReducers`)

All thunks handle `pending`, `fulfilled`, and `rejected` states to update the global `status` and `error` fields. This powers the UI's loading spinners, error boundaries, retry buttons, and empty states.

---

## 🎵 External APIs & Data Fetching

### 1. Spotify Web API (PKCE Flow)

Uses the **PKCE (Proof Key for Code Exchange)** flow to securely request top tracks without a backend secret. The app makes three parallel requests and deduplicates tracks via a `Map` before updating the Redux store.

### 2. ReccoBeats API

Since Spotify deprecated its `/audio-features` endpoint, Tunescape uses **ReccoBeats** to enrich the track data. Requests are automatically chunked in batches of 40 to respect API limits. The results are stored in the `audioFeaturesSlice` dictionary.

### 3. Race Condition Prevention

All fetches are tied to an `AbortController` provided automatically by Redux Toolkit's `createAsyncThunk` (passed via the `signal`). If a user rapidly changes filters or navigates away, the outdated request is aborted, preventing memory leaks and state overwrites.

---

## 🛡️ Read-Only Demo Mode

To allow reviewers to explore the app without a Spotify account, users can click **"Browse Demo →"** on the login page.

- Bypasses network requests and loads static `demo-tracks.json` via Redux.
- Route guards prevent demo users from accessing the Profile or Report.
- Favorite buttons are disabled (`readOnly`), and local state handles the UI restrictions.

---

## 🚀 Setup & Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_SPOTIFY_CLIENT_ID=...
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

### 3. Firebase setup

1. Enable **Email/Password** and **Google** authentication in the Firebase Console.
2. Deploy the following Firestore rules to ensure users can only read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId}/favorites/{favoriteId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    match /users/{userId}/integrations/spotify {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    // One Spotify account - one Tunescape account.
    match /spotifyLinks/{spotifyId} {
      allow create: if request.auth != null
        && request.resource.data.keys().hasOnly(['uid', 'linkedAt'])
        && request.resource.data.uid == request.auth.uid;

      allow update: if request.auth != null
        && resource.data.uid == request.auth.uid
        && request.resource.data.keys().hasOnly(['uid', 'linkedAt'])
        && request.resource.data.uid == request.auth.uid;

      allow delete: if request.auth != null
        && (resource == null || resource.data.uid == request.auth.uid);
    }
  }
}
```

### 4. Run the app

```bash
npm run dev
```