import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-tag">Revolutionizing Decision-Making</div>
      <h1 className="hero-title">
        Make Better Decisions with <span className="highlight">Collective Intelligence</span>
      </h1>
      <p className="hero-description">
        ConsensusAI combines human wisdom and artificial intelligence to 
        help teams make smarter, faster, and more inclusive decisions.
      </p>
      <div className="hero-buttons">
        <Link to="/signup" className="primary-button">Start for free <span className="arrow">→</span></Link>
        <button className="secondary-button">See how it works</button>
      </div>
    </section>
  );
};

export default Hero; 