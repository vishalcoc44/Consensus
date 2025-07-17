import { useState } from 'react';
import { FiKey, FiSmartphone, FiLogIn } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }
    
    if (!supabase) {
      alert("Supabase client not initialized.");
      return;
    }

    // Note: Supabase password update typically requires the user to be logged in.
    // The commented out logic below is a starting point.
    // const { error } = await supabase.auth.updateUser({ password: newPassword });
    // if (error) {
    //   alert(`Error updating password: ${error.message}`);
    // } else {
    //   alert("Password updated successfully!");
    //   setCurrentPassword('');
    //   setNewPassword('');
    //   setConfirmNewPassword('');
    // }
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    // Here you would add the logic to actually enable/disable 2FA with Supabase
  };

  const handleDeactivateAccount = async () => {
    if (window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
      // Logic to deactivate account
      console.log("Deactivating account...");
      // Example:
      // const { data: { user } } = await supabase.auth.getUser();
      // if (user) {
      //   const { error } = await supabase.from('profiles').update({ status: 'deactivated' }).eq('id', user.id);
      //   if (error) {
      //     alert("Error deactivating account: " + error.message);
      //   } else {
      //     alert("Account deactivated.");
      //     await supabase.auth.signOut();
      //   }
      // }
    }
  };

  const handleSignOutFromAllDevices = async () => {
    if (window.confirm("Are you sure you want to sign out from all devices?")) {
        if (!supabase) {
            alert("Supabase client not initialized.");
            return;
        }
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        alert("Error signing out from all devices: " + error.message);
      } else {
        alert("Signed out from all devices successfully.");
      }
    }
  };


  return (
    <div className="security-settings">
      <h2>Security</h2>

      <form onSubmit={handlePasswordUpdate} className="password-update-form">
        <h3>Change Password</h3>
        <div className="form-group">
          <label htmlFor="current-password">Current Password</label>
          <input
            type="password"
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-new-password">Confirm New Password</label>
          <input
            type="password"
            id="confirm-new-password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-update-password">
          <FiKey /> Update Password
        </button>
      </form>

      <div className="two-factor-auth">
        <h3>Two-Factor Authentication</h3>
        <div className="form-group-toggle">
          <p>Protect your account with an extra layer of security.</p>
          <label className="switch">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={handleTwoFactorToggle}
            />
            <span className="slider round"></span>
          </label>
        </div>
        {twoFactorEnabled && (
          <div className="setup-2fa">
            <p>Scan this QR code with your authenticator app.</p>
            {/* QR Code would be generated and displayed here */}
            <FiSmartphone size={40} />
          </div>
        )}
      </div>

      <div className="account-actions">
        <h3>Account Actions</h3>
        <button onClick={handleSignOutFromAllDevices} className="btn-sign-out-all">
          <FiLogIn /> Sign Out From All Devices
        </button>
        <button onClick={handleDeactivateAccount} className="btn-deactivate">
          Deactivate Account
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings; 