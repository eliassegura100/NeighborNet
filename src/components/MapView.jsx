import { useMemo } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "420px", borderRadius: "16px" };

export default function MapView({ center, items }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GMAPS_API_KEY,
    // libraries: ["places"], // enable if you add Autocomplete
  });

  const mapCenter = useMemo(() => center || { lat: 34.05, lng: -118.25 }, [center]);

  if (loadError) return <div>Map failed to load.</div>;
  if (!isLoaded) return <div>Loading map…</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={12}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {items?.map((r) => (
        <Marker
          key={r.id}
          position={{ lat: r.location.lat, lng: r.location.lng }}
          title={r.title}
        />
      ))}
    </GoogleMap>
  );
}
