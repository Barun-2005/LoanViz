import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHistory, FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../../contexts/LocaleContext';
import GlassCard from '../ui/modern/GlassCard';
import TooltipOverlay from '../ui/modern/TooltipOverlay';

/**
 * StampDutyHistorical component displays historical stamp duty rates
 * for the selected location.
 *
 * @param {Object} props - Component props
 * @param {Object} props.locationConfig - Configuration for the selected location
 * @param {string} props.location - Selected location/region
 * @returns {JSX.Element} Historical rates component
 */
const StampDutyHistorical = ({ locationConfig, location }) => {
  const { t } = useTranslation();
  const { formatCurrency, formatPercentage } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!locationConfig || !locationConfig.historicalRates) return null;

  // Get the tax name from the location config
  const taxName = locationConfig.name || t('stampDuty.title');

  // Get historical rates
  const historicalRates = locationConfig.historicalRates || [];

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <GlassCard
      className="mb-4"
      title={`Historical ${taxName} Rates`}
      icon={<FaHistory className="h-5 w-5" />}
      variant="secondary"
      effect="glow"
      animate={true}
      headerRight={
        <button
          onClick={toggleExpanded}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          aria-label={isExpanded ? "Collapse historical rates" : "Expand historical rates"}
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      }
    >
      <div className="p-4">
        <div className="text-gray-700 dark:text-gray-300">
          <p className="mb-2">
            {taxName} rates have changed over time. View historical rates to understand how they've evolved.
          </p>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {historicalRates.length > 0 ? (
                  <div className="mt-4 space-y-6">
                    {historicalRates.map((period, periodIndex) => (
                      <div key={periodIndex} className="border-l-4 border-purple-400 dark:border-purple-600 pl-4">
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                          {period.description || `Period ${periodIndex + 1}`}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </p>

                        {period.standard && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr className="bg-purple-50 dark:bg-purple-900/20">
                                  <th className="px-4 py-2 text-left">Property Value</th>
                                  <th className="px-4 py-2 text-left">Rate</th>
                                </tr>
                              </thead>
                              <tbody>
                                {period.standard.map((band, bandIndex) => (
                                  <tr key={bandIndex} className="border-b border-gray-200 dark:border-gray-700">
                                    <td className="px-4 py-2">
                                      {bandIndex === period.standard.length - 1
                                        ? `Over ${formatCurrency(band.threshold)}`
                                        : `${formatCurrency(band.threshold)} to ${formatCurrency(period.standard[bandIndex + 1].threshold - 1)}`
                                      }
                                    </td>
                                    <td className="px-4 py-2">{formatPercentage(band.rate / 100)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {period.notes && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <FaInfoCircle className="mr-1 mt-1 flex-shrink-0" />
                            <p>{period.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-gray-600 dark:text-gray-400 italic">
                    No historical rate information available for this location.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  );
};

export default StampDutyHistorical;
