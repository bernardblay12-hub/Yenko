"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GraduationCap, ShieldCheck, MapPin, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 block mb-2">Our Mission</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-sans">
            About Yɛnkɔ Campus Transport
          </h1>
          <p className="text-sm text-text-muted mt-3 leading-relaxed">
            Connecting UMaT Tarkwa students with fast, reliable campus rides and instant package deliveries.
          </p>
        </div>

        <div className="space-y-8 text-sm text-text-muted leading-relaxed bg-surface p-8 rounded-3xl border border-border-mute">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-500" />
              Built for University Students
            </h2>
            <p>
              Yɛnkɔ (Twi for <em>&ldquo;Let&apos;s Go!&rdquo;</em>) was born out of a simple campus challenge: getting between distant lecture halls, hostels, laboratories, and canteen hubs quickly and affordably.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-500" />
              Pre-Mapped Campus Hotspots
            </h2>
            <p>
              Whether you are heading from Main Gate to SRID Hall, picking up project equipment from Gold Refinery Lab, or ordering meals to KT Hall, Yɛnkɔ matches you with verified local campus drivers in seconds.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Verified & Safe
            </h2>
            <p>
              Every driver and e-bicycle rider on Yɛnkɔ is verified, providing safe transport options with upfront student-friendly fares paid via MTN Mobile Money, Telecel Cash, or cash on arrival.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
