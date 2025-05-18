// Region detection and locale mapping utilities
export const SUPPORTED_LOCALES = {
  'en-GB': {
    code: 'en-GB',
    name: 'United Kingdom',
    currency: '£',
    flag: '🇬🇧'
  },
  'en-IN': {
    code: 'en-IN',
    name: 'India',
    currency: '₹',
    flag: '🇮🇳'
  },
  'en-US': {
    code: 'en-US',
    name: 'United States',
    currency: '$',
    flag: '🇺🇸'
  }
};

// Fallback locale
export const DEFAULT_LOCALE = 'en-GB';

// Convert browser locale to one of our supported locales
export const mapBrowserLocaleToSupported = (browserLocale) => {
  if (!browserLocale) return DEFAULT_LOCALE;

  // First try exact match
  if (SUPPORTED_LOCALES[browserLocale]) {
    return browserLocale;
  }

  // Try matching just the language part (e.g., 'en' from 'en-GB')
  const languagePart = browserLocale.split('-')[0];

  // Map common English variants
  if (languagePart === 'en') {
    // Check for country-specific mappings
    const countryPart = browserLocale.split('-')[1]?.toUpperCase();

    if (countryPart) {
      // UK variants
      if (['GB', 'UK'].includes(countryPart)) {
        return 'en-GB';
      }

      // Indian variants
      if (['IN', 'INDIA'].includes(countryPart)) {
        return 'en-IN';
      }

      // US variants
      if (['US', 'USA'].includes(countryPart)) {
        return 'en-US';
      }
    }

    // Default to en-GB for English
    return 'en-GB';
  }

  // Default fallback
  return DEFAULT_LOCALE;
};

// Get locale info (name, currency, flag) from locale code
export const getLocaleDetails = (localeCode) => {
  return SUPPORTED_LOCALES[localeCode] || SUPPORTED_LOCALES[DEFAULT_LOCALE];
};

// Get user's locale from browser settings
export const detectBrowserLocale = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.navigator) {
    return DEFAULT_LOCALE;
  }

  // Try navigator.language first (most browsers)
  const browserLocale = window.navigator.language ||
                        window.navigator.userLanguage ||
                        window.navigator.browserLanguage;

  return mapBrowserLocaleToSupported(browserLocale);
};

// Determine user's locale from their IP address
export const detectRegionFromIP = async () => {
  try {
    // Use ipinfo.io free tier API (no API key required for basic info)
    const response = await fetch('https://ipinfo.io/json');
    const data = await response.json();

    // Get the country code from the response
    const countryCode = data.country;

    if (countryCode) {
      // Map country codes to our supported locales
      switch (countryCode) {
        case 'IN':
          return 'en-IN';
        case 'US':
          return 'en-US';
        case 'GB':
        case 'UK':
          return 'en-GB';
        default:
          // For other countries, return the browser locale
          return detectBrowserLocale();
      }
    }
  } catch (error) {
    console.error('Error detecting region from IP:', error);
  }

  // Fallback to browser locale if IP detection fails
  return detectBrowserLocale();
};

// Get user's locale (from storage or auto-detect)
export const getUserLocale = async () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_LOCALE;
  }

  // Check localStorage first
  const savedLocale = window.localStorage.getItem('locale');
  if (savedLocale && SUPPORTED_LOCALES[savedLocale]) {
    console.log('Using locale from localStorage:', savedLocale);
    return savedLocale;
  }

  try {
    // Try to detect from IP first (more accurate)
    const ipLocale = await detectRegionFromIP();
    console.log('Detected IP-based locale:', ipLocale);

    // Store the detected locale in localStorage for future visits
    try {
      window.localStorage.setItem('locale', ipLocale);
      window.localStorage.setItem('localeDetectionMethod', 'ip');
    } catch (error) {
      console.error('Error saving locale to localStorage:', error);
    }

    return ipLocale;
  } catch (error) {
    // Fallback to browser detection if IP detection fails
    console.error('IP detection failed, falling back to browser locale:', error);
    const browserLocale = detectBrowserLocale();
    console.log('Detected browser locale:', browserLocale);

    // Store the detected locale in localStorage for future visits
    try {
      window.localStorage.setItem('locale', browserLocale);
      window.localStorage.setItem('localeDetectionMethod', 'browser');
    } catch (error) {
      console.error('Error saving locale to localStorage:', error);
    }

    return browserLocale;
  }
};

// Get locale immediately without async detection (for initial render)
export const getUserLocaleSynchronous = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_LOCALE;
  }

  // Check localStorage first
  const savedLocale = window.localStorage.getItem('locale');
  if (savedLocale && SUPPORTED_LOCALES[savedLocale]) {
    return savedLocale;
  }

  // Fallback to browser detection
  return detectBrowserLocale();
};
