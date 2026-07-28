"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-background bg-[linear-gradient(to_right,rgba(120,120,120,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.03)_1px,transparent_1px)] bg-[size:32px_32px] text-foreground font-sans animate-fade-in">
      <Navbar />
      
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-20 space-y-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground font-sans text-center mb-10">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-xs text-text-muted leading-relaxed">
          <p>
            At Yɛnkɔ, we prioritize your data sovereignty, location privacy, and security. This Privacy Policy details how we handle ride bookings, delivery locations, and user account information across UMaT Tarkwa.
          </p>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">1. Geolocation & Campus Hotspot Telemetry</h2>
            <p>
              When you request a campus ride or parcel delivery, we use designated UMaT campus landmarks and optional device GPS to estimate driver arrival times and calculate upfront fares. Location data is never tracked continuously in the background outside active trip sessions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">2. Local Session & Offline Sovereignty</h2>
            <p>
              We utilize secure client-side storage mechanisms to save active dispatch requests, rider preferences, and profile credentials locally. This ensures your app operates smoothly even during network dips.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">3. Secure Authentication & Verification</h2>
            <p>
              For student riders and driver partners, authentications are managed via Supabase Auth with strict Row Level Security (RLS) policies. Your trip history and profile records are queryable only by your authenticated session.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">4. No Third-Party Data Selling</h2>
            <p>
              We do not sell, rent, or lease student contact numbers, trip logs, or hostel address details to third-party advertisers or data brokers. All telemetry is strictly used to match verified campus riders with drivers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">5. Contact Information</h2>
            <p>
              For questions regarding your data privacy, you can reach out to our team at support@yenko.app.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
