import { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase";

export function useNearbyRequests(lat: number | null, lng: number | null, radiusKm = 5) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat == null || lng == null) return;
    const run = async () => {
      setLoading(true);
      try {
        const functions = getFunctions(app);
        const findNearby = httpsCallable(functions, "findNearbyOpenRequests");
        const res: any = await findNearby({ lat, lng, radiusKm });
        setData(res.data.items || []);
      } catch (e: any) {
        setError(e.message || "Failed to load nearby requests");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [lat, lng, radiusKm]);

  return { data, loading, error };
}
