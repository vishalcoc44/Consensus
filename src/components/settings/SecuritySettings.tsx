import React, { useState } from 'react';
import { FiLock, FiKey, FiSmartphone, FiLogIn } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

const SecuritySettings = () => {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [show2FAModal, setShow2FAModal] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [factorId, setFactorId] = useState('');

    const [showSessionsModal, setShowSessionsModal] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]);

    if (!supabase) {
        return <div>Loading...</div>;
    }

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            setMessage('Password must be at least 6 characters long.');
            return;
        }
        if (!supabase) return;

        setLoading(true);
        setMessage('');
        
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Password updated successfully!');
            setShowPasswordModal(false);
        }
        setNewPassword('');
        setLoading(false);
    };

    const handleEnable2FA = async () => {
        if (!supabase) return;
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
            return;
        }

        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
        setShow2FAModal(true);
    };

    const handleVerify2FA = async () => {
        if (!supabase) return;

        const { data, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
        if (challengeError) {
            setMessage(`Error: ${challengeError.message}`);
            return;
        }

        if (!data) {
            setMessage('Could not get challenge');
            return;
        }

        const challengeId = data.id;

        const { error } = await supabase.auth.mfa.verify({
            factorId,
            challengeId,
            code: verifyCode
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('2FA enabled successfully!');
            setShow2FAModal(false);
        }
    };

    const handleViewSessions = async () => {
        if (!supabase) return;
        const { data, error } = await supabase.auth.getSession();
        if (data.session) {
            // Supabase does not directly expose all sessions.
            // This is a simplified view showing only the current session.
            // For full session management, a backend with more control is needed.
            setSessions([data.session]); 
        }
        setShowSessionsModal(true);
    };

    const handleSignOutAll = async () => {
        if (!supabase) return;
        await supabase.auth.signOut({ scope: 'global' });
        setShowSessionsModal(false);
    };

  return (
    <div>
        <h2 className="settings-section-header with-icon"><FiLock /> Security Settings</h2>
        <p className="settings-section-subheader">Manage your account security settings</p>
      
        <div className="card-section">
            <div>
                <h3>Password</h3>
                <p>Update your password to keep your account secure</p>
            </div>
            <button className="secondary-button with-icon" onClick={() => setShowPasswordModal(true)}>
                <FiKey /> Change Password
            </button>
        </div>

        <div className="card-section">
            <div>
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account</p>
            </div>
            <button className="secondary-button with-icon" onClick={handleEnable2FA}><FiSmartphone /> Enable 2FA</button>
        </div>

        <div className="card-section">
            <div>
                <h3>Login Sessions</h3>
                <p>View and manage your active login sessions</p>
            </div>
            <button className="secondary-button with-icon" onClick={handleViewSessions}>
                <FiLogIn /> Manage Sessions
            </button>
        </div>

        {showPasswordModal && (
            <div className="modal-backdrop">
                <div className="modal">
                    <h3>Change Password</h3>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    {message && <p className="form-message">{message}</p>}
                    <div className="form-actions">
                        <button className="secondary-button" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                        <button className="save-button" onClick={handleChangePassword} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Password'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {show2FAModal && (
            <div className="modal-backdrop">
                <div className="modal">
                    <h3>Enable Two-Factor Authentication</h3>
                    <p>Scan the QR code with your authenticator app.</p>
                    <div className="qr-code" dangerouslySetInnerHTML={{ __html: qrCode }}></div>
                    <div className="form-group">
                        <label htmlFor="verifyCode">Verification Code</label>
                        <input
                            type="text"
                            id="verifyCode"
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                        />
                    </div>
                    {message && <p className="form-message">{message}</p>}
                    <div className="form-actions">
                        <button className="secondary-button" onClick={() => setShow2FAModal(false)}>Cancel</button>
                        <button className="save-button" onClick={handleVerify2FA} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {showSessionsModal && (
            <div className="modal-backdrop">
                <div className="modal">
                    <h3>Active Sessions</h3>
                    <div className="sessions-list">
                        {sessions.map(session => (
                            <div key={session.access_token} className="session-item">
                                <div>
                                    <p><strong>Last Accessed:</strong> {new Date(session.expires_at * 1000).toLocaleString()}</p>
                                    <p><strong>IP Address:</strong> {session.user?.last_sign_in_at}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="form-actions">
                        <button className="secondary-button" onClick={() => setShowSessionsModal(false)}>Close</button>
                        <button className="danger-button" onClick={handleSignOutAll}>Sign Out Everywhere</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default SecuritySettings; 