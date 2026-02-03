"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchVaultKeyAndSet, setMasterKey, clearMasterKey, getMasterKey } from "@/lib/password-service";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  // Track if we're in the middle of a sign-in to prevent race conditions
  const isSigningIn = useRef(false);

  useEffect(() => {
    // Get initial session and load vault key if user is logged in
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user && !getMasterKey()) {
        // Only try to load vault key if not already set
        fetchVaultKeyAndSet(false).catch(() => {});
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        clearMasterKey();
      } else if (!isSigningIn.current && !getMasterKey()) {
        // Only try to load vault key if not currently signing in and key not already set
        fetchVaultKeyAndSet(false).catch(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      // Mark that we're signing in to prevent race condition with onAuthStateChange
      isSigningIn.current = true;
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        // Load vault key for this account; if none (existing user), use login password
        const hasVaultKey = await fetchVaultKeyAndSet(false);
        if (!hasVaultKey) {
          setMasterKey(password);
        }

        return data;
      } finally {
        // Reset the flag after a short delay to ensure onAuthStateChange has processed
        setTimeout(() => {
          isSigningIn.current = false;
        }, 100);
      }
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

      // If we have a session (e.g. no email confirmation), create vault key for new user
      if (data.session) {
        await fetchVaultKeyAndSet(true);
      }

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

  const resetPasswordForEmail = useCallback(
    async (email: string) => {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;
    },
    [supabase.auth]
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    [supabase.auth]
  );

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword,
  };
}
