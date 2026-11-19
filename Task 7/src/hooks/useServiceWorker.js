import { useCallback, useEffect, useRef, useState } from 'react'

const UPDATE_CHECK_MS = 30 * 60 * 1000
const ASSET_ATTR = /(?:src|href)="(\/assets\/[^"]+)"/g

function hash(str) {
	let h = 5381
	for (let i = 0; i < str.length; i += 1)
		h = ((h << 5) + h + str.charCodeAt(i)) >>> 0
	return h.toString(36)
}

function currentSignature() {
	return [
		...document.querySelectorAll(
			'script[src^="/assets/"], link[href^="/assets/"]',
		),
	]
		.map(el => el.getAttribute('src') || el.getAttribute('href'))
		.sort()
		.join('|')
}

function signatureFromHtml(html) {
	return [...html.matchAll(ASSET_ATTR)]
		.map(m => m[1])
		.sort()
		.join('|')
}

const swUrl = signature => `/sw.js?v=${hash(signature)}`

export function useServiceWorker() {
	const [updateReady, setUpdateReady] = useState(false)
	const [offlineReady, setOfflineReady] = useState(false)
	const waitingRef = useRef(null)
	const activatingRef = useRef(false)

	useEffect(() => {
		if (!import.meta.env.PROD || !('serviceWorker' in navigator))
			return undefined

		let cancelled = false
		let registration = null
		let requestedUrl = swUrl(currentSignature())

		const onControllerChange = () => {
			if (!activatingRef.current) return
			activatingRef.current = false
			window.location.reload()
		}
		navigator.serviceWorker.addEventListener(
			'controllerchange',
			onControllerChange,
		)

		const trackInstalling = worker => {
			worker.addEventListener('statechange', () => {
				if (cancelled) return
				if (
					worker.state === 'installed' &&
					navigator.serviceWorker.controller
				) {
					waitingRef.current = worker
					setUpdateReady(true)
				} else if (
					worker.state === 'activated' &&
					!navigator.serviceWorker.controller
				) {
					setOfflineReady(true)
				}
			})
		}

		const checkForUpdate = async () => {
			if (!registration || !navigator.onLine) return
			try {
				const res = await fetch(`/index.html?__ping=${Date.now()}`, {
					cache: 'no-store',
				})
				if (!res.ok) return
				const signature = signatureFromHtml(await res.text())
				if (!signature) return
				const nextUrl = swUrl(signature)
				if (nextUrl === requestedUrl) return
				requestedUrl = nextUrl
				const reg = await navigator.serviceWorker.register(nextUrl, {
					scope: '/',
					updateViaCache: 'none',
				})
				if (!cancelled && reg.installing) trackInstalling(reg.installing)
			} catch {
			}
		}
		const onVisible = () => {
			if (document.visibilityState === 'visible') checkForUpdate()
		}

		navigator.serviceWorker
			.register(requestedUrl, { scope: '/', updateViaCache: 'none' })
			.then(reg => {
				if (cancelled) return
				registration = reg

				if (reg.waiting && navigator.serviceWorker.controller) {
					waitingRef.current = reg.waiting
					setUpdateReady(true)
				}
				if (reg.installing) trackInstalling(reg.installing)
				reg.addEventListener('updatefound', () => {
					if (reg.installing) trackInstalling(reg.installing)
				})
				checkForUpdate()
			})
			.catch(() => {})

		document.addEventListener('visibilitychange', onVisible)
		const interval = setInterval(checkForUpdate, UPDATE_CHECK_MS)

		return () => {
			cancelled = true
			clearInterval(interval)
			document.removeEventListener('visibilitychange', onVisible)
			navigator.serviceWorker.removeEventListener(
				'controllerchange',
				onControllerChange,
			)
		}
	}, [])

	const activateUpdate = useCallback(() => {
		const worker = waitingRef.current
		if (!worker) return
		activatingRef.current = true
		worker.postMessage({ type: 'SKIP_WAITING' })
	}, [])

	const dismissOfflineReady = useCallback(() => setOfflineReady(false), [])

	return { updateReady, offlineReady, activateUpdate, dismissOfflineReady }
}
