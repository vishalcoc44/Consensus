import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Bell, CheckCheck, AlertCircle, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { formatDistanceToNow } from 'date-fns';
import ShimmerText from '@/components/ui/effects/ShimmerText';

interface Notification {
	id: string;
	user_id: string;
	title: string;
	message: string;
	link: string | null;
	type: string | null;
	is_read: boolean;
	created_at: string;
}

const Notifications = () => {
	const { user } = useUser();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all');

	useEffect(() => {
		if (!user) return;

		fetchNotifications();

		// Subscribe to real-time notifications
		const channel = supabase
			.channel('notifications')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'notifications',
					filter: `user_id=eq.${user.id}`,
				},
				() => {
					fetchNotifications();
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [user]);

	const fetchNotifications = async () => {
		if (!user) return;

		const { data, error } = await supabase
			.from('notifications')
			.select('*')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false });

		if (!error && data) {
			setNotifications(data);
		}
		setLoading(false);
	};

	const markAsRead = async (id: string) => {
		await supabase
			.from('notifications')
			.update({ is_read: true })
			.eq('id', id);

		setNotifications(prev =>
			prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
		);
	};

	const markAllAsRead = async () => {
		if (!user) return;

		await supabase
			.from('notifications')
			.update({ is_read: true })
			.eq('user_id', user.id)
			.eq('is_read', false);

		setNotifications(prev =>
			prev.map(n => ({ ...n, is_read: true }))
		);
	};

	const getIcon = (type: string | null) => {
		switch (type) {
			case 'proposal': return Calendar;
			case 'vote': return CheckCheck;
			case 'mention': return MessageSquare;
			default: return Bell;
		}
	};

	const getIconColor = (type: string | null) => {
		switch (type) {
			case 'proposal': return 'text-blue-500';
			case 'vote': return 'text-emerald-500';
			case 'mention': return 'text-purple-500';
			default: return 'text-gray-500';
		}
	};

	const filteredNotifications = notifications.filter(n => {
		if (filter === 'unread') return !n.is_read;
		if (filter === 'all') return true;
		return n.type === filter;
	});

	const unreadCount = notifications.filter(n => !n.is_read).length;

	return (
		<div className="space-y-8 max-w-4xl animate-in fade-in duration-500 pb-10">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
						<Bell className="h-8 w-8 text-primary" />
						<ShimmerText className="inline-block">Notifications</ShimmerText>
						{unreadCount > 0 && (
							<span className="px-3 py-1 text-sm font-semibold rounded-full bg-primary text-primary-foreground">
								{unreadCount}
							</span>
						)}
					</h1>
					<p className="text-muted-foreground">
						Stay updated on team decisions and activities
					</p>
				</div>
				{unreadCount > 0 && (
					<Button onClick={markAllAsRead} variant="outline" className="rounded-xl">
						<CheckCheck className="h-4 w-4 mr-2" />
						Mark all as read
					</Button>
				)}
			</div>

			<Tabs value={filter} onValueChange={setFilter} className="mb-6">
				<TabsList className="glass-panel rounded-xl">
					<TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
					<TabsTrigger value="unread" className="rounded-lg">
						Unread {unreadCount > 0 && `(${unreadCount})`}
					</TabsTrigger>
					<TabsTrigger value="proposal" className="rounded-lg">Proposals</TabsTrigger>
					<TabsTrigger value="vote" className="rounded-lg">Votes</TabsTrigger>
				</TabsList>
			</Tabs>

			<div className="space-y-3">
				{loading ? (
					<div className="text-center py-12 text-muted-foreground">
						<Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
						Loading notifications...
					</div>
				) : filteredNotifications.length === 0 ? (
					<div className="text-center py-12">
						<Bell className="h-16 w-16 mx-auto mb-4 opacity-20" />
						<h3 className="text-lg font-semibold mb-2">No notifications</h3>
						<p className="text-sm text-muted-foreground">
							{filter === 'unread' ? "You're all caught up!" : "You haven't received any notifications yet"}
						</p>
					</div>
				) : (
					filteredNotifications.map((notification) => {
						const Icon = getIcon(notification.type);
						const iconColor = getIconColor(notification.type);

						return (
							<div
								key={notification.id}
								className={`group relative rounded-xl overflow-hidden transition-all duration-200 ${notification.is_read ? 'opacity-60' : ''
									}`}
							>
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
								<div className="glass-panel p-4 rounded-xl border border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm relative">
									<div className="flex items-start gap-3">
										<div className={`p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50 ${iconColor}`}>
											<Icon className="h-5 w-5" />
										</div>
										<div className="flex-1 min-w-0">
											<h4 className="font-semibold mb-1">{notification.title}</h4>
											<p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
											<div className="flex items-center gap-4 text-xs text-muted-foreground">
												<span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
												{notification.link && (
													<a href={notification.link} className="text-primary hover:underline">
														View →
													</a>
												)}
											</div>
										</div>
										{!notification.is_read && (
											<Button
												size="sm"
												variant="ghost"
												onClick={() => markAsRead(notification.id)}
												className="rounded-lg shrink-0"
											>
												Mark read
											</Button>
										)}
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default Notifications;
