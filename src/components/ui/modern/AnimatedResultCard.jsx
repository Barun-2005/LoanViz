import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import GlassCard from './GlassCard';
import AnimatedNumberDisplay from './AnimatedNumberDisplay';

/**
 * Modern AnimatedResultCard component for displaying calculation results
 * @param {Object} props - Component props
 * @param {Object} props.data - The data to display
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.icon - Icon to display next to the title
 * @param {string} props.variant - Card variant ('default', 'primary', 'success', 'warning', 'error')
 * @param {boolean} props.animate - Whether to animate the card
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.formatValue - Function to format values
 * @param {React.ReactNode} props.footer - Footer content
 * @param {React.ReactNode} props.headerRight - Content to display on the right side of the header
 * @returns {JSX.Element} Modern animated result card component
 */
const AnimatedResultCard = ({
  data = {},
  title = 'Results',
  icon = null,
  variant = 'primary',
  animate = true,
  className = '',
  formatValue = (val) => val.toLocaleString(),
  footer = null,
  headerRight = null,
}) => {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

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

  // Set visibility after a short delay for staggered animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  // Convert data object to array for rendering
  const dataItems = Object.entries(data).map(([key, value]) => ({
    key,
    label: key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim(),
    value
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
          className={className}
        >
          <GlassCard
            title={title}
            icon={icon}
            variant={variant}
            animate={animate}
            effect="glow"
            headerRight={headerRight}
            footer={footer}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
              {dataItems.map((item, index) => (
                <motion.div
                  key={item.key}
                  variants={itemVariants}
                  className={`p-4 rounded-lg ${
                    localIsDarkMode
                      ? 'bg-gray-800/50 hover:bg-gray-800/70'
                      : 'bg-white/50 hover:bg-white/70'
                  } transition-colors duration-300 backdrop-blur-sm`}
                >
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    {item.label}
                  </div>
                  <div className="font-bold">
                    {typeof item.value === 'number' ? (
                      <AnimatedNumberDisplay
                        value={item.value}
                        prefix={item.key.toLowerCase().includes('rate') ? '' : '£'}
                        suffix={item.key.toLowerCase().includes('rate') ? '%' : ''}
                        decimals={item.key.toLowerCase().includes('rate') ? 2 : 0}
                        size="lg"
                        effect="gradient"
                        animate={true}
                        separateDigits={index < 3} // Only animate the first 3 items with separate digits
                        highlightChange={true}
                      />
                    ) : (
                      <span className="text-gray-800 dark:text-white">
                        {String(item.value)}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedResultCard;
