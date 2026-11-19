import { useSyncExternalStore } from 'react'
import { checkConnection } from '../lib/connection'
import { queryClient } from '../lib/queryClient'

let online = typeof navigator === 'undefined' ? true : navigator.onLine
const listeners = new Set()

function setOnline(next) {
	if (next === online) return
	const restored = !online && next
	online = next
	listeners.forEach(listener => listener())
	if (restored) queryClient.invalidateQueries()
}

export async function recheckConnection() {
	const ok = await checkConnection()
	setOnline(ok)
	return ok
}

if (typeof window !== 'undefined') {
	window.addEventListener('offline', () => setOnline(false))
	window.addEventListener('online', () => {
		recheckConnection()
	})
	window.addEventListener('focus', () => {
		recheckConnection()
	})
	setInterval(() => {
		if (!online) recheckConnection()
	}, 15000)
	recheckConnection()
}

function subscribe(listener) {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

export function useOnlineStatus() {
	return useSyncExternalStore(
		subscribe,
		() => online,
		() => true,
	)
}
