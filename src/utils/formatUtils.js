// Formatting utilities for numbers, currencies, and dates with locale support
export const formatNumber = (number, locale = 'en-GB', options = {}) => {
  if (number === undefined || number === null) return '';

  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    notation = 'standard'
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    notation
  }).format(number);
};

// Format currency with proper symbol and decimal places
export const formatCurrency = (amount, locale = 'en-GB', currency = 'GBP', options = {}) => {
  // Handle undefined, null, or NaN values
  if (amount === undefined || amount === null || isNaN(amount)) return '';

  // Ensure amount is a number
  amount = parseFloat(amount) || 0;

  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    notation = 'standard'
  } = options;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
      notation
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback formatting
    return `${getCurrencySymbol(locale, currency)}${amount.toFixed(maximumFractionDigits)}`;
  }
};

// Format number as percentage with locale support
export const formatPercentage = (number, locale = 'en-GB', options = {}) => {
  if (number === undefined || number === null) return '';

  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(number / 100);
};

// Format date with locale-specific formatting
export const formatDate = (date, locale = 'en-GB', options = {}) => {
  if (!date) return '';

  const {
    dateStyle = 'medium',
    timeStyle = undefined
  } = options;

  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    timeStyle
  }).format(dateObj);
};

// Get currency symbol (£, $, €, etc.) for a given locale and currency code
export const getCurrencySymbol = (locale = 'en-GB', currency = 'GBP') => {
  // Common currency symbols map
  const currencySymbolMap = {
    'GBP': '£',
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'JPY': '¥',
    'CNY': '¥'
  };

  // Use direct mapping when available
  if (currencySymbolMap[currency]) {
    return currencySymbolMap[currency];
  }

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    const parts = formatter.formatToParts(0);
    const currencySymbol = parts.find(part => part.type === 'currency')?.value || currency;

    return currencySymbol;
  } catch (error) {
    console.error('Error getting currency symbol:', error);
    // Fallback to currency code
    return currency;
  }
};

// Format large numbers in compact form (1.2M, 5K, etc.)
export const formatCompactNumber = (number, locale = 'en-GB', options = {}) => {
  // Handle undefined, null, or NaN values
  if (number === undefined || number === null || isNaN(number)) return '';

  // Ensure number is a number
  number = parseFloat(number) || 0;

  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 1
  } = options;

  // Use Indian format for en-IN locale
  if (locale === 'en-IN') {
    return formatIndianCompactNumber(number, maximumFractionDigits);
  }

  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits,
      maximumFractionDigits
    }).format(number);
  } catch (error) {
    console.error('Error formatting compact number:', error);
    // Fallback formatting
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(maximumFractionDigits)}M`;
    } else if (number >= 1000) {
      return `${(number / 1000).toFixed(maximumFractionDigits)}K`;
    }
    return number.toFixed(maximumFractionDigits);
  }
};

// Format numbers using Indian notation (K, L for lakhs, Cr for crores)
export const formatIndianCompactNumber = (number, decimals = 1) => {
  // Handle undefined, null, or NaN values
  if (number === undefined || number === null || isNaN(number)) return '';

  // Ensure number is a number
  number = parseFloat(number) || 0;

  // Define thresholds and suffixes for Indian notation
  const thresholds = [
    { value: 10000000, suffix: 'Cr' },  // 1 crore = 10,000,000
    { value: 100000, suffix: 'L' },     // 1 lakh = 100,000
    { value: 1000, suffix: 'K' }        // 1 thousand = 1,000
  ];

  // Find the appropriate threshold
  for (const { value, suffix } of thresholds) {
    if (number >= value) {
      const scaledValue = number / value;
      return `${scaledValue.toFixed(decimals)}${suffix}`;
    }
  }

  // If below the smallest threshold, just return the number
  return number.toFixed(decimals);
};

// Format currency values for chart labels (compact with currency symbol)
export const formatCurrencyForChart = (value, locale = 'en-GB', currency = 'GBP') => {
  // Handle undefined, null, or NaN values
  if (value === undefined || value === null || isNaN(value)) return '';

  // Ensure value is a number
  value = parseFloat(value) || 0;

  // Get currency symbol
  const currencySymbol = getCurrencySymbol(locale, currency);

  // Use Indian format for en-IN locale
  if (locale === 'en-IN') {
    if (value >= 10000000) {
      return `${currencySymbol}${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `${currencySymbol}${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `${currencySymbol}${(value / 1000).toFixed(0)}K`;
    }
  } else {
    // Standard format for other locales
    if (value >= 1000000) {
      return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${currencySymbol}${(value / 1000).toFixed(0)}K`;
    }
  }

  // For small values, just use the currency symbol and number
  return `${currencySymbol}${value.toFixed(0)}`;
};

// Format number as ordinal (1st, 2nd, 3rd, etc.)
export const formatOrdinal = (number, locale = 'en-GB') => {
  if (number === undefined || number === null) return '';

  const formatter = new Intl.PluralRules(locale, { type: 'ordinal' });
  const suffix = {
    'en-GB': {
      one: 'st',
      two: 'nd',
      few: 'rd',
      other: 'th'
    },
    'en-IN': {
      one: 'st',
      two: 'nd',
      few: 'rd',
      other: 'th'
    }
  }[locale]?.[formatter.select(number)] || 'th';

  return `${number}${suffix}`;
};
