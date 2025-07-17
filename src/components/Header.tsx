import React from 'react';
import { Link } from 'react-router-dom';
import PublicLogo from './PublicLogo';

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="logo-container">
                <PublicLogo />
            </div>
            <nav className="navigation">
                <ul>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#about">About</a></li>
                </ul>
            </nav>
            <div className="auth-buttons">
                <Link to="/signin" className="login-button">Log in</Link>
                <Link to="/signup" className="signup-button">Sign up</Link>
            </div>
        </header>
    );
};

export default Header; 