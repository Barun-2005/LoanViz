import { motion } from 'framer-motion';
import LoanVizLogo from './LoanVizLogo';

const LoanVizBrand = ({ size = 'md', animated = true, className = '', collapsed = false }) => {
  // Size variants for the container
  const containerSizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
  };

  // Size variants for the text
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    },
    collapsed: {
      opacity: 0,
      x: -10,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className={`flex items-center gap-2 ${containerSizeClasses[size]} ${className}`}
      variants={animated ? containerVariants : {}}
      initial={animated ? "initial" : false}
      animate={animated ? "animate" : false}
    >
      <LoanVizLogo size={collapsed ? 'xs' : size} animated={animated} className={collapsed ? "mx-auto" : ""} />

      {!collapsed && (
        <motion.div
          className="flex flex-col justify-center overflow-hidden"
          variants={animated ? textVariants : {}}
          animate={collapsed ? "collapsed" : "animate"}
        >
          <motion.h1
            className={`font-bold ${textSizeClasses[size]} bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 whitespace-nowrap`}
            variants={animated ? {
              initial: { opacity: 0, x: -10 },
              animate: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.5, delay: 0.2 }
              },
              collapsed: {
                opacity: 0,
                x: -10,
                transition: { duration: 0.3 }
              }
            } : {}}
          >
            LoanViz
          </motion.h1>

          {size === 'lg' || size === 'xl' ? (
            <motion.p
              className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap"
              variants={animated ? {
                initial: { opacity: 0 },
                animate: {
                  opacity: 1,
                  transition: { duration: 0.5, delay: 0.4 }
                },
                collapsed: {
                  opacity: 0,
                  transition: { duration: 0.3 }
                }
              } : {}}
            >
              Financial Calculator Suite
            </motion.p>
          ) : null}
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoanVizBrand;
