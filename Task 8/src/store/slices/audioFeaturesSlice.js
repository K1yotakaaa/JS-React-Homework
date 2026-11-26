import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAudioFeaturesWithMeta } from '../../lib/reccobeats'

export const fetchFeatures = createAsyncThunk(
	'audioFeatures/fetchFeatures',
	async (spotifyIds, { signal, rejectWithValue }) => {
		try {
			const data = await fetchAudioFeaturesWithMeta(spotifyIds, signal)
			return data
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

const audioFeaturesSlice = createSlice({
	name: 'audioFeatures',
	initialState: {
		data: {},
		status: 'idle',
		error: null,
	},
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(fetchFeatures.pending, state => {
				state.status = 'loading'
				state.error = null
			})
			.addCase(fetchFeatures.fulfilled, (state, action) => {
				state.status = 'succeeded'
				action.payload.items.forEach(item => {
					if (item.id) state.data[item.id] = item
				})
			})
			.addCase(fetchFeatures.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload
			})
	},
})

export default audioFeaturesSlice.reducer
