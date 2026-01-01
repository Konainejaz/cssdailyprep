import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

const SESSION_STORAGE_KEY = 'cssprep:auth_session_v1';

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  plan_id?: 'basic' | 'premium' | null;
  plan_status?: 'active' | 'inactive' | 'canceled' | null;
  plan_started_at?: string | null;
  plan_expires_at?: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const persistSession = (session: Session | null) => {
      try {
        if (session?.access_token && session?.refresh_token) {
          localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            })
          );
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {
        // ignore
      }
    };

    const restoreSession = async () => {
      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { access_token?: string; refresh_token?: string };
        if (!parsed?.access_token || !parsed?.refresh_token) return;
        await supabase.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        });
      } catch {
        // ignore
      }
    };

    const applySession = async (session: Session | null) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      persistSession(session);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    };

    const init = async () => {
      setIsLoading(true);
      await restoreSession();
      const { data } = await supabase.auth.getSession();
      await applySession(data.session ?? null);
    };

    void init();

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    // Create profile entry manually if trigger doesn't exist (failsafe)
    // Ideally use a database trigger for this
    if (data.user && !error) {
       await supabase.from('profiles').upsert({
         id: data.user.id,
         email: email,
         full_name: fullName,
         role: 'user',
         updated_at: new Date().toISOString(),
       });
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectTo = new URL(window.location.origin);
    redirectTo.pathname = '/';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo.toString(),
      },
    });

    const errorText =
      typeof (error as any)?.message === 'string'
        ? (error as any).message
        : typeof (error as any)?.msg === 'string'
          ? (error as any).msg
          : '';

    const lowered = errorText.toLowerCase();
    if (lowered.includes('provider is not enabled') || lowered.includes('unsupported provider')) {
      const configuredUrl =
        (import.meta as any)?.env?.VITE_SUPABASE_URL ??
        (import.meta as any)?.env?.SUPABASE_URL ??
        (supabase as any)?.supabaseUrl ??
        '';
      const match = String(configuredUrl).match(/https:\/\/([a-z0-9-]+)\.supabase\.co/i);
      const projectRef = match?.[1];
      const providersUrl = projectRef
        ? `https://supabase.com/dashboard/project/${projectRef}/auth/providers`
        : 'Supabase Dashboard → Authentication → Providers';
      const urlConfigUrl = projectRef
        ? `https://supabase.com/dashboard/project/${projectRef}/auth/url-configuration`
        : 'Supabase Dashboard → Authentication → URL Configuration';

      return {
        error: new Error(
          `Google login is disabled for the Supabase project this app is using.\n\nFix:\n- Enable Google provider: ${providersUrl}\n- Add this site URL (${window.location.origin}) in: ${urlConfigUrl}\n\nCurrent Supabase URL: ${configuredUrl || '(missing)'}`
        ),
      };
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    resetPassword,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
