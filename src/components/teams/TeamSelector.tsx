import { ChevronDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeam } from "@/contexts/TeamContext";
import { Team } from "@/hooks/useTeams";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamSelectorProps {
	variant?: "compact" | "full";
	className?: string;
}

export function TeamSelector({ variant = "full", className }: TeamSelectorProps) {
	const { teams, currentTeam, setCurrentTeam, isLoading, isInitializing } = useTeam();

	// Show loading state
	if (isLoading || isInitializing) {
		return (
			<div className={cn(
				"flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 animate-pulse",
				variant === "compact" ? "justify-center" : "",
				className
			)}>
				<div className="h-6 w-6 rounded-full bg-muted" />
				{variant === "full" && <div className="h-4 w-20 rounded bg-muted" />}
			</div>
		);
	}

	// No teams available
	if (teams.length === 0) {
		return (
			<div className={cn(
				"flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 text-muted-foreground text-sm",
				className
			)}>
				<Users className="h-4 w-4" />
				{variant === "full" && <span>No teams</span>}
			</div>
		);
	}

	const handleSelectTeam = (team: Team) => {
		setCurrentTeam(team);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						"flex items-center gap-2 px-3 py-2 rounded-lg",
						"bg-muted/50 hover:bg-muted transition-colors",
						"border border-border/50 hover:border-border",
						"focus:outline-none focus:ring-2 focus:ring-primary/20",
						variant === "compact" ? "justify-center" : "",
						className
					)}
				>
					<Avatar className="h-6 w-6 border border-border">
						<AvatarImage src={currentTeam?.avatar_url || undefined} />
						<AvatarFallback className="bg-primary/10 text-primary text-xs">
							{currentTeam?.name?.charAt(0) || "T"}
						</AvatarFallback>
					</Avatar>

					{variant === "full" && (
						<>
							<span className="text-sm font-medium text-foreground truncate max-w-[120px]">
								{currentTeam?.name || "Select team"}
							</span>
							<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
						</>
					)}
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" className="w-56">
				{teams.map((team) => (
					<DropdownMenuItem
						key={team.id}
						onClick={() => handleSelectTeam(team)}
						className={cn(
							"flex items-center gap-3 cursor-pointer",
							currentTeam?.id === team.id && "bg-primary/10"
						)}
					>
						<Avatar className="h-8 w-8 border border-border">
							<AvatarImage src={team.avatar_url || undefined} />
							<AvatarFallback className="bg-primary/10 text-primary text-sm">
								{team.name.charAt(0)}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate">{team.name}</p>
							<p className="text-xs text-muted-foreground truncate">
								{team.member_count || 0} members
							</p>
						</div>
						{currentTeam?.id === team.id && (
							<div className="h-2 w-2 rounded-full bg-primary shrink-0" />
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default TeamSelector;
