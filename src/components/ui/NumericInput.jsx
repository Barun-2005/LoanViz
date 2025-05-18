import { useState } from 'react';
import { motion } from 'framer-motion';
import { NumericFormat } from 'react-number-format';

const NumericInput = ({
  label,
  name,
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
  prefix = '',
  suffix = '',
  thousandSeparator = true,
  decimalScale = 2,
  allowNegative = false,
  isAllowed,
  ariaDescribedBy,
  ariaInvalid,
  ariaRequired = required,
  ariaLabel,
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

  const handleValueChange = (values) => {
    const { floatValue } = values;
    // If the input is cleared (undefined or null), set to the minimum allowed value or 0
    const safeValue = floatValue !== undefined && floatValue !== null ? floatValue : (props.min || 0);
    onChange(safeValue);
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

        <motion.div
          className="w-full"
          variants={inputVariants}
          animate={animationState}
        >
          <NumericFormat
            id={name}
            name={name}
            value={value}
            onValueChange={handleValueChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`input input-loanviz w-full h-12 sm:h-auto text-base ${
              icon ? 'pl-10' : ''
            } ${
              rightIcon || suffix ? 'pr-10' : ''
            } ${
              error ? 'input-error' : ''
            } ${inputClassName}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
            prefix={prefix}
            suffix={suffix}
            thousandSeparator={thousandSeparator}
            decimalScale={decimalScale}
            allowNegative={allowNegative}
            isAllowed={isAllowed}
            aria-describedby={ariaDescribedBy || (error || helperText ? `${name}-helper` : undefined)}
            aria-invalid={ariaInvalid || !!error}
            aria-required={ariaRequired}
            aria-label={ariaLabel || label}
            {...props}
          />
        </motion.div>

        {rightIcon && !suffix && (
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
        <label className="label" htmlFor={name}>
          {error ? (
            <span id={`${name}-helper`} className="label-text-alt text-error" role="alert">{error}</span>
          ) : helperText ? (
            <span id={`${name}-helper`} className="label-text-alt">{helperText}</span>
          ) : null}
        </label>
      )}
    </div>
  );
};

export default NumericInput;
