import React from 'react';
import { motion } from 'framer-motion';
import { 
  fadeInUp, 
  fadeInDown, 
  scaleIn, 
  cardHover, 
  iconRotate, 
  buttonTap,
  listItem,
  modalAnimation,
  gradientAnimation
} from '../utils/animations';

export const AnimatedPage = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const AnimatedCard = ({ children, className = "" }) => (
  <motion.div
    variants={scaleIn}
    whileHover={cardHover.hover}
    transition={cardHover.transition}
    className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}
  >
    {children}
  </motion.div>
);

export const AnimatedButton = ({ children, className = "", ...props }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={buttonTap.tap}
    className={`btn ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

export const AnimatedIcon = ({ icon, className = "" }) => (
  <motion.div
    whileHover={iconRotate.hover}
    transition={iconRotate.transition}
    className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 
    flex items-center justify-center shadow-lg ${className}`}
  >
    <span className="text-2xl">{icon}</span>
  </motion.div>
);

export const AnimatedListItem = ({ children, className = "" }) => (
  <motion.li
    variants={listItem}
    className={`flex items-start ${className}`}
  >
    {children}
  </motion.li>
);

export const AnimatedModal = ({ children, className = "" }) => (
  <motion.div
    variants={modalAnimation}
    initial="initial"
    animate="animate"
    exit="exit"
    className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
  >
    <motion.div
      variants={modalAnimation}
      className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-4"
    >
      {children}
    </motion.div>
  </motion.div>
);

export const AnimatedGradientText = ({ children, className = "" }) => (
  <motion.span
    variants={gradientAnimation}
    initial="initial"
    animate="animate"
    className={`bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600 
    bg-[length:200%_200%] ${className}`}
  >
    {children}
  </motion.span>
);

export const AnimatedSection = ({ children, className = "", delay = 0 }) => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    transition={{ delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const AnimatedHeading = ({ children, className = "" }) => (
  <motion.h2
    variants={fadeInDown}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    className={`text-3xl font-semibold text-gray-900 mb-8 text-center ${className}`}
  >
    {children}
  </motion.h2>
);

export const AnimatedInput = ({ className = "", ...props }) => (
  <motion.input
    whileFocus={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className={`input ${className}`}
    {...props}
  />
);

export const AnimatedSelect = ({ children, className = "", ...props }) => (
  <motion.select
    whileFocus={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className={`input ${className}`}
    {...props}
  >
    {children}
  </motion.select>
); 