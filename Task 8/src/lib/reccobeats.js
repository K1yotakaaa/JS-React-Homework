import { RECCOBEATS_API } from '../config'
import { reportDataSource } from './cacheStatus'

const BATCH_SIZE = 40

export async function fetchAudioFeaturesWithMeta(spotifyIds, signal) {
	const items = []
	let fromCache = false
	for (let i = 0; i < spotifyIds.length; i += BATCH_SIZE) {
		const batch = spotifyIds.slice(i, i + BATCH_SIZE)
		const url = `${RECCOBEATS_API}/audio-features?ids=${batch.join(',')}`
		const res = await fetch(url, { signal })
		if (res.headers.get('X-SW-Cache') === 'HIT') fromCache = true
		if (!res.ok) {
			if (res.status === 404) continue
			if (res.status === 503) {
				throw new Error('You are offline and this data has not been saved yet.')
			}
			throw new Error(`ReccoBeats → ${res.status}`)
		}
		const data = await res.json().catch(() => null)
		if (data && Array.isArray(data.content)) items.push(...data.content)
	}
	reportDataSource(fromCache)
	return { items, fromCache }
}

export async function fetchAudioFeatures(spotifyIds, signal) {
	return (await fetchAudioFeaturesWithMeta(spotifyIds, signal)).items
}

export function idFromHref(href) {
	if (!href) return null
	const parts = href.split('/').filter(Boolean)
	return parts[parts.length - 1] || null
}
