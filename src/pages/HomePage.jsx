import { Link } from "react-router-dom";
import HeroArt from "../components/HeroArt";

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div>
          <div className="hero-eyebrow">
            <span className="pulse-dot" aria-hidden="true" />
            Live in your neighborhood
          </div>
          <h1>Someone nearby is ready to help.</h1>
          <p>
            NeighborNet connects people who need a hand, groceries, tech help,
            a dog walked, with neighbors who are happy to give one. Post what
            you need, or open the map and find someone close by to help today.
          </p>
          <div className="hero-actions">
            <Link to="/my-requests" className="btn btn-primary">Post a request</Link>
            <Link to="/nearby" className="btn btn-outline">Browse the map</Link>
          </div>
        </div>
        <div className="hero-art">
          <HeroArt />
        </div>
      </section>

      <section className="steps">
        <h2>How it works</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Ask</h3>
            <p>Post what you need help with, how urgent it is, and where. It takes under a minute.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Match</h3>
            <p>Nearby volunteers see your request on the map and can claim it if they're free to help.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Help</h3>
            <p>Your volunteer taps "On the way!" so you know help is coming, and who to expect.</p>
          </div>
        </div>
      </section>

      <section className="roles">
        <h2>Two ways to take part</h2>
        <div className="roles-grid">
          <div className="card role-card">
            <h3>Need a hand?</h3>
            <p>
              Post a request for anything that doesn't call for a police officer
              or firefighter, an errand, a ride, tech troubleshooting, tutoring,
              or company for a walk. Your neighbors will see it on the map.
            </p>
            <Link to="/my-requests" className="btn btn-primary btn-sm">Post a request</Link>
          </div>
          <div className="card role-card role-card--volunteer">
            <h3>Have some time to give?</h3>
            <p>
              Browse open requests near you, read what's needed, and claim the
              ones you can help with. One tap lets your neighbor know you're
              on the way.
            </p>
            <Link to="/requests" className="btn btn-accent btn-sm">Browse requests</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
