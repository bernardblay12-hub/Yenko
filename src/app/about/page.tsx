"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-16 space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground font-sans">
          About ResuTailor
        </h1>
        <p className="text-xs text-text-muted leading-relaxed">
          ResuTailor was conceived to solve a critical issue in modern job hunting: the pressure on candidates to exaggerate or hallucinate skills to match job descriptions.
        </p>
        <p className="text-xs text-text-muted leading-relaxed">
          Instead of using automated keyword stuffers, ResuTailor uses a conversational interface to extract and highlight your real experience honestly, aligning your achievements contextually with role requirements.
        </p>
        <div className="border-t border-border-mute pt-6 mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
            Origin & Development
          </h3>
          <p className="text-xs text-text-muted mt-2 leading-relaxed">
            Constructed by engineering graduates and developers, ResuTailor operates with minimal structural layouts specifically structured to output print-ready compliance documents.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
