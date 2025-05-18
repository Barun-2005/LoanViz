import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const YearInput = ({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  helperText,
  error,
  className = '',
  placeholder = '0'
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (rawValue === '') {
      onChange('');
      return;
    }

    const newValue = parseInt(rawValue);
    if (!isNaN(newValue)) {
      // Clamp value between min and max
      const clampedValue = Math.max(min, Math.min(max, newValue));
      onChange(clampedValue);
    }
  };

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}

      <div className={`year-input-container ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
        <input
          type="text"
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          min={min}
          max={max}
          step={step}
          className="year-input"
          placeholder={placeholder}
          aria-label={`Year input for ${id || 'term'}`}
          style={{ paddingRight: '60px' }} // Add more padding to prevent overlap with yrs symbol
        />

        <div className="year-symbol">
          yrs
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

export default YearInput;
