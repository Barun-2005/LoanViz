import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobe, FaCheck, FaTimes, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { useLocale } from '../../contexts/LocaleContext';
import { SUPPORTED_LOCALES } from '../../utils/regionDetection';

/**
 * RegionDetectionBanner component that shows when a region is auto-detected
 * Allows users to confirm or change their detected region
 *
 * @returns {JSX.Element} Region detection banner component
 */
const RegionDetectionBanner = () => {
  const { locale, currentLocale, changeLocale, supportedLocales, isDetecting, detectionMethod } = useLocale();
  const [showBanner, setShowBanner] = useState(false);
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  useEffect(() => {
    // Check if this is an auto-detected locale (not manually set)
    const isFirstVisit = !localStorage.getItem('localeConfirmed');
    const wasAutoDetected = localStorage.getItem('localeAutoDetected') === 'true';

    if (isFirstVisit || wasAutoDetected) {
      setIsAutoDetected(true);
      setShowBanner(true);

      // Mark that we've shown the banner
      localStorage.setItem('localeAutoDetected', 'true');
    }
  }, [locale]); // Re-run when locale changes

  // Confirm the current locale
  const confirmLocale = () => {
    localStorage.setItem('localeConfirmed', 'true');
    localStorage.setItem('localeAutoDetected', 'false');
    setShowBanner(false);
  };

  // Dismiss the banner without confirming
  const dismissBanner = () => {
    setShowBanner(false);
  };

  // Animation variants
  const bannerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      y: -100,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  if (!showBanner && !isDetecting) return null;

  return (
    <AnimatePresence>
      {(showBanner || isDetecting) && (
        <motion.div
          className="fixed top-16 inset-x-0 z-50 flex justify-center px-4"
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-blue-200 dark:border-blue-900 p-3 max-w-lg w-full">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 rounded-full p-2 mr-3">
                {isDetecting ? (
                  <FaSpinner className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                ) : (
                  <FaMapMarkerAlt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isDetecting ? 'Detecting Your Region...' : isAutoDetected ? 'Region Detected' : 'Confirm Your Region'}
                </h3>

                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {isDetecting ? (
                    <p>Please wait while we detect your region to customize calculations and formats...</p>
                  ) : (
                    <>
                      <p>
                        We've detected you're from <span className="font-semibold">{currentLocale.name}</span>
                        {detectionMethod === 'ip' ? ' based on your location' : ' based on your browser settings'}.
                        We've customized calculations and formats for your region.
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.keys(SUPPORTED_LOCALES).map((localeCode) => {
                          const localeOption = SUPPORTED_LOCALES[localeCode];
                          return (
                            <button
                              key={localeCode}
                              className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium
                                ${locale === localeCode
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              onClick={() => changeLocale(localeCode)}
                            >
                              <span className="mr-1">{localeOption.flag}</span>
                              {localeOption.name}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {!isDetecting && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={confirmLocale}
                    >
                      <FaCheck className="mr-1.5 h-3 w-3" />
                      Confirm
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={dismissBanner}
                    >
                      <FaTimes className="mr-1.5 h-3 w-3" />
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegionDetectionBanner;
