import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeftIcon, SaveIcon } from './Icons';

interface ProfileViewProps {
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onBack }) => {
  const { profile, refreshProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState((profile as any)?.bio || ''); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;
      
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload directly to storage (standard practice for large files)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update Profile via Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
         const { error } = await supabase
           .from('profiles')
           .update({ 
             avatar_url: publicUrl,
             updated_at: new Date().toISOString()
           })
           .eq('id', session.user.id);
           
         if (error) throw error;
      }

      await refreshProfile();
      setMessage({ type: 'success', text: 'Avatar updated successfully' });
    } catch (error: any) {
       console.error(error);
       setMessage({ type: 'error', text: 'Error uploading avatar. Make sure "avatars" bucket exists and is public.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-24 h-24 mb-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white shadow-md" />
              ) : (
                <div className="w-full h-full rounded-full bg-pakGreen-100 flex items-center justify-center text-pakGreen-600 text-3xl font-bold border-4 border-white shadow-md">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)}
                </div>
              )}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-pakGreen-600 text-white p-2 rounded-full shadow-lg hover:bg-pakGreen-700 transition"
              >
                <SaveIcon className="w-4 h-4" /> {/* Reuse icon or add Camera icon */}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
               {profile?.role || 'User'}
            </span>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pakGreen-500 focus:ring-pakGreen-500 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Goal</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pakGreen-500 focus:ring-pakGreen-500 py-3"
                placeholder="Tell us about your CSS goals..."
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-pakGreen-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pakGreen-700 transition shadow-lg shadow-pakGreen-200 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => { signOut(); onBack(); }}
                className="px-6 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
              >
                Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
