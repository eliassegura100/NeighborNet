export default function SignupPage() {
    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>Sign Up for NeighborNet</h1>
            <form style={{ display: "inline-block", marginTop: "1rem" }}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" required />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}