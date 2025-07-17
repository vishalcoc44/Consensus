import React from 'react';

const Testimonials: React.FC = () => {
  return (
    <section className="testimonials-section">
      <div className="section-tag">Testimonials</div>
      <h2 className="section-title">Trusted by Forward-Thinking Teams</h2>
      <p className="section-description">
        See how organizations like yours are transforming their decision-making 
        processes with ConsensusAI.
      </p>

      <div className="testimonials-grid">
        <div className="testimonial-card">
          <div className="quote-mark">"</div>
          <p className="testimonial-text">
            ConsensusAI has transformed our executive decision-making process. 
            We're making faster, more informed decisions with better outcomes.
          </p>
        </div>

        <div className="testimonial-card">
          <div className="quote-mark">"</div>
          <p className="testimonial-text">
            The ethical analysis feature ensures our decisions align with our company values. 
            This has been a game-changer for our leadership team.
          </p>
        </div>

        <div className="testimonial-card">
          <div className="quote-mark">"</div>
          <p className="testimonial-text">
            As a non-profit, inclusive decision-making is core to our mission. 
            ConsensusAI has helped us gather input from all stakeholders efficiently.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 