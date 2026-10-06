'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { UserRole } from '@/types';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export interface SessionProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  institution: string;
  bio: string;
}

interface ProfileUpdate {
  full_name: string;
  institution: string | null;
  bio: string | null;
}

interface RoleContextValue {
  currentRole: UserRole;
  currentUser: SessionProfile;
  loading: boolean;
  error: string | null;
  saveProfile: (profile: ProfileUpdate) => Promise<void>;
  signOut: () => Promise<void>;
}

const EMPTY_PROFILE: SessionProfile = {
  id: '',
  name: '',
  email: '',
  role: 'STUDENT',
  avatar: '',
  institution: '',
  bio: '',
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SessionProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (user: { id: string; email?: string } | null) => {
    if (!user) {
      setCurrentUser(EMPTY_PROFILE);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role, institution, bio, avatar_path')
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) throw new Error(`Your account profile could not be loaded: ${profileError.message}`);
      if (!data) throw new Error('Your account profile is missing. Contact an administrator.');

      setCurrentUser({
        id: data.id,
        name: data.full_name,
        email: user.email ?? '',
        role: data.role,
        avatar: data.avatar_path ?? '',
        institution: data.institution ?? '',
        bio: data.bio ?? '',
      });
      setError(null);
    } catch (profileLoadError) {
      setError(profileLoadError instanceof Error ? profileLoadError.message : 'Your account profile could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    try {
      const supabase = createSupabaseBrowserClient();
      const initialize = async () => {
        try {
          const { data, error: authError } = await supabase.auth.getUser();
          if (authError && authError.name !== 'AuthSessionMissingError') {
            throw new Error(`Unable to validate your session: ${authError.message}`);
          }
          if (active) await loadProfile(data.user ? { id: data.user.id, email: data.user.email } : null);
        } catch (initializationError) {
          if (active) {
            setError(initializationError instanceof Error ? initializationError.message : 'Unable to load your account.');
            setLoading(false);
          }
        }
      };
      void initialize();
      const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        window.setTimeout(() => {
          if (active) void loadProfile(session?.user ? { id: session.user.id, email: session.user.email } : null);
        }, 0);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    } catch (initializationError) {
      setError(initializationError instanceof Error ? initializationError.message : 'Unable to load your account.');
      setLoading(false);
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [loadProfile]);

  const saveProfile = useCallback(async (profile: ProfileUpdate) => {
    if (!currentUser.id) throw new Error('Sign in before updating your profile.');
    const supabase = createSupabaseBrowserClient();
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        institution: profile.institution,
        bio: profile.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUser.id)
      .select('id, full_name, role, institution, bio, avatar_path')
      .single();
    if (updateError) throw new Error(`Your profile could not be saved: ${updateError.message}`);

    setCurrentUser((previous) => ({
      ...previous,
      name: data.full_name,
      role: data.role,
      institution: data.institution ?? '',
      bio: data.bio ?? '',
      avatar: data.avatar_path ?? '',
    }));
  }, [currentUser.id]);

  const signOut = useCallback(async () => {
    const { error: signOutError } = await createSupabaseBrowserClient().auth.signOut();
    if (signOutError) throw new Error(`Unable to sign out: ${signOutError.message}`);
  }, []);

  const value = useMemo<RoleContextValue>(() => ({
    currentRole: currentUser.role,
    currentUser,
    loading,
    error,
    saveProfile,
    signOut,
  }), [currentUser, loading, error, saveProfile, signOut]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within a RoleProvider');
  return context;
}
