"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { setMasterKey, clearMasterKey } from "@/lib/password-service";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        clearMasterKey();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Use the password as the master key for encryption
      // In production, you might want a separate master password
      setMasterKey(password);

      return data;
    },
    [supabase.auth]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      // Set master key on signup too
      setMasterKey(password);

      return data;
    },
    [supabase.auth]
  );

  const signOut = useCallback(async () => {
    clearMasterKey();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }, [supabase.auth]);

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
