
import { useState, useEffect } from "react";
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
	ChevronLeft
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile, signOut } from "@/components/auth/services/authService";

interface NavItem {
	icon: React.ElementType;
	label: string;
	href: string;
	badge?: number;
	isActive?: boolean;
}

const mainMenuItems: NavItem[] = [
	{ icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
	{ icon: Users, label: "Teams", href: "/dashboard/teams" },
	{ icon: FileText, label: "Decisions", href: "/dashboard/decisions" },
	{ icon: BarChart, label: "Analytics", href: "/dashboard/analytics" },
	{ icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function AppSidebar() {
	const [collapsed, setCollapsed] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [profile, setProfile] = useState<{ fullName: string, email: string, avatarUrl: string } | null>(null);
	const [pendingInvitesCount, setPendingInvitesCount] = useState(0);

	const navigate = useNavigate();
	const location = useLocation();
	const currentPath = location.pathname;

	const handleNavigate = (href: string) => {
		navigate(href);
	};

	useEffect(() => {
		const fetchProfile = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (session) {
				const userProfile = await getUserProfile(session.user.id);

				// Fetch pending invites
				if (session.user.email) {
					const { count } = await supabase
						.from('team_invites')
						.select('*', { count: 'exact', head: true })
						.eq('email', session.user.email)
						.eq('status', 'pending');
					setPendingInvitesCount(count || 0);
				}

				setProfile({
					fullName: userProfile?.full_name || session.user.email?.split('@')[0] || "User",
					email: session.user.email || "",
					avatarUrl: userProfile?.avatar_url || ""
				});
			}
		};
		fetchProfile();

		// Auto collapse after a moment to show the interaction
		const timer = setTimeout(() => {
			setCollapsed(true);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	const handleSignOut = async (e: React.MouseEvent) => {
		e.stopPropagation();
		await signOut();
		navigate('/login');
	}

	// The sidebar is visually collapsed only if it's pinned closed AND not hovered
	const isDisplayCollapsed = collapsed && !isHovered;

	const NavItemComponent = ({ item }: { item: NavItem }) => {
		const isActive = item.href === currentPath || (item.href !== '/dashboard' && currentPath.startsWith(item.href));
		const Icon = item.icon;
		const badgeCount = item.label === 'Teams' ? pendingInvitesCount : item.badge;

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
						"transition-all duration-300",
						isDisplayCollapsed ? "absolute top-1 right-2" : "mr-3"
					)}>
						<Badge
							className="h-5 min-w-[1.25rem] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] p-0.5 px-1.5 shadow-sm"
						>
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
					<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-consensus-green to-consensus-teal shrink-0 shadow-md">
						<span className="text-white font-bold text-xl">C</span>
					</div>
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
			<nav className="flex-1 overflow-y-auto px-2 py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
							<AvatarImage src={profile?.avatarUrl} />
							<AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
								{profile?.fullName?.charAt(0) || "U"}
							</AvatarFallback>
						</Avatar>
					</div>

					<div className={cn(
						"flex-1 min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap pl-2",
						isDisplayCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
					)}>
						<p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
							{profile?.fullName || "Loading..."}
						</p>
						<p className="text-xs text-muted-foreground truncate">
							{profile?.email || ""}
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

