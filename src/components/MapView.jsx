import { useEffect, useMemo, useState } from "react";
import { GoogleMap, InfoWindow, Marker, useLoadScript } from "@react-google-maps/api";
import { UrgencyBadge } from "./Badges";

const containerStyle = { width: "100%", height: "800px" };

const MAPS_KEY = import.meta.env.VITE_GMAPS_API_KEY;

export default function MapView({ center, items }) {
  // Only call the loader hook when a key is actually configured — passing
  // an empty string to useLoadScript is what triggers Google's raw
  // "This page can't load Google Maps correctly" dialog.
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: MAPS_KEY || "",
  });
 
  const [selected, setSelected] = useState(null);
  const mapCenter = useMemo(() => center || { lat: 34.05, lng: -118.25 }, [center]);
 
  // if the request list refreshes (e.g. a re-fetch) while a popup is open,
  // don't leave it pointing at data that may no longer be current
  useEffect(() => {
    setSelected(null);
  }, [items]);
 
  if (!MAPS_KEY) {
    return (
      <div className="map-fallback">
        <strong>Map isn't configured yet</strong>
        <p>
          Add a Google Maps JavaScript API key to your local <code>.env</code> as{" "}
          <code>VITE_GMAPS_API_KEY</code>, then restart the dev server.
        </p>
      </div>
    );
  }
 
  if (loadError) {
    return (
      <div className="map-fallback">
        <strong>The map couldn't load</strong>
        <p>
          This is almost always the Google Cloud project behind{" "}
          <code>VITE_GMAPS_API_KEY</code> — check that billing is enabled, the
          Maps JavaScript API is turned on, and any HTTP referrer restrictions
          include this domain.
        </p>
      </div>
    );
  }
 
  if (!isLoaded) {
    return (
      <div className="map-fallback">
        <strong>Loading map…</strong>
      </div>
    );
  }
 
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={12}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: "greedy",
      }}
      onClick={() => setSelected(null)}
    >
      {items?.map((r) => (
        <Marker
          key={r.id}
          position={{ lat: r.lat, lng: r.lng }}
          title={r.title}
          onClick={() => setSelected(r)}
        />
      ))}
 
      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="map-infowindow">
            <div className="map-infowindow-top">
              <strong>{selected.title}</strong>
              <UrgencyBadge urgency={selected.urgency} />
            </div>
            {selected.description && <p>{selected.description}</p>}
            <div className="map-infowindow-meta">{selected.type}</div>
            {selected.address && <div className="map-infowindow-meta">{selected.address}</div>}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}