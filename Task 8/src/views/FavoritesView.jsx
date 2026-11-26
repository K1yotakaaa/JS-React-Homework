import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { getFavorites, createFavorite, deleteFavorite } from '../store/slices/favoritesSlice';
import { selectAllTracks, selectFilteredAndSortedFavorites } from '../store/selectors';
import FavoriteForm from '../components/FavoriteForm';
import FavoriteList from '../components/FavoriteList';
import TrackDetail from '../components/TrackDetail';
import { LoadingState, ErrorState } from '../components/States';

export default function FavoritesView() {
  const dispatch = useDispatch();
  const { user, demoMode } = useAuth();
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedFav, setSelectedFav] = useState(null);

  // Redux State
  const tracks = useSelector(selectAllTracks);
  const favorites = useSelector((state) => 
    selectFilteredAndSortedFavorites(state, search, sortBy)
  );
  const status = useSelector((state) => state.favorites.status);
  const mutationStatus = useSelector((state) => state.favorites.mutationStatus);
  const error = useSelector((state) => state.favorites.error);

  // Fetch favorites on mount or user change
  useEffect(() => {
    if (user?.uid && !demoMode) {
      dispatch(getFavorites(user.uid));
    }
  }, [dispatch, user?.uid, demoMode]);

  const handleAdd = async (data) => {
    if (demoMode || !user?.uid) return;
    await dispatch(createFavorite({ uid: user.uid, data })).unwrap();
  };

  const handleRemove = async (id) => {
    if (demoMode || !user?.uid) return;
    await dispatch(deleteFavorite({ uid: user.uid, favId: id })).unwrap();
  };

  if (status === 'loading') return <LoadingState label="Loading favorites…" />;
  if (status === 'failed') return <ErrorState message={error} />;

  return (
    <div className="view">
      <header className="view-header">
        <h1 className="view-title">Favorites</h1>
        <p className="view-sub">Rate and remember the tracks that hit different.</p>
      </header>

      <div className="favorites-layout">
        <FavoriteForm 
          tracks={tracks} 
          onAdd={handleAdd} 
          readOnly={demoMode} 
          isAdding={mutationStatus === 'loading'}
        />

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
            favorites={favorites}
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
  );
}