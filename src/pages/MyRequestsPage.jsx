import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { createRequest } from "../requestApi";
import { StatusBadge, UrgencyBadge } from "../components/Badges";

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [type, setType] = useState("groceries");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);

  // Load this user's requests, then keep the list live: a card updates
  // in place the moment a volunteer claims it, the same way Firestore's
  // onSnapshot did. Realtime only streams changes going forward from the
  // moment you subscribe, so an initial fetch still has to happen first.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadInitial() {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        console.error(error);
        return;
      }
      setRequests(data ?? []);
    }

    loadInitial();

    const channel = supabase
      .channel(`my-requests-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests", filter: `requester_id=eq.${user.id}` },
        (payload) => {
          setRequests((prev) => {
            if (payload.eventType === "INSERT") {
              return [payload.new, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((r) => (r.id === payload.new.id ? payload.new : r));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => r.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      await createRequest({
        type,
        title,
        description,
        address,
        useMyLocation: false, // using address instead
        location: null,
        urgency,
        estimatedMinutes: 60,
      });
      // no manual state update needed — the Realtime subscription above
      // picks up the INSERT and adds it to the list itself

      setTitle("");
      setDescription("");
      setAddress("");
      setType("groceries");
      setUrgency("normal");
    } catch (err) {
      console.error(err);
      alert(err.message || "Error creating request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Dashboard</div>
        <h1>My requests</h1>
        <p>Post something you need help with, and keep an eye on where it stands.</p>
      </div>

      <div className="dashboard-grid">
        <div className="card card-pad">
          <h2>New request</h2>
          <form onSubmit={handleSubmit}>
            <label className="form-field">
              <span className="form-field-label">Type</span>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="groceries">Groceries / Errands</option>
                <option value="tech_help">Tech Help</option>
                <option value="tutoring">Tutoring</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="form-field">
              <span className="form-field-label">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>

            <label className="form-field">
              <span className="form-field-label">Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </label>

            <label className="form-field">
              <span className="form-field-label">Address</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, ST"
                required
              />
            </label>

            <label className="form-field">
              <span className="form-field-label">Urgency</span>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </label>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Creating…" : "Create request"}
            </button>
          </form>
        </div>

        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", marginBottom: "1.1rem" }}>
            Your existing requests
          </h2>

          {requests.length === 0 ? (
            <div className="card empty-state">
              <p>No requests yet, the one you post above will show up here.</p>
            </div>
          ) : (
            <div className="request-grid">
              {requests.map((r) => (
                <div key={r.id} className="card request-card">
                  <div className="request-card-top">
                    <h3>{r.title}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="request-desc">{r.description}</p>
                  <div className="request-meta">
                    <span className="request-meta-item">{r.type}</span>
                    <UrgencyBadge urgency={r.urgency} />
                  </div>
                  {r.address && <div className="request-meta">{r.address}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}