import { createSelector } from '@reduxjs/toolkit'

// basic selector: get all tracks
export const selectAllTracks = state => state.tracks.items

// memoized selector: filter and sort
export const selectFilteredAndSortedTracks = createSelector(
	[
		selectAllTracks,
		(state, search) => search,
		(state, search, sortBy) => sortBy,
		(state, search, sortBy, rangeFilter) => rangeFilter,
	],
	(tracks, search, sortBy, rangeFilter) => {
		let list = tracks

		if (rangeFilter !== 'all') {
			list = list.filter(t => t.ranges?.includes(rangeFilter))
		}

		if (search.trim()) {
			const q = search.toLowerCase()
			list = list.filter(
				t =>
					t.name.toLowerCase().includes(q) ||
					t.artists?.some(a => a.name.toLowerCase().includes(q)),
			)
		}

		const sorted = [...list]
		switch (sortBy) {
			case 'name':
				sorted.sort((a, b) => a.name.localeCompare(b.name))
				break
			case 'artist':
				sorted.sort((a, b) =>
					(a.artists?.[0]?.name || '').localeCompare(
						b.artists?.[0]?.name || '',
					),
				)
				break
			case 'duration':
				sorted.sort((a, b) => b.duration_ms - a.duration_ms)
				break
			case 'popularity':
			default:
				sorted.sort((a, b) => b.popularity - a.popularity)
		}
		return sorted
	},
)

// memoized selector: paginate the filtered tracks
export const selectPaginatedTracks = createSelector(
	[
		selectFilteredAndSortedTracks,
		(state, search, sortBy, rangeFilter, page) => page,
		(state, search, sortBy, rangeFilter, page, pageSize) => pageSize,
	],
	(filteredTracks, page, pageSize) => {
		const start = (page - 1) * pageSize
		return filteredTracks.slice(start, start + pageSize)
	},
)

export const selectFilteredAndSortedFavorites = createSelector(
  [
    (state) => state.favorites.items,
    (state, search) => search,
    (state, sortBy) => sortBy,
  ],
  (favorites, search, sortBy) => {
    let list = favorites;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          (f.trackName || '').toLowerCase().includes(q) ||
          (f.artistName || '').toLowerCase().includes(q) ||
          (f.mood || '').toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        sorted.sort((a, b) => (a.trackName || '').localeCompare(b.trackName || ''));
        break;
      default:
        sorted.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    }
    return sorted;
  }
);