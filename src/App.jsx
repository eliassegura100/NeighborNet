import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useAuth } from "./context/AuthContext";
import MyRequestsPage from "./pages/MyRequestsPage";
import BrowseRequestsPage from "./pages/BrowseRequestsPage";
import "./styles/styles.css";
import Nearby from "./pages/Nearby";


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
      {/* ✅ Green toolbar */}
      <header className="navbar">
        <div className="navbar-left">
          {/* Placeholder logo — replace URL later */}
          <img
            src="https://via.placeholder.com/40x40.png?text=N"
            alt="NeighborNet Logo"
            className="navbar-logo"
          />
          <span className="navbar-title">NeighborNet</span>
        </div>

        <nav className="navbar-links">
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/my-requests">My Requests</Link>
              <Link to="/requests">Browse</Link>
              <Link to="/nearby">Map</Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "white",
                  color: "#15803d",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.35rem 0.75rem",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </nav>
      </header>

      {/* ✅ Main content area with background card */}
      <main className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/my-requests" element={<MyRequestsPage />} />
          <Route path="/requests" element={<BrowseRequestsPage />} />
          <Route path="/nearby" element={<Nearby />} />
        </Routes>
      </main>
    </div>
  );
}