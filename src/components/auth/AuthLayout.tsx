
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
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-lg">
							<span className="text-xl font-bold">C</span>
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

			</div>
		</div>
	);
};

export default AuthLayout;
