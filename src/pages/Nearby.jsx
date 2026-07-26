import { useEffect, useState } from "react";
import { findNearbyOpenRequests } from "../requestApi";
import MapView from "../components/MapView";
import { UrgencyBadge } from "../components/Badges";

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
      const nearby = await findNearbyOpenRequests({ lat: coords.lat, lng: coords.lng, radiusKm: 5 });
      setItems(nearby ?? []);
    };
    load();
  }, [coords]);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Map</div>
        <h1>Nearby requests</h1>
        <p>Everything open within 5km of you, plotted on the map below.</p>
      </div>

      <div className="map-shell">
        <MapView center={coords} items={items} />
      </div>

      <div className="request-grid" style={{ marginTop: "1.5rem" }}>
        {items.map((r) => (
          <div key={r.id} className="card request-card">
            <div className="request-card-top">
              <h3>{r.title}</h3>
              <UrgencyBadge urgency={r.urgency} />
            </div>
            <div className="request-meta">
              <span className="request-meta-item">{r.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}