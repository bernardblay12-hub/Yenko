"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, ShieldCheck, Zap, Car, Package, Clock, Phone, CreditCard } from "lucide-react";
import { UMAT_CAMPUS_HOTSPOTS } from "@/lib/supabase";

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 block mb-2">Campus Hotspots & Features</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-sans">
            Built Specifically for UMaT Campus Transport
          </h1>
          <p className="text-sm text-text-muted mt-3 leading-relaxed">
            Discover pre-mapped pickup locations, instant rider matching, and express food & parcel delivery services.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-6 rounded-2xl bg-surface border border-border-mute space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Car className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Instant Driver Matching</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Connect directly with verified campus taxi drivers, bus shuttles, motorbikes, and e-bicycles operating across Tarkwa.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border-mute space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Hostel Room Delivery</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Order food from the university canteen or transport books and laundry directly to your hostel block.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border-mute space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Mobile Money & Cash</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Seamlessly pay via MTN Mobile Money, Telecel Cash, or cash directly upon rider arrival.
            </p>
          </div>
        </div>

        {/* Pre-mapped UMaT Hotspots List */}
        <div className="p-8 rounded-3xl bg-surface border border-border-mute">
          <h2 className="text-2xl font-extrabold text-foreground mb-2">UMaT Campus Designated Hotspots</h2>
          <p className="text-xs text-text-muted mb-8">Official pickup and dropoff points mapped for instant booking.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {UMAT_CAMPUS_HOTSPOTS.map((spot) => (
              <div key={spot.id} className="p-4 rounded-xl bg-background border border-border-mute flex items-start gap-3">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">{spot.name}</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">{spot.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
