"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function News() {
  const articles = [
    {
      title: "Tailoring Resumes for Modern Job Requirements",
      date: "June 18, 2026",
      desc: "An in-depth study on how parsing algorithms evaluate dynamic component styling and standard typography weights in A4 CV sheets."
    },
    {
      title: "ResuTailor Platform Launch Update",
      date: "June 10, 2026",
      desc: "Introducing live comparison analytics, inline visual edits, and automatic A4 export support for all registered professional accounts."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-16 space-y-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground font-sans text-center mb-10">
          Journal & Updates
        </h1>

        <div className="space-y-8">
          {articles.map((art, idx) => (
            <article key={idx} className="border-b border-border-mute pb-8">
              <span className="text-[10px] text-text-muted font-mono uppercase font-semibold">
                {art.date}
              </span>
              <h3 className="text-base font-bold text-foreground mt-1 hover:text-zinc-600 dark:hover:text-zinc-350 cursor-pointer">
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
