
import { motion } from 'framer-motion';

const Card = ({
  children,
  title,
  className = '',
  animate = true,
  delay = 0,
  footer = null,
  headerRight = null,
  maxWidth = null,
  variant = 'default', // 'default', 'glass', 'neo'
  icon = null,
  ...props
}) => {
  // Animation variants
  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay,
        ease: "easeOut"
      }
    }
  };

  // Max width style
  const maxWidthStyle = maxWidth ? { maxWidth } : {};

  // Get card variant class and additional styles
  const getCardVariantClass = () => {
    switch (variant) {
      case 'glass':
        return 'card-loanviz-glass';
      case 'bordered':
        return 'card-loanviz-bordered';
      default:
        return 'card-loanviz';
    }
  };

  // Additional styles for glassmorphism
  const getAdditionalStyles = () => {
    if (variant === 'glass') {
      return {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      };
    }
    return {};
  };

  return (
    <motion.div
      className={`${getCardVariantClass()} ${className}`}
      initial={animate ? "hidden" : false}
      animate={animate ? "visible" : false}
      variants={cardAnimation}
      style={{ ...maxWidthStyle, ...getAdditionalStyles(), overflow: 'visible' }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      <div className="card-body p-4 overflow-visible">
        {(title || headerRight || icon) && (
          <div className="flex justify-between items-center card-title mb-2">
            <div className="flex items-center">
              {icon && (
                <motion.div
                  className="mr-1.5 text-loanviz-primary dark:text-loanviz-secondary"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon}
                </motion.div>
              )}
              {title && (
                <h2 className="text-base font-bold">
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
};

export default Card;
