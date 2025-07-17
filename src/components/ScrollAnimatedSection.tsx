import { motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useInView } from 'framer-motion';

interface Props {
    children: React.ReactNode;
    className?: string;
}

const ScrollAnimatedSection = ({ children, className }: Props) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.2 });

    return (
        <motion.div
            ref={ref}
            className={className}
            style={{
                transform: isInView ? "none" : "translateY(100px)",
                opacity: isInView ? 1 : 0,
                transition: "all 1.2s cubic-bezier(0.165, 0.84, 0.44, 1)"
            }}
        >
            {children}
        </motion.div>
    );
};

export default ScrollAnimatedSection; 