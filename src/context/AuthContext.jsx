import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      if (localStorage.getItem('is_teacher_logged_in') === 'true') {
        return {
          id: 'hai-teacher-001',
          email: 'nguyenvanhai.thcs@gmail.com',
          user_metadata: { full_name: 'Nguyễn Văn Hải' }
        };
      }
    } catch (e) {}
    return null;
  });

  const [profile, setProfile] = useState(() => {
    try {
      if (localStorage.getItem('is_teacher_logged_in') === 'true') {
        return {
          id: 'hai-teacher-001',
          email: 'nguyenvanhai.thcs@gmail.com',
          full_name: 'Nguyễn Văn Hải',
          role: 'teacher',
          job_title: 'GV Tiếng Anh',
          subject: 'Tiếng Anh',
          avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=hai'
        };
      }
    } catch (e) {}
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(!isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConfigError(true);
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('is_teacher_logged_in', 'true');
          await fetchProfile(session.user);
        } else if (localStorage.getItem('is_teacher_logged_in') === 'true') {
          // Keep persistent local teacher session
        } else {
          setUser(null);
          setProfile(null);
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
        localStorage.setItem('is_teacher_logged_in', 'true');
        await fetchProfile(session.user);
      } else if (localStorage.getItem('is_teacher_logged_in') === 'true') {
        // Keep persistent local teacher session
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
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();

      if (data) {
        setProfile(data);
      } else {
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
      setProfile({
        id: userData.id,
        email: userData.email,
        full_name: userData.user_metadata?.full_name || 'Nguyễn Văn Hải',
        role: 'teacher',
        job_title: 'GV Tiếng Anh',
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
    if (!error) {
      localStorage.setItem('is_teacher_logged_in', 'true');
    }
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
    if (!error) {
      localStorage.setItem('is_teacher_logged_in', 'true');
    }
    setLoading(false);
    return { data, error };
  };

  const enterAppDirectly = (customName = 'Nguyễn Văn Hải', customEmail = 'nguyenvanhai.thcs@gmail.com') => {
    localStorage.setItem('is_teacher_logged_in', 'true');
    const fallbackId = 'hai-teacher-001';
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
      job_title: 'GV Tiếng Anh',
      subject: 'Tiếng Anh',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher'
    };
    setUser(fallbackUser);
    setProfile(fallbackProfile);
    setLoading(false);
  };

  const updateProfile = async (updatedData) => {
    setProfile(prev => ({
      ...prev,
      ...updatedData
    }));

    try {
      if (user?.id && user.id !== 'hai-teacher-001') {
        await supabase.from('profiles').upsert({
          id: user.id,
          ...updatedData
        });
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('is_teacher_logged_in');
    setUser(null);
    setProfile(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {}
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
        updateProfile,
        refreshProfile: () => user && fetchProfile(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
