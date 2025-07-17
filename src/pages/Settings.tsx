import { useState } from 'react';
import '../styles/Settings.css';
import ProfileSettings from '../components/settings/ProfileSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import RecommendationSettings from '../components/settings/RecommendationSettings'; // Import the new component

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'security':
        return <SecuritySettings />;
      case 'ai-engine':
        return <RecommendationSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="settings-container">
      <h1 className="settings-header">Account Settings</h1>
      <div className="settings-tabs">
        <button 
            onClick={() => setActiveTab('profile')} 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
        >
            Profile
        </button>
        <button 
            onClick={() => setActiveTab('privacy')} 
            className={`tab-button ${activeTab === 'privacy' ? 'active' : ''}`}
        >
            Privacy & Data
        </button>
        <button 
            onClick={() => setActiveTab('security')} 
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
        >
            Security
        </button>
        <button 
            onClick={() => setActiveTab('ai-engine')} 
            className={`tab-button ${activeTab === 'ai-engine' ? 'active' : ''}`}
        >
            AI Engine
        </button>
      </div>
      <div className="settings-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings; 