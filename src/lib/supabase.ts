import { createClient } from "@supabase/supabase-js";

// ─── Supabase Client Configuration ───
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xzldfxvkjmgkiwhjesoe.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const globalForSupabase = globalThis as unknown as { supabase?: ReturnType<typeof createClient> };

export const supabase: any =
  globalForSupabase.supabase ?? createClient(supabaseUrl, supabaseKey);

if (process.env.NODE_ENV !== "production") globalForSupabase.supabase = supabase;

// ─── TypeScript Types ───

export type UserRole = "student" | "driver";

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  phone?: string | null;
  university?: string | null;
  student_id_number?: string | null;
  vehicle_type?: string | null;
  license_plate?: string | null;
  is_verified_driver?: boolean;
  is_available?: boolean;
  current_lat?: number | null;
  current_lng?: number | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type TripStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
export type ServiceType = "ride" | "delivery";
export type PaymentMethod = "momo" | "cash";
export type PaymentStatus = "pending" | "paid" | "cash_on_delivery" | "refunded";

export interface Trip {
  id: string;
  rider_id: string;
  driver_id?: string | null;
  service_type: ServiceType;
  status: TripStatus;
  pickup_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_location: string;
  dropoff_lat: number;
  dropoff_lng: number;
  package_details?: string | null;
  recipient_phone?: string | null;
  vehicle_type: string;
  fare_amount: number;
  distance_km: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  driver_name?: string | null;
  otp_code?: string | null;
  created_at: string;
  accepted_at?: string | null;
  completed_at?: string | null;
}

export interface CampusLocation {
  id: string;
  name: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
}

// ─── UMaT Tarkwa Campus Hotspots (with GPS Coordinates) ───

export const UMAT_CAMPUS_HOTSPOTS: CampusLocation[] = [
  { id: "loc-1", name: "Main Gate",               category: "gate",       description: "University Main Entrance Gate",                     lat: 5.2995, lng: -2.0025 },
  { id: "loc-2", name: "KT Hall (Kofi Annan Hall)", category: "hall",     description: "On-campus Student Residence",                       lat: 5.2970, lng: -2.0010 },
  { id: "loc-3", name: "SRID Hall",                category: "hall",       description: "School of Railway & Infrastructure Development",    lat: 5.2982, lng: -2.0002 },
  { id: "loc-4", name: "Gold Refinery Lab",        category: "faculty",    description: "Faculty of Minerals & Petroleum Engineering",       lat: 5.2960, lng: -2.0020 },
  { id: "loc-5", name: "Library & ICT Complex",    category: "faculty",    description: "Central Library and Computer Labs",                 lat: 5.2976, lng: -2.0015 },
  { id: "loc-6", name: "University Canteen",        category: "canteen",   description: "Central Student Dining & Food Hub",                 lat: 5.2968, lng: -2.0018 },
  { id: "loc-7", name: "Town Market Junction",     category: "commercial", description: "Tarkwa Town Shuttle Pickup Point",                  lat: 5.2938, lng: -2.0042 },
  { id: "loc-8", name: "Administration Block",     category: "faculty",    description: "Vice Chancellor & Registrar Offices",               lat: 5.2990, lng: -2.0018 },
];

export const UMAT_CENTER = { lat: 5.2974, lng: -2.0019 };
export const UMAT_DEFAULT_ZOOM = 17;
