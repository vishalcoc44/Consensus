
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
	LayoutGrid,
	Users,
	FileText,
	BarChart,
	Settings,
	LogOut,
	ChevronRight,
	ChevronLeft,
	Clipboard,
	Bell,
	FolderOpen,
	Brain,
	Calendar,
	Target,
	Video,
	Activity
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { signOut } from "@/components/auth/services/authService";
import { useUser } from "@/contexts/UserContext";

interface NavItem {
	icon: React.ElementType;
	label: string;
	href: string;
	badge?: number;
	isActive?: boolean;
	isDivider?: boolean;
	category?: string;
}

const mainMenuItems: NavItem[] = [
	{ icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
	{ icon: Activity, label: "Activity Log", href: "/dashboard/activity" },
	{ isDivider: true, category: "DECISIONS", icon: FileText, label: "", href: "divider-decisions" },
	{ icon: FileText, label: "Decisions", href: "/dashboard/decisions" },
	{ icon: Clipboard, label: "Templates", href: "/dashboard/templates" },
	{ icon: Calendar, label: "Calendar", href: "/dashboard/calendar" },
	{ isDivider: true, category: "COLLABORATION", icon: Users, label: "", href: "divider-collaboration" },
	{ icon: Users, label: "Teams", href: "/dashboard/teams" },
	{ icon: Video, label: "Meeting Rooms", href: "/dashboard/meetings" },
	{ icon: FolderOpen, label: "Resources", href: "/dashboard/resources" },
	{ isDivider: true, category: "INTELLIGENCE", icon: BarChart, label: "", href: "divider-intelligence" },
	{ icon: BarChart, label: "Analytics", href: "/dashboard/analytics" },
	{ icon: Brain, label: "AI Insights", href: "/dashboard/ai-insights" },
	{ icon: Target, label: "Goals", href: "/dashboard/goals" },
	{ isDivider: true, category: "SYSTEM", icon: Settings, label: "", href: "divider-system" },
	{ icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
	{ icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function AppSidebar() {
	const [collapsed, setCollapsed] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const { user } = useUser();
	const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
	const navRef = useRef<HTMLElement>(null);

	const navigate = useNavigate();
	const location = useLocation();
	const currentPath = location.pathname;

	const handleNavigate = (href: string) => {
		// Save scroll position before navigating
		if (navRef.current) {
			sessionStorage.setItem('sidebar-scroll-position', navRef.current.scrollTop.toString());
		}
		navigate(href);
	};

	useEffect(() => {
		const fetchPendingInvites = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (session?.user?.email) {
				const { count } = await supabase
					.from('team_invites')
					.select('*', { count: 'exact', head: true })
					.eq('email', session.user.email)
					.eq('status', 'pending');
				setPendingInvitesCount(count || 0);
			}
		};
		fetchPendingInvites();

		// Auto collapse after a moment to show the interaction
		const timer = setTimeout(() => {
			setCollapsed(true);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	// Restore scroll position on mount
	useEffect(() => {
		const savedScrollPosition = sessionStorage.getItem('sidebar-scroll-position');
		if (savedScrollPosition && navRef.current) {
			// Small timeout to ensure DOM is ready
			setTimeout(() => {
				if (navRef.current) {
					navRef.current.scrollTop = parseInt(savedScrollPosition, 10);
				}
			}, 0);
		}
	}, []);

	const handleSignOut = async (e: React.MouseEvent) => {
		e.stopPropagation();
		await signOut();
		navigate('/login');
	}

	const [notificationCount, setNotificationCount] = useState(0);

	useEffect(() => {
		if (!user) return;

		const fetchNotificationCount = async () => {
			const { count } = await supabase
				.from('notifications')
				.select('*', { count: 'exact', head: true })
				.eq('user_id', user.id)
				.eq('is_read', false);
			setNotificationCount(count || 0);
		};

		fetchNotificationCount();

		// Subscribe to real-time notification changes to update badge
		const channel = supabase
			.channel('sidebar-notifications')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'notifications',
					filter: `user_id=eq.${user.id}`,
				},
				() => {
					fetchNotificationCount();
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [user]);

	// The sidebar is visually collapsed only if it's pinned closed AND not hovered
	const isDisplayCollapsed = collapsed && !isHovered;

	const NavItemComponent = ({ item }: { item: NavItem }) => {
		// Handle dividers
		if (item.isDivider) {
			return (
				<div className="my-4 first:mt-0">
					{!isDisplayCollapsed && item.category && (
						<h3 className="px-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-2 animate-fade-in whitespace-nowrap overflow-hidden">
							{item.category}
						</h3>
					)}
					{!isDisplayCollapsed && <hr className="border-border/50" />}
				</div>
			);
		}

		const isActive = item.href === currentPath || (item.href !== '/dashboard' && currentPath.startsWith(item.href));
		const Icon = item.icon;
		const badgeCount = item.label === 'Teams' ? pendingInvitesCount : (item.label === 'Notifications' ? notificationCount : item.badge);

		return (
			<button
				onClick={() => handleNavigate(item.href)}
				className={cn(
					"w-full flex items-center gap-0 px-0 py-2 rounded-lg transition-all duration-200 group relative justify-start",
					isActive
						? "bg-primary/10 text-primary font-medium"
						: "text-muted-foreground hover:bg-muted hover:text-primary",
				)}
				title={isDisplayCollapsed ? item.label : undefined}
			>
				<div className="w-16 flex items-center justify-center shrink-0">
					<Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
				</div>

				<span className={cn(
					"flex-1 text-left text-sm transition-all duration-300 overflow-hidden whitespace-nowrap pl-2",
					isDisplayCollapsed ? "w-0 opacity-0 min-w-0 hidden" : "w-auto opacity-100 min-w-auto block"
				)}>
					{item.label}
				</span>

				{(badgeCount || 0) > 0 && (
					<div className={cn(
						"transition-all duration-300 mr-2 shrink-0",
						isDisplayCollapsed ? "opacity-0 hidden" : "opacity-100 block"
					)}>
						<Badge variant="secondary" className="h-5 min-w-5 px-1.5 flex items-center justify-center text-xs">
							{badgeCount}
						</Badge>
					</div>
				)}
			</button>
		);
	};

	return (
		<aside
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				"flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out sticky top-0 z-20 shadow-xl",
				isDisplayCollapsed ? "w-[80px]" : "w-[260px]"
			)}
		>
			{/* Logo */}
			<div className={cn(
				"flex items-center gap-0 h-20 mb-2 transition-all duration-300 ease-in-out border-b border-border/50 px-2",
			)}>
				<div className="w-16 flex items-center justify-center shrink-0">
					<img src="/logo.png" alt="ConsensusAI Logo" className="w-10 h-10 rounded-xl object-cover" />
				</div>
				<div className={cn(
					"flex flex-col transition-all duration-300 overflow-hidden whitespace-nowrap",
					isDisplayCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
				)}>
					<span className="inline-block font-bold text-lg text-foreground tracking-tight pl-2">
						ConsensusAI
					</span>
				</div>
			</div>

			{/* Main Navigation */}
			<nav
				ref={navRef}
				onScroll={(e) => {
					// Save scroll position on scroll (throttled/debounced implicitly by event loop, but saving constantly is low cost enough here)
					const target = e.target as HTMLElement;
					sessionStorage.setItem('sidebar-scroll-position', target.scrollTop.toString());
				}}
				className="flex-1 overflow-y-auto px-2 py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
			>
				<div>
					{!isDisplayCollapsed && (
						<h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 animate-fade-in whitespace-nowrap overflow-hidden">
							Menu
						</h3>
					)}
					<div className="space-y-1">
						{mainMenuItems.map((item) => (
							<NavItemComponent key={item.href} item={item} />
						))}
					</div>
				</div>
			</nav>

			<button
				onClick={() => setCollapsed(!collapsed)}
				className="absolute -right-3 top-24 z-50 h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary shadow-sm md:flex hidden"
			>
				{collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
			</button>

			{/* User Profile */}
			<div className="border-t border-border p-2 mt-auto">
				<div
					onClick={() => handleNavigate('/dashboard/settings')}
					className={cn(
						"flex items-center gap-0 p-0 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group",
					)}
				>
					<div className="w-16 flex items-center justify-center shrink-0">
						<Avatar className="h-9 w-9 border border-border group-hover:border-primary/50 transition-colors">
							<AvatarImage src={user?.avatar_url || undefined} />
							<AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
								{user?.full_name?.charAt(0) || "U"}
							</AvatarFallback>
						</Avatar>
					</div>

					<div className={cn(
						"flex-1 min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap pl-2",
						isDisplayCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
					)}>
						<p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
							{user?.full_name || "Loading..."}
						</p>
						<p className="text-xs text-muted-foreground truncate">
							{user?.email || ""}
						</p>
					</div>
					{!isDisplayCollapsed && (
						<button
							onClick={handleSignOut}
							className="text-muted-foreground hover:text-destructive transition-colors p-1"
							title="Sign out"
						>
							<LogOut className="h-4 w-4" />
						</button>
					)}
				</div>
			</div>
		</aside>
	);
}
