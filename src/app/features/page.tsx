"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Layers, Cpu, CheckCircle2, FileDown } from "lucide-react";

export default function Features() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground font-sans">
            Tailored Core Features
          </h1>
          <p className="text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
            ResuTailor is structured for high-performance CV customizations. Explore our primary capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <div className="bg-surface border border-border-mute p-6 rounded shadow-sm">
            <Layers className="h-5 w-5 text-foreground mb-3" />
            <h3 className="text-sm font-bold text-foreground">Conversational Interview</h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Upload your CV and paste a job description. ResuTailor starts an interactive chat, asking specific questions to align your real background with the job.
            </p>
          </div>

          <div className="bg-surface border border-border-mute p-6 rounded shadow-sm">
            <Cpu className="h-5 w-5 text-foreground mb-3" />
            <h3 className="text-sm font-bold text-foreground">AI Bullet Tailoring</h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Rewrite CV bullets contextually with active verbs and achievements based strictly on claims you verified during the conversation.
            </p>
          </div>

          <div className="bg-surface border border-border-mute p-6 rounded shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-foreground mb-3" />
            <h3 className="text-sm font-bold text-foreground">Honest Claim Verification</h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Any claim or achievement that hasn't been confirmed in the chat is flagged with an amber warning dot, keeping your resume 100% honest.
            </p>
          </div>

          <div className="bg-surface border border-border-mute p-6 rounded shadow-sm">
            <FileDown className="h-5 w-5 text-foreground mb-3" />
            <h3 className="text-sm font-bold text-foreground">A4 Monospace Export</h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Export standard PDF formats complying with clean A4 dimensions. Unverified warning dots are automatically hidden on print outputs.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
