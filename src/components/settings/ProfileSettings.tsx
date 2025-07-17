import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ProfileSettings = () => {
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setFullName(session.user.user_metadata.full_name || '');
            }
        };
        fetchUser();
    }, []);

    const handleSaveChanges = async () => {
        if (!supabase) return;
        setLoading(true);
        setMessage('');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Update auth user metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            // Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user.id);

            if (authError || profileError) {
                const errorMessage = authError?.message || profileError?.message;
                setMessage(`Error: ${errorMessage}`);
            } else {
                setMessage('Profile updated successfully!');
            }
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="settings-section-header">Profile Information</h2>
            <p className="settings-section-subheader">Update your account profile information</p>
            <div className="avatar-section">
                <div className="avatar-placeholder">{fullName?.charAt(0).toUpperCase() || 'U'}</div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="fullName">Full Name</label>
                    <input 
                        type="text" 
                        id="fullName" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>
            </div>
            <div className="form-actions">
                {message && <div className="form-message">{message}</div>}
                <button 
                    className="save-button"
                    onClick={handleSaveChanges}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default ProfileSettings; 