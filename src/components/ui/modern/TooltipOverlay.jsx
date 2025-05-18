import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * Modern TooltipOverlay component with advanced animations
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The element that triggers the tooltip
 * @param {React.ReactNode} props.content - The content of the tooltip
 * @param {string} props.position - Position of the tooltip ('top', 'bottom', 'left', 'right')
 * @param {number} props.delay - Delay before showing the tooltip in seconds
 * @param {string} props.className - Additional CSS classes for the container
 * @param {string} props.contentClassName - Additional CSS classes for the tooltip content
 * @returns {JSX.Element} Modern tooltip overlay component
 */
const TooltipOverlay = ({
  children,
  content,
  position = 'top',
  delay = 0.2,
  className = '',
  contentClassName = ''
}) => {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  // Track theme changes with local state
  const [localIsDarkMode, setLocalIsDarkMode] = useState(isDarkMode);

  // Update local dark mode state when theme context changes
  useEffect(() => {
    setLocalIsDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Also listen for theme changes at the document level as a fallback
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

  // Position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-3',
  };

  // Arrow classes
  const arrowClasses = {
    top: 'border-t-primary border-l-transparent border-r-transparent border-b-transparent top-full left-1/2 transform -translate-x-1/2',
    bottom: 'border-b-primary border-l-transparent border-r-transparent border-t-transparent bottom-full left-1/2 transform -translate-x-1/2',
    left: 'border-l-primary border-t-transparent border-b-transparent border-r-transparent left-full top-1/2 transform -translate-y-1/2',
    right: 'border-r-primary border-t-transparent border-b-transparent border-l-transparent right-full top-1/2 transform -translate-y-1/2',
  };

  // Ensure tooltip stays within viewport
  const ensureInViewport = (position) => {
    if (position === 'top') {
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-3 max-w-[200px]';
    }
    return positionClasses[position];
  };

  // Animation variants based on position
  const getAnimationVariants = (pos) => {
    const directions = {
      top: { y: 10 },
      bottom: { y: -10 },
      left: { x: 10 },
      right: { x: -10 }
    };

    return {
      hidden: {
        opacity: 0,
        scale: 0.8,
        ...directions[pos],
        transition: { duration: 0.15 }
      },
      visible: {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 15,
          duration: 0.3
        }
      }
    };
  };

  // Get the animation variants for the current position
  const tooltipVariants = getAnimationVariants(position);

  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
    setTimeoutId(id);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      <div className="inline-flex items-center cursor-help">
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute z-50 px-4 py-3 text-sm font-medium text-white
              ${localIsDarkMode ? 'bg-indigo-600' : 'bg-blue-600'}
              backdrop-blur-sm rounded-lg shadow-lg max-w-xs border border-white/10
              ${ensureInViewport(position)} ${contentClassName}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={tooltipVariants}
            style={{
              boxShadow: localIsDarkMode
                ? '0 4px 15px rgba(99, 102, 241, 0.3)'
                : '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
          >
            {content}
            <div className={`absolute w-0 h-0 border-5 ${arrowClasses[position]}`}></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TooltipOverlay;
