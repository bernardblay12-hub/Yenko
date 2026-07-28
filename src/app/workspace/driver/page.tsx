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
} from "lucide-react";
import {
  supabase,
  type Profile,
  type Trip,
  type TripStatus,
} from "@/lib/supabase";
import { formatDistance } from "@/lib/geo";
import { toast } from "sonner";

const CampusMap = dynamic(() => import("@/components/CampusMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-2xl bg-surface border border-border-mute flex items-center justify-center" style={{ height: "280px" }}>
      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
    </div>
  ),
});

export default function DriverDashboardPage() {
  const router = useRouter();

  // ─── Auth & Profile ───
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // ─── Driver State ───
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<"incoming" | "active" | "earnings">("incoming");

  // ─── Trips ───
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  // ─── Derived ───
  const activeTrip = useMemo(() => myTrips.find(t => t.status === "accepted" || t.status === "in_progress"), [myTrips]);
  const completedTrips = useMemo(() => myTrips.filter(t => t.status === "completed"), [myTrips]);
  const todayEarnings = useMemo(() => {
    const today = new Date().toDateString();
    return completedTrips
      .filter(t => t.completed_at && new Date(t.completed_at).toDateString() === today)
      .reduce((sum, t) => sum + (t.fare_amount || 0), 0);
  }, [completedTrips]);

  // ─── Auth Check & Profile Load ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: any }) => {
      const session = data?.session;
      if (!session) {
        router.push("/login");
        return;
      }

      const uid = session.user.id;
      setIsAuthChecking(false);

      supabase.from("profiles").select("*").eq("id", uid).maybeSingle().then(({ data }: { data: any }) => {
        if (data) {
          setProfile(data as Profile);
          setIsOnline(data.is_available || false);

          // Redirect non-drivers
          if (data.role !== "driver") {
            router.push("/workspace");
            return;
          }
        }
      });

      // Load driver's own trips
      supabase.from("trips").select("*").eq("driver_id", uid).order("created_at", { ascending: false }).then(({ data }: { data: any }) => {
        if (data) setMyTrips(data as Trip[]);
      });
    });
  }, [router]);

  // ─── Load Pending Trips (available for pickup) ───
  useEffect(() => {
    if (!isOnline || !profile) return;

    const fetchPending = async () => {
      const { data } = await supabase
        .from("trips")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (data) setPendingTrips(data as Trip[]);
    };

    fetchPending();

    // Realtime subscription for new ride requests
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
              toast.info(`New ${trip.service_type} request: ${trip.pickup_location} → ${trip.dropoff_location}`);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Trip;
            // Remove from pending if no longer pending
            if (updated.status !== "pending") {
              setPendingTrips(prev => prev.filter(t => t.id !== updated.id));
            }
            // Update my trips
            setMyTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOnline, profile]);

  // ─── Toggle Online Status ───
  const toggleOnline = async () => {
    if (!profile) return;

    const newStatus = !isOnline;
    setIsOnline(newStatus);

    await supabase.from("profiles").update({
      is_available: newStatus,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);

    toast.success(newStatus ? "You are now ONLINE. Incoming requests will appear." : "You are now OFFLINE.");
  };

  // ─── Accept Trip ───
  const acceptTrip = async (trip: Trip) => {
    if (!profile || activeTrip) {
      toast.error("Complete your current trip before accepting a new one.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("trips").update({
        status: "accepted" as TripStatus,
        driver_id: profile.id,
        driver_name: `${profile.full_name} (${profile.vehicle_type || "Driver"})`,
        accepted_at: new Date().toISOString(),
      }).eq("id", trip.id);

      if (error) {
        toast.error(`Failed to accept: ${error.message}`);
      } else {
        toast.success(`Accepted ride to ${trip.dropoff_location}!`);
        setPendingTrips(prev => prev.filter(t => t.id !== trip.id));
        setMyTrips(prev => [{ ...trip, status: "accepted", driver_id: profile.id, driver_name: profile.full_name } as Trip, ...prev]);
        setActiveTab("active");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Start Trip ───
  const startTrip = async (tripId: string) => {
    const { error } = await supabase.from("trips").update({
      status: "in_progress" as TripStatus,
    }).eq("id", tripId);

    if (error) toast.error(error.message);
    else {
      toast.success("Trip started! Drive safe. 🚗");
      setMyTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: "in_progress" as TripStatus } : t));
    }
  };

  // ─── Complete Trip ───
  const completeTrip = async (tripId: string) => {
    const { error } = await supabase.from("trips").update({
      status: "completed" as TripStatus,
      completed_at: new Date().toISOString(),
    }).eq("id", tripId);

    if (error) toast.error(error.message);
    else {
      toast.success("Trip completed! 🎉 Earnings updated.");
      setMyTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: "completed" as TripStatus, completed_at: new Date().toISOString() } : t));
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-xs font-mono font-bold text-text-muted">Loading Driver Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <WorkspaceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* ─── Driver Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-mute pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`} />
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Driver Dispatch
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              {profile?.full_name} • {profile?.vehicle_type || "Vehicle"} • {isOnline ? "Online & receiving requests" : "Offline"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Today's Earnings Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border-mute text-xs font-mono font-bold">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">GHS {todayEarnings.toFixed(2)}</span>
              <span className="text-text-muted">today</span>
            </div>

            {/* Online/Offline Toggle */}
            <button
              onClick={toggleOnline}
              className={`text-xs font-mono font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                isOnline
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border-red-500/50 text-red-500"
              }`}
            >
              {isOnline ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
              {isOnline ? "Online" : "Go Online"}
            </button>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex border-b border-border-mute gap-4 mb-8">
          {[
            { key: "incoming" as const, label: "Incoming Requests", icon: Zap, count: pendingTrips.length },
            { key: "active" as const, label: "My Active Trip", icon: Navigation, count: activeTrip ? 1 : 0 },
            { key: "earnings" as const, label: "Earnings", icon: DollarSign, count: completedTrips.length },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-xs font-mono uppercase font-bold tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.key ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-transparent text-text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* ═══ INCOMING REQUESTS ═══ */}
        {activeTab === "incoming" && (
          <div className="space-y-4">
            {!isOnline ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <PowerOff className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                <p className="text-xs text-text-muted font-bold">You are currently offline.</p>
                <p className="text-[10px] text-text-muted mt-1">Go online to start receiving ride requests.</p>
                <button onClick={toggleOnline} className="mt-4 px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700 transition-all">
                  Go Online
                </button>
              </div>
            ) : pendingTrips.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-pulse" />
                <p className="text-xs text-text-muted font-bold">Waiting for ride requests...</p>
                <p className="text-[10px] text-text-muted mt-1">New requests will appear here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTrips.map(trip => (
                  <div key={trip.id} className="p-5 rounded-2xl bg-surface border border-amber-500/30 space-y-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">{trip.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${trip.service_type === "ride" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-500"}`}>
                            {trip.service_type === "ride" ? "🚕 Ride" : "📦 Delivery"}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground">{trip.pickup_location} → {trip.dropoff_location}</p>
                        {trip.package_details && <p className="text-[11px] text-text-muted mt-1">📦 {trip.package_details}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">GHS {trip.fare_amount?.toFixed(2)}</p>
                        <p className="text-[10px] text-text-muted font-mono">{trip.distance_km ? formatDistance(trip.distance_km) : "~1km"} • {trip.vehicle_type}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => acceptTrip(trip)}
                      disabled={loading || !!activeTrip}
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Accept This Ride"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ ACTIVE TRIP ═══ */}
        {activeTab === "active" && (
          <div className="space-y-6">
            {!activeTrip ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <p className="text-xs text-text-muted">No active trip. Accept a ride from incoming requests.</p>
              </div>
            ) : (
              <>
                {/* Map */}
                <CampusMap
                  pickup={activeTrip.pickup_lat && activeTrip.pickup_lng ? { id: "p", name: activeTrip.pickup_location, category: "", description: "", lat: activeTrip.pickup_lat, lng: activeTrip.pickup_lng } : null}
                  dropoff={activeTrip.dropoff_lat && activeTrip.dropoff_lng ? { id: "d", name: activeTrip.dropoff_location, category: "", description: "", lat: activeTrip.dropoff_lat, lng: activeTrip.dropoff_lng } : null}
                  height="280px"
                />

                {/* Trip Details Card */}
                <div className="p-6 rounded-2xl bg-surface border border-border-mute space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">{activeTrip.id} • {activeTrip.status.replace("_", " ").toUpperCase()}</span>
                    <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">GHS {activeTrip.fare_amount?.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><p className="text-[10px] font-mono font-bold text-text-muted uppercase">Pickup</p><p className="font-bold text-foreground">{activeTrip.pickup_location}</p></div>
                    <div><p className="text-[10px] font-mono font-bold text-text-muted uppercase">Dropoff</p><p className="font-bold text-foreground">{activeTrip.dropoff_location}</p></div>
                  </div>

                  {/* OTP Verification */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Rider OTP Code</p>
                    <p className="text-3xl font-black font-mono text-foreground tracking-[0.3em]">{activeTrip.otp_code || "—"}</p>
                    <p className="text-[10px] text-text-muted mt-1">Ask the rider for this code before starting the trip</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {activeTrip.status === "accepted" && (
                      <button onClick={() => startTrip(activeTrip.id)}
                        className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <Navigation className="h-4 w-4" /> Start Trip (OTP Verified)
                      </button>
                    )}
                    {activeTrip.status === "in_progress" && (
                      <button onClick={() => completeTrip(activeTrip.id)}
                        className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Complete Trip
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ EARNINGS ═══ */}
        {activeTab === "earnings" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surface border border-border-mute text-center">
                <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Today</p>
                <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">GHS {todayEarnings.toFixed(2)}</p>
              </div>
              <div className="p-5 rounded-2xl bg-surface border border-border-mute text-center">
                <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Total Trips</p>
                <p className="text-2xl font-black font-mono text-foreground mt-1">{completedTrips.length}</p>
              </div>
              <div className="p-5 rounded-2xl bg-surface border border-border-mute text-center">
                <p className="text-[10px] font-mono font-bold text-text-muted uppercase">All-Time Earnings</p>
                <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  GHS {completedTrips.reduce((sum, t) => sum + (t.fare_amount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Trip History */}
            {completedTrips.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <p className="text-xs text-text-muted">No completed trips yet. Start accepting rides!</p>
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
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">GHS {t.fare_amount?.toFixed(2)}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-emerald-500/10 text-emerald-600">
                        completed
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
        © 2026 Yɛnkɔ Driver Portal. All rights reserved.
      </footer>
    </div>
  );
}
