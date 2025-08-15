import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = true }) => {
  return (
    <motion.div
      className={`glass-card p-6 ${hover ? 'neon-border' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { scale: 1.02 } : {}}
    >
      {children}
    </motion.div>
  );
};
