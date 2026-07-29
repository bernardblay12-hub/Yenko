"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import {
  Car,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  Zap,
  Loader2,
  Power,
  PowerOff,
  DollarSign,
  Navigation,
  ShieldCheck,
  Phone,
  Route,
  Receipt,
  FileText,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Compass
} from "lucide-react";
import {
  supabase,
  type Profile,
  type Trip,
  type TripStatus,
} from "@/lib/supabase";
import { formatDistance } from "@/lib/geo";
import { toast } from "sonner";

// Dynamically import Leaflet map (no SSR)
const CampusMap = dynamic(() => import("@/components/CampusMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl bg-surface border border-border-mute flex items-center justify-center" style={{ height: "280px" }}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
        <span className="text-xs font-medium text-text-muted">Loading Navigation Engine...</span>
      </div>
    </div>
  ),
});

export default function DriverDashboardPage() {
  const router = useRouter();

  // ─── Auth & Profile State ───
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // ─── Shift & Tab State ───
  const [isOnline, setIsOnline] = useState(false);
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
      .filter(t => t.completed_at && new Date(t.completed_at).toDateString() === today)
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
            router.push("/workspace");
            return;
          }
        }
      });

      // Load driver's own trips
      (supabase.from("trips" as any) as any).select("*").eq("driver_id", uid).order("created_at", { ascending: false }).then(({ data }: { data: any }) => {
        if (data) setMyTrips(data as Trip[]);
      });
    });
  }, [router]);

  // ─── Realtime Listener for Incoming Student Dispatches ───
  useEffect(() => {
    if (!isOnline || !profile) return;

    const fetchPending = async () => {
      const { data } = await (supabase.from("trips" as any) as any)
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (data) setPendingTrips(data as Trip[]);
    };

    fetchPending();

    const channel = supabase
      .channel("driver-incoming")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const trip = payload.new as Trip;
            if (trip.status === "pending") {
              setPendingTrips(prev => [trip, ...prev]);
              toast.info(`New ${trip.service_type} request: ${trip.pickup_location} to ${trip.dropoff_location}`);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Trip;
            if (updated.status !== "pending") {
              setPendingTrips(prev => prev.filter(t => t.id !== updated.id));
            }
            setMyTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOnline, profile]);

  // ─── Shift Availability Toggle ───
  const toggleOnline = async () => {
    if (!profile) return;

    const newStatus = !isOnline;
    setIsOnline(newStatus);

    await (supabase.from("profiles" as any) as any).update({
      is_available: newStatus,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);

    toast.success(newStatus ? "Shift status set to ONLINE. Receiving incoming requests." : "Shift status set to OFFLINE.");
  };

  // ─── Accept Ride Dispatch ───
  const acceptTrip = async (trip: Trip) => {
    if (!profile || activeTrip) {
      toast.error("Complete your active dispatch before accepting a new request.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase.from("trips" as any) as any).update({
        status: "accepted" as TripStatus,
        driver_id: profile.id,
        driver_name: `${profile.full_name || "Campus Driver"} (${profile.vehicle_type || "Driver"})`,
        accepted_at: new Date().toISOString(),
      }).eq("id", trip.id);

      if (error) {
        toast.error(`Failed to accept dispatch: ${error.message}`);
      } else {
        toast.success(`Accepted dispatch to ${trip.dropoff_location}. Navigate to pickup node.`);
        setPendingTrips(prev => prev.filter(t => t.id !== trip.id));
        setMyTrips(prev => [{ ...trip, status: "accepted", driver_id: profile.id, driver_name: profile.full_name } as Trip, ...prev]);
        setSidebarTab("active");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Start Trip (OTP Verified) ───
  const startTrip = async (tripId: string) => {
    const { error } = await (supabase.from("trips" as any) as any).update({
      status: "in_progress" as TripStatus,
    }).eq("id", tripId);

    if (error) toast.error(error.message);
    else {
      toast.success("Dispatch started. Proceeding to dropoff location.");
      setMyTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: "in_progress" as TripStatus } : t));
    }
  };

  // ─── Complete Trip ───
  const completeTrip = async (tripId: string) => {
    const { error } = await (supabase.from("trips" as any) as any).update({
      status: "completed" as TripStatus,
      completed_at: new Date().toISOString(),
    }).eq("id", tripId);

    if (error) toast.error(error.message);
    else {
      toast.success("Dispatch completed successfully. Earnings credited.");
      setMyTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: "completed" as TripStatus, completed_at: new Date().toISOString() } : t));
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          <p className="text-xs font-medium text-text-muted">Loading Driver Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <WorkspaceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* ─── Driver Dashboard Header & Shift Controls ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-border-mute">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`} />
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Driver Dispatch Console
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              {profile?.full_name || "Campus Driver"} • {profile?.vehicle_type || "Vehicle Fleet"} • {isOnline ? "Online & Receiving Dispatches" : "Offline"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border-mute text-xs font-mono font-bold">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">GHS {todayEarnings.toFixed(2)}</span>
              <span className="text-text-muted font-normal">• Today</span>
            </div>

            <button
              onClick={toggleOnline}
              className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                isOnline
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border-red-500/50 text-red-500"
              }`}
            >
              {isOnline ? <Power className="h-3.5 w-3.5 text-emerald-500" /> : <PowerOff className="h-3.5 w-3.5" />}
              {isOnline ? "Shift Online" : "Go Online"}
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ═══ ASYMMETRIC SAAS GRID (8 COLS DISPATCH FEED / 4 COLS SIDEBAR) ═══ */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN (lg:col-span-8) — INCOMING DISPATCH FEED & QUEUE */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">

            <div className="bg-surface rounded-xl border border-border-mute p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border-mute pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Incoming Dispatch Queue
                  </h2>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {pendingTrips.length} Request{pendingTrips.length === 1 ? "" : "s"}
                </span>
              </div>

              {!isOnline ? (
                <div className="py-12 text-center border border-dashed border-border-mute rounded-xl">
                  <PowerOff className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                  <p className="text-xs text-text-muted font-bold uppercase">Shift Status: Offline</p>
                  <p className="text-[11px] text-text-muted mt-1">Go online to start receiving live UMaT campus requests.</p>
                  <button
                    onClick={toggleOnline}
                    className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
                  >
                    Go Online Now
                  </button>
                </div>
              ) : pendingTrips.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-border-mute rounded-xl">
                  <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-pulse" />
                  <p className="text-xs text-text-muted font-bold">Scanning for campus dispatches...</p>
                  <p className="text-[11px] text-text-muted mt-1">New student requests will populate here automatically.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTrips.map(trip => (
                    <div key={trip.id} className="p-4 rounded-xl bg-background border border-amber-500/30 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">{trip.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              trip.service_type === "ride"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            }`}>
                              {trip.service_type === "ride" ? "Passenger Ride" : "Package Delivery"}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{trip.pickup_location} → {trip.dropoff_location}</p>
                          {trip.package_details && (
                            <p className="text-xs text-text-muted mt-1 font-mono">Package: {trip.package_details}</p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                            GHS {trip.fare_amount?.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-text-muted font-mono">
                            {trip.distance_km ? formatDistance(trip.distance_km) : "~1km"} • {trip.vehicle_type}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => acceptTrip(trip)}
                        disabled={loading || !!activeTrip}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <span>Accept Dispatch Request</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN (lg:col-span-4) — STICKY NAVIGATION & TELEMETRY */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">

            {/* 1. Active Navigation Card */}
            <div className="bg-surface rounded-xl border border-border-mute p-5 shadow-xs space-y-4 sticky top-20">
              
              <div className="flex border-b border-border-mute pb-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSidebarTab("active")}
                  className={`text-xs font-bold transition-colors border-b-2 pb-1 cursor-pointer flex items-center gap-1.5 ${
                    sidebarTab === "active"
                      ? "border-amber-500 text-amber-600 dark:text-amber-400"
                      : "border-transparent text-text-muted hover:text-foreground"
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Active Dispatch ({activeTrip ? 1 : 0})
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("earnings")}
                  className={`text-xs font-bold transition-colors border-b-2 pb-1 cursor-pointer flex items-center gap-1.5 ${
                    sidebarTab === "earnings"
                      ? "border-amber-500 text-amber-600 dark:text-amber-400"
                      : "border-transparent text-text-muted hover:text-foreground"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Analytics ({completedTrips.length})
                </button>
              </div>

              {/* Tab 1: Active Navigation & OTP Verification */}
              {sidebarTab === "active" && (
                <div>
                  {!activeTrip ? (
                    <div className="py-8 text-center text-xs text-text-muted">
                      No active dispatch. Accept a request from the queue.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Leaflet Navigation Map */}
                      <CampusMap
                        pickup={activeTrip.pickup_lat && activeTrip.pickup_lng ? { id: "p", name: activeTrip.pickup_location, category: "", description: "", lat: activeTrip.pickup_lat, lng: activeTrip.pickup_lng } : null}
                        dropoff={activeTrip.dropoff_lat && activeTrip.dropoff_lng ? { id: "d", name: activeTrip.dropoff_location, category: "", description: "", lat: activeTrip.dropoff_lat, lng: activeTrip.dropoff_lng } : null}
                        height="240px"
                      />

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between font-mono"><span className="text-text-muted">Dispatch ID:</span><span className="font-bold">{activeTrip.id}</span></div>
                        <div className="flex justify-between font-mono"><span className="text-text-muted">Status:</span><span className="font-bold text-amber-500 uppercase">{activeTrip.status.replace("_", " ")}</span></div>
                        <div className="flex justify-between"><span className="text-text-muted">Pickup Node:</span><span className="font-semibold truncate max-w-[130px]">{activeTrip.pickup_location}</span></div>
                        <div className="flex justify-between"><span className="text-text-muted">Dropoff Node:</span><span className="font-semibold truncate max-w-[130px]">{activeTrip.dropoff_location}</span></div>
                      </div>

                      {/* Security OTP Verification Box */}
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <ShieldCheck className="h-3.5 w-3.5" /> Rider OTP Security Verification
                        </div>
                        <p className="text-2xl font-black font-mono text-foreground tracking-[0.3em]">
                          {activeTrip.otp_code || "—"}
                        </p>
                        <p className="text-[10px] text-text-muted">Ask rider for this code before starting trip.</p>
                      </div>

                      {/* Action Progression */}
                      {activeTrip.status === "accepted" && (
                        <button
                          onClick={() => startTrip(activeTrip.id)}
                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                        >
                          <Navigation className="h-4 w-4" /> Start Dispatch (OTP Verified)
                        </button>
                      )}

                      {activeTrip.status === "in_progress" && (
                        <button
                          onClick={() => completeTrip(activeTrip.id)}
                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Complete Dispatch
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Analytics & Shift Revenue */}
              {sidebarTab === "earnings" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-background border border-border-mute space-y-1">
                    <span className="text-text-muted text-[10px] font-semibold uppercase">Today's Revenue</span>
                    <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">GHS {todayEarnings.toFixed(2)}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-background border border-border-mute space-y-1">
                    <span className="text-text-muted text-[10px] font-semibold uppercase">Completed Trips</span>
                    <p className="text-xl font-black font-mono text-foreground">{completedTrips.length}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-background border border-border-mute space-y-1">
                    <span className="text-text-muted text-[10px] font-semibold uppercase">All-Time Earnings</span>
                    <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      GHS {completedTrips.reduce((sum, t) => sum + (t.fare_amount || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      <footer className="py-6 border-t border-border-mute bg-background/50 text-center text-xs text-text-muted">
        © 2026 Yɛnkɔ Driver Console. All rights reserved.
      </footer>
    </div>
  );
}
