import { Routes, Route, NavLink } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useAuth } from "./context/AuthContext";
import MyRequestsPage from "./pages/MyRequestsPage";
import BrowseRequestsPage from "./pages/BrowseRequestsPage";
import Nearby from "./pages/Nearby";
import Logo from "./components/Logo";
import "./styles/styles.css";

function navLinkClass({ isActive }) {
  return isActive ? "active" : undefined;
}

export default function App() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <div>
      <header className="navbar">
        <NavLink to="/" className="navbar-left" style={{ textDecoration: "none", color: "inherit" }}>
          <Logo />
          <span className="navbar-title">NeighborNet</span>
        </NavLink>

        <nav className="navbar-links">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          {user ? (
            <>
              <NavLink to="/my-requests" className={navLinkClass}>My Requests</NavLink>
              <NavLink to="/requests" className={navLinkClass}>Browse</NavLink>
              <NavLink to="/nearby" className={navLinkClass}>Map</NavLink>
              <button className="navbar-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              <NavLink to="/signup" className={navLinkClass}>Sign Up</NavLink>
            </>
          )}
        </nav>
      </header>

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
