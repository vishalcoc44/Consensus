import { motion } from 'framer-motion';
import React from 'react';

const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.4, duration: 0.25 } }}
        exit={{ opacity: 0, transition: { duration: 0.25 } }}
      >
        {children}
      </motion.div>

      {/* Curtain 1 */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: '#1a1a1a', // Slightly lighter carbon black
          transformOrigin: 'bottom',
          zIndex: 99,
        }}
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ scaleY: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
      />

      {/* Curtain 2 */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: '#0C0A00', // Carbon Black
          transformOrigin: 'bottom',
          zIndex: 100,
        }}
        initial={{ scaleY: 1 }}
        animate={{
          scaleY: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
        }}
        exit={{
          scaleY: 1,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
        }}
      />
    </>
  );
};

export default AnimatedPage; 