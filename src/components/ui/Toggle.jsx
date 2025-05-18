import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toggle = ({
  options,
  value,
  onChange,
  className = '',
  name = 'toggle',
  disabled = false,
  label,
  id,
  helperText,
  error,
}) => {
  // Generate a unique ID if not provided
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

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

  // Animation variants for the active indicator
  const activeIndicatorVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.15 } }
  };

  // Animation variants for the icon
  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, rotate: 5, transition: { duration: 0.2 } }
  };

  return (
    <div className="form-group">
      {label && (
        <label id={`${toggleId}-label`} className="form-label w-1/4">
          {label}
        </label>
      )}

      <div
        className={`segmented-control ${className} ${error ? 'border-error' : ''}`}
        role="tablist"
        aria-labelledby={label ? `${toggleId}-label` : undefined}
      >
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            type="button"
            role="tab"
            id={`${toggleId}-${option.value}`}
            aria-selected={value === option.value}
            aria-controls={`${toggleId}-panel`}
            tabIndex={value === option.value ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={`segmented-option group ${value === option.value ? 'segmented-option-active' : ''}`}
            disabled={disabled}
            whileHover={{ scale: value !== option.value ? 1.03 : 1 }}
            whileTap={{ scale: value !== option.value ? 0.97 : 1 }}
          >
            <AnimatePresence mode="wait">
              {value === option.value && (
                <motion.span
                  className="absolute inset-0 rounded-md -z-10"
                  style={{
                    background: isDarkMode
                      ? 'linear-gradient(to right, #6366F1, #4F46E5)'
                      : 'linear-gradient(to right, #3B82F6, #2563EB)'
                  }}
                  variants={activeIndicatorVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />
              )}
            </AnimatePresence>

            {option.icon && (
              <motion.span
                className={`mr-2 ${value === option.value ? 'text-white' : 'text-subtext group-hover:text-primary'}`}
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
              >
                {option.icon}
              </motion.span>
            )}
            <span className={value === option.value ? 'font-semibold' : ''}>
              {option.label}
            </span>
          </motion.button>
        ))}
      </div>

      {helperText && !error && (
        <p className="form-helper-text ml-[calc(25%+1rem)]">{helperText}</p>
      )}

      {error && (
        <motion.p
          className="form-error ml-[calc(25%+1rem)]"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Toggle;
