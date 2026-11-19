import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import {
	fetchFavorites,
	addFavorite,
	removeFavorite,
} from '../services/favoritesService'

export function useFavorites() {
	const { user, demoMode } = useAuth()
	const queryClient = useQueryClient()
	const uid = user?.uid
	const key = ['favorites', uid || 'demo']

	const { data, isLoading, error } = useQuery({
		queryKey: key,
		queryFn: async () => {
			if (demoMode) return []
			return fetchFavorites(uid)
		},
		enabled: !!uid || demoMode,
	})

	const addMutation = useMutation({
		mutationFn: payload => addFavorite(uid, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
	})

	const removeMutation = useMutation({
		mutationFn: id => removeFavorite(uid, id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
	})

	return {
		favorites: data ?? [],
		loading: isLoading,
		error: error?.message ?? null,
		addFavorite: addMutation.mutateAsync,
		removeFavorite: removeMutation.mutateAsync,
		adding: addMutation.isPending,
		removing: removeMutation.isPending,
	}
}
