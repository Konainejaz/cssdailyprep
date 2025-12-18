import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, LogOutIcon, SaveIcon, ShieldIcon, UserIcon } from './Icons';

interface ProfileViewProps {
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onBack }) => {
  const { profile, refreshProfile, signOut, isLoading } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState((profile as any)?.bio || '');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!profile) return;
    if (isDirty) return;
    setFullName(profile.full_name || '');
    setBio((profile as any)?.bio || '');
  }, [profile, isDirty]);

  const initials = useMemo(() => {
    const name = (profile?.full_name || fullName || '').trim();
    if (name) return name[0].toUpperCase();
    const email = (profile?.email || '').trim();
    if (email) return email[0].toUpperCase();
    return 'U';
  }, [profile?.email, profile?.full_name, fullName]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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
      setIsDirty(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    setIsUploadingAvatar(true);
    setMessage(null);

    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

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
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDiscard = () => {
    if (!profile) return;
    setFullName(profile.full_name || '');
    setBio((profile as any)?.bio || '');
    setIsDirty(false);
    setMessage(null);
  };

  const handleSignOut = async () => {
    const ok = window.confirm('Sign out from this device?');
    if (!ok) return;
    await signOut();
    onBack();
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-br from-pakGreen-700 via-pakGreen-600 to-emerald-600" />
        <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute top-24 right-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

        <div className="relative mx-auto w-full max-w-5xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
          <div className="mb-6 flex items-center justify-between">
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back
            </motion.button>

            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white/90 backdrop-blur-md">
              <ShieldIcon className="h-4 w-4" />
              Account
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="rounded-3xl bg-white p-5 shadow-xl shadow-gray-200/40 border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-56 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
                  <div className="h-28 bg-gray-100 rounded-2xl animate-pulse sm:col-span-2" />
                </div>
              </motion.div>
            ) : !profile ? (
              <motion.div
                key="no-profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="rounded-3xl bg-white p-6 shadow-xl shadow-gray-200/40 border border-gray-100"
              >
                <p className="text-gray-800 font-bold">Please sign in to view your profile.</p>
                <p className="mt-1 text-sm text-gray-500">Your session is missing or expired.</p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800"
                  >
                    Go Back
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.35 }}
                className="rounded-3xl bg-white shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden"
              >
                <div className="px-5 pt-6 sm:px-8 sm:pt-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="group relative h-20 w-20 rounded-3xl bg-gradient-to-br from-pakGreen-600 to-emerald-600 p-1 shadow-lg shadow-pakGreen-200 focus:outline-none focus:ring-2 focus:ring-pakGreen-500/40"
                        >
                          <div className="h-full w-full rounded-[22px] bg-white overflow-hidden flex items-center justify-center">
                            {profile.avatar_url ? (
                              <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-pakGreen-700 font-black text-3xl">
                                {initials}
                              </span>
                            )}
                          </div>
                          <div className="absolute inset-1 rounded-[22px] bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                            {isUploadingAvatar ? (
                              <div className="h-5 w-5 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                            ) : (
                              <SaveIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </motion.button>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarUpload}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-black text-gray-900 truncate">
                            {profile.full_name || 'Your Profile'}
                          </p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${profile.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-pakGreen-50 text-pakGreen-700'}`}>
                            {profile.role === 'admin' ? <ShieldIcon className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
                            {profile.role}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 truncate">{profile.email}</p>
                        <p className="mt-1 text-xs text-gray-400">Tap your avatar to change photo</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Status</p>
                        <p className="mt-1 text-sm font-extrabold text-gray-900">Active</p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">User ID</p>
                        <p className="mt-1 text-sm font-extrabold text-gray-900 truncate max-w-[140px]">{profile.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 bg-white px-5 pb-8 pt-6 sm:px-8">
                  <form ref={formRef} onSubmit={handleUpdate} className="space-y-6">
                    <AnimatePresence>
                      {message && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}
                        >
                          {message.text}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-500">Full Name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => { setFullName(e.target.value); setIsDirty(true); }}
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm focus:border-pakGreen-500 focus:ring-pakGreen-500/30"
                          placeholder="Your name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-500">Email</label>
                        <input
                          type="text"
                          value={profile.email || ''}
                          readOnly
                          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-500 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500">Bio / Goal</label>
                      <textarea
                        value={bio}
                        onChange={(e) => { setBio(e.target.value); setIsDirty(true); }}
                        rows={4}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm focus:border-pakGreen-500 focus:ring-pakGreen-500/30"
                        placeholder="Tell us about your CSS goals..."
                      />
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleDiscard}
                          disabled={!isDirty || isSaving}
                          className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                          Discard
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleSignOut}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                        >
                          <LogOutIcon className="h-4 w-4" />
                          Sign Out
                        </motion.button>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={isSaving || isUploadingAvatar}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pakGreen-600 to-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-pakGreen-200/60 transition disabled:opacity-60"
                      >
                        {isSaving ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <SaveIcon className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isDirty && profile && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                className="fixed inset-x-4 bottom-4 z-40 sm:hidden"
              >
                <div className="rounded-3xl border border-gray-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-gray-600 truncate">You have unsaved changes</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDiscard}
                        disabled={isSaving}
                        className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-50"
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={() => formRef.current?.requestSubmit()}
                        disabled={isSaving || isUploadingAvatar}
                        className="rounded-2xl bg-gray-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
