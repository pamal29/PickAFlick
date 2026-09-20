import { Star, Plus, X } from 'lucide-react';

export default function PosterCard({ item, onClick, featured = false, showRemove = false, onRemove, onAdd }) {
  return (
    <div onClick={onClick} className={`group cursor-pointer ${featured ? 'col-span-2 row-span-2' : ''}`}>
      <div className="relative rounded-lg overflow-hidden border border-border bg-surface aspect-[2/3]">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x450/15151F/ffffff?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-textMuted text-sm">
            No image
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-end p-3 opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-1 text-star text-sm font-bold">
            <Star size={14} fill="currentColor" />
            {item.rating}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (showRemove) onRemove(item);
            else onAdd?.(item);
          }}
          className={`absolute top-2 right-2 backdrop-blur p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all ${
            showRemove
              ? 'bg-black/60 hover:bg-danger hover:text-white'
              : 'bg-black/60 hover:bg-accent hover:text-black'
          }`}
        >
          {showRemove ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>
      <p className="text-textPrimary text-sm font-medium mt-2 truncate">{item.title}</p>
    </div>
  );
}