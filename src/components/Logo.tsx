import React from 'react';
import { useSidebar } from './ui/sidebar'; // Assuming sidebar context is in this path
import { motion } from 'framer-motion';

const Logo = () => {
    const { open } = useSidebar();
    return (
        <a href="/" className="logo-container">
            <div className="logo-icon-div">
                C
            </div>
            <motion.span
                animate={{
                    display: open ? 'inline-block' : 'none',
                    opacity: open ? 1 : 0,
                }}
                className="logo-text"
            >
                Consensus
            </motion.span>
        </a>
    );
};

export default Logo; 