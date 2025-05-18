import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';
import { useLocale } from '../../contexts/LocaleContext';
import { tooltipAnimationVariants } from '../../utils/animationUtils';
import { SUPPORTED_LOCALES } from '../../utils/regionDetection';

/**
 * LocaleSelector component for changing the application locale
 * @returns {JSX.Element} Locale selector component
 */
const LocaleSelector = () => {
  const { locale, availableLocales, changeLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Get current locale details
  const currentLocale = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES['en-GB'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-controls="locale-dropdown"
      >
        <span className="text-lg mr-1 sm:mr-2" aria-hidden="true">{currentLocale.flag}</span>
        <span className="hidden sm:inline">{currentLocale.name}</span>
        <span className="inline sm:hidden">{currentLocale.currency}</span>
        <FaChevronDown
          className={`ml-0.5 sm:ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="locale-dropdown"
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            variants={tooltipAnimationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="locale-menu-button"
          >
            <div className="py-1" role="none">
              {Object.keys(SUPPORTED_LOCALES).map((localeCode) => {
                const localeOption = SUPPORTED_LOCALES[localeCode];
                return (
                  <button
                    key={localeCode}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      locale === localeCode
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      changeLocale(localeCode);
                      setIsOpen(false);
                    }}
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{localeOption.flag}</span>
                      <span>{localeOption.name}</span>
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        {localeOption.currency}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocaleSelector;
