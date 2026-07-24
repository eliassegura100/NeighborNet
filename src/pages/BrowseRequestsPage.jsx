import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { findNearbyOpenRequests, claimRequest } from "../requestApi";
import { UrgencyBadge } from "../components/Badges";

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
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not claim this request.");
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Volunteer</div>
        <h1>Open requests near you</h1>
        <p>Anything within 5km. Claim one and let your neighbor know you're on the way.</p>
      </div>

      {loading && <div className="state-banner state-banner-loading">Loading nearby requests…</div>}
      {error && <div className="state-banner state-banner-error">{error}</div>}

      {!loading && requests.length === 0 && !error ? (
        <div className="card empty-state">
          <p>No open requests within 5km right now — check back soon.</p>
        </div>
      ) : (
        <div className="request-grid">
          {requests.map((r) => (
            <div key={r.id} className="card request-card">
              <div className="request-card-top">
                <h3>{r.title}</h3>
                <UrgencyBadge urgency={r.urgency} />
              </div>
              <p className="request-desc">{r.description}</p>
              <div className="request-meta">
                <span className="request-meta-item">{r.type}</span>
              </div>
              {r.address && <div className="request-meta">{r.address}</div>}
              <div className="request-card-actions">
                <button
                  className="btn btn-accent btn-sm"
                  onClick={() => handleClaim(r.id)}
                  disabled={claimingId === r.id}
                >
                  {claimingId === r.id ? "Claiming…" : "On the way!"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
