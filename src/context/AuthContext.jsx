import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(!isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConfigError(true);
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user);
        }
      } catch (err) {
        console.error('Lỗi khi lấy phiên đăng nhập Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();

      if (data) {
        setProfile(data);
      } else {
        // Fallback upsert profile if trigger didn't create profile row yet
        const fullName = userData.user_metadata?.full_name || userData.email.split('@')[0];
        const newProfile = {
          id: userData.id,
          email: userData.email,
          full_name: fullName,
          role: 'teacher',
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.id}`
        };
        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Fetch profile exception:', err);
      setProfile({
        id: userData.id,
        email: userData.email,
        full_name: userData.user_metadata?.full_name || 'Giáo viên Chủ Nhiệm',
        role: 'teacher',
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.id}`
      });
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { data, error };
  };

  const signUp = async (email, password, fullName) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    setLoading(false);
    return { data, error };
  };

  const enterAppDirectly = (customName = 'Giáo viên Chủ Nhiệm THCS', customEmail = 'giaovien.thcs@gmail.com') => {
    const fallbackId = '00000000-0000-0000-0000-000000000000';
    const fallbackUser = {
      id: fallbackId,
      email: customEmail,
      user_metadata: { full_name: customName }
    };
    const fallbackProfile = {
      id: fallbackId,
      email: customEmail,
      full_name: customName,
      role: 'teacher',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher'
    };
    setUser(fallbackUser);
    setProfile(fallbackProfile);
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Signout cleanup');
    }
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        configError,
        signIn,
        signUp,
        signOut,
        enterAppDirectly,
        refreshProfile: () => user && fetchProfile(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
