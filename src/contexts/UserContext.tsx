
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/components/auth/services/authService';

interface UserProfile {
	id: string;
	full_name: string | null;
	avatar_url: string | null;
	email?: string;
}

interface UserContextType {
	user: UserProfile | null;
	loading: boolean;
	refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchProfile = async () => {
		try {
			const { data: { session } } = await supabase.auth.getSession();

			if (!session) {
				setUser(null);
				setLoading(false);
				return;
			}

			// Optimistic set from session while we fetch full profile
			// This prevents "flicker" of empty state if we have at least session data
			if (!user) {
				setUser({
					id: session.user.id,
					email: session.user.email,
					full_name: session.user.user_metadata?.full_name || null,
					avatar_url: session.user.user_metadata?.avatar_url || null
				});
			}

			const profileData = await getUserProfile(session.user.id);

			if (profileData) {
				setUser({
					...profileData,
					email: session.user.email
				});
			} else {
				// Fallback or just session data
				setUser({
					id: session.user.id,
					full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
					avatar_url: null,
					email: session.user.email
				});
			}
		} catch (error) {
			console.error('Error in UserProvider:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProfile();

		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_IN') {
				fetchProfile();
			} else if (event === 'SIGNED_OUT') {
				setUser(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return (
		<UserContext.Provider value={{ user, loading, refreshProfile: fetchProfile }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};
