import { useState, useEffect } from 'react';
import './../styles/AIRecommendation.css';
import { FiStar, FiThumbsUp, FiBarChart2 } from 'react-icons/fi';

interface Recommendation {
  id: string;
  recommended_option_text: string;
  confidence_score: number;
  explanation: string;
  details: {
    support: number;
    criteria: number;
    sentiment: number;
    historical: number;
  };
}

// This component now receives the recommendation data directly as a prop.
const AIRecommendation = ({ recommendation }: { recommendation: Recommendation | null }) => {

  if (!recommendation) {
    return (
        <div className="ai-recommendation-card placeholder">
            <p>No recommendation available yet.</p>
        </div>
    );
  }

  return (
    <div className="ai-recommendation-card">
      <div className="card-header">
        <h3><FiStar className="header-icon" /> AI Recommendation</h3>
        <span className="confidence-badge">
          Confidence: {(recommendation.confidence_score * 100).toFixed(0)}%
        </span>
      </div>
      <div className="card-body">
        <div className="recommended-option">
          <h4>Recommended Choice</h4>
          <p>{recommendation.recommended_option_text}</p>
        </div>
        <div className="explanation">
          <h4>Explanation</h4>
          <p>{recommendation.explanation}</p>
        </div>
        <div className="details-grid">
          <div className="detail-item">
            <FiThumbsUp className="detail-icon" />
            <h5>Support Score</h5>
            <p>{(recommendation.details.support * 100).toFixed(0)}%</p>
          </div>
          <div className="detail-item">
            <FiBarChart2 className="detail-icon" />
            <h5>Criteria Alignment</h5>
            <p>{(recommendation.details.criteria * 100).toFixed(0)}%</p>
          </div>
          <div className="detail-item">
            <FiStar className="detail-icon" />
            <h5>Sentiment Score</h5>
            <p>{(recommendation.details.sentiment * 100).toFixed(0)}%</p>
          </div>
          {recommendation.details.historical !== null && (
            <div className="detail-item">
              <FiBarChart2 className="detail-icon" />
              <h5>Historical Success</h5>
              <p>{(recommendation.details.historical * 100).toFixed(0)}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendation; 