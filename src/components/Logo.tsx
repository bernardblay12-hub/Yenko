"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export default function Logo({
  className = "",
  showText = true,
  size = "md",
  href,
}: LogoProps) {
  const iconSizes = {
    sm: "h-7 w-7 text-sm",
    md: "h-9 w-9 text-base",
    lg: "h-11 w-11 text-xl",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const logoContent = (
    <div className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Standalone Vibrant Emerald Vector Icon Mark - No surrounding box/border */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        {/* Glow backdrop behind icon */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-sm transition-all group-hover:bg-emerald-500/30 group-hover:scale-110" />
        
        {/* Stylish Vector Y Icon SVG */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative h-full w-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        >
          <path
            d="M8 8L20 22V34"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-600 dark:text-emerald-400"
          />
          <path
            d="M32 8L20 22"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-teal-500 dark:text-teal-300"
          />
          {/* Subtle accent dot */}
          <circle cx="20" cy="22" r="2.5" fill="currentColor" className="text-emerald-500 dark:text-emerald-300" />
        </svg>
      </div>

      {showText && (
        <span className={`font-sans font-black tracking-tight text-foreground ${textSizes[size]}`}>
          Yɛnkɔ
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}
