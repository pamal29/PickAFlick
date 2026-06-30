import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError('');
    if (!form.username || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }

    // Check username is unique
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', form.username)
      .single();

    if (existing) {
      setError('Username already taken.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username } }
    });

    if (signUpError) setError(signUpError.message);
    else navigate('/');

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-6">Create Account</h1>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handle}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handle}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handle}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-all"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </div>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}