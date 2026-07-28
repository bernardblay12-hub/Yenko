"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, type Profile } from "@/lib/supabase";

interface DriverLocation {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

export function useDriverPresence(profile: Profile | null) {
  const [onlineDrivers, setOnlineDrivers] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const isDriver = profile?.role === "driver";

  const updateDatabaseAvailability = async (available: boolean, lat?: number, lng?: number) => {
    if (!profile?.id) return;
    
    const updateData: any = { is_available: available };
    if (lat !== undefined && lng !== undefined) {
      updateData.current_lat = lat;
      updateData.current_lng = lng;
    }

    try {
      await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);
    } catch (error) {
      console.error("Failed to update database availability:", error);
    }
  };

  const toggleAvailability = useCallback(async () => {
    if (!isDriver || !profile) return;

    if (!isAvailable) {
      // Trying to go online
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setIsAvailable(true);
            await updateDatabaseAvailability(true, latitude, longitude);
            
            if (channelRef.current) {
              await channelRef.current.track({
                id: profile.id,
                name: profile.full_name,
                lat: latitude,
                lng: longitude,
                vehicle_type: profile.vehicle_type,
                is_available: true,
              });
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            // Optionally handle UI feedback for geolocation failure
          },
          { enableHighAccuracy: true }
        );
      }
    } else {
      // Going offline
      setIsAvailable(false);
      await updateDatabaseAvailability(false);
      if (channelRef.current) {
        await channelRef.current.untrack();
      }
    }
  }, [isAvailable, isDriver, profile]);

  useEffect(() => {
    // Only drivers or those needing driver presence should connect to the channel
    const channel = supabase.channel("drivers-online");
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        let driversCount = 0;
        const locations: DriverLocation[] = [];

        for (const id in state) {
          const presences = state[id];
          for (const p of presences as any[]) {
            if (p.is_available) {
              driversCount++;
              locations.push({
                id: p.id,
                lat: p.lat,
                lng: p.lng,
                name: p.name,
              });
            }
          }
        }

        setOnlineDrivers(driversCount);
        setDriverLocations(locations);
      })
      .subscribe(async (status: any) => {
        if (status === "SUBSCRIBED" && isAvailable && isDriver && profile) {
          // If already marked available in local state when reconnecting
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                await channel.track({
                  id: profile.id,
                  name: profile.full_name,
                  lat: latitude,
                  lng: longitude,
                  vehicle_type: profile.vehicle_type,
                  is_available: true,
                });
              }
            );
          }
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [isDriver, isAvailable, profile]);

  return { onlineDrivers, isAvailable, toggleAvailability, driverLocations };
}
