"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Lock, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    // Check if there is an active session (Supabase automatically logs in the user
    // when they arrive via recovery link)
    supabase.auth.getSession().then((res: any) => {
      if (!res.data?.session) {
        setHasSession(false);
        toast.error("Invalid or expired password reset session. Please request a new link.");
      }
    });
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
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
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success("Password updated successfully!");
        setTimeout(() => {
          router.push("/workspace");
        }, 2000);
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-6">
        {/* Branding Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-foreground font-sans">
          Choose a new password
        </h2>
        <p className="mt-2 text-center text-xs text-text-muted">
          Type your new password below to secure your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface border border-border-mute py-8 px-6 sm:px-10 rounded-2xl shadow-xl backdrop-blur-md">
          {!hasSession ? (
            <div className="text-center space-y-4">
              <p className="text-xs text-red-500 font-semibold">
                No active password reset session found.
              </p>
              <p className="text-xs text-text-muted">
                This link may have expired or already been used. Please request a new link.
              </p>
              <div className="pt-2">
                <Link
                  href="/forgot-password"
                  className="inline-flex justify-center w-full py-2 px-4 border border-border-mute rounded-lg text-xs font-bold text-foreground bg-surface hover:bg-background transition-all focus:outline-none cursor-pointer"
                >
                  Request New Reset Link
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Password Changed!</h3>
              <p className="text-xs text-text-muted">
                Your password was updated successfully. Redirecting you to the workspace...
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handlePasswordReset}>
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-[10px] font-mono font-bold text-text-muted uppercase mb-1.5">
                  New Password
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
                    placeholder="Repeat new password"
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
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
