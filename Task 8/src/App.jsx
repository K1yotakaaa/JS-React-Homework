import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import RootLayout from './components/RootLayout'
import DemoRestrictedRoute from './components/DemoRestrictedRoute'
import ConnectivityIndicator from './components/ConnectivityIndicator'
import UpdatePrompt from './components/UpdatePrompt'
import InstallPrompt from './components/InstallPrompt'
import AppErrorBoundary from './components/AppErrorBoundary'
import { LoadingState } from './components/States'
import { useServiceWorker } from './hooks/useServiceWorker'
import OfflinePage from './pages/OfflinePage'

const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const TracksPage = lazy(() => import('./pages/TracksPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const ReportPage = lazy(() => import('./pages/ReportPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="app-loading">
      <LoadingState label={label} />
    </div>
  )
}

export default function App() {
  const { updateReady, offlineReady, activateUpdate, dismissOfflineReady } =
    useServiceWorker()

  return (
    <>
      <div className="pwa-stack">
        <ConnectivityIndicator />
        <UpdatePrompt
          updateReady={updateReady}
          onActivate={activateUpdate}
          offlineReady={offlineReady}
          onDismissOfflineReady={dismissOfflineReady}
        />
        <InstallPrompt />
      </div>
      <AppErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route
              path="callback"
              element={<PageLoader label="Connecting to Spotify…" />}
            />

            <Route element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="tracks" element={<TracksPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="offline" element={<OfflinePage />} />
              <Route element={<DemoRestrictedRoute />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="report" element={<ReportPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AppErrorBoundary>
    </>
  )
}