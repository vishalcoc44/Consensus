import { useState } from 'react';
import { FiDownload, FiTrash2, FiFileText, FiShield } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

const PrivacySettings = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleDownloadData = async () => {
        if (!supabase) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch user profile
        const userProfile = {
            id: user.id,
            email: user.email,
            ...user.user_metadata
        };

        // This is a placeholder for fetching other user-related data.
        // You would expand this to fetch data from other tables like teams, decisions, etc.
        const userData = {
            profile: userProfile,
            // teams: [], 
            // decisions: [] 
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDeleteData = async () => {
        if (!supabase) return;
        setLoading(true);
        // This should call a Supabase Edge Function to delete all user data
        // and then delete the user.
        // const { error } = await supabase.rpc('delete_user_data');
        // For now, we just show a message.
        setMessage('This is a destructive action. The backend logic should be handled by a Supabase Edge Function.');
        setLoading(false);
    };

  return (
    <div>
      <h2 className="settings-section-header with-icon"><FiShield /> Privacy & Data</h2>
      <p className="settings-section-subheader">Manage your personal data and privacy preferences</p>
      
      <div className="card-section no-flex">
        <h3>Data Protection</h3>
        <p>Your data is encrypted end-to-end and protected according to our privacy policy. You have the right to access, export, or delete your personal data at any time.</p>
      </div>

      <div className="card-section">
        <div>
          <h3>Export your data</h3>
          <p>Download a copy of your personal data</p>
        </div>
        <button className="secondary-button with-icon" onClick={handleDownloadData}>
          <FiDownload /> Export
        </button>
      </div>

      <div className="card-section">
        <div>
          <h3 className="danger-text">Delete your data</h3>
          <p>Permanently remove your personal data from our systems</p>
        </div>
        <button className="danger-button with-icon" onClick={() => setShowDeleteModal(true)}>
          <FiTrash2 /> Delete Data
        </button>
      </div>

      <div className="card-section">
        <div>
          <h3>Privacy Policy</h3>
          <p>Our privacy policy explains how we collect, use, and protect your information.</p>
        </div>
        <button className="secondary-button with-icon">
            <FiFileText /> View Privacy Policy
        </button>
      </div>

      {showDeleteModal && (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Are you sure?</h3>
                <p>This action is irreversible. All your data will be permanently deleted.</p>
                {message && <p className="form-message">{message}</p>}
                <div className="form-actions">
                    <button className="secondary-button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                    <button className="danger-button" onClick={handleDeleteData} disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete My Data'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PrivacySettings; 