import { useNavigate } from 'react-router-dom';

function LoginRequiredModel({ onClose }){
  const navigate = useNavigate();

  return(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-surface rounded-xl p-6 max-w-sm w-full text-center">
        <h2 className="text-lg font-semibold mb-2">Login required</h2>
        <p className="text-gray-400 mb-4">
          You need to log in to save movies or shows to your watchlist.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-accent rounded-lg"
          >
            Log In
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginRequiredModel;