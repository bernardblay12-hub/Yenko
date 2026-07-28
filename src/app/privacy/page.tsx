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
            At ResuTailor, we prioritize your data sovereignty and privacy. This Privacy Policy details how we collect, process, and protect your information.
          </p>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">1. Metadata Stripping & PDF Parsing</h2>
            <p>
              When you upload a CV or resume document, we parse the raw text to extract professional backgrounds. Any document metadata (author names, timestamps, software version tags) is stripped automatically to ensure anonymity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">2. Client-Side Data Sovereignty</h2>
            <p>
              We use secure client-side storage mechanisms (such as LocalStorage fallbacks) to save resume logs, profile settings, and customized audit configurations. You maintain absolute control over the export and deletion of this data directly from your browser settings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">3. Secure Authentication</h2>
            <p>
              For users who choose to create an account, authentications and profile syncs are managed securely. We utilize strict Row Level Security (RLS) policies to guarantee that your profile records are queryable only by your authenticated session.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">4. No Data Reselling</h2>
            <p>
              We do not sell, rent, or lease your resumes, profiles, or queries to third-party advertisers, recruiters, or data brokers. All data processed is strictly used to customize and print your A4 resume files.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground font-sans">5. Contact Information</h2>
            <p>
              For questions regarding your data privacy, you can reach out to our team at support@resutailor.app.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
