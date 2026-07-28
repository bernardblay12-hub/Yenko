import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const UMAT_CAMPUS_HOTSPOTS = [
  { id: "loc-1", name: "Main Gate", category: "gate", description: "University Main Entrance Gate" },
  { id: "loc-2", name: "KT Hall (Kofi Annan Hall)", category: "hall", description: "On-campus Student Residence" },
  { id: "loc-3", name: "SRID Hall", category: "hall", description: "School of Railway and Infrastructure Development" },
  { id: "loc-4", name: "Gold Refinery Lab", category: "faculty", description: "Faculty of Minerals and Petroleum Engineering" },
  { id: "loc-5", name: "Library & ICT Complex", category: "faculty", description: "Central Library and Computer Labs" },
  { id: "loc-6", name: "University Canteen", category: "canteen", description: "Central Student Dining & Food Hub" },
  { id: "loc-7", name: "Town Market Junction", category: "commercial", description: "Tarkwa Town Shuttle Pickup Point" },
  { id: "loc-8", name: "Administration Block", category: "faculty", description: "Vice Chancellor & Registrar Offices" }
];

// Custom local storage mock query builder for Profiles, Trips & Locations
class MockQueryBuilder {
  private tableName: string;
  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string = "*") {
    return this;
  }

  eq(column: string, value: any) {
    return this;
  }

  order(column: string, options: any = {}) {
    return this;
  }

  maybeSingle() {
    return Promise.resolve({ data: this.getData(true), error: null });
  }

  insert(data: any) {
    this.saveData(data);
    return Promise.resolve({ data, error: null });
  }

  upsert(data: any) {
    this.saveData(data);
    return Promise.resolve({ data, error: null });
  }

  update(data: any) {
    this.saveData(data);
    return Promise.resolve({ data, error: null });
  }

  delete() {
    return this;
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve({ data: this.getData(false), error: null }).then(onfulfilled, onrejected);
  }

  private getData(single: boolean) {
    if (typeof window === "undefined") return single ? null : [];
    if (this.tableName === "profiles") {
      const stored = localStorage.getItem("yenko_profile");
      if (stored) return JSON.parse(stored);
      return {
        id: "mock-user-id",
        role: "student",
        full_name: "Bernard Nokye",
        phone: "+233 24 123 4567",
        email: "bernard@umat.edu.gh",
        university: "UMaT (Tarkwa)",
        student_id_number: "70012345",
        vehicle_type: "Taxi / Car",
        is_available: true
      };
    } else if (this.tableName === "campus_locations") {
      return single ? UMAT_CAMPUS_HOTSPOTS[0] : UMAT_CAMPUS_HOTSPOTS;
    } else if (this.tableName === "trips") {
      const stored = localStorage.getItem("yenko_trips");
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    }
    return single ? null : [];
  }

  private saveData(data: any) {
    if (typeof window === "undefined") return;
    if (this.tableName === "profiles") {
      const existing = this.getData(true) || {};
      const updated = { ...existing, ...data };
      localStorage.setItem("yenko_profile", JSON.stringify(updated));
    } else if (this.tableName === "trips") {
      const stored = localStorage.getItem("yenko_trips");
      let trips = stored ? JSON.parse(stored) : [];
      const incoming = Array.isArray(data) ? data : [data];
      
      incoming.forEach((item) => {
        const idx = trips.findIndex((t: any) => t.id === item.id);
        if (idx >= 0) {
          trips[idx] = { ...trips[idx], ...item, updated_at: new Date().toISOString() };
        } else {
          trips.push({ ...item, id: item.id || `trip-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
        }
      });
      localStorage.setItem("yenko_trips", JSON.stringify(trips));
    }
  }
}

// Local mock client implementation
const createLocalMockClient = () => {
  const auth = {
    getSession: () => {
      if (typeof window === "undefined") return Promise.resolve({ data: { session: null }, error: null });
      const sessionStr = localStorage.getItem("yenko_session");
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      return Promise.resolve({ data: { session }, error: null });
    },
    onAuthStateChange: (callback: any) => {
      if (typeof window === "undefined") {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
      const sessionStr = localStorage.getItem("yenko_session");
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      setTimeout(() => {
        callback("SIGNED_IN", session);
      }, 0);
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    },
    signInWithPassword: ({ email }: any) => {
      const mockUser = {
        id: "mock-user-id",
        email,
        user_metadata: { full_name: "Bernard Nokye" }
      };
      const mockSession = {
        access_token: "mock-token",
        user: mockUser
      };
      localStorage.setItem("yenko_session", JSON.stringify(mockSession));
      return Promise.resolve({ data: { user: mockUser, session: mockSession }, error: null });
    },
    signUp: ({ email, options }: any) => {
      const mockUser = {
        id: "mock-user-id",
        email,
        user_metadata: { full_name: options?.data?.full_name || "Bernard Nokye" }
      };
      const mockSession = {
        access_token: "mock-token",
        user: mockUser
      };
      localStorage.setItem("yenko_session", JSON.stringify(mockSession));
      localStorage.setItem("yenko_profile", JSON.stringify({
        id: "mock-user-id",
        role: options?.data?.role || "student",
        full_name: options?.data?.full_name || "Bernard Nokye",
        university: "UMaT (Tarkwa)",
        student_id_number: "70012345"
      }));
      return Promise.resolve({ data: { user: mockUser, session: mockSession }, error: null });
    },
    signOut: () => {
      localStorage.removeItem("yenko_session");
      return Promise.resolve({ error: null });
    },
    signInWithOAuth: () => {
      const mockUser = {
        id: "mock-user-id",
        email: "bernard@umat.edu.gh",
        user_metadata: { full_name: "Bernard Nokye" }
      };
      const mockSession = {
        access_token: "mock-token",
        user: mockUser
      };
      localStorage.setItem("yenko_session", JSON.stringify(mockSession));
      window.location.reload();
      return Promise.resolve({ error: null });
    },
    resetPasswordForEmail: () => {
      return Promise.resolve({ error: null });
    },
    updateUser: () => {
      return Promise.resolve({ error: null });
    }
  };

  return {
    auth,
    from: (tableName: string) => new MockQueryBuilder(tableName)
  } as unknown as SupabaseClient;
};

// Fallback to local mock client if env keys are missing
export const supabase = (supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createLocalMockClient()) as unknown as SupabaseClient;
