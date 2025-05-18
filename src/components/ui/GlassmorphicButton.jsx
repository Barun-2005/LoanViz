import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * GlassmorphicButton component with advanced visual effects
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.variant - Button variant ('default', 'primary', 'success', 'warning', 'error')
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
 * @returns {JSX.Element} Glassmorphic button component
 */
const GlassmorphicButton = ({
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
  ...props
}) => {
  const { isDarkMode } = useTheme();

  // Size variations
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl',
  };

  // Get variant classes
  const getVariantClasses = () => {
    const baseClasses = {
      default: 'from-white/70 to-white/60 dark:from-gray-800/70 dark:to-gray-900/60 border-gray-200/50 dark:border-gray-700/50 text-gray-800 dark:text-white',
      primary: 'from-blue-500/90 to-indigo-600/80 dark:from-blue-600/80 dark:to-indigo-700/70 border-blue-400/50 dark:border-blue-500/30 text-white',
      secondary: 'from-gray-500/90 to-gray-600/80 dark:from-gray-700/80 dark:to-gray-800/70 border-gray-400/50 dark:border-gray-600/30 text-white',
      success: 'from-green-500/90 to-emerald-600/80 dark:from-green-600/80 dark:to-emerald-700/70 border-green-400/50 dark:border-green-500/30 text-white',
      warning: 'from-amber-500/90 to-yellow-600/80 dark:from-amber-600/80 dark:to-yellow-700/70 border-amber-400/50 dark:border-amber-500/30 text-white',
      error: 'from-red-500/90 to-rose-600/80 dark:from-red-600/80 dark:to-rose-700/70 border-red-400/50 dark:border-red-500/30 text-white',
      info: 'from-sky-500/90 to-cyan-600/80 dark:from-sky-600/80 dark:to-cyan-700/70 border-sky-400/50 dark:border-sky-500/30 text-white',
      ghost: 'bg-transparent border-transparent text-gray-800 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50',
      link: 'bg-transparent border-transparent text-blue-600 dark:text-blue-400 underline',
    };

    return baseClasses[variant] || baseClasses.default;
  };

  // Get effect classes
  const getEffectClasses = () => {
    switch (effect) {
      case 'glow':
        return 'shadow-[0_0_15px_rgba(59,130,246,0.5)] dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]';
      case 'neon':
        return 'animate-neon-pulse shadow-[0_0_10px_rgba(59,130,246,0.6),0_0_20px_rgba(59,130,246,0.3)] dark:shadow-[0_0_10px_rgba(99,102,241,0.6),0_0_20px_rgba(99,102,241,0.3)]';
      case 'shimmer':
        return 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer before:bg-[length:200%_100%] overflow-hidden';
      case 'pulse':
        return 'animate-pulse-subtle';
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
    hover: !disabled && !isLoading ? { rotate: 5, scale: 1.1 } : {},
    tap: !disabled && !isLoading ? { rotate: 0, scale: 1 } : {},
  };

  return (
    <motion.button
      type={type}
      className={`
        relative flex items-center justify-center gap-2 rounded-lg
        bg-gradient-to-br backdrop-blur-md
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
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" 
               style={{ 
                 borderColor: `${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
                 borderTopColor: 'transparent' 
               }} />
        </div>
      )}
    </motion.button>
  );
};

export default GlassmorphicButton;
