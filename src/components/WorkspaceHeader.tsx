"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sun, Moon, LogOut, Home, ShieldCheck, User } from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function WorkspaceHeader() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");
  const [userName, setUserName] = useState("Bernard Nokye");

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.user_metadata?.full_name) {
          setUserName(session.user.user_metadata.full_name);
        } else if (session?.user?.email) {
          setUserName(session.user.email.split("@")[0]);
        }
      });
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    toast.success("Signed out successfully.");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 border-b border-border-mute backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: App Logo + Campus Badge */}
        <div className="flex items-center gap-3">
          <Logo href="/workspace" size="md" />
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" /> UMaT Hub
          </span>
        </div>

        {/* Right: User controls, Home link, Theme toggle, Sign Out */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-surface"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Landing Page</span>
          </Link>

          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-border-mute text-text-muted hover:text-foreground hover:bg-surface transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-yellow-500" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-text-muted" />
              )}
            </button>
          )}

          {/* User Profile Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-mute text-xs font-semibold text-foreground">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <User className="w-3 h-3" />
            </div>
            <span>{userName}</span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
