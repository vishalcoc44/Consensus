import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// Use HTMLMotionProps<"div"> directly
interface MotionCardProps extends HTMLMotionProps<"div"> {
	children: React.ReactNode;
	delay?: number;
	glass?: boolean;
}

const MotionCard = ({
	children,
	className,
	delay = 0,
	glass = true,
	...props
}: MotionCardProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{
				y: -5,
				scale: 1.02,
				transition: { duration: 0.2 }
			}}
			transition={{
				duration: 0.4,
				delay: delay,
				ease: "easeOut"
			}}
			className={cn(
				"rounded-xl border p-6 shadow-sm transition-all",
				glass ? "glass-panel" : "bg-card text-card-foreground",
				className
			)}
			{...props as any}
		>
			{children}
		</motion.div>
	);
};

export default MotionCard;
