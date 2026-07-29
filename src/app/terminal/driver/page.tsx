"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import {
  Car,
  Package,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  Zap,
  Bike,
  Bus,
  Loader2,
  Activity,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Phone,
  UserCheck,
  Check,
  X,
  Power
} from "lucide-react";
import {
  supabase,
  type Profile,
  type Trip,
  type TripStatus,
} from "@/lib/supabase";
import { toast } from "sonner";

export default function DriverConsolePage() {
  const router = useRouter();

  // ─── Driver State ───
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"active" | "earnings">("active");

  // ─── Dispatches State ───
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  // ─── Derived Calculations ───
  const activeTrip = useMemo(() => myTrips.find(t => t.status === "accepted" || t.status === "in_progress"), [myTrips]);
  const completedTrips = useMemo(() => myTrips.filter(t => t.status === "completed"), [myTrips]);
  const todayEarnings = useMemo(() => {
    const today = new Date().toDateString();
    return completedTrips
      .filter(t => t.created_at && new Date(t.created_at).toDateString() === today)
      .reduce((sum, t) => sum + (t.fare_amount || 0), 0);
  }, [completedTrips]);

  // ─── Auth Check & Driver Clearance Verification ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: any }) => {
      const session = data?.session;
      if (!session) {
        router.push("/login");
        return;
      }

      const uid = session.user.id;
      setIsAuthChecking(false);

      (supabase.from("profiles" as any) as any).select("*").eq("id", uid).maybeSingle().then(({ data }: { data: any }) => {
        if (data) {
          setProfile(data as Profile);
          setIsOnline(data.is_available || false);

          if (data.role !== "driver") {
            router.push("/terminal");
            return;
          }
        }
      });

      fetchDriverTrips(uid);
    });
  }, [router]);

  // ─── Realtime Dispatches Broadcast Subscription for Drivers ───
  useEffect(() => {
    const channel = supabase
      .channel("driver-trips-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const newTrip = payload.new as any;
            if (newTrip.status === "pending") {
              setPendingTrips((prev) => [newTrip, ...prev]);
              toast.info(`⚡ New Campus Dispatch Broadcast from ${newTrip.pickup_location}!`);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            if (updated.status !== "pending") {
              setPendingTrips((prev) => prev.filter((t) => t.id !== updated.id));
            }
            setMyTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as any;
            setPendingTrips((prev) => prev.filter((t) => t.id !== deleted.id));
            setMyTrips((prev) => prev.filter((t) => t.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDriverTrips = async (driverId: string) => {
    setLoading(true);
    try {
      // Pending dispatches available for broadcast acceptance
      const { data: pending } = await (supabase.from("trips" as any) as any)
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (pending) setPendingTrips(pending as Trip[]);

      // Driver's assigned trips
      const { data: assigned } = await (supabase.from("trips" as any) as any)
        .select("*")
        .eq("driver_id", driverId)
        .order("created_at", { ascending: false });

      if (assigned) setMyTrips(assigned as Trip[]);
    } catch (err) {
      console.error("Error fetching driver dispatches:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Driver Online Status
  const toggleOnline = async () => {
    if (!profile) return;
    const nextState = !isOnline;
    setIsOnline(nextState);

    await (supabase.from("profiles" as any) as any)
      .update({ is_available: nextState })
      .eq("id", profile.id);

    toast.success(`You are now ${nextState ? "ONLINE & receiving dispatch broadcasts" : "OFFLINE"}`);
  };

  // Accept Pending Trip Request
  const handleAcceptTrip = async (trip: Trip) => {
    if (!profile) return;
    try {
      const { error } = await (supabase.from("trips" as any) as any)
        .update({
          driver_id: profile.id,
          driver_name: profile.full_name || "Campus Driver",
          status: "accepted" as TripStatus,
        })
        .eq("id", trip.id);

      if (error) {
        toast.error(`Acceptance error: ${error.message}`);
      } else {
        toast.success(`Dispatch request #${trip.id} accepted! Proceed to pickup node.`);
        if (profile.id) fetchDriverTrips(profile.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to accept trip.");
    }
  };

  // Verify OTP Code & Start Transit
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    if (enteredOtp.trim() !== activeTrip.otp_code) {
      toast.error("Invalid verification OTP. Please request rider's 4-digit code.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const { error } = await (supabase.from("trips" as any) as any)
        .update({ status: "in_progress" as TripStatus })
        .eq("id", activeTrip.id);

      if (error) {
        toast.error(`Verification error: ${error.message}`);
      } else {
        toast.success("OTP Verified! Transit in progress to dropoff node.");
        setEnteredOtp("");
        if (profile) fetchDriverTrips(profile.id);
      }
    } catch (err: any) {
      toast.error(err.message || "OTP Verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Complete Trip
  const handleCompleteTrip = async () => {
    if (!activeTrip || !profile) return;

    try {
      const { error } = await (supabase.from("trips" as any) as any)
        .update({
          status: "completed" as TripStatus,
          payment_status: "paid",
        })
        .eq("id", activeTrip.id);

      if (error) {
        toast.error(`Completion error: ${error.message}`);
      } else {
        toast.success(`Trip completed! GHS ${activeTrip.fare_amount.toFixed(2)} added to daily earnings.`);
        fetchDriverTrips(profile.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to complete trip.");
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          <p className="text-xs font-medium text-text-muted">Loading Driver Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <WorkspaceHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">

        {/* 1. Driver Duty Header Banner */}
        <div className="bg-surface rounded-xl border border-border-mute p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">{profile?.full_name || "Campus Driver"}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                  {profile?.vehicle_type || "Shuttle Driver"}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">UMaT Logistics Network • ID: {profile?.license_plate || "UMAT-DRV-01"}</p>
            </div>
          </div>

          <button
            onClick={toggleOnline}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
              isOnline
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-background border border-border-mute text-text-muted hover:text-foreground"
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? "DRIVER ONLINE (ACCEPTING)" : "DRIVER OFFLINE"}</span>
          </button>
        </div>

        {/* 2. Driver SaaS Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column (lg:col-span-8): Active & Available Dispatches */}
          <div className="lg:col-span-8 space-y-6">

            {/* Active Ride Verification Card */}
            {activeTrip && (
              <div className="bg-surface rounded-xl border-2 border-emerald-500/50 p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-border-mute pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Active Assigned Dispatch (#{activeTrip.id})
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Status: {activeTrip.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-background rounded-lg border border-border-mute">
                    <span className="text-[10px] font-semibold text-text-muted uppercase block">Pickup Node</span>
                    <strong className="text-foreground text-sm font-semibold">{activeTrip.pickup_location}</strong>
                  </div>
                  <div className="p-3 bg-background rounded-lg border border-border-mute">
                    <span className="text-[10px] font-semibold text-text-muted uppercase block">Dropoff Node</span>
                    <strong className="text-foreground text-sm font-semibold">{activeTrip.dropoff_location}</strong>
                  </div>
                </div>

                {/* OTP Verification Input Form */}
                {activeTrip.status === "accepted" && (
                  <form onSubmit={handleVerifyOtp} className="p-4 rounded-xl bg-background border border-border-mute space-y-3">
                    <label className="text-xs font-bold text-foreground block">
                      Enter Student Commuter Verification OTP:
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="4-Digit OTP"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        className="flex-1 text-center font-mono text-lg tracking-widest p-2.5 bg-surface border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500 font-bold"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isVerifyingOtp}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify OTP & Start Transit"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Complete Trip Action */}
                {activeTrip.status === "in_progress" && (
                  <button
                    onClick={handleCompleteTrip}
                    className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Complete Dispatch (Collect GHS {activeTrip.fare_amount.toFixed(2)})</span>
                  </button>
                )}
              </div>
            )}

            {/* Broadcast Available Requests */}
            <div className="bg-surface rounded-xl border border-border-mute p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border-mute pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-500" />
                  Available Campus Broadcast Requests ({pendingTrips.length})
                </h2>
              </div>

              {!isOnline ? (
                <div className="p-8 text-center border border-dashed border-border-mute rounded-xl space-y-2">
                  <Power className="w-8 h-8 text-text-muted mx-auto" />
                  <p className="text-xs font-semibold text-text-muted">You are currently offline.</p>
                  <p className="text-[11px] text-text-muted">Toggle your status to ONLINE above to receive dispatch broadcasts.</p>
                </div>
              ) : pendingTrips.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border-mute rounded-xl text-xs text-text-muted">
                  No active student dispatch requests waiting in broadcast queue.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTrips.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl bg-background border border-border-mute flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">{t.id}</span>
                          <span className="capitalize text-text-muted">• {t.service_type}</span>
                          <span className="text-text-muted">• {t.vehicle_type}</span>
                        </div>
                        <p className="text-text-muted mt-1">
                          Pickup: <strong className="text-foreground">{t.pickup_location}</strong> → Dropoff: <strong className="text-foreground">{t.dropoff_location}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          GHS {t.fare_amount?.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleAcceptTrip(t)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          Accept Broadcast
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (lg:col-span-4): Driver Telemetry & Earnings */}
          <div className="lg:col-span-4 space-y-6">

            {/* Daily Earnings Card */}
            <div className="bg-surface rounded-xl border border-border-mute p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border-mute pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Today's Driver Earnings
                </h3>
              </div>

              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">Total Net Revenue Today</p>
                <p className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  GHS {todayEarnings.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2 text-xs pt-2">
                <div className="flex justify-between text-text-muted"><span>Completed Trips Today:</span><strong className="text-foreground font-mono">{completedTrips.length}</strong></div>
                <div className="flex justify-between text-text-muted"><span>Payout Gateway:</span><strong className="text-foreground font-mono">MTN Mobile Money</strong></div>
              </div>
            </div>

          </div>

        </div>

      </main>

      <footer className="py-6 border-t border-border-mute bg-background/50 text-center text-xs text-text-muted">
        © 2026 Yɛnkɔ Campus Logistics. All rights reserved.
      </footer>
    </div>
  );
}
