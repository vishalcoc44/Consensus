import React from "react";
import { motion, Variants } from "framer-motion";

interface StaggerContainerProps {
	children: React.ReactNode;
	className?: string;
	delay?: number;
}

const container: Variants = {
	hidden: { opacity: 0 },
	show: (delay: number = 0) => ({
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: delay,
		},
	}),
};

const item: Variants = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 260,
			damping: 20
		}
	},
};

export const StaggerItem = ({ children, className }: { children: React.ReactNode, className?: string }) => {
	return (
		<motion.div variants={item} className={className}>
			{children}
		</motion.div>
	);
};

const StaggerContainer = ({ children, className, delay = 0 }: StaggerContainerProps) => {
	return (
		<motion.div
			variants={container}
			initial="hidden"
			animate="show"
			custom={delay}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export default StaggerContainer;
