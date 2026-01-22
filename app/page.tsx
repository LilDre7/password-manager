"use client";

import { useEffect, useState } from "react";
import { LoginScreen } from "@/components/login-screen";
import { Dashboard } from "@/components/dashboard";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Shield } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (user) {
      setShowDashboard(true);
    } else {
      setShowDashboard(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <span className="text-2xl font-semibold text-foreground">Vault</span>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your vault...</p>
      </div>
    );
  }

  if (!showDashboard) {
    return <LoginScreen onLogin={() => setShowDashboard(true)} />;
  }

  return <Dashboard onLogout={() => setShowDashboard(false)} />;
}
