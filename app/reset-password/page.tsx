"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { fetchVaultKeyAndSet } from "@/lib/password-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Íconos inline con suppressHydrationWarning para evitar mismatch cuando extensiones (ej. Dark Reader) modifican el DOM
function SpinnerIcon({ className }: { className?: string }) {
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

function ShieldIcon({ className }: { className?: string }) {
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [validLink, setValidLink] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setChecking(false);
      setValidLink(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await fetchVaultKeyAndSet(true);
      toast("Contraseña actualizada", {
        description: "Ya puedes iniciar sesión con tu nueva contraseña",
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        <SpinnerIcon className="h-8 w-8 animate-spin text-white" />
        <p className="mt-4 text-sm text-neutral-400">Verificando enlace...</p>
      </div>
    );
  }

  if (!validLink) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        <div className="mx-auto w-full max-w-sm rounded-2xl border border-neutral-800 bg-black p-8 text-center">
          <ShieldIcon className="mx-auto h-12 w-12 text-neutral-500" />
          <h1 className="mt-4 text-xl font-semibold text-white">
            Enlace inválido o expirado
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            El enlace para restablecer la contraseña no es válido o ya expiró.
            Solicita uno nuevo desde el inicio de sesión.
          </p>
          <Button asChild className="mt-6 w-full bg-white text-black hover:bg-neutral-200">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-neutral-800 bg-black p-8">
        <div className="mb-8 flex items-center justify-center gap-2">
          <ShieldIcon className="h-6 w-6 text-white" />
          <span className="text-lg font-semibold tracking-wide text-white">
            VAULT
          </span>
        </div>
        <h1 className="text-center text-xl font-semibold text-white">
          Nueva contraseña
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Elige una contraseña segura para tu cuenta.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-neutral-400">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="h-11 rounded-lg border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-neutral-400">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="h-11 rounded-lg border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-lg bg-white text-sm font-medium text-black hover:bg-neutral-200"
            disabled={loading}
          >
            {loading ? (
              <SpinnerIcon className="h-4 w-4 animate-spin" />
            ) : (
              "Guardar nueva contraseña"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
