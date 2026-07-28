"use client";

import { Cpu, Layers, TrendingUp, CheckCircle2 } from "lucide-react";

interface OptimizationCard {
  title: string;
  badge: string;
  description: string;
  bullets: string[];
  icon: any;
  colorClass: string;
}

export default function OptimizationShowcase() {
  const cards: OptimizationCard[] = [
    {
      title: "ATS Compliance Scan",
      badge: "Structure & Layout",
      description: "Ensures your resume parses flawlessly through automated applicant tracking systems by verifying margins, standard fonts, and filtering out tables or side columns.",
      bullets: [
        "Standard layout compliance",
        "ATS-friendly unicode fonts",
        "Zero hidden table layouts"
      ],
      icon: Cpu,
      colorClass: "text-emerald-500 bg-emerald-550/10 dark:bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Keyword Density Map",
      badge: "Semantic Matching",
      description: "Scans job descriptions to map crucial technical keywords and required capabilities directly into the bullet points of your background honestly.",
      bullets: [
        "Technical skills alignment",
        "Semantic overlap tracing",
        "Contextual placement"
      ],
      icon: Layers,
      colorClass: "text-indigo-500 bg-indigo-550/10 dark:bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Action Verb Enhancer",
      badge: "Metric Acceleration",
      description: "Upgrades weak, passive summaries to metric-focused descriptions based on real specifics you clarify during workspace questioning.",
      bullets: [
        "Quantifiable results focus",
        "Strong action vocabulary",
        "Bespoke sentence engineering"
      ],
      icon: TrendingUp,
      colorClass: "text-amber-500 bg-amber-550/10 dark:bg-amber-500/10 border-amber-500/20",
    }
  ];

  return (
    <div className="reveal-scale py-4">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">
          Resume Optimization Engine
        </span>
        <h3 className="text-3xl font-extrabold tracking-tight text-foreground font-sans mt-3">
          Simplicity Redefined. Verification Guaranteed.
        </h3>
        <p className="text-xs md:text-sm text-text-muted mt-3 max-w-xl mx-auto leading-relaxed">
          ResuTailor avoids generic templates. Our engine scans and structure-formats your credentials to align with market roles honestly.
        </p>
      </div>

      {/* 3-Column Elegant Typographic Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className="group relative p-8 rounded-3xl border border-border-mute/80 bg-surface/30 dark:bg-zinc-900/10 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-800 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Icon badge */}
              <div className={`inline-flex p-3 rounded-2xl border mb-6 transition-all group-hover:scale-105 ${card.colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Title & Badge */}
              <div className="space-y-1 mb-4">
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                  {card.badge}
                </span>
                <h4 className="text-base font-bold text-foreground font-sans tracking-tight">
                  {card.title}
                </h4>
              </div>

              {/* Description */}
              <p className="text-xs text-text-muted leading-relaxed mb-6">
                {card.description}
              </p>

              {/* Bullets */}
              <ul className="space-y-2 border-t border-border-mute/60 pt-6">
                {card.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-center gap-2.5 text-xs text-zinc-650 dark:text-zinc-405">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
