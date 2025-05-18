import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaInfoCircle } from 'react-icons/fa';

/**
 * RegulatoryDisclaimer component for displaying regulatory disclaimers with dynamic date stamp
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.variant] - Variant style ('primary', 'secondary', 'subtle')
 * @param {boolean} [props.showIcon] - Whether to show the info icon
 * @param {boolean} [props.animate] - Whether to animate the component
 * @returns {JSX.Element} Regulatory disclaimer component
 */
const RegulatoryDisclaimer = ({
  className = '',
  variant = 'subtle',
  showIcon = true,
  animate = true
}) => {
  // State for build date
  const [buildDate, setBuildDate] = useState('');

  // Get the build date on component mount
  useEffect(() => {
    // Try to get the build date from the environment variable
    // If not available, use the current date
    const envBuildDate = import.meta.env.VITE_BUILD_DATE;

    if (envBuildDate) {
      setBuildDate(envBuildDate);
    } else {
      // Format current date as YYYY-MM-DD
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setBuildDate(formattedDate);
    }
  }, []);

  // Determine variant styles
  const variantStyles = {
    primary: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    secondary: 'bg-gray-50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    subtle: 'bg-gray-50/50 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800/50'
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      className={`regulatory-disclaimer border rounded-md p-3 text-xs sm:text-sm ${variantStyles[variant]} ${className}`}
      initial={animate ? 'hidden' : 'visible'}
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-start">
        {showIcon && (
          <FaInfoCircle className="flex-shrink-0 h-4 w-4 mr-2 mt-0.5 text-blue-500 dark:text-blue-400" />
        )}
        <div>
          <p>
            All calculations are estimates. For binding quotes, consult a qualified financial advisor.
            Rates accurate as of <span className="font-semibold">{buildDate}</span>.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RegulatoryDisclaimer;
