
import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface Notification {
	id: string;
	title: string;
	message: string;
	link?: string;
	type: 'info' | 'success' | 'warning' | 'error' | 'vote' | 'comment' | 'proposal';
	is_read: boolean;
	created_at: string;
}

const NotificationBell = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();
	const { toast } = useToast();

	const fetchNotifications = async () => {
		try {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session) return;

			const { data, error } = await supabase
				.from('notifications')
				.select('*')
				.eq('user_id', session.user.id)
				.order('created_at', { ascending: false })
				.limit(20);

			if (error) throw error;

			setNotifications(data as Notification[]);
			setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
		} catch (error) {
			console.error('Error fetching notifications:', error);
		}
	};

	useEffect(() => {
		fetchNotifications();

		// Subscribe to new notifications
		const channel = supabase
			.channel('schema-db-changes')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'notifications',
				},
				(payload) => {
					// We only want notifications for the current user, but RLS might not filter subscription events automatically depending on setup.
					// Best to just re-fetch to be safe and accurate or filter by payload.new.user_id if we have current user ID.
					// For simplicity, just refetch.
					fetchNotifications();
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	const markAsRead = async (id: string, e?: React.MouseEvent) => {
		if (e) e.stopPropagation();

		// Optimistic update
		setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
		setUnreadCount(prev => Math.max(0, prev - 1));

		const { error } = await supabase
			.from('notifications')
			.update({ is_read: true })
			.eq('id', id);

		if (error) {
			console.error('Error marking as read:', error);
			// Revert if error? For now, silent fail is okayish for read status.
		}
	};

	const markAllRead = async () => {
		// Optimistic
		setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
		setUnreadCount(0);

		const { data: { session } } = await supabase.auth.getSession();
		if (!session) return;

		await supabase
			.from('notifications')
			.update({ is_read: true })
			.eq('user_id', session.user.id)
			.eq('is_read', false);
	};

	const handleNotificationClick = (notification: Notification) => {
		if (!notification.is_read) {
			markAsRead(notification.id);
		}
		if (notification.link) {
			setIsOpen(false);
			navigate(notification.link);
		}
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground">
					<Bell size={20} />
					{unreadCount > 0 && (
						<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/50">
				<DropdownMenuLabel className="p-4 flex items-center justify-between border-b border-border/50 bg-muted/20">
					<span className="font-semibold">Notifications</span>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="text-xs h-6 px-2 text-primary hover:text-primary/80"
							onClick={markAllRead}
						>
							Mark all read
						</Button>
					)}
				</DropdownMenuLabel>

				<ScrollArea className="h-[300px]">
					{notifications.length === 0 ? (
						<div className="p-8 text-center text-muted-foreground text-sm">
							<Bell className="mx-auto h-8 w-8 mb-2 opacity-20" />
							No notifications yet
						</div>
					) : (
						<div className="flex flex-col">
							{notifications.map((notification) => (
								<div
									key={notification.id}
									className={`relative p-4 border-b border-border/20 last:border-0 cursor-pointer transition-colors hover:bg-muted/30 ${!notification.is_read ? 'bg-primary/5' : ''
										}`}
									onClick={() => handleNotificationClick(notification)}
								>
									<div className="flex gap-3">
										<div className="mt-0.5">
											<div className={`h-2 w-2 rounded-full ${!notification.is_read ? 'bg-primary' : 'bg-transparent'}`} />
										</div>
										<div className="flex-1 space-y-1">
											<p className={`text-sm leading-none ${!notification.is_read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
												{notification.title}
											</p>
											<p className="text-xs text-muted-foreground line-clamp-2">
												{notification.message}
											</p>
											<p className="text-[10px] text-muted-foreground opacity-70 pt-1">
												{new Date(notification.created_at).toLocaleDateString()}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</ScrollArea>

				{notifications.length > 0 && (
					<div className="p-2 border-t border-border/50 bg-muted/20 text-center">
						<Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-7" disabled>
							View all history
						</Button>
					</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default NotificationBell;
