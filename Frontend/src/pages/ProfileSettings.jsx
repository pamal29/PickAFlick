import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
  const { user, profile, refreshProfile } = useAuth(); // refreshProfile: re-fetch profile after edits
  const navigate = useNavigate();

  const [username, setUsername] = useState(profile?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUsernameUpdate = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id);
    setStatus(error ? `Error: ${error.message}` : 'Username updated');
    if (!error) refreshProfile?.();
    setSaving(false);
  };

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      setStatus('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setStatus(error ? `Error: ${error.message}` : 'Password updated');
    setNewPassword('');
    setSaving(false);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setSaving(true);

    const ext = avatarFile.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true });

    if (uploadError) {
      setStatus(`Error: ${uploadError.message}`);
      setSaving(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`; // cache-bust

    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);

    setStatus(dbError ? `Error: ${dbError.message}` : 'Avatar updated');
    if (!dbError) refreshProfile?.();
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account permanently? This cannot be undone.')) return;

    setSaving(true);
    // Client cannot delete auth.users directly — call a backend endpoint using the service role key
    const res = await fetch(`http://localhost:3001/api/account/${user.id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      await supabase.auth.signOut();
      navigate('/');
    } else {
      setStatus('Failed to delete account');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-12 text-textPrimary space-y-10">
      <h1 className="text-3xl font-bold">Profile Settings</h1>

      {status && <p className="text-accent text-sm">{status}</p>}

      {/* Avatar */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Profile Picture</h2>
        {profile?.avatar_url && (
          <img src={profile.avatar_url} alt="avatar" className="w-24 h-24 rounded-full object-cover border border-border" />
        )}
        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
        <button onClick={handleAvatarUpload} disabled={saving || !avatarFile}
          className="bg-accent text-black px-4 py-2 rounded-full font-bold disabled:opacity-50">
          Upload
        </button>
      </div>

      {/* Username */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Username</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-4 py-2"
        />
        <button onClick={handleUsernameUpdate} disabled={saving}
          className="bg-accent text-black px-4 py-2 rounded-full font-bold disabled:opacity-50">
          Save Username
        </button>
      </div>

      {/* Password */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Change Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-4 py-2"
        />
        <button onClick={handlePasswordUpdate} disabled={saving}
          className="bg-accent text-black px-4 py-2 rounded-full font-bold disabled:opacity-50">
          Update Password
        </button>
      </div>

      {/* Delete account */}
      <div className="space-y-3 border-t border-border pt-8">
        <h2 className="font-semibold text-lg text-danger">Danger Zone</h2>
        <button onClick={handleDeleteAccount} disabled={saving}
          className="bg-danger text-white px-4 py-2 rounded-full font-bold disabled:opacity-50">
          Delete Account
        </button>
      </div>
    </div>
  );
}