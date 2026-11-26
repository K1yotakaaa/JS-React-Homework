import { configureStore } from '@reduxjs/toolkit'
import tracksReducer from './slices/tracksSlice'
import favoritesReducer from './slices/favoritesSlice'
import audioFeaturesReducer from './slices/audioFeaturesSlice'

export const store = configureStore({
	reducer: {
		tracks: tracksReducer,
		favorites: favoritesReducer,
		audioFeatures: audioFeaturesReducer,
	},
})
