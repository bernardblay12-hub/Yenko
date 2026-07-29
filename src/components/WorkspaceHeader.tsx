"use client";

import { useEffect, useState, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Sun,
  Moon,
  LogOut,
  User,
  Navigation,
  Activity,
  Wallet,
  Settings,
  ChevronDown
} from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

function WorkspaceHeaderNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");
  const [userName, setUserName] = useState("Bernard Nokye");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dynamic Tab Active Indicator
  const currentTab = useMemo(() => {
    if (pathname === "/pricing") return "wallet";
    if (pathname.includes("/terminal") || pathname.includes("/workspace")) {
      return searchParams.get("tab") || "dispatch";
    }
    return "dispatch";
  }, [pathname, searchParams]);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    if (supabase) {
      supabase.auth.getSession().then(({ data }: { data: any }) => {
        const session = data?.session;
        if (session?.user?.user_metadata?.full_name) {
          setUserName(session.user.user_metadata.full_name);
        } else if (session?.user?.email) {
          setUserName(session.user.email.split("@")[0]);
        }
      });
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    try {
      if (supabase) {
        await supabase.auth.signOut({ scope: "local" });
      }
    } catch (err) {
      // Ignore network errors on sign out so local session cleanup always completes
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sb-xzldfxvkjmgkiwhjesoe-auth-token");
        sessionStorage.clear();
      }
      toast.success("Signed out successfully.");
      router.push("/login");
    }
  };

  const getNavStyle = (tabName: string) => {
    const isActive = currentTab === tabName;
    return isActive
      ? "bg-emerald-500 text-white font-bold shadow-xs px-4 py-1.5 rounded-full text-xs tracking-wider transition-all flex items-center gap-1.5"
      : "text-text-muted hover:text-foreground hover:bg-background/50 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5";
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 border-b border-border-mute backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: App Logo */}
        <div className="flex items-center gap-3">
          <Logo href="/terminal" size="md" />
        </div>

        {/* Center Flex: Dynamic Global Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface/80 p-1 rounded-full border border-border-mute">
          <Link href="/terminal?tab=dispatch" className={getNavStyle("dispatch")}>
            <Navigation className="w-3.5 h-3.5" />
            <span>DISPATCH</span>
          </Link>

          <Link href="/terminal?tab=activity" className={getNavStyle("activity")}>
            <Activity className="w-3.5 h-3.5" />
            <span>ACTIVITY</span>
          </Link>

          <Link href="/terminal?tab=wallet" className={getNavStyle("wallet")}>
            <Wallet className="w-3.5 h-3.5" />
            <span>WALLET</span>
          </Link>
        </nav>

        {/* Right: Profile Dropdown Menu */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-mute text-xs font-semibold text-foreground hover:bg-background transition-all cursor-pointer shadow-xs"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <User className="w-3 h-3" />
              </div>
              <span className="max-w-[120px] truncate">{userName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>

            {/* Dropdown Popover */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-surface border border-border-mute shadow-lg py-1.5 z-50 text-xs font-medium space-y-0.5">
                <div className="px-3.5 py-2 border-b border-border-mute">
                  <p className="font-bold text-foreground truncate">{userName}</p>
                  <p className="text-[10px] text-text-muted font-mono">UMaT Commuter</p>
                </div>

                <Link
                  href="/terminal?tab=dispatch"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-text-muted hover:text-foreground hover:bg-background transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Profile Settings</span>
                </Link>

                {mounted && (
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-text-muted hover:text-foreground hover:bg-background transition-colors cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      {theme === "dark" ? (
                        <Sun className="w-3.5 h-3.5 text-yellow-500" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-text-muted" />
                      )}
                      <span>Appearance</span>
                    </span>
                    <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded bg-background border border-border-mute text-text-muted">
                      {theme}
                    </span>
                  </button>
                )}

                <div className="border-t border-border-mute pt-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}

export default function WorkspaceHeader() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 w-full bg-background/90 border-b border-border-mute backdrop-blur-md h-16 flex items-center justify-between px-6">
          <Logo href="/terminal" size="md" />
        </header>
      }
    >
      <WorkspaceHeaderNav />
    </Suspense>
  );
}
