
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface AuthLayoutProps {
	children: React.ReactNode;
	imageSrc?: string;
	quote?: string;
	author?: string;
}

// Page transition variants
const pageVariants = {
	initial: {
		opacity: 0,
		x: -20,
	},
	in: {
		opacity: 1,
		x: 0,
	},
	out: {
		opacity: 0,
		x: 20,
	},
};

const pageTransition = {
	ease: [0.43, 0.13, 0.23, 0.96] as const,
	duration: 0.4,
};

const AuthLayout = ({
	children,
	imageSrc = "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80",
	quote = "ConsensusAI has revolutionized how we make decisions as a team.",
	author = "Sofia Davis"
}: AuthLayoutProps) => {
	return (
		<motion.div
			initial="initial"
			animate="in"
			exit="out"
			variants={pageVariants}
			transition={pageTransition}
			className="grid min-h-svh lg:grid-cols-2"
		>
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link to="/" className="flex items-center gap-2 font-medium text-foreground">
						<img src="/logo.png" alt="ConsensusAI Logo" className="h-10 w-10 rounded-lg object-cover" />
						ConsensusAI
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<motion.div
						className="w-full max-w-xs"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.4 }}
					>
						{children}
					</motion.div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block overflow-hidden">
				<motion.img
					src={imageSrc}
					alt="Authentication background"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
					initial={{ scale: 1.1, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
				/>
			</div>
		</motion.div>
	);
};

export default AuthLayout;

