import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  subscribeToAuth,
  signUp,
  signIn,
  signInWithGoogle,
  logOut,
} from '../services/authService'
import {
  fetchSpotifyTokens,
  saveSpotifyTokens,
} from '../services/spotifyTokenService'
import {
  claimSpotifyLink,
  releaseSpotifyConnection,
} from '../services/spotifyLinkService'
import {
  buildLoginUrl,
  handleCallback,
  refreshAccessToken,
  fetchMe,
} from '../lib/spotify'
import { STORAGE_KEYS, SPOTIFY_INACTIVITY_LIMIT_MS } from '../config'
import { removeKey } from '../lib/storage'
import { getAuthErrorMessage } from '../utils/authErrors'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const callbackHandled = useRef(false)

  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const [tokens, setTokens] = useState(null)
  const [tokensLoading, setTokensLoading] = useState(true)
  const [spotifyExpired, setSpotifyExpired] = useState(false)
  const [spotifyUser, setSpotifyUser] = useState(null)

  const uidRef = useRef(null)
  const tokensRef = useRef(null)
  const refreshingRef = useRef(null)
  const freshRef = useRef(false)

  const demoMode = !authLoading && !user

  useEffect(() => {
    removeKey(STORAGE_KEYS.tokens)
    removeKey(STORAGE_KEYS.demoMode)
  }, [])

  useEffect(() => {
    const unsub = subscribeToAuth((fbUser) => {
      uidRef.current = fbUser?.uid ?? null
      setUser(fbUser)
      setAuthLoading(false)
    })
    return unsub
  }, [])

  const clearError = useCallback(() => setAuthError(null), [])

  const applyTokens = useCallback((next) => {
    tokensRef.current = next
    setTokens(next)
  }, [])

  const persistTokens = useCallback(
    (next) => {
      freshRef.current = true
      applyTokens(next)
      const uid = uidRef.current
      if (uid) saveSpotifyTokens(uid, next).catch(console.error)
    },
    [applyTokens]
  )

  const getValidToken = useCallback(async () => {
    const current = tokensRef.current
    if (!current) return null
    if (current.expires_at - Date.now() > 60_000) return current.access_token

    if (!refreshingRef.current) {
      refreshingRef.current = refreshAccessToken(current.refresh_token)
        .then((fresh) => {
          const next = { ...fresh, spotifyId: current.spotifyId }
          persistTokens(next)
          return next
        })
        .catch(async (e) => {
          if (e.message !== 'Refresh failed') throw e
          const id = uidRef.current
          applyTokens(null)
          setSpotifyExpired(true)
          if (id) {
            await releaseSpotifyConnection(id, current.spotifyId ?? null).catch(
              console.error
            )
          }
          return null
        })
        .finally(() => {
          refreshingRef.current = null
        })
    }

    const fresh = await refreshingRef.current
    return fresh?.access_token ?? null
  }, [persistTokens, applyTokens])

  const migrateLegacy = useCallback(
    async (uid) => {
      try {
        const token = await getValidToken()
        if (!token) return
        const me = await fetchMe(token)

        const current = tokensRef.current
        if (!current || uidRef.current !== uid || current.spotifyId) return

        const next = { ...current, spotifyId: me.id }
        await claimSpotifyLink(uid, me.id, next)
        applyTokens(next)
      } catch (e) {
        if (e.message === 'spotify_already_linked') {
          await releaseSpotifyConnection(uid, null).catch(console.error)
          applyTokens(null)
          setAuthError(getAuthErrorMessage(e))
        } else {
          console.error(e)
        }
      }
    },
    [getValidToken, applyTokens]
  )

  const uid = user?.uid ?? null
  useEffect(() => {
    if (authLoading) return

    if (!uid) {
      freshRef.current = false
      applyTokens(null)
      setSpotifyExpired(false)
      setTokensLoading(false)
      return
    }

    let cancelled = false
    freshRef.current = false
    setTokensLoading(true)

    fetchSpotifyTokens(uid)
      .then(async (saved) => {
        if (cancelled || freshRef.current) return

        if (!saved) {
          applyTokens(null)
          return
        }

        const idleMs = Date.now() - (saved.lastActiveAt ?? 0)
        if (idleMs > SPOTIFY_INACTIVITY_LIMIT_MS) {
          await releaseSpotifyConnection(uid, saved.spotifyId ?? null).catch(
            console.error
          )
          if (cancelled) return
          applyTokens(null)
          setSpotifyExpired(true)
          return
        }

        applyTokens(saved)
        saveSpotifyTokens(uid, saved).catch(console.error)

        if (!saved.spotifyId) migrateLegacy(uid)
      })
      .catch((e) => {
        console.error(e)
        if (!cancelled) applyTokens(null)
      })
      .finally(() => {
        if (!cancelled) setTokensLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, uid, applyTokens, migrateLegacy])

  useEffect(() => {
    const ctrl = new AbortController()
    if (demoMode) {
      setSpotifyUser({ display_name: 'Demo Listener' })
      return () => ctrl.abort()
    }
    if (!tokens?.access_token) {
      setSpotifyUser(null)
      return () => ctrl.abort()
    }
    getValidToken()
      .then((token) => (token ? fetchMe(token, ctrl.signal) : null))
      .then((me) => {
        if (!ctrl.signal.aborted) setSpotifyUser(me)
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setSpotifyUser(null)
      })
    return () => ctrl.abort()
  }, [tokens?.access_token, demoMode, getValidToken])

  useEffect(() => {
    if (pathname !== '/callback') {
      callbackHandled.current = false
      return
    }
    if (authLoading || callbackHandled.current) return
    callbackHandled.current = true

    const fallback = user ? '/profile' : '/login'
    const params = new URLSearchParams(search)
    const code = params.get('code')
    const state = params.get('state')
    const oauthError = params.get('error')

    if (oauthError) {
      setAuthError(getAuthErrorMessage(oauthError))
      navigate(fallback, { replace: true })
      return
    }
    if (!code) {
      navigate(fallback, { replace: true })
      return
    }
    if (!user) {
      setAuthError('Please sign in before connecting Spotify.')
      navigate('/login', { replace: true })
      return
    }

    const connectingUid = user.uid
    ;(async () => {
      try {
        const fresh = await handleCallback(code, state)
        const me = await fetchMe(fresh.access_token)
        const next = { ...fresh, spotifyId: me.id }
        const previousId = tokensRef.current?.spotifyId ?? null

        await claimSpotifyLink(connectingUid, me.id, next, previousId)

        freshRef.current = true
        applyTokens(next)
        setSpotifyExpired(false)
        setAuthError(null)
      } catch (e) {
        setAuthError(getAuthErrorMessage(e))
      }
      navigate('/profile', { replace: true })
    })()
  }, [pathname, search, authLoading, user, navigate, applyTokens])

  const wrap =
    (fn) =>
    async (...args) => {
      setAuthError(null)
      try {
        await fn(...args)
      } catch (e) {
        setAuthError(getAuthErrorMessage(e))
        throw e
      }
    }

  const handleSignUp = wrap(signUp)
  const handleSignIn = wrap(signIn)
  const handleGoogle = wrap(signInWithGoogle)

  const handleLogout = async () => {
    await logOut()
    setAuthError(null)
    navigate('/', { replace: true })
  }

  const connectSpotify = async () => {
    setAuthError(null)
    window.location.href = await buildLoginUrl()
  }

  const disconnectSpotify = async () => {
    const id = uidRef.current
    if (!id) return
    setAuthError(null)
    try {
      await releaseSpotifyConnection(id, tokensRef.current?.spotifyId ?? null)
      applyTokens(null)
      setSpotifyExpired(false)
    } catch (e) {
      setAuthError(getAuthErrorMessage(e))
    }
  }

  const value = {
    user,
    loading: authLoading,
    error: authError,
    clearError,
    isAuthenticated: !!user,
    demoMode,
    isDemoOnly: demoMode,
    signup: handleSignUp,
    login: handleSignIn,
    loginWithGoogle: handleGoogle,
    logout: handleLogout,
    connectSpotify,
    disconnectSpotify,
    spotifyConnected: !!user && !!tokens?.access_token,
    spotifyExpired,
    spotifyUser,
    tokensLoading,
    getValidToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}