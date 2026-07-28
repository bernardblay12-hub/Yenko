"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  ArrowRight, 
  Car, 
  Bus, 
  Bike, 
  Package, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2,
  Navigation,
  Zap,
  Coffee
} from "lucide-react";
import { UMAT_CAMPUS_HOTSPOTS } from "@/lib/supabase";

/* ─── Scroll Reveal Hook ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = container.querySelectorAll(
      ".reveal, .reveal-fade, .reveal-scale"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function Home() {
  const scrollRef = useScrollReveal();
  
  return (
    <div ref={scrollRef} className="flex flex-col min-h-screen bg-background bg-[linear-gradient(to_right,rgba(120,120,120,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.03)_1px,transparent_1px)] bg-[size:32px_32px] text-foreground font-sans animate-fade-in">
      <Navbar />

      <main className="flex-1">
        {/* ─── 1. Hero Area ─── */}
        <section className="relative border-b border-border-mute bg-background/30 py-20 md:py-28 overflow-hidden">
          {/* Floating gradient background elements */}
          <div
            className="hero-orb"
            style={{
              width: 500, height: 500,
              background: "radial-gradient(circle, #059669 0%, transparent 70%)",
              top: "-15%", left: "10%",
            }}
          />
          <div
            className="hero-orb"
            style={{
              width: 400, height: 400,
              background: "radial-gradient(circle, #0284c7 0%, transparent 70%)",
              bottom: "-10%", right: "5%",
              animationDelay: "4s",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-6 flex flex-col items-center text-center">
            {/* Monospace Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              UMaT Tarkwa Campus Transport & Logistics
            </div>

            <h1 className="max-w-4xl font-sans text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.1] transition-transform duration-500 hover:scale-[1.01]">
              Navigate Campus Fast.<br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Rides & Deliveries in Seconds.
              </span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-text-muted mt-6 leading-relaxed">
              Designed specifically for UMaT students & staff. Request quick campus rides or order food and parcel deliveries direct to your hostel or lecture hall.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-10 w-full sm:w-auto">
              <Link
                href="/workspace"
                className="btn-primary-shimmer flex items-center justify-center gap-2 rounded.xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-7 py-3.5 text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] cursor-pointer"
              >
                <Car className="h-4 w-4" />
                Book Campus Ride
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/workspace"
                className="flex items-center justify-center gap-2 rounded-xl border border-border-mute bg-surface px-7 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-background hover:border-emerald-500/40 cursor-pointer"
              >
                <Package className="h-4 w-4 text-emerald-500" />
                Request Delivery
              </Link>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full border-t border-border-mute/80 mt-16 pt-8 text-left">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">&lt; 3 Min</span>
                <span className="text-[11px] uppercase font-bold tracking-wider text-text-muted font-mono">Avg Pickup Time</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">100%</span>
                <span className="text-[11px] uppercase font-bold tracking-wider text-text-muted font-mono">Verified Campus Riders</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">GHS 5.00+</span>
                <span className="text-[11px] uppercase font-bold tracking-wider text-text-muted font-mono">Affordable Student Fares</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">MoMo & Cash</span>
                <span className="text-[11px] uppercase font-bold tracking-wider text-text-muted font-mono">Instant Payments</span>
              </div>
            </div>
          </div>
        </section>


        {/* ─── 2. Vehicle Options ─── */}
        <section className="py-20 border-b border-border-mute bg-surface">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 font-mono block mb-2">Transport Fleet</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
                Multiple Ways to Move Across Campus
              </h2>
              <p className="text-sm text-text-muted mt-2">
                Choose the vehicle mode that fits your schedule, luggage, or delivery needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Option 1: Taxi / Car */}
              <div className="p-6 rounded-2xl bg-background border border-border-mute hover:border-emerald-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Car className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Taxi / Car</h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  Comfortable, direct rides between campus halls, laboratories, and Tarkwa town market junction.
                </p>
                <div className="mt-4 pt-4 border-t border-border-mute/50 flex justify-between items-center text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Capacity: 4 Seats</span>
                  <span>From GHS 10</span>
                </div>
              </div>

              {/* Option 2: Bus / Shuttle */}
              <div className="p-6 rounded-2xl bg-background border border-border-mute hover:border-emerald-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bus className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Bus / Shuttle</h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  Group shuttle rides connecting hostels, SRID hall, and main lecture faculties during peak hours.
                </p>
                <div className="mt-4 pt-4 border-t border-border-mute/50 flex justify-between items-center text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  <span>Group Travel</span>
                  <span>From GHS 5</span>
                </div>
              </div>

              {/* Option 3: Motorbike */}
              <div className="p-6 rounded-2xl bg-background border border-border-mute hover:border-emerald-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Express Motorbike</h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  Fastest option for single passengers needing quick express trips or urgent document deliveries.
                </p>
                <div className="mt-4 pt-4 border-t border-border-mute/50 flex justify-between items-center text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold">
                  <span>Express Speed</span>
                  <span>From GHS 7</span>
                </div>
              </div>

              {/* Option 4: E-Bicycle */}
              <div className="p-6 rounded-2xl bg-background border border-border-mute hover:border-emerald-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bike className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">E-Bicycle Courier</h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  Eco-friendly delivery riders for canteen meals, snacks, and small packages direct to hostel rooms.
                </p>
                <div className="mt-4 pt-4 border-t border-border-mute/50 flex justify-between items-center text-xs font-mono text-teal-600 dark:text-teal-400 font-semibold">
                  <span>Eco Deliveries</span>
                  <span>From GHS 5</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ─── 3. Campus Hotspots Grid ─── */}
        <section className="py-20 border-b border-border-mute bg-background">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 font-mono block mb-2">Pre-Mapped Hotspots</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
                  UMaT Campus Pickup Points
                </h2>
              </div>
              <p className="text-xs text-text-muted max-w-md">
                Select from designated campus landmarks for instant driver matching and accurate fare estimates.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {UMAT_CAMPUS_HOTSPOTS.map((spot) => (
                <div key={spot.id} className="p-4 rounded-xl border border-border-mute bg-surface hover:border-emerald-500/40 transition-colors flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{spot.name}</h4>
                    <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{spot.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ─── 4. Deliveries Feature Callout ─── */}
        <section className="py-20 border-b border-border-mute bg-surface overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 font-mono">Instant Deliveries</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Need Food, Books or Laundry Delivered to Your Hostel?
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Yɛnkɔ isn&apos;t just for passenger rides. Specify your pickup canteen or shop, add instructions, and a nearby motorbike or e-bicycle rider will deliver it straight to your room.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-foreground">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Coffee className="h-3.5 w-3.5" />
                  </div>
                  <span><strong>Campus Canteen Meals</strong> — Hot food delivered while you study.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <span><strong>Lab Documents & Books</strong> — Express transport between faculties.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <span><strong>Secure Mobile Money Payments</strong> — Pay securely via MTN MoMo or cash.</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/workspace"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 text-xs transition-all shadow-md shadow-emerald-600/20"
                >
                  Create Delivery Order
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Visual Card Mockup */}
            <div className="p-6 rounded-3xl bg-background border border-border-mute shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-border-mute">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-foreground">Active Delivery #YK-489</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">In Progress</span>
              </div>

              <div className="py-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Navigation className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-text-muted">Pickup Location</span>
                    <p className="text-xs font-bold text-foreground">University Canteen (Vendor 4)</p>
                  </div>
                </div>

                <div className="h-4 border-l-2 border-dashed border-emerald-500/40 ml-4" />

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-text-muted">Dropoff Location</span>
                    <p className="text-xs font-bold text-foreground">SRID Hall - Block B Room 204</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-border-mute flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-text-muted font-mono">Assigned Rider</span>
                  <p className="text-xs font-bold text-foreground">Kwame A. • E-Bicycle Rider</p>
                </div>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">GHS 8.00</span>
              </div>
            </div>
          </div>
        </section>


        {/* ─── 5. Final CTA ─── */}
        <section className="py-20 bg-background text-center">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl font-extrabold text-foreground">Ready to Get Moving Across Campus?</h2>
            <p className="text-sm text-text-muted mt-3 max-w-xl mx-auto">
              Launch the Yɛnkɔ dispatch hub now to book a ride or schedule an instant delivery.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/workspace"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-3.5 text-sm transition-all shadow-lg shadow-emerald-600/20"
              >
                Launch Yɛnkɔ Workspace
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
