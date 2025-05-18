import { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

/* Glass card with customizable visual effects and animations.
 * Supports theming, collapsible content, and various border styles.
 * For header actions, use headerRight instead of the deprecated headerAction.
 */
const GlassCard = forwardRef(({
  children,
  className = '',
  variant = 'default',
  effect = 'none',
  animate = true,
  interactive = true,
  blurStrength = 8,
  opacity = 90,
  borderStyle = 'thin',
  motionProps = {},
  title = null,
  titleClassName = '',
  icon = null,
  headerRight = null,
  headerAction = null, // Deprecated, use headerRight instead
  footer = null,
  collapsible = false,
  defaultCollapsed = false,
  ...props
}, ref) => {
  const { isDarkMode } = useTheme();

  // Local state for theme tracking
  const [localIsDarkMode, setLocalIsDarkMode] = useState(isDarkMode);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Sync with theme context
  useEffect(() => {
    setLocalIsDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Fallback: watch for theme changes at document level
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newIsDarkMode = document.documentElement.classList.contains('dark');
          setLocalIsDarkMode(newIsDarkMode);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Theme-based gradient classes
  const getVariantClasses = () => {
    return localIsDarkMode
      ? 'from-gray-800/90 to-gray-900/90 border-gray-700/30'
      : 'from-white/90 to-white/80 border-white/20';
  };

  // Border style classes
  const getBorderClasses = () => {
    switch (borderStyle) {
      case 'none':
        return 'border-0';
      case 'thick':
        return 'border-2';
      case 'glow':
        return variant === 'default'
          ? 'border border-white/30 dark:border-gray-700/40 shadow-lg'
          : 'border shadow-lg';
      case 'thin':
      default:
        return 'border';
    }
  };

  // Visual effect classes
  const getEffectClasses = () => {
    switch (effect) {
      case 'glow':
        return 'shadow-glow dark:shadow-glow-dark';
      case 'neon':
        return 'animate-neon-pulse';
      case 'shimmer':
        return 'animate-shimmer';
      default:
        return '';
    }
  };

  // Framer Motion animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        duration: 0.4
      }
    },
    hover: interactive ? {
      scale: 1.01,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    } : {},
    tap: interactive ? {
      scale: 0.98,
      boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    } : {}
  };

  return (
    <motion.div
      ref={ref}
      className={`
        relative overflow-hidden rounded-xl
        bg-gradient-to-br ${getVariantClasses()}
        backdrop-blur-md ${getBorderClasses()} ${getEffectClasses()}
        shadow-lg
        ${className}
      `}
      style={{
        backdropFilter: `blur(${blurStrength}px)`,
        WebkitBackdropFilter: `blur(${blurStrength}px)`,
        backgroundColor: localIsDarkMode ? `rgba(31, 41, 55, ${opacity / 100})` : `rgba(255, 255, 255, ${opacity / 100})`,
      }}
      initial={animate ? "hidden" : "visible"}
      animate="visible"
      whileHover={interactive ? "hover" : undefined}
      whileTap={interactive ? "tap" : undefined}
      variants={cardVariants}
      {...motionProps}
      {...props}
    >
      <div className="card-body p-4 overflow-visible">
        {(title || headerRight || icon || collapsible) && (
          <div className="flex justify-between items-center card-title mb-2">
            <div className="flex items-center">
              {icon && (
                <motion.div
                  className="mr-1.5 text-blue-600 dark:text-indigo-400"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon}
                </motion.div>
              )}
              {title && (
                <h2 className={`text-base font-bold text-gray-800 dark:text-white ${titleClassName}`}>
                  {title}
                </h2>
              )}
            </div>
            <div className="flex items-center">
              {/* Header actions */}
              {(headerRight || headerAction) && (
                <div className="flex items-center mr-2">
                  {headerRight || headerAction}
                </div>
              )}
              {collapsible && (
                <motion.button
                  type="button"
                  className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={isCollapsed ? "Expand" : "Collapse"}
                >
                  {isCollapsed ? <FaChevronDown size={14} /> : <FaChevronUp size={14} />}
                </motion.button>
              )}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>

        {footer && !isCollapsed && (
          <div className="card-footer mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/30">
            {footer}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default GlassCard;
