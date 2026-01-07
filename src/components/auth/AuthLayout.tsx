
import { GalleryVerticalEnd } from "lucide-react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
	children: React.ReactNode;
	imageSrc?: string;
	quote?: string;
	author?: string;
}

const AuthLayout = ({
	children,
	imageSrc = "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80",
	quote = "ConsensusAI has revolutionized how we make decisions as a team.",
	author = "Sofia Davis"
}: AuthLayoutProps) => {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link to="/" className="flex items-center gap-2 font-medium text-foreground">
						<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<GalleryVerticalEnd className="size-4" />
						</div>
						ConsensusAI
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						{children}
					</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<img
					src={imageSrc}
					alt="Authentication background"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
				<div className="absolute bottom-10 left-10 right-10 z-20">
					<div className="bg-background/80 backdrop-blur-sm p-6 rounded-xl border border-border shadow-lg">
						<blockquote className="space-y-2">
							<p className="text-lg text-foreground">
								&ldquo;{quote}&rdquo;
							</p>
							<footer className="text-sm text-muted-foreground">{author}</footer>
						</blockquote>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthLayout;
