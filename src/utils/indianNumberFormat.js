// Indian number formatting utilities
export const formatIndianNumber = (number, decimals = 0) => {
  if (number === undefined || number === null) return '';

  // Convert to string and split into integer and decimal parts
  const parts = number.toFixed(decimals).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Format the integer part with Indian grouping (e.g., 1,23,456)
  let formattedInteger = '';

  // Handle the first 3 digits (from right)
  const firstGroup = integerPart.length % 2 === 0 ?
    integerPart.substring(0, 2) :
    integerPart.substring(0, 1);

  formattedInteger = firstGroup;

  // Add the rest of the digits in groups of 2
  for (let i = firstGroup.length; i < integerPart.length; i += 2) {
    formattedInteger += ',' + integerPart.substring(i, i + 2);
  }

  // Add decimal part if needed
  return decimals > 0 ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

// Format numbers with Indian abbreviations (K, L, Cr)
export const formatIndianCompactNumber = (number, decimals = 1) => {
  if (number === undefined || number === null) return '';

  // Define thresholds and suffixes
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

// Format numbers with locale-specific abbreviations
export const formatCompactNumberByLocale = (number, locale = 'en-GB', decimals = 1) => {
  if (number === undefined || number === null) return '';

  // Use Indian compact notation for en-IN locale
  if (locale === 'en-IN') {
    return formatIndianCompactNumber(number, decimals);
  }

  // For other locales, use standard compact notation with K, M, B suffixes
  const thresholds = [
    { value: 1000000000, suffix: 'B' }, // Billion
    { value: 1000000, suffix: 'M' },    // Million
    { value: 1000, suffix: 'K' }        // Thousand
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
