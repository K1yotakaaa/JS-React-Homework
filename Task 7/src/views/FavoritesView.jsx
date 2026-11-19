import { useMemo, useState } from 'react'
import { useTopTracks } from '../hooks/useTopTracks'
import { useFavorites } from '../hooks/useFavorites'
import { useAuth } from '../context/AuthContext'
import FavoriteForm from '../components/FavoriteForm'
import FavoriteList from '../components/FavoriteList'
import TrackDetail from '../components/TrackDetail'
import { LoadingState } from '../components/States'

export default function FavoritesView() {
  const { demoMode } = useAuth()
  const { tracks, loading: tracksLoading } = useTopTracks()
  const {
    favorites,
    loading: favLoading,
    addFavorite,
    removeFavorite,
  } = useFavorites()

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedFav, setSelectedFav] = useState(null)

  const handleAdd = async (data) => {
    if (demoMode) return
    await addFavorite(data)
  }

  const handleRemove = async (id) => {
    if (demoMode) return
    await removeFavorite(id)
  }

  const filteredAndSorted = useMemo(() => {
    let list = favorites
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (f) =>
          (f.trackName || '').toLowerCase().includes(q) ||
          (f.artistName || '').toLowerCase().includes(q) ||
          (f.mood || '').toLowerCase().includes(q)
      )
    }
    const sorted = [...list]
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        sorted.sort((a, b) => a.trackName.localeCompare(b.trackName))
        break
      default:
        sorted.sort(
          (a, b) =>
            (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
        )
    }
    return sorted
  }, [favorites, search, sortBy])

  if (tracksLoading || favLoading) {
    return <LoadingState label="Loading favorites…" />
  }

  return (
    <div className="view">
      <header className="view-header">
        <h1 className="view-title">Favorites</h1>
        <p className="view-sub">
          Rate and remember the tracks that hit different.
        </p>
      </header>

      <div className="favorites-layout">
        <FavoriteForm tracks={tracks} onAdd={handleAdd} readOnly={demoMode} />

        <div>
          <div className="filter-bar filter-bar-two">
            <input
              className="input search-input"
              placeholder="Search favorites by track, artist, or mood…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="input select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A→Z</option>
            </select>
          </div>

          <FavoriteList
            favorites={filteredAndSorted}
            onRemove={handleRemove}
            readOnly={demoMode}
            onSelect={setSelectedFav}
          />
        </div>
      </div>

      {selectedFav && (
        <TrackDetail
          track={{
            id: selectedFav.trackId,
            name: selectedFav.trackName,
            artists: [{ name: selectedFav.artistName }],
            album: { images: [{ url: selectedFav.imageUrl }] },
            popularity: 0,
            duration_ms: 0,
          }}
          onClose={() => setSelectedFav(null)}
        />
      )}
    </div>
  )
}