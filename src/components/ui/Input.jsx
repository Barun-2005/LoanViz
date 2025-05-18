import { useState } from 'react';
import { motion } from 'framer-motion';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon,
  rightIcon,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  labelClassName = '',
  containerClassName = '',
  onFocus,
  onBlur,
  min,
  max,
  step,
  pattern,
  autoComplete,
  autoFocus = false,
  readOnly = false,
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
  const inputVariants = {
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

  // Icon animation variants
  const iconVariants = {
    focused: {
      scale: 1.1,
      color: 'rgba(59, 130, 246, 1)',
      transition: { duration: 0.2 },
    },
    error: {
      scale: 1.1,
      color: 'rgba(239, 68, 68, 1)',
      transition: { duration: 0.2 },
    },
    default: {
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

      <div className="relative">
        {icon && (
          <motion.div
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            variants={iconVariants}
            animate={animationState}
          >
            {icon}
          </motion.div>
        )}

        <motion.input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input input-loanviz w-full ${
            icon ? 'pl-10' : ''
          } ${
            rightIcon ? 'pr-10' : ''
          } ${
            error ? 'input-error' : ''
          } ${inputClassName}`}
          variants={inputVariants}
          animate={animationState}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          readOnly={readOnly}
          {...props}
        />

        {rightIcon && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            variants={iconVariants}
            animate={animationState}
          >
            {rightIcon}
          </motion.div>
        )}
      </div>

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

export default Input;
