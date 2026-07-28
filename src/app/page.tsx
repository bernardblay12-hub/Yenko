"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StepsCarousel from "@/components/StepsCarousel";
import { 
  ArrowRight, 
  Car, 
  Bus, 
  Bike, 
  Package, 
  ShieldCheck, 
  CheckCircle2,
  Navigation,
  Zap,
  Coffee,
  Star,
  UserCheck,
  Check,
  MapPin,
  Clock,
  Smartphone
} from "lucide-react";
import { UMAT_CAMPUS_HOTSPOTS } from "@/lib/supabase";
import { 
  MtnMoMoLogo, 
  TelecelLogo, 
  PaystackLogo, 
  GoogleMapsLogo,
  UMaTCrestLogo 
} from "@/components/BrandIcons";

const FEATURE_CARDS = [
  { Icon: Car, title: 'Instant Campus Rides', desc: 'Direct rides between UMaT hostels, laboratories, lecture faculties, and Tarkwa town.' },
  { Icon: Package, title: 'Hostel Parcel Delivery', desc: 'Order canteen meals, books, or laundry delivered direct to your hostel room.' },
  { Icon: ShieldCheck, title: '4-Digit OTP PIN Security', desc: 'Every ride requires a unique security PIN verification before the trip starts.' },
  { Icon: Navigation, title: 'Pre-Mapped Hotspots', desc: 'Designated campus pickup nodes for instant driver matching and zero GPS confusion.' },
  { Icon: Smartphone, title: 'MoMo & Cash Payments', desc: 'Upfront student-friendly fares paid via MTN Mobile Money, Telecel Cash, or Cash.' },
  { Icon: UserCheck, title: 'Verified Campus Drivers', desc: '100% ID-cleared student & campus partners for maximum safety day and night.' },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const errorDesc = urlParams.get("error_description") || hashParams.get("error_description");
      const error = urlParams.get("error") || hashParams.get("error");

      if (error || errorDesc) {
        toast.error("Google authentication error: Unable to exchange OAuth code. Please sign in with Email/Password or verify Supabase OAuth settings.", {
          duration: 6000,
        });
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground font-sans animate-fade-in">
      {/* ─── SmartStudy Square Grid Mesh Backing ─── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
      
      {/* ─── Ambient Concentric Cyber-Rings (Tarkwa Live Driver Radar) ─── */}
      <div className="absolute top-[6%] left-1/2 -translate-x-1/2 w-[48rem] h-[48rem] rounded-full border border-emerald-500/20 pointer-events-none hidden lg:block animate-pulse" />
      <div className="absolute top-[6%] left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] rounded-full border border-emerald-500/15 border-dashed pointer-events-none animate-[spin_90s_linear_infinite] hidden lg:block" />
      <div className="absolute top-[6%] left-1/2 -translate-x-1/2 w-[20rem] h-[20rem] rounded-full border border-teal-500/25 pointer-events-none hidden lg:block" />

      {/* ─── Floating Cyber-Hexagon & Vector Nodes ─── */}
      <svg className="absolute top-[14%] left-[5%] w-28 h-32 text-emerald-500/25 pointer-events-none animate-orb-slow hidden lg:block" viewBox="0 0 100 115" fill="none">
        <polygon points="50,2 98,30 98,85 50,113 2,85 2,30" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg className="absolute top-[48%] right-[5%] w-36 h-40 text-teal-500/22 pointer-events-none animate-orb-reverse hidden lg:block" viewBox="0 0 100 115" fill="none">
        <polygon points="50,2 98,30 98,85 50,113 2,85 2,30" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" />
      </svg>

      {/* ─── Floating Gradient Glow Orbs (Multi-Color Layering) ─── */}
      <div className="absolute top-[2%] left-[-8%] w-[42rem] h-[42rem] rounded-full bg-emerald-500/15 blur-[140px] pointer-events-none animate-orb-slow" />
      <div className="absolute top-[20%] right-[-8%] w-[38rem] h-[38rem] rounded-full bg-teal-500/15 blur-[120px] pointer-events-none animate-orb-reverse" />
      <div className="absolute top-[50%] left-[20%] w-[32rem] h-[32rem] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none animate-orb-slow" />
      <div className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] rounded-full bg-emerald-500/12 blur-[130px] pointer-events-none animate-orb-reverse" />
      
      {/* ─── Laser Beams & Animated Transit Corridors ─── */}
      <div className="absolute top-[8%] left-[-20%] w-[85rem] h-[12rem] -rotate-12 bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent blur-[70px] pointer-events-none" />
      <div className="absolute top-[34%] right-[-30%] w-[75rem] h-[28rem] -rotate-[35deg] bg-gradient-to-r from-transparent via-emerald-600/25 to-transparent blur-[90px] pointer-events-none" />
      <div className="absolute top-[65%] left-[-10%] w-[95rem] h-[25rem] rotate-15 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent blur-[85px] pointer-events-none" />
      
      {/* ─── Glowing Spline Wave Curves (Campus Transit Corridors) ─── */}
      <div className="absolute top-[18%] left-0 w-full h-[600px] pointer-events-none overflow-hidden opacity-90">
        <svg className="w-full h-full" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M-100 150 C 300 50, 600 450, 1000 250 C 1200 150, 1400 350, 1600 300"
            stroke="url(#spline-grad-1)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-[pulse_8s_ease-in-out_infinite]"
          />
          <path
            d="M-50 200 C 350 120, 550 380, 950 320 C 1150 280, 1350 420, 1550 380"
            stroke="url(#spline-grad-2)"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="spline-grad-1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
              <stop offset="30%" stopColor="#10b981" stopOpacity="0.38" />
              <stop offset="70%" stopColor="#059669" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="spline-grad-2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" stopOpacity="0" />
              <stop offset="25%" stopColor="#059669" stopOpacity="0.28" />
              <stop offset="75%" stopColor="#10b981" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ─── UMaT Constellation Data Nodes (Goldfields, KT Hall, FOE, Town) ─── */}
      <div className="absolute top-[26%] left-[3%] w-52 h-52 pointer-events-none hidden lg:block opacity-90">
        <svg className="w-full h-full text-emerald-500/35" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="15" y1="20" x2="45" y2="35" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="45" y1="35" x2="30" y2="70" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="30" y1="70" x2="75" y2="55" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="45" y1="35" x2="75" y2="55" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="75" y1="55" x2="85" y2="15" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
          
          <circle cx="15" cy="20" r="3.5" fill="#10b981" className="animate-[pulse_3s_infinite]" />
          <circle cx="45" cy="35" r="5" fill="#059669" className="animate-[pulse_4s_infinite]" />
          <circle cx="30" cy="70" r="4" fill="#10b981" className="animate-[pulse_2s_infinite]" />
          <circle cx="75" cy="55" r="4.5" fill="#059669" className="animate-[pulse_5s_infinite]" />
          <circle cx="85" cy="15" r="3" fill="#10b981" className="animate-[pulse_3.5s_infinite]" />
        </svg>
      </div>

      <div className="relative z-10">
        <Navbar />

        <main>
          {/* ─── 1. Hero Area ─── */}
          <section className="pt-24 md:pt-36 pb-20 md:pb-28 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
            <h1 className="max-w-3xl font-sans text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
              Navigate Campus Fast.<br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 bg-clip-text text-transparent">
                Rides & Deliveries in Seconds.
              </span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-text-muted mt-5 leading-relaxed">
              Designed specifically for UMaT students & staff. Request quick campus rides or order food and parcel deliveries direct to your hostel or lecture hall.
            </p>

            {/* Hero Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
              <Link
                href="/workspace"
                className="btn-primary-shimmer flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 text-sm transition-all shadow-[0_8px_25px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Car className="h-4 w-4 stroke-[2.5]" />
                Book Campus Ride
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/workspace"
                className="flex items-center justify-center gap-2.5 rounded-xl border border-border-mute bg-surface px-8 py-4 text-sm font-bold text-foreground transition-all hover:bg-background hover:border-emerald-500/40 cursor-pointer shadow-sm"
              >
                <Package className="h-4 w-4 text-emerald-500 stroke-[2.5]" />
                Request Delivery
              </Link>
            </div>

            {/* Key Metrics Counter */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full border-t border-border-mute/80 mt-16 pt-8 text-left">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-foreground tracking-tight">&lt; 3 Min</span>
                <span className="text-[11px] uppercase font-bold tracking-wider text-text-muted font-mono">Avg Pickup Time</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-emerald-500 tracking-tight">100%</span>
                <span className="text-[11px] uppercase font-bold tracking-wider text-text-muted font-mono">Verified Campus Riders</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-foreground tracking-tight">GHS 4.00+</span>
                <span className="text-[11px] uppercase font-bold tracking-wider text-text-muted font-mono">Affordable Student Fares</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-foreground tracking-tight">MoMo & Cash</span>
                <span className="text-[11px] uppercase font-bold tracking-wider text-text-muted font-mono">Instant Payments</span>
              </div>
            </div>
          </section>

          {/* ─── 2. SmartStudy-Style Feature Cards Section ─── */}
          <section id="features" className="py-20 border-t border-border-mute/60 bg-surface/40 backdrop-blur-xs relative z-10">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-16">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-500 block mb-2">Platform Capabilities</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Everything You Need To Move & Deliver</h2>
                <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-md mx-auto">High-performance campus transport tools built for UMaT student convenience and security.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURE_CARDS.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-background border border-border-mute hover:border-emerald-500/40 transition-all duration-300 shadow-sm hover:-translate-y-1 group"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                      <feature.Icon className="w-5 h-5 stroke-[2.25]" />
                    </div>
                    <h3 className="text-base font-bold mb-1.5 text-foreground tracking-tight">{feature.title}</h3>
                    <p className="text-xs text-text-muted leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── 3. 3-Step Workflow Section ─── */}
          <section className="py-20 border-t border-border-mute bg-background relative z-10">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-14">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-500 block mb-2">Simple 3-Step Dispatch</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">How Yɛnkɔ Works</h2>
                <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-sm mx-auto">Request a ride or delivery in three seamless steps from your smartphone.</p>
              </div>

              {mounted && <StepsCarousel />}
            </div>
          </section>

          {/* ─── 4. Transport Fleet Options ─── */}
          <section className="py-20 border-t border-border-mute bg-surface/50 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-500 font-mono block mb-2">Transport Fleet</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
                  Multiple Ways to Move Across Campus
                </h2>
                <p className="text-sm text-text-muted mt-2">
                  Choose the vehicle mode that fits your schedule, luggage, or delivery needs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Option 1: Taxi / Car */}
                <div className="p-6 rounded-2xl bg-background border border-border-mute hover:border-emerald-500/50 transition-all group shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm mb-4 group-hover:scale-105 transition-transform">
                    <Car className="h-6 w-6 stroke-[2.25]" />
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
                <div className="p-6 rounded-2xl bg-background border border-border-mute hover:border-emerald-500/50 transition-all group shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm mb-4 group-hover:scale-105 transition-transform">
                    <Bus className="h-6 w-6 stroke-[2.25]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Campus Shuttle Bus</h3>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Group shuttle rides connecting hostels, SRID hall, and main lecture faculties during peak hours.
                  </p>
                  <div className="mt-4 pt-4 border-t border-border-mute/50 flex justify-between items-center text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">
                    <span>Capacity: 12 Seats</span>
                    <span>From GHS 4</span>
                  </div>
                </div>

                {/* Option 3: Motorbike */}
                <div className="p-6 rounded-2xl bg-background border border-border-mute hover:border-emerald-500/50 transition-all group shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm mb-4 group-hover:scale-105 transition-transform">
                    <Zap className="h-6 w-6 stroke-[2.25]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Motorbike Express</h3>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Fastest option for single passengers needing quick express trips or urgent document deliveries.
                  </p>
                  <div className="mt-4 pt-4 border-t border-border-mute/50 flex justify-between items-center text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold">
                    <span>Capacity: 1 Seat</span>
                    <span>From GHS 5</span>
                  </div>
                </div>

                {/* Option 4: Campus Courier */}
                <div className="p-6 rounded-2xl bg-background border border-border-mute hover:border-emerald-500/50 transition-all group shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shadow-sm mb-4 group-hover:scale-105 transition-transform">
                    <Bike className="h-6 w-6 stroke-[2.25]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Campus Courier</h3>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Eco-friendly delivery riders for canteen meals, snacks, and small packages direct to hostel rooms.
                  </p>
                  <div className="mt-4 pt-4 border-t border-border-mute/50 flex justify-between items-center text-xs font-mono text-teal-600 dark:text-teal-400 font-semibold">
                    <span>Parcel / Goods</span>
                    <span>From GHS 6</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 5. Pre-Mapped Hotspots Grid ─── */}
          <section className="py-20 border-t border-border-mute bg-background relative z-10">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-emerald-500 font-mono block mb-2">Pre-Mapped Hotspots</span>
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
                  <div key={spot.id} className="p-4 rounded-xl border border-border-mute bg-surface hover:border-emerald-500/40 transition-colors flex items-start gap-3 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-sm mt-0.5">
                      <GoogleMapsLogo className="h-5 w-5" />
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

          {/* ─── 6. Tiered Pricing / Student Commuter Pass ─── */}
          <section className="py-20 border-t border-border-mute bg-surface/50 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-500 font-mono block mb-2">Flexible Pass Plans</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
                  Student Fares & Commuter Passes
                </h2>
                <p className="text-sm text-text-muted mt-2">
                  Pay per ride via Mobile Money or save with an unlimited monthly campus pass.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Plan 1: Standard Pay-As-You-Go */}
                <div className="p-8 rounded-3xl bg-background border border-border-mute shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-text-muted uppercase">Standard Rider</span>
                    <h3 className="text-2xl font-extrabold text-foreground mt-2">Pay-As-You-Go</h3>
                    <div className="mt-4 flex items-baseline gap-1 font-mono">
                      <span className="text-4xl font-black text-foreground">GH₵ 4.00</span>
                      <span className="text-xs text-text-muted">/ base trip</span>
                    </div>
                    <p className="text-xs text-text-muted mt-3 leading-relaxed">
                      Ideal for occasional campus rides between lectures or weekend trips to Tarkwa market.
                    </p>

                    <ul className="mt-6 space-y-3 text-xs text-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Instant Driver Matching</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>MTN MoMo & Telecel Cash</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>4-Digit Security OTP PIN</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8 pt-4">
                    <Link
                      href="/workspace"
                      className="w-full flex items-center justify-center py-3 rounded-xl border border-border-mute bg-surface hover:bg-background text-xs font-bold text-foreground transition-all shadow-sm"
                    >
                      Book Pay-As-You-Go Ride
                    </Link>
                  </div>
                </div>

                {/* Plan 2: Pro Student Commuter Pass */}
                <div className="p-8 rounded-3xl bg-background border-2 border-emerald-500/60 shadow-xl relative flex flex-col justify-between">
                  <div className="absolute -top-3.5 right-6 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                    Popular Choice
                  </div>

                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Pro Commuter Pass</span>
                    <h3 className="text-2xl font-extrabold text-foreground mt-2">Monthly Student Pass</h3>
                    <div className="mt-4 flex items-baseline gap-1 font-mono">
                      <span className="text-4xl font-black text-emerald-500">GH₵ 29.00</span>
                      <span className="text-xs text-text-muted">/ month</span>
                    </div>
                    <p className="text-xs text-text-muted mt-3 leading-relaxed">
                      Unlimited discount vouchers and priority dispatch during peak lecture changeovers.
                    </p>

                    <ul className="mt-6 space-y-3 text-xs text-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 stroke-[3]" />
                        <span><strong>20% Off All Rides & Deliveries</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 stroke-[3]" />
                        <span>Priority Peak Hour Dispatch</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 stroke-[3]" />
                        <span>Free Canteen Delivery Slot</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8 pt-4">
                    <Link
                      href="/signup"
                      className="w-full flex items-center justify-center py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                    >
                      Get Pro Commuter Pass
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 7. Social Proof & Verified Student Reviews ─── */}
          <section className="py-20 border-t border-border-mute bg-background relative z-10">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-500 font-mono block mb-2">Student Testimonials</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
                  Loved by UMaT Students & Staff
                </h2>
                <p className="text-sm text-text-muted mt-2">
                  See what students across Goldfields, KT Hall, and FOE say about Yɛnkɔ.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Review 1 */}
                <div className="p-6 rounded-2xl bg-surface border border-border-mute shadow-sm space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <p className="text-xs text-foreground leading-relaxed italic">
                    &ldquo;Getting from Goldfields Hostel to the Main Lecture Theatre used to take 20 minutes walking in the sun. With Yɛnkɔ, a motorbike rider picks me up in 2 minutes!&rdquo;
                  </p>
                  <div className="pt-2 border-t border-border-mute/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Ama Mensah</h4>
                      <span className="text-[10px] text-text-muted font-mono">2nd Year Mining Eng. • Goldfields</span>
                    </div>
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>

                {/* Review 2 */}
                <div className="p-6 rounded-2xl bg-surface border border-border-mute shadow-sm space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <p className="text-xs text-foreground leading-relaxed italic">
                    &ldquo;Ordering canteen meals to KT Hall during exam week saved my GPA. The rider delivered hot food straight to my block entrance.&rdquo;
                  </p>
                  <div className="pt-2 border-t border-border-mute/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Kwesi Appiah</h4>
                      <span className="text-[10px] text-text-muted font-mono">3rd Year Electrical Eng. • KT Hall</span>
                    </div>
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>

                {/* Review 3 */}
                <div className="p-6 rounded-2xl bg-surface border border-border-mute shadow-sm space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <p className="text-xs text-foreground leading-relaxed italic">
                    &ldquo;The security OTP PIN verification gives me 100% peace of mind when taking late evening shuttle rides back from the FOE lab.&rdquo;
                  </p>
                  <div className="pt-2 border-t border-border-mute/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Emmanuel Addo</h4>
                      <span className="text-[10px] text-text-muted font-mono">4th Year Geomatic Eng. • FOE</span>
                    </div>
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 8. Compatible Ecosystem Partners ─── */}
          <section className="py-20 border-t border-border-mute bg-surface/50 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-500 font-mono block mb-2">Ecosystem Partners</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
                  Powered by Official Integrations
                </h2>
                <p className="text-sm text-text-muted mt-2">
                  Seamlessly integrated with local payments, GPS telemetry, and academic authentication.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {/* MTN MoMo */}
                <div className="p-6 rounded-2xl bg-background border border-border-mute flex flex-col items-center text-center group hover:border-amber-500/50 transition-all shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-sm mb-3">
                    <MtnMoMoLogo className="h-7 w-7" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">MTN Mobile Money</h4>
                  <span className="text-[10px] text-text-muted mt-1">Instant MoMo Push</span>
                </div>

                {/* Telecel Cash */}
                <div className="p-6 rounded-2xl bg-background border border-border-mute flex flex-col items-center text-center group hover:border-red-500/50 transition-all shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 shadow-sm mb-3">
                    <TelecelLogo className="h-7 w-7" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Telecel Cash</h4>
                  <span className="text-[10px] text-text-muted mt-1">USSD & Wallet Sync</span>
                </div>

                {/* Google Maps */}
                <div className="p-6 rounded-2xl bg-background border border-border-mute flex flex-col items-center text-center group hover:border-blue-500/50 transition-all shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-sm mb-3">
                    <GoogleMapsLogo className="h-7 w-7" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Google Maps GPS</h4>
                  <span className="text-[10px] text-text-muted mt-1">Real-time Telemetry</span>
                </div>

                {/* UMaT Crest Clearance */}
                <div className="p-6 rounded-2xl bg-background border border-border-mute flex flex-col items-center text-center group hover:border-emerald-500/50 transition-all shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm mb-3">
                    <UMaTCrestLogo className="h-7 w-7" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">UMaT Crest Portal</h4>
                  <span className="text-[10px] text-text-muted mt-1">Student Clearance</span>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 9. Final CTA Banner ─── */}
          <section className="py-20 bg-background text-center relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 relative z-10">
              <h2 className="text-3xl font-extrabold text-foreground">Ready to Get Moving Across Campus?</h2>
              <p className="text-sm text-text-muted mt-3 max-w-xl mx-auto">
                Launch the Yɛnkɔ dispatch hub now to book a ride or schedule an instant delivery.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link
                  href="/signup"
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 text-sm transition-all shadow-lg shadow-emerald-500/30 active:scale-[0.98]"
                >
                  Launch Yɛnkɔ Dispatch Hub
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
