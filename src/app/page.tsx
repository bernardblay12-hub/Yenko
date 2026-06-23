"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  ArrowRight, 
  Bot, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  Layers,
  UploadCloud,
  ShieldCheck,
  FileDown
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b border-border-mute bg-background/50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border-mute bg-surface px-3 py-1 text-xs text-text-muted mb-6 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Honest CV Tailoring
            </div>

            <h1 className="max-w-4xl font-sans text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.1]">
              Tailor your CV to any role. In minutes. Without lying.
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-text-muted mt-6 leading-relaxed">
              Stop sending generic resumes. ResuTailor asks clarifying questions about your real background to align your accomplishments with the job details honestly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <Link
                href="/workspace"
                className="flex items-center justify-center gap-2 rounded bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 cursor-pointer"
              >
                Start Tailoring
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/workspace"
                className="flex items-center justify-center rounded border border-border-mute bg-surface px-6 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-background hover:text-foreground cursor-pointer"
              >
                Launch Workspace
              </Link>
            </div>
          </div>
        </section>

        {/* Hero Demo (Static Chat Snippet) */}
        <section className="py-16 border-b border-border-mute max-w-4xl mx-auto px-6">
          <div className="bg-surface border border-border-mute rounded-lg shadow-md overflow-hidden font-mono">
            {/* Window header */}
            <div className="bg-background border-b border-border-mute px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                ResuTailor Assistant
              </span>
              <div className="w-12" />
            </div>

            {/* Chat content snippet */}
            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-start">
                <div className="bg-background border border-border-mute rounded p-3.5 max-w-[85%] text-foreground space-y-2">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5" />
                    ResuTailor Assistant
                  </p>
                  <p className="leading-relaxed">
                    Based on the job requirements, I see frontend system design is key. Do you have hands-on experience optimizing React application load times or asset overhead?
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-foreground text-background rounded p-3.5 max-w-[85%] space-y-1">
                  <p className="font-semibold text-[10px] opacity-80">You (Candidate)</p>
                  <p className="leading-relaxed">
                    Yes, I spearheaded mobile development using React Native; we optimized asset bundle loading times by 35% and increased our App Store rating from 4.1 to 4.6.
                  </p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-background border border-border-mute rounded p-3.5 max-w-[85%] text-foreground space-y-2">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5" />
                    ResuTailor Assistant
                  </p>
                  <p className="leading-relaxed">
                    Understood. I will adjust your first bullet to highlight React Native and the 35% loading speed improvement. Did you also work with Supabase Client Authentication?
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-foreground text-background rounded p-3.5 max-w-[85%] space-y-1">
                  <p className="font-semibold text-[10px] opacity-80">You (Candidate)</p>
                  <p className="leading-relaxed">
                    No, I haven't worked with Supabase. I did authentication using Firebase Auth in our club portal.
                  </p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-background border border-border-mute rounded p-3.5 max-w-[85%] text-foreground space-y-2">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5" />
                    ResuTailor Assistant
                  </p>
                  <p className="leading-relaxed text-zinc-600 dark:text-zinc-350">
                    Perfect. I will list Firebase Auth in your expertise, but I will not add Supabase. I'll flag it as an unverified gap instead. Ready to generate your resume?
                  </p>
                  <div className="pt-1">
                    <span className="inline-block bg-emerald-600 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase shadow-sm">
                      Generate Tailored Resume
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 border-b border-border-mute bg-surface">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
                Tailor in three simple steps
              </h2>
              <p className="text-sm text-text-muted mt-2">
                Say goodbye to generic resumes and exaggerated claims. Here is how we build high-impact CVs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-background border border-border-mute p-6 rounded shadow-xs relative">
                <span className="absolute top-4 right-4 text-3xl font-extrabold text-zinc-200 dark:text-zinc-800 font-mono">01</span>
                <div className="h-8 w-8 rounded bg-surface border border-border-mute flex items-center justify-center text-foreground mb-4">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground font-sans">
                  1. Upload CV
                </h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  Drag and drop your current master resume (PDF, TXT, or DOCX). Our secure server parser will instantly extract your existing background.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-background border border-border-mute p-6 rounded shadow-xs relative">
                <span className="absolute top-4 right-4 text-3xl font-extrabold text-zinc-200 dark:text-zinc-800 font-mono">02</span>
                <div className="h-8 w-8 rounded bg-surface border border-border-mute flex items-center justify-center text-foreground mb-4">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground font-sans">
                  2. Paste Job Link
                </h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  Paste the link of the posting or drop in the raw job description. ResuTailor immediately identifies the core requirements and skills.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-background border border-border-mute p-6 rounded shadow-xs relative">
                <span className="absolute top-4 right-4 text-3xl font-extrabold text-zinc-200 dark:text-zinc-800 font-mono">03</span>
                <div className="h-8 w-8 rounded bg-surface border border-border-mute flex items-center justify-center text-foreground mb-4">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground font-sans">
                  3. Answer Honest Questions
                </h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  Answer clarifying questions about your experience to get your tailored resume, using only confirmed claims without lying.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 bg-background/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
                Professional tools built for results
              </h2>
              <p className="text-sm text-text-muted mt-2">
                We skipped the flashy graphics to give you an immaculate workspace tailored for high performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-surface border border-border-mute p-6 rounded shadow-sm hover:border-zinc-350 transition-colors">
                <div className="h-8 w-8 rounded bg-background border border-border-mute flex items-center justify-center text-foreground mb-4">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground font-sans">
                  Zero Hallucinations
                </h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  No invented accomplishments or fake skills. ResuTailor highlights gaps dynamically and builds your resume based only on your honest input.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-surface border border-border-mute p-6 rounded shadow-sm hover:border-zinc-350 transition-colors">
                <div className="h-8 w-8 rounded bg-background border border-border-mute flex items-center justify-center text-foreground mb-4">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground font-sans">
                  Monospace Canvas Preview
                </h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  View your changes instantly on a structured A4 document preview. Bullet points requiring further verification get distinct visual indicators.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-surface border border-border-mute p-6 rounded shadow-sm hover:border-zinc-350 transition-colors">
                <div className="h-8 w-8 rounded bg-background border border-border-mute flex items-center justify-center text-foreground mb-4">
                  <FileDown className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground font-sans">
                  Print-Ready Exports
                </h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  Export formatted resumes perfectly complying with international A4 standards. Simple styling ensures clean, elegant print copies.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
