import { useQuery } from '@tanstack/react-query'
import { fetchAudioFeatures, idFromHref } from '../lib/reccobeats'
import { useAuth } from '../context/AuthContext'
import demoData from '../data/demo-tracks.json'

export function useAudioFeatures(trackId) {
	const { demoMode } = useAuth()

	const { data, isLoading, error } = useQuery({
		queryKey: ['audio-features', trackId, demoMode],
		queryFn: async ({ signal }) => {
			if (demoMode) {
				return (demoData.features || {})[trackId] || null
			}
			const list = await fetchAudioFeatures([trackId], signal)
			return list.find(f => idFromHref(f.href) === trackId) ?? null
		},
		enabled: !!trackId,
		staleTime: 30 * 60 * 1000,
	})

	return {
		features: data ?? null,
		loading: isLoading,
		error: error?.message ?? null,
	}
}
