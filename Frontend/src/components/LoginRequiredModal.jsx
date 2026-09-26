import { useNavigate } from 'react-router-dom';

export default function LoginRequiredModal({ onClose }) {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl p-6 max-w-sm w-full text-center border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-textPrimary mb-2">Login required</h2>
        <p className="text-textSecond mb-5 text-sm">
          You need to log in to save movies or shows to your watchlist.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 bg-accent text-black rounded-full font-bold hover:bg-accentHover transition-all"
          >
            Log In
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-surfaceHover text-textPrimary rounded-full font-bold hover:bg-border transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}