import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../../../contexts/LocaleContext';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * Modern StyledSlider component with advanced visual effects
 * @param {Object} props - Component props
 * @param {number} props.min - Minimum value
 * @param {number} props.max - Maximum value
 * @param {number} props.step - Step value
 * @param {number} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.formatValue - Function to format the value for display
 * @param {string} props.leftLabel - Label for the left side
 * @param {string} props.rightLabel - Label for the right side
 * @param {string} props.symbol - Symbol to display with the value
 * @param {string} props.symbolPosition - Position of the symbol ('prefix', 'suffix')
 * @param {string} props.trackColor - Color of the track
 * @param {string} props.thumbColor - Color of the thumb
 * @param {string} props.thumbBorderColor - Color of the thumb border
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Modern styled slider component
 */
const StyledSlider = ({
  min,
  max,
  step,
  value,
  onChange,
  formatValue = (val) => val,
  leftLabel,
  rightLabel,
  symbol = '',
  symbolPosition = 'prefix',
  trackColor,
  thumbColor = 'bg-white',
  thumbBorderColor = 'border-blue-500',
  className = '',
}) => {
  const { isDarkMode } = useTheme();
  const { currentLocale, formatCurrency, formatCompactNumber } = useLocale();

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

  // Use currency symbol from locale if symbol is a common currency symbol
  const dynamicSymbol = symbol === '£' || symbol === '$' || symbol === '₹' || symbol === '€'
    ? currentLocale.currency
    : symbol;
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const inputRef = useRef(null);

  // Calculate percentage for positioning with safety check for undefined/null values
  const safeValue = value !== undefined && value !== null ? value : min;
  const percentage = ((safeValue - min) / (max - min)) * 100;

  // Format the value for display with safety check for undefined/null values
  const formattedValue = symbolPosition === 'prefix'
    ? `${dynamicSymbol}${formatValue(value !== undefined && value !== null ? value : min)}`
    : `${formatValue(value !== undefined && value !== null ? value : min)}${dynamicSymbol}`;

  // Handle track click
  const handleTrackClick = (e) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const trackWidth = rect.width;

    // Calculate new value based on click position
    const percentage = clickPosition / trackWidth;
    const newValue = min + percentage * (max - min);

    // Use a more precise rounding method for smoother steps
    const steppedValue = Math.round((newValue - min) / step) * step + min;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    onChange(clampedValue);
  };

  // Handle thumb drag
  const handleThumbDrag = (e) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.type.includes('touch')
      ? e.touches[0].clientX
      : e.clientX;

    const clickPosition = clientX - rect.left;
    const trackWidth = rect.width;

    // Calculate new value based on drag position
    const percentage = clickPosition / trackWidth;
    const newValue = min + percentage * (max - min);

    // Use a more precise rounding method for smoother steps
    const steppedValue = Math.round((newValue - min) / step) * step + min;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    // Only update if the value has actually changed
    if (value !== clampedValue) {
      onChange(clampedValue);
    }
  };

  // Handle mouse and touch events
  const handleMouseDown = (e) => {
    e.preventDefault(); // Prevent default to stop scrolling
    e.stopPropagation();
    setIsDragging(true);
    setShowTooltip(true);

    // Initial drag to handle immediate movement
    if (e.type === 'touchstart' && e.touches && e.touches[0]) {
      handleThumbDrag(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => {
      setShowTooltip(false);
    }, 1000);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleThumbDrag(e);
    }
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className={`slider-container ${className}`} style={{ minHeight: '60px' }}>
      <div
        ref={trackRef}
        className="slider-track"
        onClick={handleTrackClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => !isDragging && setShowTooltip(false)}
      >
        {/* Background track with subtle animation */}
        <motion.div
          className={`absolute inset-0 ${localIsDarkMode ? 'bg-gray-700/50' : 'bg-gray-200/70'} rounded-full overflow-hidden`}
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />

        {/* Filled track with gradient and animation */}
        <motion.div
          className={`slider-fill ${trackColor}`}
          style={{ width: `${percentage}%` }}
          initial={{ width: 0 }}
          animate={{
            width: `${percentage}%`,
            boxShadow: isDragging
              ? '0 0 10px rgba(59, 130, 246, 0.5)'
              : '0 0 5px rgba(59, 130, 246, 0.3)'
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Hidden native input for accessibility */}
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider"
          aria-label="Slider"
        />

        {/* Custom visible thumb */}
        <motion.div
          ref={thumbRef}
          className={`slider-thumb ${thumbColor} ${thumbBorderColor}`}
          style={{ left: `${percentage}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          animate={{
            scale: isDragging ? 1.2 : 1,
            boxShadow: isDragging
              ? '0 0 0 8px rgba(59, 130, 246, 0.2)'
              : '0 0 0 4px rgba(59, 130, 246, 0.1)'
          }}
          whileHover={{
            scale: 1.15,
            boxShadow: '0 0 0 6px rgba(59, 130, 246, 0.15)'
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              className={`slider-value-tooltip ${trackColor || 'bg-gradient-to-r from-blue-500 to-indigo-500'} text-white font-medium shadow-lg`}
              style={{ left: `${percentage}%`, position: 'absolute', top: '-35px' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: isDragging ? 1.1 : 1,
                boxShadow: isDragging
                  ? '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
                  : '0 4px 15px -3px rgba(59, 130, 246, 0.3)'
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {formattedValue}

              {/* Decorative elements */}
              <motion.div
                className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-indigo-500 rotate-45"
                animate={{
                  backgroundColor: ['#3B82F6', '#6366F1', '#3B82F6'],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="slider-helpers">
        <motion.span
          whileHover={{ scale: 1.1, color: '#3B82F6' }}
          transition={{ duration: 0.2 }}
          className="text-xs font-medium"
        >
          {leftLabel || formatValue(min)}
        </motion.span>
        <motion.span
          whileHover={{ scale: 1.1, color: '#6366F1' }}
          transition={{ duration: 0.2 }}
          className="text-xs font-medium"
        >
          {rightLabel || formatValue(max)}
        </motion.span>
      </div>
    </div>
  );
};

export default StyledSlider;
