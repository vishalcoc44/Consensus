import React from 'react';
import PublicLogo from './PublicLogo';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-logo">
                    <PublicLogo />
                    <p className="footer-tagline">
                        Revolutionizing how organizations make decisions through collaborative intelligence.
                    </p>
                </div>
                <div className="footer-links">
                    <div className="footer-column">
                        <h3>Product</h3>
                        <ul>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                            <li><a href="#">Integrations</a></li>
                            <li><a href="#">API</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>Company</h3>
                        <ul>
                            <li><a href="#about">About us</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>Resources</h3>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Documentation</a></li>
                            <li><a href="#">Security</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p className="copyright">&copy; {new Date().getFullYear()} Consensus. All rights reserved.</p>
                <div className="social-links">
                    <a href="#" className="social-link">Twitter</a>
                    <a href="#" className="social-link">LinkedIn</a>
                    <a href="#" className="social-link">GitHub</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 