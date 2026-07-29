// ─── Geo Utilities for Yɛnkɔ Campus Logistics ───

/**
 * Calculate the distance in kilometers between two GPS coordinates
 * using the Haversine formula.
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate fare based on distance, vehicle type, and service type.
 *
 * Fare structure (GHS):
 *   Base fare + (per-km rate × distance)
 *   Minimum fare enforced per vehicle type.
 *   Delivery surcharge: +GHS 2.00
 */
export function calculateFare(
  distanceKm: number,
  vehicleType: string,
  serviceType: "ride" | "delivery"
): number {
  const rates: Record<string, { base: number; perKm: number; min: number }> = {
    "Taxi / Car":    { base: 5.00, perKm: 3.50, min: 8.00 },
    "Bus / Shuttle": { base: 2.00, perKm: 2.00, min: 4.00 },
    "Motorbike":     { base: 3.00, perKm: 3.00, min: 6.00 },
    "E-Bicycle":     { base: 2.00, perKm: 2.50, min: 5.00 },
  };

  const rate = rates[vehicleType] || rates["Taxi / Car"];
  let fare = rate.base + (rate.perKm * distanceKm);

  // Delivery surcharge
  if (serviceType === "delivery") {
    fare += 2.00;
  }

  // Enforce minimum fare
  fare = Math.max(fare, rate.min);

  return Math.round(fare * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate a random 4-digit OTP code for rider-driver verification.
 */
export function generateOTP(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Generate a unique trip ID in the format YK-XXXXXX.
 */
export function generateTripId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Format a distance in km for display.
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Estimate travel time in minutes based on distance and vehicle type.
 * Average campus speeds: Car ~25km/h, Bus ~20km/h, Motorbike ~30km/h, E-Bicycle ~15km/h
 */
export function estimateTime(distanceKm: number, vehicleType: string): number {
  const speeds: Record<string, number> = {
    "Taxi / Car": 25,
    "Bus / Shuttle": 20,
    "Motorbike": 30,
    "E-Bicycle": 15,
  };

  const speed = speeds[vehicleType] || 25;
  const timeHours = distanceKm / speed;
  const timeMinutes = Math.max(1, Math.round(timeHours * 60));
  return timeMinutes;
}
