"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border-mute bg-surface py-12 mt-auto no-print">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Column 1: Brand & Logo */}
        <div className="col-span-2 md:col-span-1 space-y-3">
          <Logo href="/" size="sm" />
          <p className="text-[11px] text-text-muted leading-relaxed max-w-xs">
            On-demand campus transport and instant package deliveries for university students and staff across UMaT Tarkwa.
          </p>
        </div>

        {/* Column 2: Transport & Services */}
        <div className="col-span-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground font-mono mb-3">
            Services
          </h4>
          <ul className="space-y-2 text-[11px] text-text-muted">
            <li>
              <Link href="/workspace" className="hover:text-foreground transition-colors">Book a Campus Ride</Link>
            </li>
            <li>
              <Link href="/workspace" className="hover:text-foreground transition-colors">Request Delivery</Link>
            </li>
            <li>
              <Link href="/features" className="hover:text-foreground transition-colors">Campus Hotspots</Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-foreground transition-colors">Fares & Rates</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Platform */}
        <div className="col-span-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground font-mono mb-3">
            Platform
          </h4>
          <ul className="space-y-2 text-[11px] text-text-muted">
            <li>
              <Link href="/about" className="hover:text-foreground transition-colors">About Yɛnkɔ</Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className="col-span-2 sm:col-span-1 md:col-span-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground font-mono mb-3">
            Campus HQ
          </h4>
          <ul className="space-y-2 text-[11px] text-text-muted">
            <li>
              <span className="block font-medium text-foreground">University:</span>
              <span className="text-text-muted">UMaT, Tarkwa - Ghana</span>
            </li>
            <li>
              <span className="block font-medium text-foreground mt-1">Contact:</span>
              <a href="mailto:support@yenko.app" className="hover:text-foreground transition-colors">
                support@yenko.app
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 border-t border-border-mute pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[10px] text-text-muted">
          © {new Date().getFullYear()} Yɛnkɔ. Designed for UMaT Campus Transport & Deliveries.
        </span>
        <span className="text-[9px] text-text-muted font-mono">
          Tarkwa • Ghana
        </span>
      </div>
    </footer>
  );
}
