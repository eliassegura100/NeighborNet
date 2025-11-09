
export default function HomePage() {
  return (
    <div style={{ textAlign: "center", padding: "2rem 0" }}>
      <h1 style={{ fontSize: "2.25rem", color: "#14532d", marginBottom: "1rem" }}>
        Welcome to NeighborNet
      </h1>
      <p style={{ fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
        A community-powered platform to connect neighbors who need a helping hand
        with those who are happy to assist. Create requests, volunteer, and make
        an impact — one connection at a time.
      </p>
      <img
        src="https://via.placeholder.com/600x250.png?text=Community+Help+Illustration"
        alt="Community help illustration"
        style={{
          width: "100%",
          maxWidth: "600px",
          marginTop: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
}
