import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * Modern GlowButton component with advanced visual effects
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.variant - Button variant ('primary', 'success', 'warning', 'error', 'info')
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.type - Button type ('button', 'submit', 'reset')
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {boolean} props.isLoading - Whether the button is in loading state
 * @param {boolean} props.fullWidth - Whether the button should take full width
 * @param {string} props.size - Button size ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {string} props.ariaLabel - Aria label for accessibility
 * @param {string} props.iconPosition - Icon position ('left', 'right')
 * @param {string} props.effect - Visual effect ('none', 'glow', 'neon', 'shimmer')
 * @returns {JSX.Element} Modern glow button component
 */
const GlowButton = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  icon = null,
  isLoading = false,
  fullWidth = false,
  size = 'md',
  ariaLabel,
  iconPosition = 'left',
  effect = 'none',
  ariaDescribedBy,
  ariaExpanded,
  ariaControls,
  ariaPressed,
  role,
  ...props
}) => {
  const { isDarkMode } = useTheme();

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

  // Size variations
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
  };

  // Get variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return localIsDarkMode
          ? 'from-blue-600 to-indigo-600 border-blue-500/50 text-white hover:from-blue-500 hover:to-indigo-500'
          : 'from-blue-500 to-indigo-500 border-blue-400/50 text-white hover:from-blue-600 hover:to-indigo-600';
      case 'success':
        return localIsDarkMode
          ? 'from-green-600/90 to-emerald-600/90 border-green-500/50 text-white hover:from-green-500/90 hover:to-emerald-500/90'
          : 'from-green-500/90 to-emerald-500/90 border-green-400/50 text-white hover:from-green-600/90 hover:to-emerald-600/90';
      case 'warning':
        return localIsDarkMode
          ? 'from-amber-600/90 to-yellow-600/90 border-amber-500/50 text-white hover:from-amber-500/90 hover:to-yellow-500/90'
          : 'from-amber-500/90 to-yellow-500/90 border-amber-400/50 text-white hover:from-amber-600/90 hover:to-yellow-600/90';
      case 'error':
        return localIsDarkMode
          ? 'from-red-600 to-rose-600 border-red-500/50 text-white hover:from-red-500 hover:to-rose-500'
          : 'from-red-500 to-rose-500 border-red-400/50 text-white hover:from-red-600 hover:to-rose-600';
      case 'info':
        return localIsDarkMode
          ? 'from-cyan-600/90 to-sky-600/90 border-cyan-500/50 text-white hover:from-cyan-500/90 hover:to-sky-500/90'
          : 'from-cyan-500/90 to-sky-500/90 border-cyan-400/50 text-white hover:from-cyan-600/90 hover:to-sky-600/90';
      case 'secondary':
        return localIsDarkMode
          ? 'from-gray-700 to-gray-800 border-gray-600/50 text-white hover:from-gray-600 hover:to-gray-700'
          : 'from-gray-200 to-gray-300 border-gray-300/50 text-gray-800 hover:from-gray-300 hover:to-gray-400';
      default:
        return localIsDarkMode
          ? 'from-gray-700 to-gray-800 border-gray-600/50 text-white hover:from-gray-600 hover:to-gray-700'
          : 'from-gray-200 to-gray-300 border-gray-300/50 text-gray-800 hover:from-gray-300 hover:to-gray-400';
    }
  };

  // Get effect classes
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

  // Width class
  const widthClass = fullWidth ? 'w-full' : '';

  // State classes
  const stateClasses = isLoading ? 'relative !text-transparent' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Button animation variants
  const buttonVariants = {
    hover: !disabled && !isLoading ? {
      scale: 1.02,
      boxShadow: variant === 'primary' ? '0 0 20px rgba(59, 130, 246, 0.6)' :
                variant === 'success' ? '0 0 20px rgba(16, 185, 129, 0.6)' :
                variant === 'warning' ? '0 0 20px rgba(245, 158, 11, 0.6)' :
                variant === 'error' ? '0 0 20px rgba(239, 68, 68, 0.6)' :
                '0 0 20px rgba(99, 102, 241, 0.6)',
    } : {},
    tap: !disabled && !isLoading ? { scale: 0.98 } : {},
  };

  // Icon animation variants
  const iconVariants = {
    hover: { rotate: [0, 15, 0], transition: { duration: 0.5 } },
  };

  return (
    <motion.button
      type={type}
      className={`
        relative flex items-center justify-center gap-2 rounded-md
        bg-gradient-to-r
        border transition-all duration-300
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${getEffectClasses()}
        ${widthClass}
        ${stateClasses}
        ${disabledClasses}
        ${className}
      `}
      onClick={disabled || isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={isLoading}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-pressed={ariaPressed}
      role={role}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <motion.span
          className={isLoading ? 'opacity-0' : ''}
          variants={iconVariants}
        >
          {icon}
        </motion.span>
      )}

      <span className={isLoading ? 'opacity-0' : ''}>
        {children}
      </span>

      {icon && iconPosition === 'right' && (
        <motion.span
          className={isLoading ? 'opacity-0' : ''}
          variants={iconVariants}
        >
          {icon}
        </motion.span>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="Loading"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
    </motion.button>
  );
};

export default GlowButton;
