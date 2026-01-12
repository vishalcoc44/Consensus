import { cn } from "@/lib/utils";
import React from "react";

interface ShimmerTextProps {
	children: React.ReactNode;
	className?: string;
	shimmerColor?: string;
}

const ShimmerText: React.FC<ShimmerTextProps> = ({
	children,
	className,
	shimmerColor = "rgba(255, 255, 255, 0.5)"
}) => {
	return (
		<span
			className={cn(
				"relative inline-block bg-clip-text text-transparent bg-[linear-gradient(110deg,#000000,45%,var(--shimmer-color),55%,#000000)] bg-[length:250%_100%] animate-shimmer dark:bg-[linear-gradient(110deg,#ffffff,45%,var(--shimmer-color),55%,#ffffff)]",
				className
			)}
			style={{
				"--shimmer-color": shimmerColor,
			} as React.CSSProperties}
		>
			{children}
		</span>
	);
};

export default ShimmerText;
