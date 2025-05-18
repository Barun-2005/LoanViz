import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../../contexts/LocaleContext';

const CurrencyInput = ({
  id,
  value,
  onChange,
  min,
  max,
  step = 1000,
  currencySymbol,
  placeholder = '0',
  label,
  helperText,
  error,
  className = '',
  isDarkMode = false,
}) => {
  // Get locale information
  const { currentLocale } = useLocale();

  // Use provided currency symbol or default to the one from locale context
  const symbol = currencySymbol || currentLocale.currency;

  const [isFocused, setIsFocused] = useState(false);

  // Format the value for display (add commas)
  const formatValue = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Note: parseValue function removed as it was unused

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
      onChange(clampedValue);
    }
  };

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <motion.label
          htmlFor={id}
          className="form-label"
          animate={{
            color: isFocused
              ? (isDarkMode ? '#60A5FA' : '#3B82F6')
              : ''
          }}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.label>
      )}

      <motion.div
        className={`currency-input-container ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}
        whileHover={{
          scale: 1.01,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}
        animate={{
          borderColor: isFocused
            ? isDarkMode ? '#60A5FA' : '#3B82F6'
            : error
              ? '#EF4444'
              : isDarkMode ? 'rgba(75, 85, 99, 0.8)' : 'rgba(229, 231, 235, 0.8)',
          boxShadow: isFocused
            ? isDarkMode
              ? '0 0 0 3px rgba(96, 165, 250, 0.25)'
              : '0 0 0 3px rgba(59, 130, 246, 0.25)'
            : error
              ? '0 0 0 3px rgba(239, 68, 68, 0.25)'
              : 'none'
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="currency-symbol"
          animate={{
            color: isFocused
              ? (isDarkMode ? '#60A5FA' : '#3B82F6')
              : (isDarkMode ? '#D1D5DB' : '')
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            animate={{
              scale: isFocused ? 1.1 : 1,
              y: isFocused ? -2 : 0
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 10
            }}
          >
            {symbol}
          </motion.span>
        </motion.div>

        <input
          type="text"
          id={id}
          value={formatValue(value)}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="currency-input"
          min={min}
          max={max}
          step={step}
          aria-label={`Currency input for ${id || 'amount'}`}
          style={{ paddingLeft: '35px' }} // Add more padding to prevent overlap with currency symbol
        />

        {/* Animated focus indicator */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className={`focus-indicator bg-gradient-to-r ${
                isDarkMode
                  ? 'from-blue-400 to-indigo-400'
                  : 'from-blue-500 to-indigo-500'
              }`}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* Subtle background animation */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-100/10 to-indigo-100/10 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg overflow-hidden pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                backgroundPosition: ['0% 0%', '100% 0%'],
              }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.3 },
                backgroundPosition: {
                  duration: 5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'linear',
                }
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {helperText && !error && (
          <motion.div
            className="form-helper-text"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {helperText}
          </motion.div>
        )}

        {error && (
          <motion.div
            className="form-error"
            initial={{ opacity: 0, x: -5 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 10
              }
            }}
            exit={{ opacity: 0, x: -5 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencyInput;
