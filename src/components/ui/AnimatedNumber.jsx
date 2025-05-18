import { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

/**
 * Enhanced AnimatedNumber component with advanced animations and effects
 * @param {Object} props - Component props
 * @param {number} props.value - The number value to display
 * @param {string} props.prefix - Prefix to display before the number (e.g., '£')
 * @param {string} props.suffix - Suffix to display after the number (e.g., '%')
 * @param {number} props.duration - Animation duration in seconds
 * @param {number} props.decimals - Number of decimal places to show
 * @param {boolean} props.animate - Whether to animate the number
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant ('sm', 'md', 'lg', 'xl', 'xxl')
 * @param {string} props.color - Text color class
 * @param {string} props.effect - Visual effect ('none', 'glow', 'pulse', 'gradient')
 * @param {boolean} props.highlightChange - Whether to highlight when value changes
 * @param {string} props.easing - Animation easing function ('spring', 'expo', 'bounce')
 * @param {boolean} props.separateDigits - Whether to animate each digit separately
 * @returns {JSX.Element} Enhanced animated number component
 */
const AnimatedNumber = ({
  value = 0,
  prefix = '',
  suffix = '',
  duration = 1.5,
  decimals = 0,
  animate = true,
  className = '',
  size = 'md',
  color = 'text-gray-900 dark:text-white',
  effect = 'none',
  highlightChange = false,
  easing = 'expo',
  separateDigits = false,
}) => {
  const previousValue = useRef(0);
  const [isClient, setIsClient] = useState(false);
  const [valueChanged, setValueChanged] = useState(false);
  const [digits, setDigits] = useState([]);
  const [key, setKey] = useState(0);

  // Format number with commas and decimal places
  const formatNumber = (num, decimalPlaces) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  };

  // Set up motion value with custom easing
  const motionValue = useMotionValue(previousValue.current);

  // Configure spring based on easing preference
  const springConfig = {
    spring: {
      stiffness: 100,
      damping: 30,
      mass: 1
    },
    expo: {
      duration: duration * 1000,
      ease: [0.16, 1, 0.3, 1] // Custom easeOutExpo curve
    },
    bounce: {
      type: "spring",
      stiffness: 200,
      damping: 10,
      mass: 0.5,
      velocity: 2
    }
  };

  const springValue = useSpring(motionValue, springConfig[easing]);

  // Transform the motion value to a formatted string
  const displayValue = useTransform(springValue, (latest) => {
    return formatNumber(latest, decimals);
  });

  // Size classes with added xxl size
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    xxl: 'text-4xl',
  };

  // Effect classes
  const getEffectClasses = () => {
    switch (effect) {
      case 'glow':
        return 'text-shadow-glow';
      case 'strong-glow':
        return 'text-shadow-strong-glow';
      case 'neon':
        return 'text-shadow-neon animate-pulse-subtle';
      case 'pulse':
        return 'animate-pulse-subtle';
      case 'gradient':
        return 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400';
      case 'shimmer':
        return 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-400 animate-shimmer bg-[length:200%_100%]';
      default:
        return '';
    }
  };

  // Update motion value when value changes
  useEffect(() => {
    // Log the value for debugging
    console.log("AnimatedNumber received value:", value);

    if (value !== previousValue.current) {
      if (highlightChange) {
        setValueChanged(true);
        setTimeout(() => setValueChanged(false), 1500);
      }

      if (animate) {
        if (separateDigits) {
          // For separate digits animation, we need to split the number
          const formattedValue = formatNumber(value, decimals);
          setDigits(formattedValue.split(''));
          setKey(prev => prev + 1); // Force re-render of digits
        } else {
          // Standard animation - start from current value
          if (previousValue.current !== 0) {
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
  }, [value, animate, motionValue, springValue, decimals, highlightChange, separateDigits]);

  // Check if we're in the browser and initialize values
  useEffect(() => {
    setIsClient(true);

    // Initialize the motion value with the current value
    motionValue.set(value);

    // Initialize digits if using separate digits animation
    if (separateDigits) {
      const formattedValue = formatNumber(value, decimals);
      setDigits(formattedValue.split(''));
    }

    // Set the previous value to the current value on first render
    previousValue.current = value;

    console.log("AnimatedNumber initialized with value:", value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If not in browser, render a static version
  if (!isClient) {
    return (
      <span className={`font-semibold ${sizeClasses[size]} ${color} ${className}`}>
        {prefix}{formatNumber(value, decimals)}{suffix}
      </span>
    );
  }

  // Render with separate digits animation
  if (separateDigits) {
    return (
      <span className={`font-semibold ${sizeClasses[size]} ${color} ${className} ${getEffectClasses()} inline-flex items-center`}>
        {prefix && (
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
            {prefix}
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
        {prefix && (
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
            {prefix}
          </motion.span>
        )}
        <motion.span>{displayValue}</motion.span>
        {suffix && <span className="ml-0.5">{suffix}</span>}
      </motion.span>
    </AnimatePresence>
  );
};

export default AnimatedNumber;
