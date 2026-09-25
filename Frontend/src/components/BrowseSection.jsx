import { useState, useEffect } from 'react';
import PosterCard from './PosterCard';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest' },
];

export default function BrowseSection({ onCardClick, onAdd }) {
  const [type, setType] = useState('movie');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch genre list whenever type changes (movie genres ≠ tv genres)
  useEffect(() => {
    setSelectedGenre(''); // reset genre filter on type switch, ids don't match across movie/tv
    fetch(`http://localhost:3001/api/genres/${type}`)
      .then(res => res.json())
      .then(setGenres)
      .catch(err => console.error('Error fetching genres:', err));
  }, [type]);

  // Fetch browse results whenever any filter changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type, sortBy, page: 1 });
    if (selectedGenre) params.set('genre', selectedGenre);
    if (minRating) params.set('minRating', minRating);

    fetch(`http://localhost:3001/api/browse?${params}`)
      .then(res => res.json())
      .then(data => setItems(data.results || []))
      .catch(err => console.error('Error fetching browse results:', err))
      .finally(() => setLoading(false));
  }, [type, selectedGenre, minRating, sortBy]);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Browse the Collection</h2>

        <div className="flex flex-wrap gap-2">
          <div className="flex bg-surface rounded-full p-1 border border-border">
            <button
              onClick={() => setType('movie')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                type === 'movie' ? 'bg-accent text-black' : 'text-textSecond'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setType('tv')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                type === 'tv' ? 'bg-accent text-black' : 'text-textSecond'
              }`}
            >
              TV Shows
            </button>
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-surface border border-border rounded-full px-4 py-1.5 text-sm"
          >
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="bg-surface border border-border rounded-full px-4 py-1.5 text-sm"
          >
            <option value="">Any Rating</option>
            <option value="7">7+ ⭐</option>
            <option value="8">8+ ⭐</option>
            <option value="9">9+ ⭐</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-surface border border-border rounded-full px-4 py-1.5 text-sm"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : items.length === 0 ? (
        <p className="text-textSecond text-center py-12">No results match these filters.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {items.map((item, i) => (
            <PosterCard
              key={item.id}
              item={item}
              onClick={() => onCardClick(item)}
              featured={i % 7 === 0}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </section>
  );
}