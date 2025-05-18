import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RangeSlider = ({
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
  trackColor = 'bg-gradient-to-r from-blue-500 to-indigo-500',
  thumbColor = 'bg-white',
  thumbBorderColor = 'border-blue-500',
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const inputRef = useRef(null);

  // Position calculation
  const percentage = ((value - min) / (max - min)) * 100;

  // Value formatting
  const displayValue = formatValue(value);
  const formattedValue = symbolPosition === 'prefix'
    ? `${symbol}${displayValue}`
    : `${displayValue}${symbol}`;

  // Auto-hide tooltip after dragging
  useEffect(() => {
    if (!isDragging) {
      const timer = setTimeout(() => setShowTooltip(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  // Jump to clicked position on track
  const handleTrackClick = (e) => {
    e.preventDefault();

    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const trackWidth = rect.width;
      const clickPercentage = clickPosition / trackWidth;
      const newValue = min + clickPercentage * (max - min);

      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      onChange(clampedValue);
    }
  };

  // Smooth thumb dragging
  const handleThumbDrag = (e) => {
    if (trackRef.current && isDragging) {
      if (!e.touches) {
        e.preventDefault();
      }

      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const rect = trackRef.current.getBoundingClientRect();
      const dragPosition = clientX - rect.left;
      const trackWidth = rect.width;

      const dragPercentage = Math.max(0, Math.min(1, dragPosition / trackWidth));
      const newValue = min + dragPercentage * (max - min);
      const steppedValue = Math.round((newValue - min) / step) * step + min;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      if (value !== clampedValue) {
        onChange(clampedValue);
      }
    }
  };

  // Start dragging (mouse/touch)
  const handleMouseDown = (e) => {
    if (e.type !== 'touchstart') {
      e.preventDefault();
    }
    e.stopPropagation();
    setIsDragging(true);
    setShowTooltip(true);

    // Handle immediate touch movement
    if (e.type === 'touchstart' && e.touches && e.touches[0]) {
      handleThumbDrag(e);
    }
  };

  // End dragging
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleThumbDrag);
      document.removeEventListener('mouseup', handleMouseUp);
      setTimeout(() => setShowTooltip(false), 1000);
    }
  };

  // Manage drag event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleMouseUp);
      document.addEventListener('mousemove', handleThumbDrag);
      document.addEventListener('touchmove', handleThumbDrag, { passive: true });
    }

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('mousemove', handleThumbDrag);
      document.removeEventListener('touchmove', handleThumbDrag);
    };
  }, [isDragging]);

  return (
    <div className={`slider-container ${className}`}>
      <div
        ref={trackRef}
        className="slider-track"
        onClick={handleTrackClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => !isDragging && setShowTooltip(false)}
      >
        {/* Animated background track */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-indigo-100/30 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full overflow-hidden"
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />

        {/* Filled track */}
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

        {/* Native input (hidden but accessible) */}
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider"
          aria-label="Slider"
        />

        {/* Draggable thumb */}
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

        {/* Value tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              className="slider-value-tooltip bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-lg"
              style={{ left: `${percentage}%` }}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: -35,
                scale: isDragging ? 1.1 : 1,
                boxShadow: isDragging
                  ? '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
                  : '0 4px 15px -3px rgba(59, 130, 246, 0.3)'
              }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {formattedValue}

              {/* Tooltip pointer */}
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

export default RangeSlider;
