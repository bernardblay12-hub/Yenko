"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to workspace
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/workspace");
      }
    });
  }, [router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/login" : "",
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        // If auto-confirm is enabled in Supabase local, they might be logged in directly.
        // If verification email is required, let them know.
        if (data.session) {
          toast.success("Account created successfully, welcome!");
          router.push("/workspace");
        } else {
          toast.success("Registration successful! Check your email to verify your account.");
          router.push("/login");
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin + "/workspace" : "",
        queryParams: {
          client_id: "696756760553-4lus6v4geqt91tlhgb574lop5ks2fou0.apps.googleusercontent.com"
        }
      },
    });

    if (error) {
      toast.error("Google login failed: " + error.message);
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
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="ResuTailor Logo"
              className="h-8 w-8 object-contain rounded border border-zinc-200 dark:border-zinc-800"
            />
            <span className="font-sans font-bold tracking-tight text-foreground text-lg">
              resu<span className="text-zinc-400 font-normal">tailor</span>
            </span>
          </Link>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-foreground font-sans">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-xs text-text-muted">
          Save your tailored resumes and sync your settings to the cloud.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface border border-border-mute py-8 px-6 sm:px-10 rounded-2xl shadow-xl backdrop-blur-md">
          <form className="space-y-5" onSubmit={handleSignUp}>
            {/* Full Name Input */}
            <div>
              <label htmlFor="name" className="block text-[10px] font-mono font-bold text-text-muted uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <User className="h-3.5 w-3.5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Bernard Blay"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-background border border-border-mute rounded-lg outline-none focus:border-emerald-500 transition-colors text-foreground"
                />
              </div>
            </div>

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
              <label htmlFor="password" className="block text-[10px] font-mono font-bold text-text-muted uppercase mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[10px] font-mono font-bold text-text-muted uppercase mb-1.5">
                Confirm Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-background border border-border-mute rounded-lg outline-none focus:border-emerald-500 transition-colors text-foreground"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-background bg-foreground hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Create Account"
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
                <span className="px-2 bg-surface text-text-muted">Or register with</span>
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
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google logo"
                      className="h-4 w-4"
                    />
                    Register with Google
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Link to Login */}
          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
