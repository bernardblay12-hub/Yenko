"use client";

import React from "react";
import { type Trip } from "@/lib/supabase";
import { MapPin, Navigation, Clock, ShieldCheck, X, CheckCircle2, Loader2, Car, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TripTrackerProps {
  trip: Trip;
  onCancel: (tripId: string) => void;
}

export default function TripTracker({ trip, onCancel }: TripTrackerProps) {
  const isCancellable = trip.status === "pending" || trip.status === "accepted";

  const renderStatusIcon = () => {
    switch (trip.status) {
      case "pending":
        return <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />;
      case "accepted":
        return <Car className="w-6 h-6 text-emerald-500" />;
      case "in_progress":
        return <Navigation className="w-6 h-6 text-emerald-500" />;
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case "cancelled":
        return <X className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-text-muted" />;
    }
  };

  const getStatusMessage = () => {
    switch (trip.status) {
      case "pending":
        return "Searching for nearby drivers...";
      case "accepted":
        return `Driver is on the way! Share OTP: ${trip.otp_code || "N/A"}`;
      case "in_progress":
        return `You're on your way to ${trip.dropoff_location}!`;
      case "completed":
        return `Trip completed! GHS ${trip.fare_amount?.toFixed(2) || "0.00"}`;
      case "cancelled":
        return "Trip was cancelled";
      default:
        return "Trip status unknown";
    }
  };

  const steps = ["pending", "accepted", "in_progress", "completed"];
  const currentStepIndex = steps.indexOf(trip.status);

  return (
    <div className="w-full max-w-md mx-auto bg-surface border border-border-mute rounded-2xl shadow-lg overflow-hidden text-foreground">
      {/* Header */}
      <div className="bg-background/50 border-b border-border-mute p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface rounded-full border border-border-mute">
            {renderStatusIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-emerald-500">
              Trip #{trip.id.substring(0, 6)}
            </h3>
            <p className="text-sm text-text-muted">{getStatusMessage()}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {trip.status !== "cancelled" && (
        <div className="px-6 py-4 border-b border-border-mute bg-surface">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border-mute rounded-full" />
            <motion.div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
            
            {steps.map((step, index) => {
              const isPast = index <= currentStepIndex;
              return (
                <div 
                  key={step}
                  className={`relative z-10 w-4 h-4 rounded-full border-2 transition-colors duration-300 ${
                    isPast ? "bg-emerald-500 border-emerald-500" : "bg-surface border-border-mute"
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="p-6 space-y-6">
        <div className="relative pl-8 space-y-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border-mute" />
          
          <div className="relative">
            <div className="absolute -left-8 p-1 bg-surface rounded-full border border-border-mute">
              <MapPin className="w-4 h-4 text-text-muted" />
            </div>
            <p className="text-sm text-text-muted mb-1">Pickup</p>
            <p className="font-medium">{trip.pickup_location}</p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-8 p-1 bg-surface rounded-full border border-emerald-500">
              <Navigation className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm text-text-muted mb-1">Dropoff</p>
            <p className="font-medium">{trip.dropoff_location}</p>
          </div>
        </div>

        {trip.status === "accepted" && trip.otp_code && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="text-sm text-text-muted mb-1">Provide this OTP to your driver</p>
            <p className="text-3xl font-mono font-bold tracking-widest text-emerald-500">
              {trip.otp_code}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border-mute">
          <div>
            <p className="text-sm text-text-muted">Estimated Fare</p>
            <p className="text-xl font-semibold">GHS {trip.fare_amount?.toFixed(2) || "0.00"}</p>
          </div>
          
          {isCancellable && (
            <button
              onClick={() => onCancel(trip.id)}
              className="px-4 py-2 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
