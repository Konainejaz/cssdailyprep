import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { LogOutIcon, SaveIcon, ShieldIcon, UserIcon, SettingsIcon, BellIcon, CheckIcon, MenuIcon, ChevronLeftIcon } from './Icons';

interface ProfileViewProps {
  onBack: () => void;
  onMenuClick?: () => void;
}

// 3D Tilt Card Component
const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative transition-all duration-200 ease-out ${className}`}
    >
      <div style={{ transform: "translateZ(50px)" }} className="h-full">
         {children}
      </div>
    </motion.div>
  );
};

const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onMenuClick }) => {
  const { profile, refreshProfile, signOut, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'preferences'>('personal');
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState((profile as any)?.bio || '');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Security Tab State
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Preferences Tab State (Mock)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    examUpdates: true,
    dailyTips: false
  });

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

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      setResetEmailSent(true);
      setMessage({ type: 'success', text: 'Password reset email sent!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50/50 overflow-hidden relative">
        {/* Animated Background Mesh */}
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

      {/* Custom TopBar with Integrated Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
             <div className="flex items-center gap-3">
              <button 
                onClick={onMenuClick}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
              
              <button 
                onClick={onBack}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden md:block"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold text-gray-900 font-serif tracking-tight">My Profile</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full">
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-64"
              >
                <div className="h-8 w-8 rounded-full border-4 border-pakGreen-200 border-t-pakGreen-600 animate-spin" />
              </motion.div>
            ) : !profile ? (
               <motion.div
                key="no-profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white p-8 text-center shadow-sm border border-gray-100 max-w-md mx-auto mt-10"
              >
                <p className="text-gray-800 font-bold text-lg">Please sign in to view your profile.</p>
                <button
                    onClick={onBack}
                    className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:scale-105 transition-transform"
                >
                    Go Back
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="profile-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
              >
                {/* LEFT COLUMN: Profile Card (Sticky on Desktop) */}
                <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-4">
                    <TiltCard className="h-full">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-2xl shadow-gray-900/20 relative overflow-hidden h-full min-h-[400px] flex flex-col items-center text-center border border-gray-700/50">
                            {/* Decorative Blobs inside card */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-pakGreen-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10 flex flex-col items-center w-full">
                                <div className="relative group mb-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative h-32 w-32 rounded-full p-1.5 border-2 border-white/20 shadow-xl"
                                    >
                                        <div className="h-full w-full rounded-full overflow-hidden bg-gray-800 relative">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-white font-black text-4xl bg-gradient-to-br from-pakGreen-600 to-emerald-800">
                                                    {initials}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                {isUploadingAvatar ? (
                                                    <div className="h-6 w-6 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                                                ) : (
                                                    <SaveIcon className="h-6 w-6 text-white" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-1 right-1 bg-pakGreen-500 rounded-full p-2 border-2 border-gray-900 shadow-lg">
                                            <SaveIcon className="h-3 w-3 text-white" />
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

                                <h1 className="text-2xl font-bold tracking-tight mb-1">{profile.full_name || 'Anonymous User'}</h1>
                                <p className="text-gray-400 text-sm mb-6">{profile.email}</p>

                                <div className="w-full space-y-3">
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Role</span>
                                        <span className="text-sm font-bold text-pakGreen-400 capitalize">{profile.role}</span>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-pakGreen-500 animate-pulse" />
                                            <span className="text-sm font-bold text-white">Active</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-auto pt-8 w-full">
                                    <button 
                                        onClick={handleSignOut}
                                        className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LogOutIcon className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </TiltCard>
                </div>

                {/* RIGHT COLUMN: Tabs & Content */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    {/* Navigation Tabs */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-1.5 inline-flex shadow-sm border border-gray-200/50 overflow-x-auto max-w-full no-scrollbar">
                         {[
                            { id: 'personal', label: 'Personal Info', icon: UserIcon },
                            { id: 'security', label: 'Security', icon: ShieldIcon },
                            { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                  ? 'text-gray-900 shadow-sm'
                                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {activeTab === tab.id && (
                                <motion.div
                                  layoutId="activeTabBg"
                                  className="absolute inset-0 bg-white rounded-xl shadow-sm ring-1 ring-black/5"
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                              )}
                              <span className="relative z-10 flex items-center gap-2">
                                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-pakGreen-600' : ''}`} />
                                {tab.label}
                              </span>
                            </button>
                          ))}
                    </div>

                    {/* Tab Content Panel */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/40 border border-white/60 p-6 md:p-8 min-h-[500px] relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeTab === 'personal' && (
                                <motion.div
                                    key="personal"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                                        <p className="text-gray-500">Update your photo and personal details here.</p>
                                    </div>

                                    <form ref={formRef} onSubmit={handleUpdate} className="space-y-8 max-w-3xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3 group">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 group-focus-within:text-pakGreen-600 transition-colors">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => { setFullName(e.target.value); setIsDirty(true); }}
                                                    className="w-full bg-gray-50 border-b-2 border-gray-200 px-4 py-3 text-base font-semibold text-gray-900 focus:bg-white focus:border-pakGreen-500 transition-all outline-none rounded-t-lg"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                            <div className="space-y-3 group">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                                                <input
                                                    type="text"
                                                    value={profile.email || ''}
                                                    disabled
                                                    className="w-full bg-gray-100 border-b-2 border-transparent px-4 py-3 text-base font-semibold text-gray-500 cursor-not-allowed rounded-t-lg"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3 group">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 group-focus-within:text-pakGreen-600 transition-colors">Bio & Goals</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => { setBio(e.target.value); setIsDirty(true); }}
                                                rows={5}
                                                className="w-full bg-gray-50 border-b-2 border-gray-200 px-4 py-3 text-base font-medium text-gray-900 focus:bg-white focus:border-pakGreen-500 transition-all outline-none resize-none rounded-t-lg leading-relaxed"
                                                placeholder="Share your CSS journey goals..."
                                            />
                                        </div>

                                        <div className="pt-6 flex justify-end border-t border-gray-100">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={!isDirty || isSaving}
                                                className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg shadow-gray-900/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 hover:bg-gray-800"
                                            >
                                                {isSaving ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Saving...
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span>Save Changes</span>
                                                        <CheckIcon className="w-4 h-4" />
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="max-w-2xl space-y-8"
                                >
                                     <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-gray-900">Security Settings</h3>
                                        <p className="text-gray-500">Manage your password and session security.</p>
                                    </div>

                                    <div className="bg-orange-50/50 rounded-2xl p-8 border border-orange-100 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300">
                                        <div className="flex items-start gap-5">
                                            <div className="p-3 bg-white rounded-2xl text-orange-600 shadow-sm ring-1 ring-orange-100">
                                                <ShieldIcon className="w-8 h-8" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900">Password Reset</h3>
                                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">If you suspect any unauthorized access or just want to be safe, send a password reset link to your email.</p>
                                                
                                                <div className="mt-6">
                                                    {!resetEmailSent ? (
                                                        <motion.button 
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={handlePasswordReset}
                                                            className="px-6 py-2.5 bg-white border border-orange-200 text-orange-700 rounded-xl text-sm font-bold shadow-sm hover:bg-orange-50 transition-colors"
                                                        >
                                                            Send Reset Link
                                                        </motion.button>
                                                    ) : (
                                                        <div className="flex items-center gap-3 text-green-700 font-bold text-sm bg-green-50 px-6 py-3 rounded-xl border border-green-200">
                                                            <CheckIcon className="w-5 h-5" />
                                                            Reset link sent to {profile.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-200/50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">Active Session</h3>
                                                <p className="text-sm text-gray-500 mt-1">You are currently logged in on this device.</p>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                Online
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'preferences' && (
                                <motion.div
                                    key="preferences"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="max-w-3xl mx-auto space-y-6"
                                >
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-gray-900">Notifications</h3>
                                        <p className="text-gray-500">Choose what updates you want to receive.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { key: 'email', label: 'Email Digest', desc: 'Daily study summary' },
                                            { key: 'push', label: 'Push Alerts', desc: 'Instant exam notifications' },
                                            { key: 'examUpdates', label: 'FPSC Updates', desc: 'Critical schedule changes' },
                                            { key: 'dailyTips', label: 'Daily Tips', desc: 'Preparation advice' }
                                        ].map((item, i) => (
                                            <motion.div 
                                                key={item.key}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 ${
                                                    notifications[item.key as keyof typeof notifications] 
                                                    ? 'bg-pakGreen-50/30 border-pakGreen-200' 
                                                    : 'bg-gray-50 border-gray-100'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-pakGreen-100 text-pakGreen-600' : 'bg-gray-200 text-gray-400'}`}>
                                                        <BellIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                                                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out ${notifications[item.key as keyof typeof notifications] ? 'bg-pakGreen-600' : 'bg-gray-300'}`}
                                                >
                                                    <span 
                                                        className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`}
                                                    />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Feedback Message Toast */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 backdrop-blur-md ${
                                message.type === 'success' 
                                    ? 'bg-gray-900/90 text-white border-gray-800' 
                                    : 'bg-red-500/90 text-white border-red-600'
                            }`}
                        >
                            <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-green-500/20' : 'bg-white/20'}`}>
                                {message.type === 'success' ? <CheckIcon className="w-5 h-5" /> : <ShieldIcon className="w-5 h-5" />}
                            </div>
                            <span className="font-bold text-sm pr-2">{message.text}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;