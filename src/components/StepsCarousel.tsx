"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, CreditCard, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export default function StepsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = [
    {
      step: "01",
      title: "Select UMaT Landmark",
      description: "Pick your pickup node from pre-mapped UMaT hotspots like Main Gate, KT Hall, SRID, or FOE.",
      icon: MapPin,
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      accentBorder: "group-hover:border-emerald-500/40",
    },
    {
      step: "02",
      title: "Choose Fleet & Fare",
      description: "Select Motorbike Express, Campus Shuttle Bus, Taxi Car, or E-Bicycle Courier.",
      icon: Navigation,
      badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
      accentBorder: "group-hover:border-teal-500/40",
    },
    {
      step: "03",
      title: "Verify OTP & Ride",
      description: "Share your 4-digit security PIN with your driver and pay via MTN MoMo, Telecel Cash, or Cash.",
      icon: CreditCard,
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      accentBorder: "group-hover:border-amber-500/40",
    }
  ];

  useEffect(() => {
    if (isUserInteracting) return;
    autoTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [isUserInteracting, steps.length]);

  const handleUserInteraction = useCallback(() => {
    setIsUserInteracting(true);
    const timer = setTimeout(() => setIsUserInteracting(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % steps.length);
    handleUserInteraction();
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + steps.length) % steps.length);
    handleUserInteraction();
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* ─── Desktop & Tablet Layout (3-Column Interactive Grid) ─── */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 relative">
        {/* Connecting line behind step cards */}
        <div className="absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-amber-500/40 -z-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-beam" />
        </div>

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeIndex === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => {
                setActiveIndex(idx);
                handleUserInteraction();
              }}
              className={`relative z-10 p-6 rounded-2xl bg-surface border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full shadow-xs group ${
                isActive
                  ? "border-emerald-500/70 ring-2 ring-emerald-500/25 shadow-lg shadow-emerald-500/10 glow-active"
                  : "border-border-mute hover:border-emerald-500/40 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`p-3 rounded-xl border ${step.badgeColor} shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 stroke-[2.25]" />
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border transition-colors ${
                    isActive
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-xs animate-pulse"
                      : "bg-background text-text-muted border-border-mute group-hover:border-emerald-500/30"
                  }`}>
                    Step {step.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground tracking-tight mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-emerald-500/80 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
                  <span>Next Step</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ─── Mobile View (Clean Tab Switcher & Animated Card Carousel) ─── */}
      <div className="block md:hidden max-w-sm mx-auto">
        {/* Step Tab Buttons */}
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIndex(idx);
                handleUserInteraction();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeIndex === idx
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "bg-surface border border-border-mute text-text-muted hover:text-foreground"
              }`}
            >
              Step {step.step}
            </button>
          ))}
        </div>

        {/* Mobile Slide Card */}
        <div className="relative overflow-hidden min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full p-6 rounded-2xl bg-surface border border-emerald-500/40 shadow-sm flex flex-col items-center text-center space-y-3"
            >
              <div className={`p-3 rounded-full border ${steps[activeIndex].badgeColor}`}>
                {(() => {
                  const Icon = steps[activeIndex].icon;
                  return <Icon className="w-6 h-6 stroke-[2.25]" />;
                })()}
              </div>

              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500">
                Step {steps[activeIndex].step} of 03
              </span>

              <h3 className="text-sm font-bold text-foreground tracking-tight">
                {steps[activeIndex].title}
              </h3>

              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                {steps[activeIndex].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex items-center justify-between mt-4 px-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg border border-border-mute bg-surface text-foreground hover:bg-background transition-colors cursor-pointer"
            aria-label="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveIndex(idx);
                  handleUserInteraction();
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeIndex === idx ? "w-6 bg-emerald-500" : "w-1.5 bg-border-mute"
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-lg border border-border-mute bg-surface text-foreground hover:bg-background transition-colors cursor-pointer"
            aria-label="Next step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
