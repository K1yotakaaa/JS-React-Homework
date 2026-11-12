# Tunescape — Spotify Wrapped, On Demand

**Tunescape** is a frontend-only React Single Page Application (SPA) that acts as an "on-demand Spotify Wrapped." Built for Task 6, it extends a React Router application with **Firebase Authentication**, **Firestore database integration**, and **TanStack Query** caching.

The app allows users to securely log in, connect their Spotify account, browse their top tracks across three time ranges, analyze audio features, and export a shareable PDF report.

---

## 🛠 Tech Stack & Architecture

- **Core:** React 19, Vite, React Router v7
- **Authentication:** Firebase Auth (Email/Password & Google) + Spotify OAuth (PKCE)
- **Database:** Firebase Firestore (for user favorites & Spotify token linking)
- **State & Caching:** TanStack Query (React Query)
- **External APIs:** Spotify Web API, ReccoBeats API
- **Styling:** Custom Vanilla CSS (Glassmorphism, Cassette/Vinyl aesthetics)

### Project Structure

- `src/pages/` — Route-level components (lazy-loaded).
- `src/components/` — Reusable UI, layouts, and route guards.
- `src/services/` — API abstractions (Auth, Firestore, Spotify Link).
- `src/hooks/` — TanStack Query hooks (`useTopTracks`, `useFavorites`).
- `src/context/` — Global authentication and Spotify token state.

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

To prevent a single Spotify account from being linked to multiple Tunescape accounts, the app uses a dedicated `spotifyLinks` collection in Firestore. The document ID is the Spotify User ID, ensuring atomic, secure claims.

```jsx
// Example: src/services/spotifyLinkService.js
export async function claimSpotifyLink(uid, spotifyId, tokens, previousSpotifyId = null) {
  const batch = writeBatch(db)
  batch.set(linkRef(spotifyId), { uid, linkedAt: Date.now() })
  batch.set(tokenRef(uid), buildTokenDoc({ ...tokens, spotifyId }))
  // ...
  await batch.commit()
}
```

---

## ⚡ Server Data & Caching Strategy

The app uses **TanStack Query** to manage server state, prevent race conditions, and cache responses from Firebase and Spotify.

### Query Keys & Stale Times

- **Top Tracks:** `['top-tracks', scope]` — Cached for 5 minutes. Automatically falls back to sample data if Spotify is not connected.
- **Audio Features:** `['audio-features', trackId, demoMode]` — Cached for 30 minutes (features rarely change).
- **User Favorites:** `['favorites', uid]` — Fetched from Firestore, invalidated upon mutation.

```jsx
// Example: Caching Audio Features
export function useAudioFeatures(trackId) {
  return useQuery({
    queryKey: ['audio-features', trackId, demoMode],
    queryFn: async ({ signal }) => { /* ... */ },
    enabled: !!trackId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}
```

### Cache Invalidation (CRUD)

When a user adds or removes a favorite, the cache is instantly invalidated, triggering a background refetch of the Firestore collection without reloading the page.

```jsx
// Example: src/hooks/useFavorites.js
const addMutation = useMutation({
  mutationFn: payload => addFavorite(uid, payload),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
})
```

---

## 🎵 External APIs & Data Fetching

### 1. Spotify Web API (PKCE Flow)

Uses the PKCE (Proof Key for Code Exchange) flow to securely request top tracks without a backend secret. The app makes three parallel requests for `short_term`, `medium_term`, and `long_term` data, deduplicating tracks via a `Map` before caching.

### 2. ReccoBeats API

Since Spotify deprecated its `/audio-features` endpoint, Tunescape uses ReccoBeats to enrich the track data (Danceability, Energy, Valence, etc.). Requests are automatically chunked in batches of 40 to respect API limits.

### 3. Race Condition Prevention

All fetches are tied to an `AbortController` (passed via TanStack Query's `signal`). If a user clicks rapidly between tracks or navigates away, the outdated request is aborted, preventing memory leaks and state overwrites.

---

## 🛡️ Read-Only Demo Mode

To allow reviewers to explore the app without a Spotify account, users can click **"Browse Demo →"** on the login page.

- Bypasses network requests and loads static `demo-tracks.json`.
- Route guards prevent demo users from accessing the Profile or Report.
- Favorite buttons are disabled (`readOnly`).

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

Enable **Email/Password** and **Google** authentication in the Firebase Console.

Deploy the following Firestore rules. These ensure users can only read/write their own favorites and integration tokens, and prevent a Spotify account from being linked to multiple Tunescape accounts:

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
    // The document ID is the Spotify user ID. No client can read these
    // documents, so one user can't see who owns a link.
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