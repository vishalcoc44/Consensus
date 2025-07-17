import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useRef } from 'react';

interface Props {
    children: React.ReactNode;
    className?: string;
}

const ParallaxCard = ({ children, className }: Props) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ['-35%', '35%']);

    return (
        <motion.div
            ref={ref}
            className={className}
            style={{ y }}
        >
            {children}
        </motion.div>
    );
};

export default ParallaxCard; 