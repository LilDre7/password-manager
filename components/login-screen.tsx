"use client";

import React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Link,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activeSlide, setActiveSlide] = useState(2);

  const { signIn, signUp, resetPasswordForEmail } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  // Función para generar contraseña segura y copiarla al portapapeles
  const generatePassword = async () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(password);
    setShowPassword(true); // Mostrar la contraseña generada
    
    // Copiar al portapapeles
    try {
      await navigator.clipboard.writeText(password);
      toast("No olvides tu contraseña, amigo", {
        description: "Contraseña copiada al portapapeles. Asegúrate de guardarla en un lugar seguro",
      });
    } catch (err) {
      // Si falla copiar, aún mostrar el toast
      toast("No olvides tu contraseña, amigo", {
        description: "Asegúrate de guardarla en un lugar seguro",
      });
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!forgotPasswordEmail.trim()) return;
    setForgotPasswordLoading(true);
    try {
      await resetPasswordForEmail(forgotPasswordEmail.trim());
      toast("Correo enviado", {
        description: "Revisa tu bandeja y usa el enlace para crear una nueva contraseña",
      });
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el enlace");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (activeTab === "signup" && !agreedToTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    setLoading(true);

    try {
      if (activeTab === "login") {
        await signIn(email, password);
        onLogin();
      } else {
        const result = await signUp(email, password);
        if (result.user?.identities?.length === 0) {
          setError("An account with this email already exists.");
        } else if (result.user && !result.session) {
          setMessage("Check your email to confirm your account.");
        } else {
          onLogin();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 sm:p-8">
      <div className="flex w-full max-w-[1100px] overflow-hidden rounded-none bg-black shadow-none lg:rounded-2xl lg:shadow-xl lg:border lg:border-neutral-800">
        {/* Left Panel - Image (Desktop only) */}
        <div className="relative hidden w-[45%] lg:block">
          <div className="relative h-full overflow-hidden">
            {/* Header */}
            <div className="absolute left-8 top-8 z-10 flex items-center gap-2">
              <Shield className="h-5 w-5 text-white" />
              <span className="text-lg font-semibold tracking-wide text-white">
                VAULT
              </span>
            </div>
            <button
              type="button"
              className="absolute right-8 top-8 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              <a href="https://alvaro-aburto.vercel.app/" target="_blank" rel="noopener noreferrer">
                Back to website
              </a>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Background Image - unoptimized evita diferencias de srcset/sizes entre servidor y cliente */}
            <Image
              src="/login-bg.jpg"
              alt="Desert landscape"
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-linear-to-br from-black/40 via-black/30 to-black/50" />

            {/* Tagline */}
            <div className="absolute bottom-12 left-8 right-8">
              <h2 className="text-3xl font-light leading-tight text-white">
                Secure Your Passwords,
                <br />
                Protect Your Life
              </h2>
            </div>

            {/* Carousel Dots */}
            <div className="absolute bottom-6 left-8 flex gap-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${activeSlide === index
                    ? "w-8 bg-white"
                    : "w-1.5 bg-white/50"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[55%] lg:px-16 lg:py-16">
          {/* Mobile Logo */}
          <div className="mb-12 flex items-center justify-center gap-2 lg:hidden">
            <Shield className="h-6 w-6 text-white" />
            <span className="text-xl font-semibold tracking-wide text-white">
              VAULT
            </span>
          </div>

          {/* Content */}
          <div className="mx-auto w-full max-w-sm">
            {showForgotPassword ? (
              <>
                <h1 className="mb-2 text-center text-3xl font-semibold text-white lg:text-left">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="mb-6 text-center text-sm text-neutral-400 lg:text-left">
                  Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                </p>
                <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4">
                  <Input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Email"
                    className="h-11 rounded-lg border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                    required
                  />
                  {error && (
                    <div className="rounded-lg bg-red-950/50 border border-red-800 px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="h-11 w-full rounded-lg bg-white text-sm font-medium text-black hover:bg-neutral-200"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Enviar enlace"
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError(null);
                      setForgotPasswordEmail("");
                    }}
                    className="text-center text-sm text-neutral-400 underline hover:text-neutral-300"
                  >
                    Volver al inicio de sesión
                  </button>
                </form>
              </>
            ) : (
              <>
            {/* Title */}
            <h1 className="mb-2 text-center text-3xl font-semibold text-white lg:text-left">
              {activeTab === "signup" ? "Create account" : "Welcome back"}
            </h1>
            <p className="mb-8 text-center text-sm text-neutral-400 lg:text-left">
              {activeTab === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("login");
                      setError(null);
                      setMessage(null);
                    }}
                    className="font-medium text-white underline decoration-neutral-500 underline-offset-2 hover:decoration-neutral-400"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("signup");
                      setError(null);
                      setMessage(null);
                    }}
                    className="font-medium text-white underline decoration-neutral-500 underline-offset-2 hover:decoration-neutral-400"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {activeTab === "signup" && (
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="h-11 flex-1 rounded-lg border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                  />
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="h-11 flex-1 rounded-lg border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                  />
                </div>
              )}

              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="h-11 rounded-lg border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                required
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-11 rounded-lg border-neutral-700 bg-neutral-900 pr-24 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                  required
                  minLength={6}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-neutral-500 transition-colors hover:text-neutral-300"
                    title="Generar contraseña"
                  >
                    <RefreshCw className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-500 transition-colors hover:text-neutral-300"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {activeTab === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-sm text-neutral-400 underline hover:text-neutral-300"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {activeTab === "signup" && (
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) =>
                      setAgreedToTerms(checked as boolean)
                    }
                    className="mt-0.5 border-neutral-600 data-[state=checked]:border-white data-[state=checked]:bg-white"
                  />
                  <label htmlFor="terms" className="text-sm leading-tight text-neutral-400">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-white underline decoration-neutral-500 underline-offset-2 hover:decoration-neutral-400"
                    >
                      Terms & Conditions
                    </button>
                  </label>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-950/50 border border-red-800 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-lg bg-green-950/50 border border-green-800 px-4 py-3 text-sm text-green-400">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="mt-2 h-11 w-full rounded-lg bg-white text-sm font-medium text-black transition-colors hover:bg-neutral-200"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : activeTab === "signup" ? (
                  "Create account"
                ) : (
                  "Log in"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-700" />
              <span className="text-sm text-neutral-500">Or register with</span>
              <div className="h-px flex-1 bg-neutral-700" />
            </div>

            {/* Social Login */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 gap-2 rounded-lg border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-200"
                onClick={() => toast("Google — en desarrollo", { description: "Próximamente disponible" })}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 gap-2 rounded-lg border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-200"
                onClick={() => toast("Apple — en desarrollo", { description: "Próximamente disponible" })}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Apple
              </Button>
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// No more changes needed