import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaCheck } from 'react-icons/fa';

/**
 * MobileSelectDropdown component provides a mobile-friendly dropdown alternative to native select
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Currently selected value
 * @param {Function} props.onChange - Function to call when selection changes
 * @param {Array} props.options - Array of option objects with value and label properties
 * @param {string} props.className - Additional CSS classes for the container
 * @param {string} props.buttonClassName - Additional CSS classes for the button
 * @param {string} props.dropdownClassName - Additional CSS classes for the dropdown
 * @param {string} props.placeholder - Placeholder text when no option is selected
 * @param {string} props.ariaLabel - Accessibility label
 * @returns {JSX.Element} Mobile-friendly dropdown component
 */
const MobileSelectDropdown = ({
  value,
  onChange,
  options = [],
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  placeholder = 'Select an option',
  ariaLabel = 'Select an option',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the selected option label
  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle option selection
  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  // Animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: { 
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeInOut" }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        className={`flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${buttonClassName}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className="truncate">{displayText}</span>
        {isOpen ? (
          <FaChevronUp className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <FaChevronDown className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm ${dropdownClassName}`}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="listbox"
            tabIndex="-1"
            aria-labelledby="listbox-label"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  value === option.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' : 'text-gray-900 dark:text-gray-300'
                }`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={value === option.value}
              >
                <div className="flex items-center">
                  <span className={`block truncate ${value === option.value ? 'font-medium' : 'font-normal'}`}>
                    {option.label}
                  </span>
                </div>

                {value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-300">
                    <FaCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileSelectDropdown;
