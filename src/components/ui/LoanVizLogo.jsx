import { motion } from 'framer-motion';

const LoanVizLogo = ({ size = 'md', animated = true, className = '' }) => {
  // Size variants
  const sizeClasses = {
    xs: 'w-8 h-8', // Increased from w-6 h-6
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Animation variants
  const logoVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
      transition: { duration: 0.3 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Coin animation variants
  const coinVariants = {
    initial: { rotateY: 0 },
    animate: { rotateY: 360, transition: { duration: 2, repeat: Infinity, repeatDelay: 5 } }
  };

  // Wave animation variants
  const waveVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${className}`}
      variants={animated ? logoVariants : {}}
      initial={animated ? "initial" : false}
      animate={animated ? "animate" : false}
      whileHover={animated ? "hover" : false}
      whileTap={animated ? "tap" : false}
    >
      {/* Logo background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-lg shadow-lg"
        animate={animated ? {
          boxShadow: [
            '0 4px 6px rgba(59, 130, 246, 0.3)',
            '0 6px 10px rgba(59, 130, 246, 0.4)',
            '0 4px 6px rgba(59, 130, 246, 0.3)'
          ]
        } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Coin icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        variants={animated ? coinVariants : {}}
        initial={animated ? "initial" : false}
        animate={animated ? "animate" : false}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-2/3 h-2/3 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <motion.circle
            cx="12"
            cy="12"
            r="8"
            fill="none"
            stroke="currentColor"
            variants={animated ? waveVariants : {}}
            initial={animated ? "initial" : false}
            animate={animated ? "animate" : false}
          />
          <motion.path
            d="M12 6v12M8 10h8M8 14h8"
            stroke="currentColor"
            strokeLinecap="round"
            variants={animated ? waveVariants : {}}
            initial={animated ? "initial" : false}
            animate={animated ? "animate" : false}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default LoanVizLogo;
