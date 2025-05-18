import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PercentageInput = ({
  id,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  label,
  helperText,
  error,
  className = '',
  placeholder = '0'
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    if (rawValue === '' || rawValue === '.') {
      onChange('');
      return;
    }

    const newValue = parseFloat(rawValue);
    if (!isNaN(newValue)) {
      // Clamp value between min and max
      const clampedValue = Math.max(min, Math.min(max, newValue));
      // Format to 2 decimal places to avoid floating point issues
      const formattedValue = parseFloat(clampedValue.toFixed(2));
      onChange(formattedValue);
    }
  };

  // Format the displayed value to always show 2 decimal places
  const displayValue = typeof value === 'number' ? value.toFixed(2) : value;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}

      <div className={`percentage-input-container ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
        <input
          type="text"
          id={id}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          min={min}
          max={max}
          step={step}
          className="percentage-input"
          placeholder={placeholder}
          aria-label={`Percentage input for ${id || 'rate'}`}
          style={{ paddingRight: '50px' }} // Add more padding to prevent overlap with % symbol
        />

        <div className="percentage-symbol">
          %
        </div>

        {/* Animated focus indicator */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="focus-indicator"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </div>

      {helperText && !error && (
        <div className="form-helper-text">{helperText}</div>
      )}

      {error && (
        <div className="form-error">{error}</div>
      )}
    </div>
  );
};

export default PercentageInput;
