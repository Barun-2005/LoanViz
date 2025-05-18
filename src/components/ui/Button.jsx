import { motion } from 'framer-motion';

const Button = ({
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
  ...props
}) => {
  // Size variations
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    xl: 'btn-xl',
  };

  // Variant styles
  const variantClasses = {
    primary: 'btn-loanviz-primary',
    secondary: 'btn-loanviz-secondary',
    outline: 'btn-loanviz-outline',
    accent: 'btn-loanviz-accent',
    ghost: 'btn-ghost',
    link: 'btn-link',
  };

  // Width class - responsive on mobile
  const widthClass = fullWidth ? 'w-full' : 'w-full sm:w-auto';

  // State classes
  const stateClasses = isLoading ? 'loading' : '';

  // Button animation variants
  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  // Icon animation variants
  const iconVariants = {
    hover: { rotate: 5, scale: 1.1 },
    tap: { rotate: 0, scale: 1 },
  };

  return (
    <motion.button
      type={type}
      className={`btn ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${stateClasses} ${className}`}
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
          className={`mr-2 ${isLoading ? 'opacity-0' : ''}`}
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
          className={`ml-2 ${isLoading ? 'opacity-0' : ''}`}
          variants={iconVariants}
        >
          {icon}
        </motion.span>
      )}
    </motion.button>
  );
};

export default Button;
