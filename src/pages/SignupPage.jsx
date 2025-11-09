// src/pages/SignupPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) Create auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // 2) Create Firestore profile doc (basic for now)
      await setDoc(doc(db, "users", uid), {
        name,
        email,
        role: null,      // you'll let them pick requester/volunteer later
        createdAt: new Date(),
      });

      // 3) Redirect to onboarding or home
      navigate("/onboarding"); // or "/" if you don’t have onboarding yet
    } catch (err) {
      console.error(err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "2rem" }}>
      <h1 style={{ marginBottom: "1rem", textAlign: "center", font:"bold 35px Arial, sans-serif"}}>Sign Up</h1>

      {error && (
        <div
          style={{
            backgroundColor: "#ffe5e5",
            color: "#b00020",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: "0.5rem", font:"15px Arial, sans-serif" }}>
          Full Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.25rem",
              marginBottom: "1rem",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.5rem", font:"15px Arial, sans-serif" }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.25rem",
              marginBottom: "1rem",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.5rem", font:"15px Arial, sans-serif" }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.25rem",
              marginBottom: "1rem",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "none",
            backgroundColor: "#16a34a",
            color: "white",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center", font:"15px Arial, sans-serif" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#2563eb", font:"15px Arial, sans-serif" }}>
          Log in
        </Link>
      </p>
    </div>
  );
}
