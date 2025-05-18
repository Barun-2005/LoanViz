import { motion } from 'framer-motion';
import { forwardRef, useState, useEffect } from 'react';

/**
 * GlassmorphicCard component with advanced visual effects
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Card variant ('default', 'primary', 'success', 'warning', 'error')
 * @param {string} props.effect - Visual effect ('none', 'glow', 'neon', 'shimmer')
 * @param {boolean} props.animate - Whether to animate the card
 * @param {boolean} props.interactive - Whether the card should react to hover/focus
 * @param {number} props.blurStrength - Backdrop blur strength (1-20)
 * @param {number} props.opacity - Background opacity (0-100)
 * @param {string} props.borderStyle - Border style ('none', 'thin', 'thick', 'glow')
 * @param {Object} props.motionProps - Additional Framer Motion props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.icon - Icon to display next to the title
 * @param {React.ReactNode} props.headerRight - Content to display on the right side of the header
 * @param {React.ReactNode} props.footer - Footer content
 * @returns {JSX.Element} Glassmorphic card component
 */
const GlassmorphicCard = forwardRef(({
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
  icon = null,
  headerRight = null,
  footer = null,
  ...props
}, ref) => {
  // Track theme changes
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Get variant classes
  const getVariantClasses = () => {
    const baseClasses = {
      default: 'from-white/70 to-white/60 dark:from-gray-800/70 dark:to-gray-900/60 border-gray-200/50 dark:border-gray-700/50',
      primary: 'from-blue-50/80 to-indigo-50/70 dark:from-gray-800/80 dark:to-gray-900/70 border-blue-300/60 dark:border-blue-700/40',
      success: 'from-green-50/80 to-emerald-50/70 dark:from-gray-800/80 dark:to-gray-900/70 border-green-300/60 dark:border-green-700/40',
      warning: 'from-amber-50/80 to-yellow-50/70 dark:from-gray-800/80 dark:to-gray-900/70 border-amber-300/60 dark:border-amber-700/40',
      error: 'from-red-50/80 to-rose-50/70 dark:from-gray-800/80 dark:to-gray-900/70 border-red-300/60 dark:border-red-700/40',
      info: 'from-sky-50/80 to-cyan-50/70 dark:from-gray-800/80 dark:to-gray-900/70 border-sky-300/60 dark:border-sky-700/40',
      purple: 'from-purple-50/80 to-violet-50/70 dark:from-gray-800/80 dark:to-gray-900/70 border-purple-300/60 dark:border-purple-700/40',
    };

    return baseClasses[variant] || baseClasses.default;
  };

  // Get effect classes
  const getEffectClasses = () => {
    switch (effect) {
      case 'glow':
        return 'shadow-[0_0_20px_rgba(59,130,246,0.3)] dark:shadow-[0_0_20px_rgba(99,102,241,0.3)]';
      case 'neon':
        return 'animate-neon-pulse shadow-[0_0_15px_rgba(59,130,246,0.4),0_0_30px_rgba(59,130,246,0.2)] dark:shadow-[0_0_15px_rgba(99,102,241,0.4),0_0_30px_rgba(99,102,241,0.2)]';
      case 'shimmer':
        return 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer before:bg-[length:200%_100%]';
      case 'pulse':
        return 'animate-pulse-subtle';
      case 'rainbow':
        return 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:via-purple-500/10 before:to-pink-500/10 before:animate-gradient-shift before:bg-[length:200%_100%]';
      case 'frosted':
        return 'backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]';
      case 'noise':
        return 'after:absolute after:inset-0 after:bg-noise after:opacity-[0.03] after:mix-blend-soft-light after:pointer-events-none';
      default:
        return '';
    }
  };

  // Get border style classes
  const getBorderClasses = () => {
    switch (borderStyle) {
      case 'none':
        return 'border-0';
      case 'thin':
        return 'border border-white/30 dark:border-gray-700/40';
      case 'thick':
        return 'border-2 border-blue-200/60 dark:border-indigo-500/40';
      case 'glow':
        return 'border border-blue-200/50 dark:border-indigo-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5),inset_0_0_10px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(99,102,241,0.5),inset_0_0_10px_rgba(99,102,241,0.1)]';
      case 'neon':
        return 'border border-blue-300/60 dark:border-indigo-400/50 shadow-[0_0_10px_rgba(59,130,246,0.5),inset_0_0_5px_rgba(59,130,246,0.2)] dark:shadow-[0_0_10px_rgba(99,102,241,0.5),inset_0_0_5px_rgba(99,102,241,0.2)] animate-border-pulse';
      case 'primary':
        return 'border border-blue-300/60 dark:border-blue-500/40';
      case 'success':
        return 'border border-green-300/60 dark:border-green-500/40';
      case 'warning':
        return 'border border-amber-300/60 dark:border-amber-500/40';
      case 'error':
        return 'border border-red-300/60 dark:border-red-500/40';
      case 'rainbow':
        return 'border border-transparent bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 p-[1px]';
      case 'inset':
        return 'border border-white/20 dark:border-gray-700/30 shadow-[inset_0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]';
      default:
        return 'border border-gray-200/60 dark:border-gray-700/40';
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    hover: interactive ? {
      y: -5,
      scale: 1.02,
      boxShadow: variant === 'primary' ? '0 0 25px rgba(59, 130, 246, 0.5)' :
                variant === 'success' ? '0 0 25px rgba(16, 185, 129, 0.5)' :
                variant === 'warning' ? '0 0 25px rgba(245, 158, 11, 0.5)' :
                variant === 'error' ? '0 0 25px rgba(239, 68, 68, 0.5)' :
                variant === 'info' ? '0 0 25px rgba(14, 165, 233, 0.5)' :
                variant === 'purple' ? '0 0 25px rgba(139, 92, 246, 0.5)' :
                '0 0 25px rgba(99, 102, 241, 0.5)',
      backgroundColor: isDarkMode ?
                variant === 'primary' ? 'rgba(30, 58, 138, 0.3)' :
                variant === 'success' ? 'rgba(6, 78, 59, 0.3)' :
                variant === 'warning' ? 'rgba(120, 53, 15, 0.3)' :
                variant === 'error' ? 'rgba(127, 29, 29, 0.3)' :
                'rgba(30, 41, 59, 0.3)' :
                'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(12px)',
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
        backgroundColor: isDarkMode ? `rgba(31, 41, 55, ${opacity / 100})` : `rgba(255, 255, 255, ${opacity / 100})`,
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
        {(title || headerRight || icon) && (
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
                <h2 className="text-base font-bold text-gray-800 dark:text-white">
                  {title}
                </h2>
              )}
            </div>
            {headerRight && (
              <div className="flex items-center">
                {headerRight}
              </div>
            )}
          </div>
        )}

        <div className="flex-1">
          {children}
        </div>

        {footer && (
          <div className="card-actions justify-end mt-4">
            {footer}
          </div>
        )}
      </div>
    </motion.div>
  );
});

GlassmorphicCard.displayName = 'GlassmorphicCard';

export default GlassmorphicCard;
