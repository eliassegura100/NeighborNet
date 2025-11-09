// src/pages/BrowseRequestsPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { findNearbyOpenRequests, claimRequest } from "../requestApi";

export default function BrowseRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");
        setLoading(true);

        // Get user's current location
        await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
          }
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }).then(async (pos) => {
          const { latitude, longitude } = pos.coords;
          const items = await findNearbyOpenRequests({
            lat: latitude,
            lng: longitude,
            radiusKm: 5,
          });
          setRequests(items);
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load nearby requests");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleClaim(id) {
    if (!user) {
      alert("You must be logged in to claim a request.");
      return;
    }
    setClaimingId(id);
    try {
      await claimRequest(id);
      alert("Request claimed! Check your messages / app for details.");
      // You could also remove it from local list:
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not claim this request.");
    } finally {
      setClaimingId(null);
    }
  }

  if (loading) return <div style={{ padding: "1rem" }}>Loading nearby requests...</div>;

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "1rem" }}>
      <h1>Open Requests Near You</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {requests.length === 0 ? (
        <p>No open requests found within 5km of your location.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {requests.map((r) => (
            <li
              key={r.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                padding: "0.75rem 1rem",
                marginBottom: "0.75rem",
              }}
            >
              <strong>{r.title}</strong>
              <div>{r.description}</div>
              <div>Type: {r.type} • Urgency: {r.urgency}</div>
              {r.address && <div>Address: {r.address}</div>}
              <button
                onClick={() => handleClaim(r.id)}
                disabled={claimingId === r.id}
                style={{ marginTop: "0.5rem" }}
              >
                {claimingId === r.id ? "Claiming..." : "Claim this request"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
