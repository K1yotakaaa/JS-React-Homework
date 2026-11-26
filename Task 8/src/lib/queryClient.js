import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			gcTime: 30 * 60 * 1000,
			refetchOnWindowFocus: false,
			networkMode: 'offlineFirst',
			retry: (failureCount, error) =>
				failureCount < 1 &&
				(typeof navigator === 'undefined' || navigator.onLine) &&
				!!error,
		},
	},
})
