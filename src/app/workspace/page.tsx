"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import { 
  Car, 
  Package, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Phone, 
  CreditCard, 
  Zap, 
  Bike, 
  Bus, 
  UserCheck, 
  AlertCircle,
  Plus,
  RotateCcw,
  Check,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { supabase, UMAT_CAMPUS_HOTSPOTS } from "@/lib/supabase";
import { MtnMoMoLogo, TelecelLogo } from "@/components/BrandIcons";
import { toast } from "sonner";

export default function WorkspacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"book" | "active" | "history">("book");
  const [serviceType, setServiceType] = useState<"ride" | "delivery">("ride");
  
  // Form fields
  const [pickup, setPickup] = useState("Main Gate");
  const [customPickup, setCustomPickup] = useState("");
  const [dropoff, setDropoff] = useState("KT Hall (Kofi Annan Hall)");
  const [customDropoff, setCustomDropoff] = useState("");
  const [packageDetails, setPackageDetails] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [vehicleType, setVehicleType] = useState<"Taxi / Car" | "Bus / Shuttle" | "Motorbike" | "E-Bicycle">("Taxi / Car");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "cash">("momo");
  
  // Auth & Profile state
  const [userProfile, setUserProfile] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [driverMode, setDriverMode] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Authenticate & Load Profile on mount
  useEffect(() => {
    if (!supabase) {
      setIsAuthChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please sign in to access your dashboard.");
        router.push("/login");
        return;
      }

      setIsAuthChecking(false);

      // Load User Profile
      supabase.from("profiles").select("*").maybeSingle().then(({ data }) => {
        if (data) {
          setUserProfile(data);
          if (data.role === "driver") {
            setDriverMode(true);
          }
        }
      });

      fetchTrips();
    });
  }, [router]);

  const fetchTrips = async () => {
    try {
      const { data } = await supabase.from("trips").select("*");
      if (data) {
        setTrips(data);
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
    }
  };

  // Role Switching Guard
  const handleToggleDriverMode = () => {
    const isVerifiedDriver = userProfile?.role === "driver" || userProfile?.is_verified_driver === true;

    if (!driverMode && !isVerifiedDriver) {
      toast.error("Driver View is restricted to verified UMaT drivers. Please complete driver clearance first.", {
        icon: <ShieldAlert className="w-4 h-4 text-amber-500" />
      });
      return;
    }

    setDriverMode(!driverMode);
    toast.success(driverMode ? "Switched to Student Commuter View" : "Switched to Driver Dispatch View");
  };

  // Fare Calculation
  const calculateFare = () => {
    let baseFare = 8.0;
    if (vehicleType === "Bus / Shuttle") baseFare = 5.0;
    if (vehicleType === "E-Bicycle") baseFare = 6.0;
    if (vehicleType === "Motorbike") baseFare = 7.0;
    if (vehicleType === "Taxi / Car") baseFare = 10.0;
    if (serviceType === "delivery") baseFare += 2.0;
    return baseFare.toFixed(2);
  };

  // Create new ride or delivery request
  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const actualPickup = pickup === "custom" ? customPickup : pickup;
    const actualDropoff = dropoff === "custom" ? customDropoff : dropoff;

    if (!actualPickup || !actualDropoff) {
      toast.error("Please specify both pickup and dropoff locations.");
      setLoading(false);
      return;
    }

    if (serviceType === "delivery" && !packageDetails) {
      toast.error("Please describe what item needs to be delivered.");
      setLoading(false);
      return;
    }

    const fare = calculateFare();

    const newTrip = {
      id: `YK-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: userProfile?.id || "mock-user-id",
      service_type: serviceType,
      pickup_location: actualPickup,
      dropoff_location: actualDropoff,
      package_details: serviceType === "delivery" ? packageDetails : null,
      recipient_phone: recipientPhone || null,
      fare_amount: parseFloat(fare),
      status: "pending",
      payment_status: paymentMethod === "cash" ? "cash_on_delivery" : "paid",
      payment_method: paymentMethod,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from("trips").insert(newTrip);
      toast.success(`${serviceType === "ride" ? "Ride" : "Delivery"} requested successfully! Matching nearby riders...`);
      setPackageDetails("");
      setRecipientPhone("");
      await fetchTrips();
      setActiveTab("active");
    } catch (err: any) {
      toast.error(err.message || "Failed to create request.");
    } finally {
      setLoading(false);
    }
  };

  // Status Simulation helper for driver actions
  const updateTripStatus = async (tripId: string, newStatus: string, driverName?: string) => {
    const updated = trips.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: newStatus,
          driver_name: driverName || t.driver_name || "Kwame A. (Rider)",
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });
    setTrips(updated);
    try {
      await supabase.from("trips").upsert(updated);
      toast.success(`Trip ${tripId} status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  const activeTrips = trips.filter(t => t.status !== "completed" && t.status !== "cancelled");
  const pastTrips = trips.filter(t => t.status === "completed" || t.status === "cancelled");

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs font-mono font-bold text-text-muted">Loading Yɛnkɔ Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <WorkspaceHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Top Header & Driver Mode Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-mute pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-sans">
                Yɛnkɔ Dispatch Hub
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              On-demand UMaT Tarkwa campus rides & instant package deliveries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleDriverMode}
              className={`text-xs font-mono font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                driverMode 
                  ? "bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400" 
                  : "bg-surface border-border-mute text-text-muted hover:text-foreground"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              {driverMode ? "Mode: Campus Driver" : "Switch to Driver View"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border-mute gap-4 mb-8">
          <button
            onClick={() => setActiveTab("book")}
            className={`pb-3 text-xs font-mono uppercase font-bold tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "book"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-text-muted hover:text-foreground"
            }`}
          >
            <Plus className="h-4 w-4" />
            New Request
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 text-xs font-mono uppercase font-bold tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "active"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-text-muted hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
            Active Requests ({activeTrips.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-xs font-mono uppercase font-bold tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "history"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-text-muted hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Trip History ({pastTrips.length})
          </button>
        </div>

        {/* ─── TAB 1: NEW BOOKING REQUEST FORM ─── */}
        {activeTab === "book" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6 bg-surface p-6 rounded-2xl border border-border-mute">
              
              {/* Service Type Selector */}
              <div>
                <label className="text-xs font-mono uppercase font-bold text-text-muted block mb-2">Select Service</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setServiceType("ride")}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      serviceType === "ride"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "border-border-mute bg-background text-text-muted hover:border-zinc-400"
                    }`}
                  >
                    <Car className="h-5 w-5" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">Passenger Ride 🚕</p>
                      <p className="text-[10px] text-text-muted">Travel across campus halls & towns</p>
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
                    <Package className="h-5 w-5" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">Package Delivery 📦</p>
                      <p className="text-[10px] text-text-muted">Food, books, laundry to your room</p>
                    </div>
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateTrip} className="space-y-4">
                {/* Pickup Location */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Pickup Location</label>
                  <select
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full text-xs p-3 bg-background border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500"
                  >
                    {UMAT_CAMPUS_HOTSPOTS.map((spot) => (
                      <option key={spot.id} value={spot.name}>
                        📍 {spot.name} ({spot.description})
                      </option>
                    ))}
                    <option value="custom">✍️ Custom Location (Specify below)</option>
                  </select>

                  {pickup === "custom" && (
                    <input
                      type="text"
                      placeholder="e.g. Near Faculty of Engineering Block B"
                      value={customPickup}
                      onChange={(e) => setCustomPickup(e.target.value)}
                      className="mt-2 w-full text-xs p-3 bg-background border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500"
                      required
                    />
                  )}
                </div>

                {/* Dropoff Location */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Dropoff Location</label>
                  <select
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="w-full text-xs p-3 bg-background border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500"
                  >
                    {UMAT_CAMPUS_HOTSPOTS.map((spot) => (
                      <option key={spot.id} value={spot.name}>
                        📍 {spot.name} ({spot.description})
                      </option>
                    ))}
                    <option value="custom">✍️ Custom Location (Specify below)</option>
                  </select>

                  {dropoff === "custom" && (
                    <input
                      type="text"
                      placeholder="e.g. Town Market Station"
                      value={customDropoff}
                      onChange={(e) => setCustomDropoff(e.target.value)}
                      className="mt-2 w-full text-xs p-3 bg-background border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500"
                      required
                    />
                  )}
                </div>

                {/* Transport Mode */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Transport Vehicle</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { type: "Taxi / Car", icon: Car, fare: "GHS 10" },
                      { type: "Bus / Shuttle", icon: Bus, fare: "GHS 5" },
                      { type: "Motorbike", icon: Zap, fare: "GHS 7" },
                      { type: "E-Bicycle", icon: Bike, fare: "GHS 6" },
                    ].map((v) => {
                      const Icon = v.icon;
                      const selected = vehicleType === v.type;
                      return (
                        <button
                          key={v.type}
                          type="button"
                          onClick={() => setVehicleType(v.type as any)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            selected
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                              : "border-border-mute bg-background text-text-muted hover:border-zinc-400"
                          }`}
                        >
                          <Icon className="h-4 w-4 mx-auto mb-1" />
                          <p className="text-[11px] font-bold truncate">{v.type}</p>
                          <p className="text-[9px] text-text-muted font-mono">{v.fare}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Package Details (if delivery) */}
                {serviceType === "delivery" && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Package Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Canteen takeaway food pack & water bottle"
                        value={packageDetails}
                        onChange={(e) => setPackageDetails(e.target.value)}
                        className="w-full text-xs p-3 bg-background border border-border-mute rounded-xl text-foreground outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Recipient Phone (Optional)</label>
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

                {/* Payment Method */}
                <div className="pt-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-text-muted block mb-1">Payment Method</label>
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
                      <MtnMoMoLogo className="h-4 w-4" />
                      MTN MoMo / Telecel
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
                      <CreditCard className="h-4 w-4" />
                      Cash on Arrival
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 mt-4"
                >
                  {loading ? "Requesting Dispatch..." : `Confirm & Request ${serviceType === "ride" ? "Ride" : "Delivery"}`}
                </button>
              </form>
            </div>

            {/* Sidebar Summary Card */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-surface border border-border-mute space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-mute pb-2">
                  Fare Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Service Type:</span>
                    <span className="font-bold capitalize">{serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Vehicle:</span>
                    <span className="font-bold">{vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Estimated Distance:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Campus Zone (~1.8 km)</span>
                  </div>
                </div>

                <div className="border-t border-border-mute pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-mono uppercase font-bold text-text-muted">Estimated Fare</span>
                  <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    GHS {calculateFare()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Student discount applied automatically for UMaT Tarkwa campus.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: ACTIVE REQUESTS (DISPATCH QUEUE & DRIVER SIMULATION) ─── */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {activeTrips.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <p className="text-xs text-text-muted">No active rides or deliveries right now.</p>
                <button
                  onClick={() => setActiveTab("book")}
                  className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Create a new request →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTrips.map((trip) => (
                  <div key={trip.id} className="p-6 rounded-2xl bg-surface border border-border-mute space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-mute pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Trip ID: {trip.id}</span>
                        <h4 className="text-sm font-bold text-foreground capitalize">{trip.service_type} Request</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                        trip.status === "pending"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {trip.status === "pending" ? "Searching for Rider..." : `Status: ${trip.status}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Pickup</p>
                        <p className="font-semibold text-foreground">{trip.pickup_location}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Dropoff</p>
                        <p className="font-semibold text-foreground">{trip.dropoff_location}</p>
                      </div>
                    </div>

                    {trip.package_details && (
                      <div className="p-3 rounded-xl bg-background border border-border-mute text-xs">
                        <span className="text-text-muted font-semibold">Item: </span>
                        <span>{trip.package_details}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border-mute text-xs">
                      <div>
                        <span className="text-text-muted">Fare: </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">GHS {trip.fare_amount?.toFixed(2)}</span>
                      </div>

                      {/* Status Simulation Controls */}
                      <div className="flex items-center gap-2">
                        {trip.status === "pending" && (
                          <button
                            onClick={() => updateTripStatus(trip.id, "accepted", "Kwaku A. (Campus Shuttle)")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Accept Request 🚘
                          </button>
                        )}
                        {trip.status === "accepted" && (
                          <button
                            onClick={() => updateTripStatus(trip.id, "completed")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Mark as Completed ✅
                          </button>
                        )}
                        <button
                          onClick={() => updateTripStatus(trip.id, "cancelled")}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[11px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: TRIP HISTORY ─── */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {pastTrips.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border-mute rounded-2xl">
                <p className="text-xs text-text-muted">No completed trip history yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastTrips.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-surface border border-border-mute flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{t.id}</span>
                        <span className="capitalize text-text-muted">• {t.service_type}</span>
                      </div>
                      <p className="text-text-muted mt-1">
                        From <strong className="text-foreground">{t.pickup_location}</strong> to <strong className="text-foreground">{t.dropoff_location}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">GHS {t.fare_amount?.toFixed(2)}</span>
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

      {/* ─── Clean Dashboard Footer (No Landing Page Marketing Links) ─── */}
      <footer className="py-6 border-t border-border-mute bg-background/50 text-center text-xs text-text-muted font-mono">
        © 2026 Yɛnkɔ Campus Logistics Hub. All rights reserved.
      </footer>
    </div>
  );
}
