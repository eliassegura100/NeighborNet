import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // The name goes in as signup metadata rather than a second write —
      // the handle_new_user trigger (0005) picks it up server-side and
      // creates the profiles row itself, so there's no two-step
      // "create auth user, then separately create a profile" to leave a
      // half-finished account if the second step fails.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;

      if (data.session) {
        // Email confirmation is off for this project — signUp already
        // signed them in, so there's somewhere to send them.
        navigate("/");
      } else {
        // Email confirmation is required — there's no session yet, so
        // sending them to "/" would just look like signup silently
        // failed. Tell them what's actually happening instead.
        setCheckEmail(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <div className="auth-page">
        <div className="card auth-card">
          <h1>Check your email</h1>
          <p style={{ textAlign: "center" }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to
            finish setting up your account, then log in.
          </p>
          <p className="auth-footer">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Create your account</h1>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-field-label">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <label className="form-field">
            <span className="form-field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="form-field">
            <span className="form-field-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}