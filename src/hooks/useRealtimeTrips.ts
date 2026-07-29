"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, type Trip } from "@/lib/supabase";

export function useRealtimeTrips(userId: string) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTrips = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await (supabase.from("trips" as any) as any)
        .select("*")
        .or(`rider_id.eq.${userId},driver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.message) console.error("Error fetching trips:", error.message);
      } else if (data) {
        setTrips(data as Trip[]);
      }
    } catch (err: any) {
      console.error("Failed to fetch trips:", err?.message || err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`trips-channel-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips" },
        (payload: any) => {
          const newTrip = payload.new as Trip | null;
          const oldTrip = payload.old as Trip | null;

          const isRelevant =
            (newTrip && (newTrip.rider_id === userId || newTrip.driver_id === userId)) ||
            (oldTrip && (oldTrip.rider_id === userId || oldTrip.driver_id === userId));

          if (!isRelevant) return;

          setTrips((prevTrips) => {
            if (payload.eventType === "INSERT" && newTrip) {
              return [newTrip, ...prevTrips];
            }
            if (payload.eventType === "UPDATE" && newTrip) {
              return prevTrips.map((trip) =>
                trip.id === newTrip.id ? newTrip : trip
              );
            }
            if (payload.eventType === "DELETE" && oldTrip) {
              return prevTrips.filter((trip) => trip.id !== oldTrip.id);
            }
            return prevTrips;
          });
        }
      )
      .subscribe((status: any, err?: any) => {
        if (err) console.error("Subscription error:", err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const activeTrips = trips.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled"
  );
  
  const pastTrips = trips.filter(
    (t) => t.status === "completed" || t.status === "cancelled"
  );

  return { trips, activeTrips, pastTrips, loading, refetch: fetchTrips };
}
