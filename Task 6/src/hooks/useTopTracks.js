import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { fetchTopTracks } from '../lib/spotify'
import demoData from '../data/demo-tracks.json'

const RANGES = ['short_term', 'medium_term', 'long_term']

async function loadTracks({ token, demoMode, signal }) {
	if (demoMode || !token) return demoData.tracks || []

	const results = await Promise.all(
		RANGES.map(r =>
			fetchTopTracks(r, token, signal).then(items =>
				items.map(t => ({ ...t, _range: r })),
			),
		),
	)
	const merged = new Map()
	results.flat().forEach(t => {
		const existing = merged.get(t.id)
		if (existing) existing.ranges.add(t._range)
		else merged.set(t.id, { ...t, ranges: new Set([t._range]) })
	})
	return Array.from(merged.values()).map(t => ({
		...t,
		ranges: Array.from(t.ranges),
	}))
}

export function useTopTracks() {
	const {
		user,
		demoMode,
		getValidToken,
		spotifyConnected,
		loading: authLoading,
		tokensLoading,
	} = useAuth()

	const scope = demoMode
		? 'demo'
		: spotifyConnected
			? `spotify:${user.uid}`
			: 'sample'

	const { data, isLoading, error } = useQuery({
		queryKey: ['top-tracks', scope],
		queryFn: async ({ signal }) => {
			const token = await getValidToken()
			return loadTracks({ token, demoMode, signal })
		},
		enabled: !authLoading && !tokensLoading,
	})

	return {
		tracks: data ?? [],
		loading: authLoading || tokensLoading || isLoading,
		error: error?.message ?? null,
	}
}
