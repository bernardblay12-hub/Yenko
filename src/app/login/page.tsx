"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, ArrowLeft, Loader2, Eye, EyeOff, Car, GraduationCap } from "lucide-react";
import { GoogleLogo } from "@/components/BrandIcons";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [loginRole, setLoginRole] = useState<"student" | "driver">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to workspace
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const errorDesc = urlParams.get("error_description") || hashParams.get("error_description");
      const error = urlParams.get("error") || hashParams.get("error");

      if (error || errorDesc) {
        const detailMsg = errorDesc || error || "OAuth code exchange failed";
        toast.error(`Google authentication error: ${detailMsg}`, {
          duration: 8000,
        });
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    if (!supabase) return;
    supabase.auth.getSession().then(({ data }: { data: any }) => {
      const session = data?.session;
      if (session) {
        const uid = session.user.id;
        (supabase.from("profiles" as any) as any).select("role").eq("id", uid).maybeSingle().then(({ data: prof }: { data: any }) => {
          if (prof?.role === "driver") {
            router.push("/terminal/driver");
          } else {
            router.push("/terminal");
          }
        });
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else if (data.session) {
        if (data.session.user) {
          try {
            await supabase.from("profiles").upsert({
              id: data.session.user.id,
              email: data.session.user.email || email,
              role: loginRole,
              is_verified_driver: loginRole === "driver" ? true : undefined,
              updated_at: new Date().toISOString()
            });
          } catch {}
        }

        // Update local session role cache if logged in as driver
        if (typeof window !== "undefined") {
          const existingProfile = localStorage.getItem("yenko_profile");
          const parsed = existingProfile ? JSON.parse(existingProfile) : {};
          localStorage.setItem("yenko_profile", JSON.stringify({
            ...parsed,
            role: loginRole,
            is_verified_driver: loginRole === "driver" ? true : parsed.is_verified_driver,
          }));
        }

        toast.success(`Welcome back, bro! Signed in as ${loginRole === "driver" ? "Campus Driver" : "Student Commuter"}.`);
        if (loginRole === "driver") {
          router.push("/terminal/driver");
        } else {
          router.push("/terminal");
        }
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }
    setIsGoogleLoading(true);
    try {
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/terminal` : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        toast.error("Google login failed: " + error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      toast.error("Google login error: " + (err.message || "Failed to connect"));
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl -z-10" />

      {/* Top Navbar/Back Link */}
      <div className="absolute top-6 left-6 sm:left-12">
        <Link
          href="/"
          className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-6">
        {/* Branding Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-foreground font-sans">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface border border-border-mute py-8 px-6 sm:px-10 rounded-2xl shadow-xl backdrop-blur-md">
          
          {/* Role Login Selector */}
          <div className="mb-6">
            <label className="block text-[10px] font-mono font-bold text-text-muted uppercase mb-2">
              Sign In As
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-background border border-border-mute">
              <button
                type="button"
                onClick={() => setLoginRole("student")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginRole === "student"
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Student Commuter
              </button>

              <button
                type="button"
                onClick={() => setLoginRole("driver")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginRole === "driver"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                <Car className="h-4 w-4" />
                Campus Driver
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-mono font-bold text-text-muted uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-background border border-border-mute rounded-lg outline-none focus:border-emerald-500 transition-colors text-foreground"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-[10px] font-mono font-bold text-text-muted uppercase">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2 text-xs bg-background border border-border-mute rounded-lg outline-none focus:border-emerald-500 transition-colors text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white transition-all focus:outline-none disabled:opacity-50 cursor-pointer ${
                  loginRole === "driver"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  loginRole === "driver" ? "Sign In as Driver" : "Sign In as Student"
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-mute" />
              </div>
              <div className="relative flex justify-center text-[10px] font-mono font-bold uppercase">
                <span className="px-2 bg-surface text-text-muted">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-border-mute rounded-lg bg-surface hover:bg-background text-foreground text-xs font-semibold shadow-sm transition-all focus:outline-none cursor-pointer"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <GoogleLogo className="h-4 w-4" />
                    Sign in with Google
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Link to Signup */}
          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted">
              New to Yɛnkɔ?{" "}
              <Link
                href="/signup"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
