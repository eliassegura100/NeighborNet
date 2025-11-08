import { UseState } from "react";
import { UseNavigate, Link } from "react-router-dom";
import {signInWithEmailAndPassword} from "firebase/auth";
import { auth } from "../src/firebase/auth";

export default function LoginPage() {
    const navigate = UseNavigate();
    const [email, setEmail] = UseState("");
    const [password, setPassword] = UseState("");
    const [error, setError] = UseState("");
    const [loading, setLoading] = UseState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            setError("Failed to log in. Please check your credentials and try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
            <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>Login to NeighborNet</h1>
            { error && (
                <div 
                    style={{
                        backgroundColor: "#ffe5e5",
                        color: "#b00020",
                        padding: "0.75rem",
                        marginBottom: "1rem",
                        borderRadius: "0.5rem",
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Email:
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

                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Password:
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
                        backgroundColor: "#2563eb",
                        color: "white",
                        fontWeight: "bold",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <p style={{ marginTop: "1rem", textAlign: "center" }}>
                Don't have an account? {" "}
                <Link to="/signup" style={{ color: "#2563eb" }}>
                   Register
                </Link>
            </p>
        </div>
    );
}