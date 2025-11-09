import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useAuth } from "./context/AuthContext";


export default function App() {
  const { user, loading, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <div>
      {/* Very simple navbar */}
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          padding: "1rem",
          borderBottom: "1px solid #e5e7eb",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/">Home</Link>

          {/* If NO user is logged in, show Login & Signup */}
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>

        {/* If user IS logged in, show email + Logout button */}
        {user && (
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", opacity: 0.8, font:"15px Arial, sans-serif" }}>
              Signed in as <strong>{user.displayName}</strong>
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "0.5rem",
                border: "none",
                backgroundColor: "#ef4444",
                color: "white",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Routes stay the same */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* later: /onboarding, /my-requests, /requests, etc. */}
      </Routes>
    </div>
  );
}