import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchTopTracks } from '../../lib/spotify'
import demoData from '../../data/demo-tracks.json'

const RANGES = ['short_term', 'medium_term', 'long_term']

export const fetchTracks = createAsyncThunk(
	'tracks/fetchTracks',
	async ({ token, demoMode }, { signal, rejectWithValue }) => {
		try {
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
		} catch (error) {
			if (error.name === 'AbortError') return rejectWithValue('aborted')
			return rejectWithValue(error.message)
		}
	},
	{
		condition: ({ scope, forceRefresh }, { getState }) => {
			const { tracks } = getState()
			if (forceRefresh) return true
			if (tracks.status === 'loading') return false
			if (tracks.currentScope === scope && tracks.status === 'succeeded')
				return false
			return true
		},
	},
)

const tracksSlice = createSlice({
	name: 'tracks',
	initialState: {
		items: [],
		status: 'idle',
		error: null,
		currentScope: null,
	},
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(fetchTracks.pending, state => {
				state.status = 'loading'
				state.error = null
			})
			.addCase(fetchTracks.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.items = action.payload
				state.currentScope = action.meta.arg.scope
			})
			.addCase(fetchTracks.rejected, (state, action) => {
				if (action.payload === 'aborted') {
					state.status = 'idle'
					return
				}
				state.status = 'failed'
				state.error = action.payload
			})
	},
})

export default tracksSlice.reducer
