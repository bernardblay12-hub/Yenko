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
  CreditCard,
  Zap,
  Bike,
  Bus,
  AlertCircle,
  Plus,
  Loader2,
  Route,
  Terminal,
  ShieldCheck,
  Building2,
  GraduationCap,
  ArrowRight,
  Receipt,
  FileText
} from "lucide-react";
import {
  supabase,
  UMAT_CAMPUS_HOTSPOTS,
  type Profile,
  type Trip,
  type CampusLocation,
  type TripStatus,
} from "@/lib/supabase";
import {
  haversineDistance,
  calculateFare,
  generateOTP,
  generateTripId,
  formatDistance,
  estimateTime,
} from "@/lib/geo";
import { MtnMoMoLogo, TelecelLogo } from "@/components/BrandIcons";
import { toast } from "sonner";

// Dynamically import Leaflet map (no SSR)
const CampusMap = dynamic(() => import("@/components/CampusMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-2xl bg-surface border border-border-mute flex items-center justify-center" style={{ height: "340px" }}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">Loading UMaT Map Engine...</span>
      </div>
    </div>
  ),
});

// Dynamically import TripTracker
const TripTracker = dynamic(() => import("@/components/TripTracker"), { ssr: false });

export default function WorkspacePage() {
  const router = useRouter();

  // ─── Auth & Profile State ───
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // ─── Tab Navigation ───
  const [activeTab, setActiveTab] = useState<"book" | "active" | "history">("book");

  // ─── Booking Form State ───
  const [serviceType, setServiceType] = useState<"ride" | "delivery">("ride");
  const [pickupLocation, setPickupLocation] = useState<CampusLocation | null>(UMAT_CAMPUS_HOTSPOTS[0]);
  const [dropoffLocation, setDropoffLocation] = useState<CampusLocation | null>(UMAT_CAMPUS_HOTSPOTS[1]);
  const [mapSelectionMode, setMapSelectionMode] = useState<"pickup" | "dropoff">("pickup");
  const [packageDetails, setPackageDetails] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [vehicleType, setVehicleType] = useState<"Taxi / Car" | "Bus / Shuttle" | "Motorbike" | "E-Bicycle">("Taxi / Car");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "cash">("momo");

  // ─── Trips State ───
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [tripsLoading, setTripsLoading] = useState(true);

  // ─── Distance & Fare Calculations ───
  const distance = useMemo(() => {
    if (!pickupLocation || !dropoffLocation) return 0;
    return haversineDistance(pickupLocation.lat, pickupLocation.lng, dropoffLocation.lat, dropoffLocation.lng);
  }, [pickupLocation, dropoffLocation]);

  const fare = useMemo(() => calculateFare(distance, vehicleType, serviceType), [distance, vehicleType, serviceType]);
  const eta = useMemo(() => estimateTime(distance, vehicleType), [distance, vehicleType]);

  const activeTrips = useMemo(() => trips.filter(t => t.status !== "completed" && t.status !== "cancelled"), [trips]);
  const pastTrips = useMemo(() => trips.filter(t => t.status === "completed" || t.status === "cancelled"), [trips]);

  // ─── Auth Initialization & Profile Check ───
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
          setTimeout(async () => {
            const { data: { session: delayedSession } } = await supabase.auth.getSession();
            if (delayedSession && isMounted) {
              initUserSession(delayedSession);
            } else if (isMounted) {
              toast.error("Please sign in to access your terminal.");
              router.push("/login");
            }
          }, 1000);
          return;
        }

        if (isMounted) {
          toast.error("Please sign in to access your terminal.");
          router.push("/login");
        }
        return;
      }

      if (isMounted) {
        initUserSession(session);
      }
    };

    const initUserSession = (session: any) => {
      const uid = session.user.id;
      setUserId(uid);
      setIsAuthChecking(false);

      // Load profile from database
      (supabase.from("profiles" as any) as any).select("*").eq("id", uid).maybeSingle().then(({ data }: { data: any }) => {
        if (data && isMounted) {
          setUserProfile(data as Profile);
          if (data.role === "driver") {
            router.push("/workspace/driver");
            return;
          }
        }
      });

      fetchTrips(uid);
    };

    checkAuth();

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      if (session && isMounted) {
        initUserSession(session);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  // ─── Supabase Realtime Subscription ───
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("trips-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const newTrip = payload.new as Trip;
            if (newTrip.rider_id === userId) {
              setTrips((prev) => [newTrip, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Trip;
            setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

            if (updated.rider_id === userId) {
              if (updated.status === "accepted") {
                toast.success(`Driver ${updated.driver_name || "Assigned"} accepted your request. Verification OTP: ${updated.otp_code}`);
              } else if (updated.status === "in_progress") {
                toast.success("Your dispatch is now in progress.");
              } else if (updated.status === "completed") {
                toast.success(`Dispatch completed. Total fare: GHS ${updated.fare_amount?.toFixed(2)}`);
              }
            }
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as Trip;
            setTrips((prev) => prev.filter((t) => t.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchTrips = async (uid: string) => {
    setTripsLoading(true);
    try {
      const { data, error } = await (supabase.from("trips" as any) as any)
        .select("*")
        .eq("rider_id", uid)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching trips:", error);
      } else if (data) {
        setTrips(data as Trip[]);
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setTripsLoading(false);
    }
  };

  // ─── Map Node Selection Helper ───
  const handleMapLocationSelect = useCallback((location: CampusLocation, type: "pickup" | "dropoff") => {
    if (type === "pickup") {
      setPickupLocation(location);
      setMapSelectionMode("dropoff");
      toast.success(`Pickup set to ${location.name}`);
    } else {
      setDropoffLocation(location);
      toast.success(`Dropoff set to ${location.name}`);
    }
  }, []);

  // ─── Create Trip Request ───
  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupLocation || !dropoffLocation) {
      toast.error("Please specify pickup and dropoff nodes.");
      return;
    }
    if (pickupLocation.id === dropoffLocation.id) {
      toast.error("Pickup and dropoff nodes must be different locations.");
      return;
    }
    if (serviceType === "delivery" && !packageDetails) {
      toast.error("Please specify package description.");
      return;
    }

    setLoading(true);
    const tripId = generateTripId();
    const otp = generateOTP();

    const newTrip: Partial<Trip> = {
      id: tripId,
      rider_id: userId!,
      service_type: serviceType,
      status: "pending" as TripStatus,
      pickup_location: pickupLocation.name,
      pickup_lat: pickupLocation.lat,
      pickup_lng: pickupLocation.lng,
      dropoff_location: dropoffLocation.name,
      dropoff_lat: dropoffLocation.lat,
      dropoff_lng: dropoffLocation.lng,
      package_details: serviceType === "delivery" ? packageDetails : null,
      recipient_phone: recipientPhone || null,
      vehicle_type: vehicleType,
      fare_amount: fare,
      distance_km: Math.round(distance * 100) / 100,
      payment_method: paymentMethod,
      payment_status: paymentMethod === "cash" ? "cash_on_delivery" : "pending",
      otp_code: otp,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await (supabase.from("trips" as any) as any).insert(newTrip);
      if (error) {
        toast.error(`Dispatch request failed: ${error.message}`);
      } else {
        toast.success(`Dispatch request initiated. Searching active campus drivers...`);
        setPackageDetails("");
        setRecipientPhone("");
        setActiveTab("active");
        if (userId) fetchTrips(userId);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create dispatch request.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Cancel Trip Request ───
  const handleCancelTrip = async (tripId: string) => {
    try {
      const { error } = await (supabase.from("trips" as any) as any)
        .update({ status: "cancelled" as TripStatus })
        .eq("id", tripId);

      if (error) {
        toast.error(`Cancellation error: ${error.message}`);
      } else {
        toast.success("Dispatch request cancelled.");
        setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: "cancelled" as TripStatus } : t)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          <p className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Loading Student Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <WorkspaceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* ─── Terminal Top Header ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-mute pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-sans flex items-center gap-2">
                Student Dispatch Terminal
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1 font-sans">
              On-demand UMaT Tarkwa campus transit & instant room delivery routing.
            </p>
          </div>

          {/* Quick Account Info Badge */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-surface border border-border-mute flex items-center gap-2 text-xs font-mono">
              <GraduationCap className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-foreground">{userProfile?.full_name || "UMaT Student"}</span>
              <span className="text-text-muted">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">{userProfile?.student_id_number || "70012345"}</span>
            </div>
          </div>
        </div>

        {/* ─── Tab Navigation ─── */}
        <div className="flex border-b border-border-mute gap-6 mb-8">
          {[
            { key: "book" as const, label: "Book & Dispatch", icon: Plus, count: null },
            { key: "active" as const, label: "Active Dispatches", icon: Clock, count: activeTrips.length },
            { key: "history" as const, label: "Trip History", icon: CheckCircle2, count: pastTrips.length },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-xs font-mono uppercase font-bold tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label} {tab.count !== null ? `(${tab.count})` : ""}
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* ═══ TAB 1: BOOKING & DISPATCH ROUTING ═══ */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === "book" && (
          <div className="space-y-6">
            
            {/* ─── Interactive Map Module ─── */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  <h2 className="text-xs font-mono uppercase font-bold text-foreground tracking-wider">
                    Interactive Campus Map Engine
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMapSelectionMode("pickup")}
                    className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full cursor-pointer transition-all ${
                      mapSelectionMode === "pickup"
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "bg-surface border border-border-mute text-text-muted hover:text-foreground"
                    }`}
                  >
                    Select Pickup Node
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapSelectionMode("dropoff")}
                    className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full cursor-pointer transition-all ${
                      mapSelectionMode === "dropoff"
                        ? "bg-red-500 text-white shadow-xs"
                        : "bg-surface border border-border-mute text-text-muted hover:text-foreground"
                    }`}
                  >
                    Select Dropoff Node
                  </button>
                </div>
              </div>

              <CampusMap
                pickup={pickupLocation}
                dropoff={dropoffLocation}
                onSelectLocation={handleMapLocationSelect}
                selectionMode={mapSelectionMode}
                height="340px"
              />

              {/* Quick-Tap Hotspot Pills */}
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[9px] font-mono font-bold text-text-muted uppercase shrink-0">Hotspot Shortcuts:</span>
                {UMAT_CAMPUS_HOTSPOTS.map((spot) => {
                  const isPickup = pickupLocation?.id === spot.id;
                  const isDropoff = dropoffLocation?.id === spot.id;
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => {
                        if (mapSelectionMode === "pickup") {
                          setPickupLocation(spot);
                          setMapSelectionMode("dropoff");
                          toast.success(`Pickup: ${spot.name}`);
                        } else {
                          setDropoffLocation(spot);
                          toast.success(`Dropoff: ${spot.name}`);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
                        isPickup
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                          : isDropoff
                          ? "bg-red-500/10 border-red-500 text-red-500 font-bold"
                          : "bg-surface border-border-mute text-text-muted hover:border-zinc-400 hover:text-foreground"
                      }`}
                    >
                      <Building2 className="w-3 h-3" />
                      {spot.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Form & Calculation Controls ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5 bg-surface p-6 rounded-2xl border border-border-mute">

                {/* Service Selector */}
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-text-muted block mb-2">Select Service Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceType("ride")}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        serviceType === "ride"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "border-border-mute bg-background text-text-muted hover:border-zinc-400"
                      }`}
                    >
                      <Car className="h-5 w-5 stroke-[2]" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground">Passenger Ride</p>
                        <p className="text-[10px] text-text-muted">Direct transport across campus & Tarkwa town</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceType("delivery")}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        serviceType === "delivery"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "border-border-mute bg-background text-text-muted hover:border-zinc-400"
                      }`}
                    >
                      <Package className="h-5 w-5 stroke-[2]" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground">Package Delivery</p>
                        <p className="text-[10px] text-text-muted">Food, books, laundry delivered to room</p>
                      </div>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleCreateTrip} className="space-y-4">
                  {/* Location Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Pickup Location Node</label>
                      <select
                        value={pickupLocation?.id || ""}
                        onChange={(e) => {
                          const loc = UMAT_CAMPUS_HOTSPOTS.find(s => s.id === e.target.value);
                          if (loc) setPickupLocation(loc);
                        }}
                        className="w-full text-xs p-3 bg-background border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500"
                      >
                        {UMAT_CAMPUS_HOTSPOTS.map((spot) => (
                          <option key={spot.id} value={spot.id}>
                            {spot.name} ({spot.description})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Dropoff Location Node</label>
                      <select
                        value={dropoffLocation?.id || ""}
                        onChange={(e) => {
                          const loc = UMAT_CAMPUS_HOTSPOTS.find(s => s.id === e.target.value);
                          if (loc) setDropoffLocation(loc);
                        }}
                        className="w-full text-xs p-3 bg-background border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500"
                      >
                        {UMAT_CAMPUS_HOTSPOTS.map((spot) => (
                          <option key={spot.id} value={spot.id}>
                            {spot.name} ({spot.description})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calculated Route Info Indicator */}
                  {pickupLocation && dropoffLocation && pickupLocation.id !== dropoffLocation.id && (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                        <Route className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>Distance: {formatDistance(distance)}</span>
                        <span>•</span>
                        <span>Est. Travel: ~{eta} min</span>
                      </div>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        GHS {fare.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Transport Vehicle Fleet Selection */}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Vehicle Fleet Option</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {([
                        { type: "Taxi / Car" as const, icon: Car },
                        { type: "Bus / Shuttle" as const, icon: Bus },
                        { type: "Motorbike" as const, icon: Zap },
                        { type: "E-Bicycle" as const, icon: Bike },
                      ]).map((v) => {
                        const Icon = v.icon;
                        const selected = vehicleType === v.type;
                        const vFare = calculateFare(distance, v.type, serviceType);
                        return (
                          <button
                            key={v.type}
                            type="button"
                            onClick={() => setVehicleType(v.type)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              selected
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                                : "border-border-mute bg-background text-text-muted hover:border-zinc-400"
                            }`}
                          >
                            <Icon className="h-4 w-4 mx-auto mb-1 stroke-[2]" />
                            <p className="text-[11px] font-bold truncate">{v.type}</p>
                            <p className="text-[9px] text-text-muted font-mono">GHS {vFare.toFixed(2)}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Parcel Details */}
                  {serviceType === "delivery" && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Package Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Canteen food pack and water bottle"
                          value={packageDetails}
                          onChange={(e) => setPackageDetails(e.target.value)}
                          className="w-full text-xs p-3 bg-background border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Recipient Contact Phone (Optional)</label>
                        <input
                          type="tel"
                          placeholder="+233 24 000 0000"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="w-full text-xs p-3 bg-background border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div className="pt-2">
                    <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Payment Channel</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("momo")}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ${
                          paymentMethod === "momo"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-border-mute bg-background text-text-muted"
                        }`}
                      >
                        <MtnMoMoLogo className="h-4 w-4" /> MTN MoMo / Telecel
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cash")}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ${
                          paymentMethod === "cash"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-border-mute bg-background text-text-muted"
                        }`}
                      >
                        <CreditCard className="h-4 w-4" /> Cash on Delivery
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Initiating Dispatch...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Dispatch Request</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* ─── Fare Summary Sidebar Card ─── */}
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-surface border border-border-mute space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-mute pb-2 flex items-center justify-between">
                    <span>Fare Breakdown</span>
                    <Receipt className="w-3.5 h-3.5" />
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between"><span className="text-text-muted">Service Type:</span><span className="font-bold capitalize">{serviceType}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Vehicle Tier:</span><span className="font-bold">{vehicleType}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Campus Distance:</span><span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatDistance(distance)}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Est. Duration:</span><span className="font-mono font-bold">~{eta} min</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Pickup Node:</span><span className="font-bold truncate max-w-[130px]">{pickupLocation?.name || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Dropoff Node:</span><span className="font-bold truncate max-w-[130px]">{dropoffLocation?.name || "—"}</span></div>
                  </div>

                  <div className="border-t border-border-mute pt-3 flex justify-between items-baseline">
                    <span className="text-xs font-mono uppercase font-bold text-text-muted">Total Fare</span>
                    <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      GHS {fare.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Fare calculated automatically based on distance between selected UMaT campus nodes.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ═══ TAB 2: ACTIVE DISPATCH TRACKER ═══ */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {tripsLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-mono text-text-muted">Updating live dispatches...</p>
              </div>
            ) : activeTrips.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <Clock className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted font-bold">No active dispatch requests.</p>
                <button
                  onClick={() => setActiveTab("book")}
                  className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Create a new dispatch request →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTrips.map((trip) => (
                  <TripTracker key={trip.id} trip={trip} onCancel={handleCancelTrip} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ═══ TAB 3: DIGITAL TRIP HISTORY ═══ */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {tripsLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-mono text-text-muted">Loading dispatch history...</p>
              </div>
            ) : pastTrips.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <FileText className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">No completed dispatch history yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastTrips.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-surface border border-border-mute flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{t.id}</span>
                        <span className="capitalize text-text-muted">• {t.service_type}</span>
                        <span className="text-text-muted">• {t.vehicle_type}</span>
                      </div>
                      <p className="text-text-muted mt-1">
                        From <strong className="text-foreground">{t.pickup_location}</strong> to <strong className="text-foreground">{t.dropoff_location}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        GHS {t.fare_amount?.toFixed(2)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        t.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                      }`}>
                        {t.status}
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
        © 2026 Yɛnkɔ Student Terminal. All rights reserved.
      </footer>
    </div>
  );
}
