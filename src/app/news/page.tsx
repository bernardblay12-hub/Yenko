"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function News() {
  const articles = [
    {
      title: "Expanding Yɛnkɔ Campus Transport Across UMaT Tarkwa",
      date: "July 24, 2026",
      desc: "Introducing pre-mapped pickup hotspots for Goldfields Hostel, KT Hall, FOE Blocks, and Main Gate to reduce average student pickup times to under 3 minutes."
    },
    {
      title: "Instant Canteen & Hostel Deliveries Now Live",
      date: "July 18, 2026",
      desc: "Students can now order hot meals from campus canteens and request express lab document or laundry deliveries direct to their hostel room."
    },
    {
      title: "Seamless Mobile Money & Cash Upfront Payments",
      date: "July 10, 2026",
      desc: "An analytical review of how upfront fare estimates and MTN MoMo / Telecel Cash integrations eliminate price bargaining and enhance transaction safety."
    },
    {
      title: "Yɛnkɔ Driver Safety Verification & 100% Student Security",
      date: "July 02, 2026",
      desc: "Every rider and driver on Yɛnkɔ is verified with campus ID clearance and secure 4-digit OTP PIN validation for every active trip."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background bg-[linear-gradient(to_right,rgba(120,120,120,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.03)_1px,transparent_1px)] bg-[size:32px_32px] text-foreground font-sans animate-fade-in">
      <Navbar />
      
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-16 space-y-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground font-sans text-center mb-10">
          Yɛnkɔ Campus Journal & News
        </h1>

        <div className="space-y-8">
          {articles.map((art, idx) => (
            <article key={idx} className="border-b border-border-mute pb-8">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono uppercase font-semibold">
                {art.date}
              </span>
              <h3 className="text-base font-bold text-foreground mt-1 hover:text-emerald-600 transition-colors cursor-pointer">
                {art.title}
              </h3>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                {art.desc}
              </p>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
