import { Bookmark } from 'lucide-react';
import PosterCard from './PosterCard';

export default function ShelfSection({ user, shelfItems, shelfLoading, onNavigateLogin, onCardClick, onRemove }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bookmark className="text-accent" size={22} />
          <h2 className="text-2xl font-bold">Your Shelf</h2>
        </div>
        {shelfItems.length > 0 && <span className="text-textMuted text-sm">{shelfItems.length} saved</span>}
      </div>

      {!user ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-textSecond mb-4">Log in to start building your personal shelf.</p>
          <button onClick={onNavigateLogin} className="bg-accent text-black px-6 py-2.5 rounded-full font-bold hover:bg-accentHover transition-all">
            Log In
          </button>
        </div>
      ) : shelfLoading ? (
        <div className="text-textMuted">Loading your shelf...</div>
      ) : shelfItems.length === 0 ? (
        <div className="bg-surface border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-textSecond text-lg mb-1">Your shelf is empty</p>
          <p className="text-textMuted text-sm">Start collecting — tap "Save for Later" on anything you like.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {shelfItems.map((item) => (
            <PosterCard key={item.id} item={item} onClick={() => onCardClick(item)} showRemove onRemove={onRemove} />
          ))}
        </div>
      )}
    </section>
  );
}