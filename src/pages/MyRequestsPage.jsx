import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
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

  // Subscribe to this user's requests
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "requests"),
      where("requesterId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
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
              <p>No requests yet — the one you post above will show up here.</p>
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
