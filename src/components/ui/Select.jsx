import { useState } from 'react';
import { motion } from 'framer-motion';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  selectClassName = '',
  labelClassName = '',
  containerClassName = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Animation variants
  const selectVariants = {
    focused: {
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
      borderColor: 'rgba(59, 130, 246, 0.8)',
    },
    error: {
      boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.3)',
      borderColor: 'rgba(239, 68, 68, 0.8)',
    },
    default: {
      boxShadow: 'none',
      borderColor: 'rgba(209, 213, 219, 1)',
    },
  };

  // Label animation variants
  const labelVariants = {
    focused: {
      y: -4,
      scale: 0.85,
      color: 'rgba(59, 130, 246, 1)',
      transition: { duration: 0.2 },
    },
    error: {
      y: -4,
      scale: 0.85,
      color: 'rgba(239, 68, 68, 1)',
      transition: { duration: 0.2 },
    },
    default: {
      y: 0,
      scale: 1,
      color: 'rgba(107, 114, 128, 1)',
      transition: { duration: 0.2 },
    },
  };

  // Determine animation state
  const animationState = error ? 'error' : isFocused ? 'focused' : 'default';

  return (
    <div className={`form-control w-full ${containerClassName}`}>
      {label && (
        <motion.label
          htmlFor={name}
          className={`label ${labelClassName}`}
          variants={labelVariants}
          animate={animationState}
        >
          <span className="label-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </motion.label>
      )}

      <motion.select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`select select-loanviz w-full ${
          error ? 'select-error' : ''
        } ${selectClassName}`}
        variants={selectVariants}
        animate={animationState}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </motion.select>

      {(error || helperText) && (
        <label className="label">
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

export default Select;
