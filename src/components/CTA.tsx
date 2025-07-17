import React from 'react';
import { Link } from 'react-router-dom';

const CTA: React.FC = () => {
  return (
    <section className="cta-section">
      <h2 className="cta-title">Ready to Transform Your Decision-Making?</h2>
      <p className="cta-description">
        Join innovative teams already using ConsensusAI to make smarter, 
        faster, and more inclusive decisions.
      </p>
      <div className="cta-buttons">
        <Link to="/signup" className="primary-button">Get started for free <span className="arrow">→</span></Link>
        <Link to="/signin" className="secondary-button">Sign in</Link>
      </div>
      <p className="cta-note">No credit card required. Free plan includes all basic features.</p>
    </section>
  );
};

export default CTA; 