import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTracks } from '../store/slices/tracksSlice';
import { useDebounce } from '../hooks/useDebounce';
import { 
  selectAllTracks, 
  selectFilteredAndSortedTracks, 
  selectPaginatedTracks 
} from '../store/selectors';
import FilterBar from '../components/FilterBar';
import TrackList from '../components/TrackList';
import Pagination from '../components/Pagination';
import TrackDetail from '../components/TrackDetail';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

export default function TracksView() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, demoMode, getValidToken, spotifyConnected, loading: authLoading, tokensLoading } = useAuth();

  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'popularity';
  const rangeFilter = searchParams.get('range') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);

  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearchParams((prev) => {
        prev.set('search', debouncedSearch);
        prev.set('page', '1');
        return prev;
      });
    }
  }, [debouncedSearch, search, setSearchParams]);

  // Basic selector
  const allTracks = useSelector(selectAllTracks);
  
  // Memoized selectors
  const filteredTracks = useSelector((state) => 
    selectFilteredAndSortedTracks(state, search, sortBy, rangeFilter)
  );
  
  const pagedTracks = useSelector((state) => 
    selectPaginatedTracks(state, search, sortBy, rangeFilter, page, pageSize)
  );

  const status = useSelector((state) => state.tracks.status);
  const error = useSelector((state) => state.tracks.error);

  const scope = demoMode ? 'demo' : spotifyConnected ? `spotify:${user.uid}` : 'sample';

  // Fetch from redux thunk
  useEffect(() => {
    if (authLoading || tokensLoading) return;

    const loadTracks = async () => {
      const token = await getValidToken();
      dispatch(fetchTracks({ token, demoMode, scope }));
    };
    loadTracks();
  }, [dispatch, scope, authLoading, tokensLoading, getValidToken, demoMode]);

  const handleRetry = async () => {
    const token = await getValidToken();
    dispatch(fetchTracks({ token, demoMode, scope, forceRefresh: true }));
  };

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      prev.set(key, value);
      if (key !== 'page') prev.set('page', '1');
      return prev;
    });
  };

  const loading = authLoading || tokensLoading || status === 'loading';

  if (loading) return <LoadingState label="Fetching your top tracks…" />;
  
  if (status === 'failed') {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  return (
    <div className="view">
      <header className="view-header">
        <h1 className="view-title">Top Tracks</h1>
        <p className="view-sub">
          Aggregated from short, medium, and long term — {allTracks.length} unique tracks.
        </p>
      </header>

      <FilterBar
        search={searchInput}
        setSearch={setSearchInput}
        sortBy={sortBy}
        setSortBy={(v) => updateParam('sortBy', v)}
        rangeFilter={rangeFilter}
        setRangeFilter={(v) => updateParam('range', v)}
      />

      {filteredTracks.length === 0 ? (
        <EmptyState
          message="No tracks match your filters."
          hint="Try clearing the search or changing the range."
        />
      ) : (
        <>
          <TrackList
            tracks={pagedTracks}
            startIndex={(page - 1) * pageSize}
            selectedId={selectedTrack?.id}
            onSelect={setSelectedTrack}
          />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={filteredTracks.length}
            setPage={(p) => updateParam('page', p)}
            setPageSize={(s) => updateParam('pageSize', s)}
          />
        </>
      )}

      {selectedTrack && (
        <TrackDetail track={selectedTrack} onClose={() => setSelectedTrack(null)} />
      )}
    </div>
  );
}