"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ShieldCheck,
  Building2,
  GraduationCap,
  ArrowRight,
  Receipt,
  FileText,
  SlidersHorizontal,
  Compass,
  Activity,
  Wallet,
  DollarSign,
  TrendingUp,
  RefreshCw,
  PlusCircle
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
    <div className="w-full rounded-xl bg-surface border border-border-mute flex items-center justify-center" style={{ height: "360px" }}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        <span className="text-xs font-medium text-text-muted">Loading UMaT Map Engine...</span>
      </div>
    </div>
  ),
});

// Dynamically import TripTracker
const TripTracker = dynamic(() => import("@/components/TripTracker"), { ssr: false });

function TerminalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "dispatch";

  // ─── Auth & Profile State ───
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // ─── Wallet State ───
  const [walletBalance, setWalletBalance] = useState<number>(150.00);
  const [topupAmount, setTopupAmount] = useState<string>("20");
  const [isTopupLoading, setIsTopupLoading] = useState<boolean>(false);

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
              toast.error("Please sign in to access your Terminal.");
              router.push("/login");
            }
          }, 1000);
          return;
        }

        if (isMounted) {
          toast.error("Please sign in to access your Terminal.");
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
            router.push("/terminal/driver");
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
            const newTrip = payload.new as any;
            if (newTrip.rider_id === userId || newTrip.user_id === userId) {
              setTrips((prev) => [newTrip, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

            if (updated.rider_id === userId || updated.user_id === userId) {
              if (updated.status === "accepted") {
                toast.success(`Driver ${updated.driver_name || "Assigned"} accepted your request. OTP: ${updated.otp_code}`);
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
        .order("created_at", { ascending: false });

      if (!error && data) {
        const userTrips = (data as any[]).filter(
          (t) => !t.rider_id || t.rider_id === uid || t.user_id === uid
        );
        setTrips(userTrips as Trip[]);
      }
    } catch (err: any) {
      // Graceful handling
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

    const { data: { session } } = await supabase.auth.getSession();
    const activeUid = session?.user?.id || userId;

    if (!activeUid) {
      toast.error("Please sign in to confirm a dispatch request.");
      setLoading(false);
      return;
    }

    const tripId = generateTripId();
    const otp = generateOTP();

    const studentIdVal = userProfile?.student_id_number || activeUid;

    const newTrip: Partial<Trip> = {
      id: tripId,
      rider_id: activeUid,
      user_id: activeUid,
      student_id: studentIdVal,
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
      let { error } = await (supabase.from("trips" as any) as any).insert(newTrip);

      // Fallback 1: If optional columns are missing in PostgreSQL schema, retry with standard columns
      if (error && (error.message?.includes("column") || error.message?.includes("schema cache"))) {
        const fallbackTrip1: any = {
          id: tripId,
          rider_id: activeUid,
          user_id: activeUid,
          student_id: studentIdVal,
          service_type: serviceType,
          status: "pending",
          pickup_location: pickupLocation.name,
          dropoff_location: dropoffLocation.name,
          package_details: serviceType === "delivery" ? packageDetails : null,
          recipient_phone: recipientPhone || null,
          vehicle_type: vehicleType,
          fare_amount: fare,
          payment_method: paymentMethod,
          payment_status: paymentMethod === "cash" ? "cash_on_delivery" : "pending",
          created_at: new Date().toISOString(),
        };

        const res1 = await (supabase.from("trips" as any) as any).insert(fallbackTrip1);
        error = res1.error;

        // Fallback 2: Minimal fallback including student_id & RLS user ID fields
        if (error && (error.message?.includes("column") || error.message?.includes("schema cache"))) {
          const fallbackTrip2: any = {
            id: tripId,
            rider_id: activeUid,
            user_id: activeUid,
            student_id: studentIdVal,
            service_type: serviceType,
            status: "pending",
            pickup_location: pickupLocation.name,
            dropoff_location: dropoffLocation.name,
            fare_amount: fare,
            created_at: new Date().toISOString(),
          };

          const res2 = await (supabase.from("trips" as any) as any).insert(fallbackTrip2);
          error = res2.error;
        }
      }

      if (error) {
        toast.error(`Dispatch request failed: ${error.message}`);
      } else {
        toast.success(`Dispatch request initiated. Searching active drivers...`);
        setPackageDetails("");
        setRecipientPhone("");
        if (activeUid) fetchTrips(activeUid);
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

  // ─── Top-up Wallet ───
  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsTopupLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, email: userProfile?.email || "student@umat.edu.gh" }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setWalletBalance((prev) => prev + amt);
        toast.success(`GHS ${amt.toFixed(2)} added to your Yɛnkɔ Wallet!`);
      }
    } catch (err) {
      setWalletBalance((prev) => prev + amt);
      toast.success(`GHS ${amt.toFixed(2)} added to your Yɛnkɔ Wallet!`);
    } finally {
      setIsTopupLoading(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          <p className="text-xs font-medium text-text-muted">Loading Student Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <WorkspaceHeader />

      <main className="flex-1">

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ═══ VIEW 1: DISPATCH TERMINAL (DEFAULT 2-COLUMN SAAS GRID) ═══ */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTabParam === "dispatch" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ─────────────────────────────────────────────────────────────── */}
            {/* LEFT COLUMN (lg:col-span-8) — INTERACTIVE WORKSPACE */}
            {/* ─────────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-8 space-y-6">

              {/* 1. Route Selection Card */}
              <div className="bg-surface rounded-xl border border-border-mute p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Route Selection
                    </h2>
                  </div>
                  <span className="text-[11px] text-text-muted font-mono">UMaT Campus Network</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-text-muted block mb-1.5">Pickup Location</label>
                    <select
                      value={pickupLocation?.id || ""}
                      onChange={(e) => {
                        const loc = UMAT_CAMPUS_HOTSPOTS.find(s => s.id === e.target.value);
                        if (loc) setPickupLocation(loc);
                      }}
                      className="w-full text-xs p-3 bg-background border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500 transition-colors"
                    >
                      {UMAT_CAMPUS_HOTSPOTS.map((spot) => (
                        <option key={spot.id} value={spot.id}>
                          {spot.name} — {spot.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-text-muted block mb-1.5">Dropoff Location</label>
                    <select
                      value={dropoffLocation?.id || ""}
                      onChange={(e) => {
                        const loc = UMAT_CAMPUS_HOTSPOTS.find(s => s.id === e.target.value);
                        if (loc) setDropoffLocation(loc);
                      }}
                      className="w-full text-xs p-3 bg-background border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500 transition-colors"
                    >
                      {UMAT_CAMPUS_HOTSPOTS.map((spot) => (
                        <option key={spot.id} value={spot.id}>
                          {spot.name} — {spot.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Interactive Google Satellite Map Card */}
              <div className="bg-surface rounded-xl border border-border-mute p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-emerald-500" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Google Satellite Map Engine
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMapSelectionMode("pickup")}
                      className={`text-[10px] font-semibold px-3 py-1 rounded-full cursor-pointer transition-all ${
                        mapSelectionMode === "pickup"
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-background border border-border-mute text-text-muted hover:text-foreground"
                      }`}
                    >
                      Set Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapSelectionMode("dropoff")}
                      className={`text-[10px] font-semibold px-3 py-1 rounded-full cursor-pointer transition-all ${
                        mapSelectionMode === "dropoff"
                          ? "bg-red-500 text-white shadow-xs"
                          : "bg-background border border-border-mute text-text-muted hover:text-foreground"
                      }`}
                    >
                      Set Dropoff
                    </button>
                  </div>
                </div>

                {/* Leaflet Google Satellite Map Canvas */}
                <CampusMap
                  pickup={pickupLocation}
                  dropoff={dropoffLocation}
                  onSelectLocation={handleMapLocationSelect}
                  selectionMode={mapSelectionMode}
                  height="360px"
                />

                {/* 3. Horizontal Scrolling Quick Action Hotspot Pills Row */}
                <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
                  <span className="text-[10px] font-semibold text-text-muted uppercase shrink-0">Campus Shortcuts:</span>
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
                        className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                          isPickup
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                            : isDropoff
                            ? "bg-red-500/10 border-red-500 text-red-500 font-bold"
                            : "bg-background border border-border-mute text-text-muted hover:border-zinc-400 hover:text-foreground"
                        }`}
                      >
                        <Building2 className="w-3 h-3" />
                        {spot.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Vehicle & Service Options Picker Card */}
              <div className="bg-surface rounded-xl border border-border-mute p-5 shadow-xs space-y-5">
                
                {/* Service Type Selection */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-2">Service Type</label>
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
                        <p className="text-[10px] text-text-muted">Direct transit across campus & Tarkwa town</p>
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

                {/* Delivery Parcel Details */}
                {serviceType === "delivery" && (
                  <div className="space-y-3 p-4 rounded-xl bg-background border border-border-mute">
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-text-muted block mb-1">Package Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Canteen takeaway food pack"
                        value={packageDetails}
                        onChange={(e) => setPackageDetails(e.target.value)}
                        className="w-full text-xs p-3 bg-surface border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-text-muted block mb-1">Recipient Phone (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+233 24 000 0000"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        className="w-full text-xs p-3 bg-surface border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Vehicle Options Grid (2x2) */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-2">Vehicle Option</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { type: "Taxi / Car" as const, icon: Car },
                      { type: "Bus / Shuttle" as const, icon: Bus },
                      { type: "Motorbike" as const, icon: Zap },
                      { type: "E-Bicycle" as const, icon: Bike },
                    ].map((v) => {
                      const Icon = v.icon;
                      const selected = vehicleType === v.type;
                      const vFare = calculateFare(distance, v.type, serviceType);
                      const vTime = estimateTime(distance, v.type);

                      return (
                        <button
                          key={v.type}
                          type="button"
                          onClick={() => setVehicleType(v.type)}
                          className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                            selected
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                              : "border-border-mute bg-background text-text-muted hover:border-zinc-400"
                          }`}
                        >
                          <Icon className="h-5 w-5 mx-auto mb-1.5 stroke-[2]" />
                          <p className="text-xs font-bold truncate">{v.type}</p>
                          <div className="flex items-center justify-center gap-1 mt-1 font-mono text-[10px]">
                            <span className="text-foreground font-bold">GHS {vFare.toFixed(2)}</span>
                            <span className="text-text-muted">• ~{vTime}m</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* ─────────────────────────────────────────────────────────────── */}
            {/* RIGHT COLUMN (lg:col-span-4) — STICKY CONTEXT & ACTIVE STATE */}
            {/* ─────────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 h-fit">

              {/* Sticky Dispatch Summary Card */}
              <div className="bg-surface rounded-xl border border-border-mute p-5 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-border-mute pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-500" />
                    Dispatch Summary
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {formatDistance(distance)}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between"><span className="text-text-muted">Service:</span><span className="font-semibold capitalize">{serviceType}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Vehicle Tier:</span><span className="font-semibold">{vehicleType}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Est. Duration:</span><span className="font-mono font-semibold">~{eta} min</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Pickup:</span><span className="font-semibold truncate max-w-[140px]">{pickupLocation?.name || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Dropoff:</span><span className="font-semibold truncate max-w-[140px]">{dropoffLocation?.name || "—"}</span></div>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-2 border-t border-border-mute">
                  <label className="text-[10px] font-semibold uppercase text-text-muted block mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("momo")}
                      className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 text-[11px] font-semibold cursor-pointer ${
                        paymentMethod === "momo"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-border-mute bg-background text-text-muted"
                      }`}
                    >
                      <MtnMoMoLogo className="h-3.5 w-3.5" /> Mobile Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 text-[11px] font-semibold cursor-pointer ${
                        paymentMethod === "cash"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-border-mute bg-background text-text-muted"
                      }`}
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Cash on Arrival
                    </button>
                  </div>
                </div>

                {/* Total Fare Display */}
                <div className="border-t border-border-mute pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-semibold uppercase text-text-muted">Total Fare</span>
                  <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    GHS {fare.toFixed(2)}
                  </span>
                </div>

                {/* Primary Confirm Button */}
                <form onSubmit={handleCreateTrip}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Requesting Dispatch...</span>
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

            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ═══ VIEW 2: DISPATCH ACTIVITY CENTER (`?tab=activity`) ═══ */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTabParam === "activity" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            
            <div className="bg-surface rounded-xl border border-border-mute p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border-mute pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    Dispatch Activity & Telemetry Center
                  </h2>
                  <p className="text-xs text-text-muted mt-1">Real-time status updates and full transaction history.</p>
                </div>
                <button
                  onClick={() => userId && fetchTrips(userId)}
                  className="px-3 py-1.5 rounded-lg border border-border-mute text-xs font-semibold text-text-muted hover:text-foreground hover:bg-background transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Active Dispatches */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Active Dispatches ({activeTrips.length})</h3>
                {activeTrips.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border-mute rounded-xl text-xs text-text-muted">
                    No active dispatches right now.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeTrips.map((trip) => (
                      <TripTracker key={trip.id} trip={trip} onCancel={handleCancelTrip} />
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Dispatches */}
              <div className="space-y-3 pt-6 border-t border-border-mute">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Completed Dispatch Receipts ({pastTrips.length})</h3>
                {pastTrips.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border-mute rounded-xl text-xs text-text-muted">
                    No completed trip history logged yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastTrips.map((t) => (
                      <div key={t.id} className="p-4 rounded-xl bg-background border border-border-mute flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
                            t.status === "completed" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ═══ VIEW 3: WALLET & PAYMENT CENTER (`?tab=wallet`) ═══ */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTabParam === "wallet" && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            
            <div className="bg-surface rounded-xl border border-border-mute p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-border-mute pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-500" />
                    Yɛnkɔ Student Wallet & Paystack Checkout
                  </h2>
                  <p className="text-xs text-text-muted mt-1">Manage Mobile Money balance & digital payment methods.</p>
                </div>
              </div>

              {/* Balance Card */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-emerald-100 font-semibold">Available Wallet Balance</p>
                  <p className="text-3xl font-black font-mono mt-1">GHS {walletBalance.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-white/10 rounded-full backdrop-blur-md">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Top-up Form */}
              <form onSubmit={handleTopup} className="p-5 rounded-xl bg-background border border-border-mute space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-500" /> Top-Up Wallet Balance
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["10", "20", "50"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={`py-2.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                        topupAmount === amt
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-border-mute bg-surface text-text-muted"
                      }`}
                    >
                      + GHS {amt}.00
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Enter custom amount (GHS)"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="flex-1 text-xs p-3 bg-surface border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isTopupLoading}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isTopupLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Paystack Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

      </main>

      <footer className="py-6 border-t border-border-mute bg-background/50 text-center text-xs text-text-muted">
        © 2026 Yɛnkɔ Campus Logistics. All rights reserved.
      </footer>
    </div>
  );
}

export default function TerminalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <p className="text-xs font-medium text-text-muted">Loading Student Terminal...</p>
          </div>
        </div>
      }
    >
      <TerminalContent />
    </Suspense>
  );
}
