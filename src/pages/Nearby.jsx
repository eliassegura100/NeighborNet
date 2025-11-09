import { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase/config";
import MapView from "../components/MapView";

export default function Nearby() {
  const [coords, setCoords] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords({ lat: 34.05, lng: -118.25 }) // fallback: LA
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    const load = async () => {
      const fn = httpsCallable(getFunctions(app), "findNearbyOpenRequests");
      const res = await fn({ lat: coords.lat, lng: coords.lng, radiusKm: 5 });
      setItems(res.data.items || []);
    };
    load();
  }, [coords]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Nearby Requests</h1>
      <MapView center={coords} items={items} />
      <div className="grid gap-3">
        {items.map((r) => (
          <div key={r.id} className="p-3 rounded-xl border">
            <div className="font-medium">{r.title}</div>
            <div className="text-sm opacity-70">{r.type} • {r.urgency}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
