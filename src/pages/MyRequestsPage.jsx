// src/pages/MyRequestsPage.jsx
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { createRequest } from "../requestApi";

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
      setRequests(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
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
        useMyLocation: false,   // using address instead
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
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "1rem" }}>
      <h1>My Requests</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <h2>Create a new request</h2>

        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="groceries">Groceries / Errands</option>
            <option value="tech_help">Tech Help</option>
            <option value="tutoring">Tutoring</option>
            <option value="other">Other</option>
          </select>
        </label>

        <br />

        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <br />

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        <br />

        <label>
          Address
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, ST"
            required
          />
        </label>

        <br />

        <label>
          Urgency
          <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </label>

        <br />

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Request"}
        </button>
      </form>

      <h2>Your existing requests</h2>
      {requests.length === 0 ? (
        <p>No requests yet.</p>
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
              <div>
                Status: <em>{r.status}</em> • Type: {r.type}
              </div>
              {r.address && <div>Address: {r.address}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
