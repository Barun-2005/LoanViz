import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Slider = ({
  min,
  max,
  step,
  value,
  onChange,
  label,
  unit = '',
  className = '',
  showInput = true,
  formatValue = (val) => val.toLocaleString(),
  inputProps = {},
  id,
  helperText,
  error,
}) => {
  const [localValue, setLocalValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const sliderRef = useRef(null);

  // Generate a unique ID if not provided
  const inputId = id || `slider-${Math.random().toString(36).slice(2, 11)}`;

  // Calculate the percentage for the slider fill
  const percentage = ((value - min) / (max - min)) * 100;

  // Update tooltip position when value changes
  useEffect(() => {
    if (sliderRef.current) {
      const thumbPosition = (value - min) / (max - min) * sliderRef.current.offsetWidth;
      setTooltipPosition(thumbPosition);
    }
  }, [value, min, max]);

  // Handle slider change
  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
    setLocalValue(newValue.toString());
  };

  // Handle input change
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);

    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    setIsFocused(false);

    // Reset to valid value if input is invalid
    const numValue = parseFloat(localValue);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setLocalValue(value.toString());
    }
  };

  // Handle drag start/end
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  return (
    <div className={`form-control w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {label && (
          <label htmlFor={inputId} className="label-text font-medium">
            {label}
          </label>
        )}

        <div className="text-sm font-medium">
          {formatValue(value)} {unit}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative" ref={sliderRef}>
          <AnimatePresence>
            {(isDragging || isFocused) && (
              <motion.div
                className="absolute -top-8 px-2 py-1 bg-loanviz-primary dark:bg-loanviz-secondary text-white text-xs rounded pointer-events-none z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                style={{ left: `${tooltipPosition}px`, transform: 'translateX(-50%)' }}
              >
                {formatValue(value)} {unit}
                <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-loanviz-primary dark:bg-loanviz-secondary transform rotate-45 -translate-x-1/2"></div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute h-full bg-gradient-to-r from-loanviz-primary to-loanviz-secondary rounded-full"
              style={{ width: `${percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />

            <input
              id={inputId}
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleSliderChange}
              onMouseDown={handleDragStart}
              onMouseUp={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchEnd={handleDragEnd}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="range range-primary absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label={`${label || 'Slider'} value: ${value} ${unit}`}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={value}
            />

            <motion.div
              className="absolute h-4 w-4 bg-loanviz-primary dark:bg-loanviz-secondary rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none"
              style={{ top: '50%', left: `${percentage}%` }}
              animate={{
                scale: isDragging ? 1.3 : isFocused ? 1.2 : 1,
                boxShadow: isDragging
                  ? '0 0 0 6px rgba(59, 130, 246, 0.4)'
                  : isFocused
                    ? '0 0 0 4px rgba(59, 130, 246, 0.3)'
                    : 'none'
              }}
              transition={{ duration: 0.2 }}
            />
          </div>

          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatValue(min)} {unit}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatValue(max)} {unit}
            </span>
          </div>
        </div>

        {showInput && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-24"
          >
            <div className="relative">
              <input
                type="text"
                value={localValue}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                className={`input input-loanviz w-full pr-8 text-right ${error ? 'input-error' : ''}`}
                aria-label={`${label || 'Value'} input`}
                {...inputProps}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">{unit}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {(helperText || error) && (
        <label className="label pt-1">
          {error ? (
            <span className="label-text-alt text-error">{error}</span>
          ) : helperText ? (
            <span className="label-text-alt">{helperText}</span>
          ) : null}
        </label>
      )}
    </div>
  );
};

export default Slider;
