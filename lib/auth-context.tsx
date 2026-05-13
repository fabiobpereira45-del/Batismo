"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isMaster: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    // Verificar sessão atual
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: session.user.user_metadata?.role,
          });
          setIsMaster(session.user.user_metadata?.role === 'master');
        } else {
          setUser(null);
          setIsMaster(false);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data?.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        role: data.user.user_metadata?.role,
      });
      setIsMaster(data.user.user_metadata?.role === 'master');
    }
    
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsMaster(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isMaster, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}