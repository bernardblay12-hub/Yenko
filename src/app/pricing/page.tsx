"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  const plans = [
    {
      name: "Standard",
      price: "Free",
      desc: "Perfect for core adjustments and direct A4 exports.",
      features: [
        "Up to 2 customized CVs",
        "Interactive tailoring rounds",
        "Direct A4 PDF print layouts"
      ]
    },
    {
      name: "Professional",
      price: "$12",
      period: "/month",
      desc: "For job hunters aiming for verified, aligned applications.",
      features: [
        "Unlimited customized CVs",
        "Interactive chat assistant",
        "Honest experience verification",
        "Priority support channels"
      ],
      popular: true
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground font-sans">
            Transparent Pricing plans
          </h1>
          <p className="text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
            Choose the fit that matches your target ambitions. Free tier available.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 max-w-2xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`bg-surface border p-6 rounded flex flex-col justify-between relative ${
                plan.popular ? "border-foreground shadow-md" : "border-border-mute shadow-sm"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-4 bg-foreground text-background text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  Popular
                </span>
              )}
              
              <div>
                <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{plan.desc}</p>
                
                <div className="mt-4 flex items-baseline">
                  <span className="text-2xl font-bold tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-xs text-text-muted ml-1">{plan.period}</span>}
                </div>
                
                <ul className="mt-6 space-y-2.5 text-xs text-text-muted border-t border-border-mute pt-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-zinc-950 dark:text-zinc-50 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/workspace"
                  className={`w-full text-center block rounded py-2 text-xs font-semibold transition-all ${
                    plan.popular
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-surface border border-zinc-300 dark:border-zinc-700 text-foreground hover:border-zinc-400"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
