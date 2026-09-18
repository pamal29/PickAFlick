import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Film, Eye, EyeOff } from 'lucide-react';
import supabase from '../supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError('');
    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    });

    if (loginError) setError(loginError.message);
    else navigate('/');

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4 overflow-hidden">
      {/* Cinematic backdrop */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(61,90,254,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_100%,rgba(255,184,0,0.12),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute inset-0 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.015)_3px)]" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Film size={24} className="text-secondary" />
          <span className="text-textPrimary font-bold text-2xl tracking-tight">
            Pick<span className="text-secondary">A</span>Flick
          </span>
        </div>

        <div className="bg-surface/80 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl shadow-black/60">
          <h1 className="text-2xl font-bold text-textPrimary mb-1">Welcome back</h1>
          <p className="text-textSecond text-sm mb-6">Pick up right where you left off.</p>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-2.5 rounded-lg mb-5">
              {error}
            </div>
          )}

          <div className="space-y-3" onKeyDown={handleKeyDown}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handle}
              className="w-full bg-black/40 border border-border text-textPrimary placeholder-textMuted px-4 py-3 rounded-xl outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handle}
                className="w-full bg-black/40 border border-border text-textPrimary placeholder-textMuted px-4 py-3 pr-11 rounded-xl outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textSecond transition-colors"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-accent hover:bg-accentHover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </div>

          <p className="text-textSecond text-sm mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-secondary hover:text-secondaryHover font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}