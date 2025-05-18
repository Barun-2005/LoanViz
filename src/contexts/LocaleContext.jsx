import { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getUserLocale,
  getUserLocaleSynchronous,
  detectBrowserLocale,
  detectRegionFromIP,
  SUPPORTED_LOCALES,
  getLocaleDetails
} from '../utils/regionDetection';
import {
  formatCurrency as formatCurrencyUtil,
  formatCompactNumber as formatCompactNumberUtil,
  getCurrencySymbol,
  formatCurrencyForChart
} from '../utils/formatUtils';

// Create the context
const LocaleContext = createContext();

/**
 * LocaleProvider component for managing locale settings
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Locale provider component
 */
export const LocaleProvider = ({ children }) => {
  const { i18n } = useTranslation();

  // Get initial locale synchronously for first render
  const initialLocale = getUserLocaleSynchronous();
  const [locale, setLocale] = useState(initialLocale);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState(localStorage.getItem('localeDetectionMethod') || 'browser');

  // Get current locale details
  const currentLocale = getLocaleDetails(locale);

  // Map currency codes to locale codes
  const currencyCodes = {
    'en-GB': 'GBP',
    'en-IN': 'INR',
    'en-US': 'USD'
  };

  // Format currency based on current locale
  const formatCurrency = (amount, options = {}) => {
    return formatCurrencyUtil(amount, locale, currencyCodes[locale], options);
  };

  // Format number based on current locale
  const formatNumber = (number, options = {}) => {
    if (number === undefined || number === null || isNaN(number)) return '';

    // Ensure number is a number
    number = parseFloat(number) || 0;

    const {
      minimumFractionDigits = 0,
      maximumFractionDigits = 2,
      notation = 'standard'
    } = options;

    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
        notation
      }).format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      // Fallback formatting
      return number.toFixed(maximumFractionDigits);
    }
  };

  // Format percentage based on current locale
  const formatPercentage = (number, options = {}) => {
    if (number === undefined || number === null || isNaN(number)) return '';

    // Ensure number is a number
    number = parseFloat(number) || 0;

    const {
      minimumFractionDigits = 0,
      maximumFractionDigits = 2
    } = options;

    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits,
        maximumFractionDigits
      }).format(number / 100);
    } catch (error) {
      console.error('Error formatting percentage:', error);
      // Fallback formatting
      return `${(number).toFixed(maximumFractionDigits)}%`;
    }
  };

  // Format number in compact notation based on locale
  const formatCompactNumber = (number, options = {}) => {
    return formatCompactNumberUtil(number, locale, options);
  };

  // Format currency for chart labels
  const formatChartCurrency = (value) => {
    return formatCurrencyForChart(value, locale, currencyCodes[locale]);
  };

  // Change locale
  const changeLocale = (newLocale) => {
    if (SUPPORTED_LOCALES[newLocale]) {
      setLocale(newLocale);
      localStorage.setItem('locale', newLocale);
      i18n.changeLanguage(newLocale);
    }
  };

  // Update i18n language when locale changes
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale, i18n]);

  // Add auto-detection of locale on first visit using IP geolocation
  useEffect(() => {
    const detectLocale = async () => {
      // Only run on first visit (when localStorage doesn't have a locale)
      // or when the locale was previously auto-detected but not confirmed
      const shouldDetect = !localStorage.getItem('locale') ||
                          (localStorage.getItem('localeAutoDetected') === 'true' &&
                           !localStorage.getItem('localeConfirmed'));

      if (shouldDetect) {
        setIsDetecting(true);
        try {
          // Use IP-based detection for more accuracy
          const detectedLocale = await getUserLocale();
          if (detectedLocale && detectedLocale !== locale) {
            changeLocale(detectedLocale);
            // Mark that this locale was auto-detected
            localStorage.setItem('localeAutoDetected', 'true');
            console.log('Auto-detected and set locale:', detectedLocale);
          }
        } catch (error) {
          console.error('Error during locale detection:', error);
        } finally {
          setIsDetecting(false);
        }
      }
    };

    detectLocale();
  }, []);

  // Context value
  const value = {
    locale,
    currentLocale,
    supportedLocales: SUPPORTED_LOCALES,
    changeLocale,
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatCompactNumber,
    formatChartCurrency,
    isDetecting,
    detectionMethod,
    getCurrencySymbol: (currency = currencyCodes[locale]) => getCurrencySymbol(locale, currency)
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};

/**
 * Custom hook for using the locale context
 * @returns {Object} Locale context value
 */
export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export default LocaleContext;
