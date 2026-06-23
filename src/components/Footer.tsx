"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border-mute bg-surface py-12 mt-auto no-print">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Brand & Logo */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="ResuTailor Logo" 
              className="h-6 w-6 object-contain rounded border border-zinc-200 dark:border-zinc-800"
            />
            <span className="font-sans font-bold tracking-tight text-foreground text-sm">
              resu<span className="text-zinc-400 font-normal">tailor</span>
            </span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed max-w-xs">
            Precision resume customizations optimized for applicant tracking systems. Build high-impact, print-ready document layouts.
          </p>
        </div>

        {/* Column 2: Product */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground font-mono mb-3">
            Product
          </h4>
          <ul className="space-y-2 text-[11px] text-text-muted">
            <li>
              <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            </li>
            <li>
              <Link href="/workspace" className="hover:text-foreground transition-colors">Workspace</Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground font-mono mb-3">
            Company
          </h4>
          <ul className="space-y-2 text-[11px] text-text-muted">
            <li>
              <Link href="/about" className="hover:text-foreground transition-colors">About Us</Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-foreground transition-colors">Journal & Updates</Link>
            </li>
            <li>
              <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground font-mono mb-3">
            Connect
          </h4>
          <ul className="space-y-2 text-[11px] text-text-muted">
            <li>
              <span className="block font-medium text-foreground">Support:</span>
              <a href="mailto:support@resutailor.app" className="hover:text-foreground transition-colors">
                support@resutailor.app
              </a>
            </li>
            <li>
              <span className="block font-medium text-foreground mt-1">Repository:</span>
              <a href="https://github.com/bernardblay" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                github.com/resutailor
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 border-t border-border-mute pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[10px] text-text-muted">
          © {new Date().getFullYear()} ResuTailor. Structured for professionals.
        </span>
        <span className="text-[9px] text-text-muted font-mono">
          Ghana • UMaT
        </span>
      </div>
    </footer>
  );
}
