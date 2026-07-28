"use client";

import React from "react";
import Image from "next/image";

export function MtnMoMoLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/mtn.png"
        alt="MTN Mobile Money"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export function TelecelLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/telecel.png"
        alt="Telecel Cash"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export function PaystackLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="60" height="12" rx="3" fill="#0BA4DB" />
      <rect x="20" y="40" width="60" height="12" rx="3" fill="#0BA4DB" />
      <rect x="20" y="60" width="35" height="12" rx="3" fill="#0BA4DB" />
    </svg>
  );
}

export function GoogleMapsLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/google maps.jfif"
        alt="Google Maps"
        className="h-full w-full object-contain rounded-md"
      />
    </div>
  );
}

export function UMaTCrestLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/umat logo.jfif"
        alt="UMaT Academic Crest"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export function SupabaseLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="#3ECF8E" />
      <circle cx="50" cy="50" r="15" fill="#1E1E1E" />
    </svg>
  );
}

export function VercelLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/vercel.svg"
        alt="Vercel"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export function GoogleLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
