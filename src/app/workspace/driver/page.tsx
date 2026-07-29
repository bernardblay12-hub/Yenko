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
  Terminal,
  Route,
  Receipt,
  FileText,
  AlertCircle,
  ArrowRight
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
    <div className="w-full rounded-2xl bg-surface border border-border-mute flex items-center justify-center" style={{ height: "280px" }}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
        <span className="text-[10px] font-mono text-text-muted uppercase">Loading Navigation Engine...</span>
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
  const [activeTab, setActiveTab] = useState<"incoming" | "active" | "earnings">("incoming");

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
        setActiveTab("active");
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
          <p className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Loading Driver Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <WorkspaceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* ─── Driver Terminal Top Header ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-mute pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`} />
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-sans flex items-center gap-2">
                Driver Dispatch Terminal
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1 font-sans">
              {profile?.full_name || "Campus Driver"} • {profile?.vehicle_type || "Vehicle Fleet"} • {isOnline ? "Online & Receiving Dispatches" : "Offline"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Shift Earnings Summary Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border-mute text-xs font-mono font-bold">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">GHS {todayEarnings.toFixed(2)}</span>
              <span className="text-text-muted font-normal">• Today</span>
            </div>

            {/* Shift Availability Power Switch */}
            <button
              onClick={toggleOnline}
              className={`text-xs font-mono font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
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

        {/* ─── Tab Navigation ─── */}
        <div className="flex border-b border-border-mute gap-6 mb-8">
          {[
            { key: "incoming" as const, label: "Dispatch Queue", icon: Zap, count: pendingTrips.length },
            { key: "active" as const, label: "Active Dispatch", icon: Navigation, count: activeTrip ? 1 : 0 },
            { key: "earnings" as const, label: "Earnings & Shifts", icon: DollarSign, count: completedTrips.length },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-xs font-mono uppercase font-bold tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                    : "border-transparent text-text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* ═══ TAB 1: INCOMING DISPATCH QUEUE ═══ */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === "incoming" && (
          <div className="space-y-4">
            {!isOnline ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <PowerOff className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                <p className="text-xs text-text-muted font-bold uppercase font-mono">Shift Status: Offline</p>
                <p className="text-[10px] text-text-muted mt-1">Switch your shift to online to receive live UMaT campus requests.</p>
                <button
                  onClick={toggleOnline}
                  className="mt-4 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  Go Online Now
                </button>
              </div>
            ) : pendingTrips.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-pulse" />
                <p className="text-xs text-text-muted font-bold">Scanning for campus dispatches...</p>
                <p className="text-[10px] text-text-muted mt-1">New requests across campus nodes will populate here automatically.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTrips.map(trip => (
                  <div key={trip.id} className="p-5 rounded-2xl bg-surface border border-amber-500/30 space-y-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">{trip.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono border ${
                            trip.service_type === "ride"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          }`}>
                            {trip.service_type === "ride" ? "Passenger Ride" : "Package Delivery"}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground">{trip.pickup_location} → {trip.dropoff_location}</p>
                        {trip.package_details && (
                          <p className="text-[11px] text-text-muted mt-1 font-mono">Package Details: {trip.package_details}</p>
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
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ═══ TAB 2: ACTIVE DISPATCH NAVIGATION ═══ */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === "active" && (
          <div className="space-y-6">
            {!activeTrip ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <Navigation className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">No active dispatch. Accept a request from the Dispatch Queue.</p>
              </div>
            ) : (
              <>
                {/* Navigation Map Engine */}
                <CampusMap
                  pickup={activeTrip.pickup_lat && activeTrip.pickup_lng ? { id: "p", name: activeTrip.pickup_location, category: "", description: "", lat: activeTrip.pickup_lat, lng: activeTrip.pickup_lng } : null}
                  dropoff={activeTrip.dropoff_lat && activeTrip.dropoff_lng ? { id: "d", name: activeTrip.dropoff_location, category: "", description: "", lat: activeTrip.dropoff_lat, lng: activeTrip.dropoff_lng } : null}
                  height="300px"
                />

                {/* Dispatch Control Details */}
                <div className="p-6 rounded-2xl bg-surface border border-border-mute space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
                      Dispatch #{activeTrip.id} • STATUS: {activeTrip.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      GHS {activeTrip.fare_amount?.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-b border-border-mute py-3">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Pickup Node</p>
                      <p className="font-bold text-foreground">{activeTrip.pickup_location}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Dropoff Node</p>
                      <p className="font-bold text-foreground">{activeTrip.dropoff_location}</p>
                    </div>
                  </div>

                  {/* Rider Security OTP Box */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mb-1">
                      <ShieldCheck className="h-4 w-4" /> Rider Verification Security OTP
                    </div>
                    <p className="text-3xl font-black font-mono text-foreground tracking-[0.3em] my-1">
                      {activeTrip.otp_code || "—"}
                    </p>
                    <p className="text-[10px] text-text-muted">Verify this code with the student before starting the trip.</p>
                  </div>

                  {/* Dispatch Progression Actions */}
                  <div className="flex gap-3 pt-2">
                    {activeTrip.status === "accepted" && (
                      <button
                        onClick={() => startTrip(activeTrip.id)}
                        className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Navigation className="h-4 w-4" /> Start Dispatch (OTP Verified)
                      </button>
                    )}

                    {activeTrip.status === "in_progress" && (
                      <button
                        onClick={() => completeTrip(activeTrip.id)}
                        className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Mark Dispatch Completed
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ═══ TAB 3: SHIFT EARNINGS & LOGS ═══ */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === "earnings" && (
          <div className="space-y-6">
            {/* Analytics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surface border border-border-mute text-center">
                <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Today's Revenue</p>
                <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">GHS {todayEarnings.toFixed(2)}</p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border-mute text-center">
                <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Total Dispatches</p>
                <p className="text-2xl font-black font-mono text-foreground mt-1">{completedTrips.length}</p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border-mute text-center">
                <p className="text-[10px] font-mono font-bold text-text-muted uppercase">All-Time Revenue</p>
                <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  GHS {completedTrips.reduce((sum, t) => sum + (t.fare_amount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Historical Log */}
            {completedTrips.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <FileText className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">No completed dispatches logged yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedTrips.map(t => (
                  <div key={t.id} className="p-4 rounded-xl bg-surface border border-border-mute flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{t.id}</span>
                        <span className="capitalize text-text-muted">• {t.service_type}</span>
                      </div>
                      <p className="text-text-muted mt-1">{t.pickup_location} → {t.dropoff_location}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        GHS {t.fare_amount?.toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-6 border-t border-border-mute bg-background/50 text-center text-xs text-text-muted font-mono">
        © 2026 Yɛnkɔ Driver Dispatch Terminal. All rights reserved.
      </footer>
    </div>
  );
}
