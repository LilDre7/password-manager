"use client";

import { useEffect, useState } from "react";
import { LoginScreen } from "@/components/login-screen";
import { Dashboard } from "@/components/dashboard";
import { useAuth } from "@/hooks/use-auth";
// Íconos inline con suppressHydrationWarning para evitar mismatch cuando extensiones (ej. Dark Reader) modifican el DOM
function LoadingShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      suppressHydrationWarning
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LoadingSpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      suppressHydrationWarning
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setShowDashboard(true);
    } else {
      setShowDashboard(false);
    }
  }, [user]);

  // Mismo contenido en servidor y primer paint del cliente para evitar hidratación incorrecta
  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <LoadingShieldIcon className="h-7 w-7 text-primary" />
          </div>
          <span className="text-2xl font-semibold text-foreground">Password Manager</span>
        </div>
        <LoadingSpinnerIcon className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your vault...</p>
      </div>
    );
  }

  if (!showDashboard) {
    return <LoginScreen onLogin={() => setShowDashboard(true)} />;
  }

  return <Dashboard onLogout={() => setShowDashboard(false)} />;
}
