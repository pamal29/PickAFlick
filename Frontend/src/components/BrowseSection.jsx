import PosterCard from './PosterCard';

export default function BrowseSection({ allMovies, onCardClick, onAdd }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Browse the Collection</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
        {allMovies.map((item, i) => (
          <PosterCard key={item.id} item={item} onClick={() => onCardClick(item)} featured={i % 7 === 0} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}