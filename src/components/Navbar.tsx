"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
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

  const navItems = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "News", href: "/news" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-mute bg-background/80 backdrop-blur-md no-print">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img 
            src="/logo.png" 
            alt="ResuTailor Logo" 
            className="h-7.5 w-7.5 object-contain rounded border border-zinc-200 dark:border-zinc-800"
          />
          <span className="font-sans font-bold tracking-tight text-foreground">
            resu<span className="text-zinc-400 font-normal">tailor</span>
          </span>
        </Link>

        {/* Navigation Items (Clean Center Menu) */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] font-medium tracking-wide transition-colors hover:text-foreground ${
                  isActive ? "text-foreground font-semibold" : "text-zinc-400"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User CTA buttons */}
        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-yellow-500" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-zinc-500" />
              )}
            </button>
          )}

          <Link
            href="/workspace"
            className="rounded border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-foreground"
          >
            Log In
          </Link>
          <Link
            href="/workspace"
            className="rounded bg-zinc-950 dark:bg-zinc-50 px-3.5 py-1.5 text-[11px] font-medium text-white dark:text-black transition-colors hover:bg-zinc-850 dark:hover:bg-zinc-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
