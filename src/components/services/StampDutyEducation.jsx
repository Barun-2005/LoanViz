import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaChevronDown, FaChevronUp, FaExternalLinkAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../../contexts/LocaleContext';
import GlassCard from '../ui/modern/GlassCard';
import TooltipOverlay from '../ui/modern/TooltipOverlay';

/**
 * StampDutyEducation component provides educational information about stamp duty
 * that is customized based on the user's locale and selected region.
 *
 * @param {Object} props - Component props
 * @param {Object} props.locationConfig - Configuration for the selected location
 * @param {string} props.location - Selected location/region
 * @returns {JSX.Element} Educational component about stamp duty
 */
const StampDutyEducation = ({ locationConfig, location }) => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!locationConfig) return null;

  // Get the tax name from the location config
  const taxName = locationConfig.name || t('stampDuty.title');

  // Get the description from the location config or use a default
  const description = locationConfig.description ||
    t('stampDuty.defaultDescription', 'A tax paid when purchasing property or land.');

  // Get the payment deadline
  const paymentDeadline = locationConfig.paymentDeadline ||
    t('stampDuty.defaultPaymentDeadline', 'Varies by location');

  // Get the official link
  const officialLink = locationConfig.officialLink || '';

  // Get exemptions
  const exemptions = locationConfig.exemptions || [];

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <GlassCard
      className="mb-4"
      title={`About ${taxName}`}
      icon={<FaInfoCircle className="h-5 w-5" />}
      variant="info"
      effect="glow"
      animate={true}
      headerRight={
        <button
          onClick={toggleExpanded}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          aria-label={isExpanded ? "Collapse information" : "Expand information"}
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      }
    >
      <div className="p-4">
        <div className="text-gray-700 dark:text-gray-300">
          <p className="mb-2">{description}</p>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {/* Payment Information */}
                <div className="mt-4">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Payment Information</h4>
                  <p className="mb-2">
                    <span className="font-medium">Deadline:</span> {paymentDeadline}
                  </p>

                  {/* Who pays */}
                  <p className="mb-2">
                    <span className="font-medium">Who pays:</span> {' '}
                    {locale === 'en-US'
                      ? 'Usually the buyer, but can be negotiated between parties.'
                      : 'The buyer is responsible for paying this tax.'}
                  </p>

                  {/* How to pay */}
                  <p className="mb-2">
                    <span className="font-medium">How to pay:</span> {' '}
                    {locale === 'en-IN'
                      ? 'Payment is made at the Sub-Registrar\'s office during property registration.'
                      : locale === 'en-US'
                        ? 'Payment is typically handled by the escrow or title company at closing.'
                        : 'Payment is usually handled by your solicitor or conveyancer.'}
                  </p>
                </div>

                {/* Exemptions */}
                {exemptions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Possible Exemptions</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {exemptions.map((exemption, index) => (
                        <li key={index}>
                          <span className="font-medium">{exemption.name}:</span> {exemption.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional Charges */}
                {locationConfig.additionalCharges && locationConfig.additionalCharges.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Additional Charges</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {locationConfig.additionalCharges.map((charge, index) => (
                        <li key={index}>
                          <span className="font-medium">{charge.name}:</span> {charge.description}
                          {charge.rate && !charge.isVariable && ` (${charge.rate}%)`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Official Resources */}
                {officialLink && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Official Resources</h4>
                    <a
                      href={officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                    >
                      Official {taxName} Information <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                    </a>
                    {locationConfig.source && locationConfig.source !== officialLink && (
                      <a
                        href={locationConfig.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-1"
                      >
                        {location.charAt(0).toUpperCase() + location.slice(1)} Registration Department <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  );
};

export default StampDutyEducation;
