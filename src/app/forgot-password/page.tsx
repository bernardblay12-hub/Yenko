"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? window.location.origin + "/reset-password" : "",
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSent(true);
        toast.success("Password recovery link sent! Check your inbox.");
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

      {/* Top Navbar/Back Link */}
      <div className="absolute top-6 left-6 sm:left-12">
        <Link
          href="/login"
          className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Sign In
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-6">
        {/* Branding Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-foreground font-sans">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-xs text-text-muted">
          We will email you a secure link to reset your account password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface border border-border-mute py-8 px-6 sm:px-10 rounded-2xl shadow-xl backdrop-blur-md">
          {isSent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Check your email</h3>
              <p className="text-xs text-text-muted">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex justify-center w-full py-2 px-4 border border-border-mute rounded-lg text-xs font-bold text-foreground bg-surface hover:bg-background transition-all focus:outline-none cursor-pointer"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleResetRequest}>
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
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
                    "Send Reset Link"
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
