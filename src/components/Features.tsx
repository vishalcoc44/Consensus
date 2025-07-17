import React from 'react';
import ParallaxCard from './ParallaxCard';

const Features: React.FC = () => {
  return (
    <section className="features-section" id="features">
      <div className="section-tag">Features</div>
      <h2 className="section-title">Transform How Your Team Makes Decisions</h2>
      <p className="section-description">
        Our platform combines human intuition with artificial intelligence to create a 
        powerful decision-making ecosystem.
      </p>

      <div className="features-grid">
        <ParallaxCard>
          <div className="feature-card">
            <div className="feature-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Gather insights from all stakeholders in one centralized platform, ensuring every voice is heard.</h3>
          </div>
        </ParallaxCard>

        <ParallaxCard>
          <div className="feature-card">
            <div className="feature-icon purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.2 8.4c.5.38.8.97.8 1.6 0 1.1-.9 2-2 2H10a2 2 0 1 1 0-4h10a2 2 0 0 1 1.2.4"></path>
                <path d="M11 18a2 2 0 1 1 0-4h10a2 2 0 1 1 0 4H11z"></path>
                <path d="M20 12v4"></path>
                <path d="M12 12v4"></path>
                <path d="M7 16H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"></path>
              </svg>
            </div>
            <h3>Harness advanced algorithms to identify patterns, sentiment, and valuable insights from collected input.</h3>
          </div>
        </ParallaxCard>

        <ParallaxCard>
          <div className="feature-card">
            <div className="feature-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
            </div>
            <h3>Transform complex information into intuitive visualizations that make trends and insights immediately clear.</h3>
          </div>
        </ParallaxCard>

        <ParallaxCard>
          <div className="feature-card">
            <div className="feature-icon yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
              </svg>
            </div>
            <h3>Ethical Guardrails</h3>
            <p>Ensure decisions align with your organization's values and priorities through AI-driven ethical analysis.</p>
          </div>
        </ParallaxCard>

        <ParallaxCard>
          <div className="feature-card">
            <div className="feature-icon red">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <path d="M13 2v7h7"></path>
              </svg>
            </div>
            <h3>Streamline decision processes, saving time while improving quality through structured collaborative workflows.</h3>
          </div>
        </ParallaxCard>
      </div>
    </section>
  );
};

export default Features; 