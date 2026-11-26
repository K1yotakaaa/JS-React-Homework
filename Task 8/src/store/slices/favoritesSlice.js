import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
	fetchFavorites,
	addFavorite,
	removeFavorite,
} from '../../services/favoritesService'

export const getFavorites = createAsyncThunk(
	'favorites/getFavorites',
	async (uid, { rejectWithValue }) => {
		try {
			return await fetchFavorites(uid)
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

export const createFavorite = createAsyncThunk(
	'favorites/createFavorite',
	async ({ uid, data }, { dispatch, rejectWithValue }) => {
		try {
			const newFav = await addFavorite(uid, data)
			dispatch(getFavorites(uid))
			return newFav
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

export const deleteFavorite = createAsyncThunk(
	'favorites/deleteFavorite',
	async ({ uid, favId }, { dispatch, rejectWithValue }) => {
		try {
			await removeFavorite(uid, favId)
			dispatch(getFavorites(uid))
			return favId
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

const favoritesSlice = createSlice({
	name: 'favorites',
	initialState: {
		items: [],
		status: 'idle',
		error: null,
		mutationStatus: 'idle',
	},
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(getFavorites.pending, state => {
				state.status = 'loading'
				state.error = null
			})
			.addCase(getFavorites.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.items = action.payload
			})
			.addCase(getFavorites.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload
			})
			.addCase(createFavorite.pending, state => {
				state.mutationStatus = 'loading'
				state.error = null
			})
			.addCase(createFavorite.fulfilled, state => {
				state.mutationStatus = 'succeeded'
			})
			.addCase(createFavorite.rejected, (state, action) => {
				state.mutationStatus = 'failed'
				state.error = action.payload
			})
			// Remove Favorite
			.addCase(deleteFavorite.pending, state => {
				state.mutationStatus = 'loading'
			})
			.addCase(deleteFavorite.fulfilled, state => {
				state.mutationStatus = 'succeeded'
			})
			.addCase(deleteFavorite.rejected, (state, action) => {
				state.mutationStatus = 'failed'
				state.error = action.payload
			})
	},
})

export default favoritesSlice.reducer
