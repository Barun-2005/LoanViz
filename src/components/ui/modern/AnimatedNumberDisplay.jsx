import { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLocale } from '../../../contexts/LocaleContext';

/**
 * Modern AnimatedNumberDisplay component with advanced animations
 * @param {Object} props - Component props
 * @param {number} props.value - The number to display
 * @param {string} props.prefix - Prefix to display before the number
 * @param {string} props.suffix - Suffix to display after the number
 * @param {number} props.decimals - Number of decimal places to display
 * @param {string} props.size - Size of the number ('xs', 'sm', 'md', 'lg', 'xl', 'xxl')
 * @param {string} props.color - Color of the number
 * @param {string} props.effect - Visual effect ('none', 'glow', 'shimmer', 'gradient')
 * @param {boolean} props.animate - Whether to animate the number
 * @param {boolean} props.separateDigits - Whether to animate each digit separately
 * @param {string} props.easing - Easing function for the animation
 * @param {boolean} props.highlightChange - Whether to highlight the number when it changes
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Modern animated number display component
 */
const AnimatedNumberDisplay = ({
  value = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  size = 'md',
  color = 'text-gray-800 dark:text-white',
  effect = 'none',
  animate = true,
  separateDigits = false,
  easing = 'easeOut',
  highlightChange = false,
  className = '',
  useCurrencySymbol = false,
}) => {
  const { isDarkMode } = useTheme();
  const {
    currentLocale,
    formatNumber: formatLocaleNumber,
    formatCompactNumber: formatLocaleCompactNumber
  } = useLocale();

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
  const [digits, setDigits] = useState([]);
  const [key, setKey] = useState(0);
  const [valueChanged, setValueChanged] = useState(false);
  const previousValue = useRef(value);
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: 0.8,
    ease: easing
  });

  // Use currency symbol from locale if requested
  const displayPrefix = useCurrencySymbol ? currentLocale.currency : prefix;

  const [displayValue, setDisplayValue] = useState(formatNumber(value, decimals));
  const [isClient, setIsClient] = useState(false);

  // Size classes
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    xxl: 'text-2xl',
  };

  // Format number with commas and decimals
  function formatNumber(num, dec) {
    if (num === undefined || num === null || isNaN(num)) return '0';

    // Ensure num is a number
    num = parseFloat(num) || 0;

    try {
      return formatLocaleNumber(num, {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec
      });
    } catch (error) {
      console.error('Error formatting number in AnimatedNumberDisplay:', error);
      // Fallback formatting
      return num.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }

  // Get effect classes
  const getEffectClasses = () => {
    switch (effect) {
      case 'glow':
        return localIsDarkMode ? 'text-shadow-glow-light' : 'text-shadow-glow';
      case 'shimmer':
        return 'animate-shimmer-text';
      case 'gradient':
        return `bg-clip-text text-transparent bg-gradient-to-r ${
          localIsDarkMode
            ? 'from-indigo-200 to-blue-200'
            : 'from-blue-600 to-indigo-600'
        }`;
      default:
        return '';
    }
  };

  // Set up client-side rendering check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update display value when spring value changes
  useEffect(() => {
    if (!animate || separateDigits) return;

    const unsubscribe = springValue.on("change", latest => {
      setDisplayValue(formatNumber(latest, decimals));
    });

    return unsubscribe;
  }, [springValue, decimals, animate, separateDigits]);

  // Handle value changes
  useEffect(() => {
    // Enhanced debug log to see what values are being received
    console.log('AnimatedNumberDisplay value:', {
      value,
      valueType: typeof value,
      previousValue: previousValue.current,
      displayPrefix,
      useCurrencySymbol,
      currentLocale,
      key: `${Date.now()}-${value}` // Log the key being used
    });

    // Always update on first render or when value changes
    const isFirstRender = previousValue.current === undefined;

    // Force update for separate digits animation regardless of previous value
    // This ensures the component always updates when the parent re-renders
    const shouldForceUpdate = separateDigits;

    if (isFirstRender || value !== previousValue.current || shouldForceUpdate) {
      if (highlightChange && !isFirstRender) {
        setValueChanged(true);
        setTimeout(() => setValueChanged(false), 1500);
      }

      if (animate) {
        if (separateDigits) {
          // For separate digits animation, we need to split the number
          const formattedValue = formatNumber(value, decimals);
          console.log('Formatted value for digits:', formattedValue);
          setDigits(formattedValue.split(''));
          // Force re-render with a timestamp and value-based key
          // Use both timestamp and value to ensure uniqueness
          setKey(`${Date.now()}-${value}`);
        } else {
          // Standard animation - start from current value
          if (!isFirstRender && previousValue.current !== 0) {
            motionValue.set(previousValue.current);
          } else {
            // If it's the first time, start from 0
            motionValue.set(0);
          }
          springValue.set(value);
        }
      } else {
        // No animation, just set the value directly
        motionValue.set(value);
      }

      previousValue.current = value;
    }
  }, [value, animate, separateDigits, highlightChange, motionValue, springValue, decimals, displayPrefix, useCurrencySymbol, currentLocale]);

  // If not in browser, render a static version
  if (!isClient) {
    return (
      <span className={`font-semibold ${sizeClasses[size]} ${color} ${className}`}>
        {displayPrefix}{formatNumber(value, decimals)}{suffix}
      </span>
    );
  }

  // Render with separate digits animation
  if (separateDigits) {
    return (
      <span className={`font-semibold ${sizeClasses[size]} ${color} ${className} ${getEffectClasses()} inline-flex items-center`}>
        {displayPrefix && (
          <motion.span
            animate={{
              y: [0, -3, 0],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="mr-0.5"
          >
            {displayPrefix}
          </motion.span>
        )}
        <span className="inline-flex">
          {digits.map((digit, index) => (
            <motion.span
              key={`${key}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05, // Stagger effect
                ease: [0.16, 1, 0.3, 1] // easeOutExpo
              }}
              className={valueChanged ? 'animate-bounce-subtle' : ''}
            >
              {digit}
            </motion.span>
          ))}
        </span>
        {suffix && <span className="ml-0.5">{suffix}</span>}
      </span>
    );
  }

  // Standard animation render
  return (
    <AnimatePresence mode="wait">
      <motion.span
        className={`font-semibold ${sizeClasses[size]} ${color} ${className} ${getEffectClasses()} inline-flex items-center`}
        animate={valueChanged ? {
          scale: [1, 1.15, 1],
          textShadow: [
            "0 0 0px rgba(59, 130, 246, 0)",
            "0 0 10px rgba(59, 130, 246, 0.7)",
            "0 0 15px rgba(59, 130, 246, 0.5)",
            "0 0 8px rgba(59, 130, 246, 0.3)",
            "0 0 0px rgba(59, 130, 246, 0)"
          ]
        } : {}}
        transition={{
          duration: 1.2,
          times: [0, 0.2, 0.5, 0.8, 1],
          ease: "easeInOut"
        }}
      >
        {displayPrefix && (
          <motion.span
            animate={{
              y: [0, -2, 0],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="mr-0.5"
          >
            {displayPrefix}
          </motion.span>
        )}
        <span>{displayValue}</span>
        {suffix && <span className="ml-0.5">{suffix}</span>}
      </motion.span>
    </AnimatePresence>
  );
};

export default AnimatedNumberDisplay;
