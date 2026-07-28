"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Check, Car, Bus, Zap, Bike } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 block mb-2">Fair Student Fares</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-sans">
            Transparent Campus Transport Rates
          </h1>
          <p className="text-sm text-text-muted mt-3 leading-relaxed">
            No surge pricing or hidden fees. Affordable student rates for trips across UMaT Tarkwa campus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Bus Shuttle */}
          <div className="p-6 rounded-2xl bg-surface border border-border-mute flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bus className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-bold text-foreground">Bus Shuttle</h3>
              </div>
              <p className="text-xs text-text-muted mb-4">Group campus transport along main routes.</p>
              <div className="text-2xl font-extrabold font-mono text-foreground mb-4">
                GHS 5.00 <span className="text-xs text-text-muted font-normal">/ seat</span>
              </div>
              <ul className="space-y-2 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Main Gate to SRID Hall</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Hostel route shuttles</span>
                </li>
              </ul>
            </div>
            <Link href="/workspace" className="mt-6 w-full py-2.5 rounded-xl bg-background border border-border-mute hover:border-emerald-500 text-center text-xs font-bold text-foreground">
              Book Shuttle
            </Link>
          </div>

          {/* E-Bicycle */}
          <div className="p-6 rounded-2xl bg-surface border border-border-mute flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bike className="h-5 w-5 text-teal-500" />
                <h3 className="text-lg font-bold text-foreground">E-Bicycle</h3>
              </div>
              <p className="text-xs text-text-muted mb-4">Eco-friendly campus parcel & canteen deliveries.</p>
              <div className="text-2xl font-extrabold font-mono text-foreground mb-4">
                GHS 6.00 <span className="text-xs text-text-muted font-normal">/ delivery</span>
              </div>
              <ul className="space-y-2 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Canteen meal delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Direct to hostel door</span>
                </li>
              </ul>
            </div>
            <Link href="/workspace" className="mt-6 w-full py-2.5 rounded-xl bg-background border border-border-mute hover:border-emerald-500 text-center text-xs font-bold text-foreground">
              Request Delivery
            </Link>
          </div>

          {/* Motorbike */}
          <div className="p-6 rounded-2xl bg-surface border border-border-mute flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-foreground">Motorbike</h3>
              </div>
              <p className="text-xs text-text-muted mb-4">Express single passenger rides and urgent packages.</p>
              <div className="text-2xl font-extrabold font-mono text-foreground mb-4">
                GHS 7.00 <span className="text-xs text-text-muted font-normal">/ trip</span>
              </div>
              <ul className="space-y-2 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Express speed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Shortcuts across campus</span>
                </li>
              </ul>
            </div>
            <Link href="/workspace" className="mt-6 w-full py-2.5 rounded-xl bg-background border border-border-mute hover:border-emerald-500 text-center text-xs font-bold text-foreground">
              Book Motorbike
            </Link>
          </div>

          {/* Taxi / Car */}
          <div className="p-6 rounded-2xl bg-surface border-2 border-emerald-500 flex flex-col justify-between relative shadow-lg shadow-emerald-500/10">
            <span className="absolute -top-3 right-4 bg-emerald-600 text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded">Most Popular</span>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Car className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-foreground">Taxi / Car</h3>
              </div>
              <p className="text-xs text-text-muted mb-4">Private rides & multi-passenger comfort.</p>
              <div className="text-2xl font-extrabold font-mono text-foreground mb-4">
                GHS 10.00 <span className="text-xs text-text-muted font-normal">/ ride</span>
              </div>
              <ul className="space-y-2 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Up to 4 passengers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Direct door-to-door</span>
                </li>
              </ul>
            </div>
            <Link href="/workspace" className="mt-6 w-full py-2.5 rounded-xl bg-emerald-600 text-white text-center text-xs font-bold shadow-md shadow-emerald-600/20">
              Book Taxi
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
