"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-background bg-[linear-gradient(to_right,rgba(120,120,120,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.03)_1px,transparent_1px)] bg-[size:32px_32px] text-foreground font-sans animate-fade-in">
      <Navbar />
      
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-20 space-y-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground font-sans text-center mb-10">
          Terms of Service
        </h1>

        <div className="space-y-6 text-xs text-text-muted leading-relaxed">
          <p>
            Welcome to Yɛnkɔ. By accessing or using our campus ride-hailing and parcel delivery platform, you agree to comply with and be bound by the following Terms of Service.
          </p>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">1. Acceptable Use & Campus Safety</h2>
            <p>
              Yɛnkɔ is designed exclusively for verified UMaT students, staff, and authorized campus transport partners. Users agree to maintain mutual respect, provide accurate pickup landmarks, and comply with campus mobility safety rules.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">2. Fare Frequencies & Upfront Fares</h2>
            <p>
              Upfront student fares calculated in the app are binding for the selected campus route. Fares may be paid via MTN Mobile Money, Telecel Cash, or cash on arrival. Drivers and riders must adhere to the agreed rate.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">3. Parcel Delivery Liability</h2>
            <p>
              Delivery riders handling canteen meals, lab documents, or personal items pledge to handle items with care. Prohibited items include illegal substances, hazardous materials, and unregistered dangerous goods.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">4. Local Fallback & Availability</h2>
            <p>
              Yɛnkɔ implements offline local session sync to process dispatch requests seamlessly. We are not liable for delays caused by severe weather or unusual traffic bottlenecks at campus gate checkpoints.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">5. Updates to Terms</h2>
            <p>
              We reserve the right to update these Terms of Service as campus guidelines evolve. Continued use of Yɛnkɔ constitutes acceptance of updated terms.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
