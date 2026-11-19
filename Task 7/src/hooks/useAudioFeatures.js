import { useQuery } from '@tanstack/react-query'
import { fetchAudioFeaturesWithMeta, idFromHref } from '../lib/reccobeats'
import { useAuth } from '../context/AuthContext'
import demoData from '../data/demo-tracks.json'

export function useAudioFeatures(trackId) {
	const { demoMode } = useAuth()

	const { data, isLoading, error } = useQuery({
		queryKey: ['audio-features', trackId, demoMode],
		queryFn: async ({ signal }) => {
			if (demoMode) {
				return {
					features: (demoData.features || {})[trackId] || null,
					fromCache: false,
				}
			}
			const { items, fromCache } = await fetchAudioFeaturesWithMeta(
				[trackId],
				signal,
			)
			return {
				features: items.find(f => idFromHref(f.href) === trackId) ?? null,
				fromCache,
			}
		},
		enabled: !!trackId,
		staleTime: 30 * 60 * 1000,
	})

	return {
		features: data?.features ?? null,
		fromCache: data?.fromCache ?? false,
		loading: isLoading,
		error: error?.message ?? null,
	}
}
