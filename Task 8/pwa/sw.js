const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev'

const PREFIX = 'tunescape-'
const RUNTIME_VERSION = 'v1'

const PRECACHE = `${PREFIX}precache-${VERSION}`
const IMAGES_CACHE = `${PREFIX}images-${RUNTIME_VERSION}`
const FONTS_CACHE = `${PREFIX}fonts-${RUNTIME_VERSION}`
const API_CACHE = `${PREFIX}api-${RUNTIME_VERSION}`
const CURRENT_CACHES = new Set([PRECACHE, IMAGES_CACHE, FONTS_CACHE, API_CACHE])

const MAX_IMAGE_ENTRIES = 60
const MAX_FONT_ENTRIES = 20
const MAX_API_ENTRIES = 80
const API_TIMEOUT_MS = 5000

const SHELL_STATIC = [
	'/offline.html',
	'/manifest.json',
	'/icons/icon-192.png',
	'/icons/icon-512.png',
]
const SHELL_STATIC_SET = new Set(SHELL_STATIC)

const PUBLIC_API_HOSTS = new Set(['api.reccobeats.com'])

function isFirebaseHost(host) {
	if (host === 'fonts.googleapis.com') return false
	return (
		host.endsWith('firebaseio.com') ||
		host.endsWith('firebaseapp.com') ||
		host.endsWith('googleapis.com')
	)
}

function isSpotifyHost(host) {
	return host === 'accounts.spotify.com' || host === 'api.spotify.com'
}

function isPublicImageHost(host) {
	return host === 'scdn.co' || host.endsWith('.scdn.co')
}

function isHtml(response) {
	return (response.headers.get('content-type') || '').includes('text/html')
}


const ASSET_ATTR = /(?:src|href)="(\/assets\/[^"]+)"/g
const CHUNK_REF =
	/(?:\.\/|assets\/)([A-Za-z0-9_.]+-[A-Za-z0-9_-]{6,12}\.(?:js|css))/g

async function fetchFresh(url) {
	return fetch(new Request(url, { cache: 'reload' }))
}

async function precache() {
	const cache = await caches.open(PRECACHE)

	const indexRes = await fetchFresh('/index.html')
	if (!indexRes.ok) throw new Error('precache: /index.html ' + indexRes.status)
	const html = await indexRes.clone().text()
	await cache.put('/index.html', indexRes)

	const seen = new Set()
	let wave = [...new Set([...html.matchAll(ASSET_ATTR)].map(m => m[1]))]

	while (wave.length) {
		wave.forEach(url => seen.add(url))
		const found = []
		await Promise.all(
			wave.map(async url => {
				const res = await fetchFresh(url)
				if (!res.ok || isHtml(res)) return
				if (url.endsWith('.js')) {
					const text = await res.clone().text()
					for (const m of text.matchAll(CHUNK_REF))
						found.push('/assets/' + m[1])
				}
				await cache.put(url, res)
			}),
		)
		wave = [...new Set(found)].filter(url => !seen.has(url))
	}

	await Promise.all(
		SHELL_STATIC.map(async url => {
			const res = await fetchFresh(url)
			if (!res.ok || (url !== '/offline.html' && isHtml(res))) {
				throw new Error('precache: missing ' + url)
			}
			await cache.put(url, res)
		}),
	)
}


self.addEventListener('install', event => {
	event.waitUntil(precache())
})

self.addEventListener('activate', event => {
	event.waitUntil(
		(async () => {
			const names = await caches.keys()
			await Promise.all(
				names
					.filter(name => name.startsWith(PREFIX) && !CURRENT_CACHES.has(name))
					.map(name => caches.delete(name)),
			)
			await self.clients.claim()
		})(),
	)
})

self.addEventListener('message', event => {
	if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})


async function trimCache(cacheName, maxEntries) {
	if (!maxEntries) return
	const cache = await caches.open(cacheName)
	const keys = await cache.keys()
	const excess = keys.length - maxEntries
	if (excess <= 0) return
	await Promise.all(keys.slice(0, excess).map(key => cache.delete(key)))
}

function withHeader(response, name, value) {
	const headers = new Headers(response.headers)
	headers.set(name, value)
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	})
}

async function fetchWithTimeout(request, ms) {
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), ms)
	try {
		return await fetch(request, { signal: controller.signal })
	} finally {
		clearTimeout(timer)
	}
}

async function handleNavigation(event) {
	const cache = await caches.open(PRECACHE)
	const shell = await cache.match('/index.html')
	if (shell) return shell
	try {
		return await fetch(event.request)
	} catch {
		return (
			(await cache.match('/offline.html')) ||
			new Response('Offline', {
				status: 503,
				headers: { 'Content-Type': 'text/plain' },
			})
		)
	}
}

async function precacheFirst(request) {
	const cache = await caches.open(PRECACHE)
	const hit = await cache.match(new URL(request.url).pathname)
	return hit || fetch(request)
}

async function cacheFirst(event, cacheName, maxEntries) {
	const { request } = event
	const cache = await caches.open(cacheName)
	const hit = await cache.match(request.url)
	if (hit) return hit
	try {
		const res = await fetch(request)
		if (res.ok && !isHtml(res)) {
			event.waitUntil(
				cache
					.put(request.url, res.clone())
					.then(() => trimCache(cacheName, maxEntries)),
			)
		}
		return res
	} catch {
		return Response.error()
	}
}

async function imageCacheFirst(event) {
	const { request } = event
	const cache = await caches.open(IMAGES_CACHE)
	const hit = await cache.match(request.url)
	if (hit) return hit
	const sameOrigin = new URL(request.url).origin === self.location.origin
	try {
		let res
		try {
			res = await fetch(
				sameOrigin
					? request
					: new Request(request.url, { mode: 'cors', credentials: 'omit' }),
			)
		} catch {
			return await fetch(request)
		}
		if (res.ok && !isHtml(res)) {
			event.waitUntil(
				cache
					.put(request.url, res.clone())
					.then(() => trimCache(IMAGES_CACHE, MAX_IMAGE_ENTRIES)),
			)
		}
		return res
	} catch {
		return Response.error()
	}
}

async function staleWhileRevalidate(event, cacheName, maxEntries) {
	const { request } = event
	const cache = await caches.open(cacheName)
	const cached = await cache.match(request)
	const update = fetch(request)
		.then(async res => {
			if (res.ok) {
				await cache.put(request, res.clone())
				await trimCache(cacheName, maxEntries)
			}
			return res
		})
		.catch(() => null)
	if (cached) {
		event.waitUntil(update)
		return cached
	}
	return (await update) || Response.error()
}

async function networkFirst(event, cacheName, maxEntries, timeoutMs) {
	const { request } = event
	const cache = await caches.open(cacheName)
	const fromCache = async () => {
		const cached = await cache.match(request, { ignoreVary: true })
		return cached ? withHeader(cached, 'X-SW-Cache', 'HIT') : null
	}
	try {
		const res = await fetchWithTimeout(request, timeoutMs)
		if (res.ok) {
			event.waitUntil(
				cache
					.put(request, res.clone())
					.then(() => trimCache(cacheName, maxEntries)),
			)
			return res
		}
		return (await fromCache()) || res
	} catch {
		return (
			(await fromCache()) ||
			new Response(
				JSON.stringify({
					error: 'offline',
					message: 'No cached data available',
				}),
				{
					status: 503,
					headers: { 'Content-Type': 'application/json', 'X-SW-Cache': 'MISS' },
				},
			)
		)
	}
}


self.addEventListener('fetch', event => {
	const { request } = event
	if (request.method !== 'GET') return

	const url = new URL(request.url)
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return

	if (url.searchParams.has('__ping')) return
	if (request.headers.has('Authorization')) return
	if (isSpotifyHost(url.hostname) || isFirebaseHost(url.hostname)) return

	if (request.mode === 'navigate') {
		if (url.origin !== self.location.origin || url.pathname.startsWith('/__/'))
			return
		event.respondWith(handleNavigation(event))
		return
	}

	if (url.origin === self.location.origin) {
		if (
			url.pathname.startsWith('/assets/') ||
			SHELL_STATIC_SET.has(url.pathname)
		) {
			event.respondWith(precacheFirst(request))
			return
		}
	}

	if (PUBLIC_API_HOSTS.has(url.hostname)) {
		event.respondWith(
			networkFirst(event, API_CACHE, MAX_API_ENTRIES, API_TIMEOUT_MS),
		)
		return
	}

	if (url.hostname === 'fonts.googleapis.com') {
		event.respondWith(
			staleWhileRevalidate(event, FONTS_CACHE, MAX_FONT_ENTRIES),
		)
		return
	}

	if (request.destination === 'font') {
		event.respondWith(cacheFirst(event, FONTS_CACHE, MAX_FONT_ENTRIES))
		return
	}

	if (
		request.destination === 'image' &&
		(url.origin === self.location.origin || isPublicImageHost(url.hostname))
	) {
		event.respondWith(imageCacheFirst(event))
	}
})
