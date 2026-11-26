import { useSyncExternalStore } from 'react'

let servedFromCache = false
const listeners = new Set()

export function reportDataSource(fromCache) {
	if (servedFromCache === fromCache) return
	servedFromCache = fromCache
	listeners.forEach(listener => listener())
}

function subscribe(listener) {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

export function useServedFromCache() {
	return useSyncExternalStore(
		subscribe,
		() => servedFromCache,
		() => false,
	)
}
