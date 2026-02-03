"use client";

import { useState, useMemo, useEffect } from "react";
import { PasswordEntry, Category } from "@/lib/types";
import {
  fetchPasswords,
  createPassword,
  updatePassword,
  deletePassword,
  setMasterKey,
  type PasswordCategory,
} from "@/lib/password-service";
import { PasswordCard } from "./password-card";
import { PasswordDrawer } from "./password-drawer";
import { SearchBar } from "./search-bar";
import { CategoryFilter } from "./category-filter";
import { SortDropdown, SortOption } from "./sort-dropdown";
import { AddPasswordDialog } from "./add-password-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, LogOut, Lock, Loader2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsMasterKey, setNeedsMasterKey] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { signOut, user } = useAuth();

  const loadPasswords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPasswords();
      // Map the decrypted data to our PasswordEntry type
      setPasswords(
        data.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          service_name: item.service_name,
          username: item.username,
          password: item.password,
          website: item.website,
          category: item.category as Category,
          notes: item.notes,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }))
      );
      setNeedsMasterKey(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load passwords";
      
      // If master key is missing, show unlock dialog instead of forcing logout
      if (errorMessage.includes("Master key not found")) {
        setNeedsMasterKey(true);
        return;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasswords();
  }, []);

  const filteredAndSortedPasswords = useMemo(() => {
    let result = [...passwords];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.service_name.toLowerCase().includes(searchLower) ||
          p.username.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (categoryFilter !== "All") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "date-desc":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case "date-asc":
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case "name-asc":
          return a.service_name.localeCompare(b.service_name);
        case "name-desc":
          return b.service_name.localeCompare(a.service_name);
        default:
          return 0;
      }
    });

    return result;
  }, [passwords, search, categoryFilter, sortOption]);

  const handleCardClick = (entry: PasswordEntry) => {
    setSelectedEntry(entry);
    setDrawerOpen(true);
  };

  // Helper to handle master key errors - show unlock dialog instead of forcing logout
  const handleMasterKeyError = (errorMessage: string): boolean => {
    if (errorMessage.includes("Master key not found")) {
      setNeedsMasterKey(true);
      return true;
    }
    return false;
  };

  const handleEdit = async (updatedEntry: PasswordEntry) => {
    try {
      const result = await updatePassword(updatedEntry.id, {
        service_name: updatedEntry.service_name,
        username: updatedEntry.username,
        password: updatedEntry.password,
        website: updatedEntry.website || undefined,
        category: updatedEntry.category as PasswordCategory,
        notes: updatedEntry.notes || undefined,
      });

      setPasswords((prev) =>
        prev.map((p) =>
          p.id === result.id
            ? {
                ...result,
                category: result.category as Category,
              }
            : p
        )
      );
      setSelectedEntry({
        ...result,
        category: result.category as Category,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update password";
      if (handleMasterKeyError(errorMessage)) return;
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePassword(id);
      setPasswords((prev) => prev.filter((p) => p.id !== id));
      setDrawerOpen(false);
      setSelectedEntry(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete password";
      if (handleMasterKeyError(errorMessage)) return;
      setError(errorMessage);
    }
  };

  const handleAdd = async (entry: {
    service_name: string;
    username: string;
    password: string;
    website?: string;
    category: Category;
    notes?: string;
  }) => {
    try {
      const result = await createPassword({
        ...entry,
        category: entry.category as PasswordCategory,
      });

      setPasswords((prev) => [
        {
          ...result,
          category: result.category as Category,
        },
        ...prev,
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add password";
      if (handleMasterKeyError(errorMessage)) return;
      setError(errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
    }
  };

  // Handle unlocking the vault with the user's password
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockPassword.trim()) return;
    
    setUnlockLoading(true);
    setUnlockError(null);
    
    try {
      // Set the password as the master key
      setMasterKey(unlockPassword);
      
      // Try to load passwords to verify the key works
      const data = await fetchPasswords();
      setPasswords(
        data.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          service_name: item.service_name,
          username: item.username,
          password: item.password,
          website: item.website,
          category: item.category as Category,
          notes: item.notes,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }))
      );
      
      // Success - close dialog and reset state
      setNeedsMasterKey(false);
      setUnlockPassword("");
      setShowUnlockPassword(false);
    } catch (err) {
      // If decryption fails, the password is wrong
      setUnlockError("Contraseña incorrecta. Usa la contraseña con la que creaste tu cuenta.");
    } finally {
      setUnlockLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground">Vault</span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm text-muted-foreground sm:block">
                {user.email}
              </span>
            )}
            <AddPasswordDialog onAdd={handleAdd} />
            <Button
              variant="ghost"
              size="icon"
              onClick={loadPasswords}
              className="text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              title="Lock vault"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {passwords.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Passwords</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <span className="text-lg font-bold text-blue-400">
                  {passwords.filter((p) => p.category === "Social").length}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Social</p>
                <p className="text-xs text-muted-foreground">accounts</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <span className="text-lg font-bold text-emerald-400">
                  {passwords.filter((p) => p.category === "Bank").length}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Bank</p>
                <p className="text-xs text-muted-foreground">accounts</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                <span className="text-lg font-bold text-cyan-400">
                  {passwords.filter((p) => p.category === "Technology").length}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Tech</p>
                <p className="text-xs text-muted-foreground">accounts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center gap-3">
            <SortDropdown value={sortOption} onChange={setSortOption} />
          </div>
        </div>

        <div className="mb-6">
          <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
        </div>

        {/* Password Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Loading your passwords...
            </p>
          </div>
        ) : filteredAndSortedPasswords.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedPasswords.map((entry) => (
              <PasswordCard
                key={entry.id}
                entry={entry}
                onClick={() => handleCardClick(entry)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              No passwords found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || categoryFilter !== "All"
                ? "Try adjusting your filters"
                : "Add your first password to get started"}
            </p>
          </div>
        )}
      </main>

      {/* Password Drawer */}
      <PasswordDrawer
        entry={selectedEntry}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Unlock Vault Dialog */}
      <Dialog open={needsMasterKey} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-md border-neutral-800 bg-neutral-900"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl text-white">
              Desbloquear Vault
            </DialogTitle>
            <DialogDescription className="text-center text-neutral-400">
              Tu sesión requiere autenticación. Ingresa tu contraseña para acceder a tus contraseñas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUnlock} className="mt-4 flex flex-col gap-4">
            <div className="relative">
              <Input
                type={showUnlockPassword ? "text" : "password"}
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                placeholder="Contraseña"
                className="h-11 rounded-lg border-neutral-700 bg-neutral-800 pr-10 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-300"
              >
                {showUnlockPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {unlockError && (
              <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
                {unlockError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-white text-sm font-medium text-black hover:bg-neutral-200"
                disabled={unlockLoading}
              >
                {unlockLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Desbloquear"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-11 w-full rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
