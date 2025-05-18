import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enGB from './locales/en-GB.json';
import enIN from './locales/en-IN.json';

// Initialize i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default language
    fallbackLng: 'en-GB',
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',
    // Resources with translations
    resources: {
      'en-GB': {
        translation: enGB
      },
      'en-IN': {
        translation: enIN
      }
    },
    // Interpolation configuration
    interpolation: {
      escapeValue: false // React already escapes values
    },
    // Detection options
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'locale',
      caches: ['localStorage']
    }
  });

export default i18n;
