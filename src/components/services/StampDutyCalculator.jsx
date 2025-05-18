import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaStamp, FaHome, FaInfoCircle, FaChartBar, FaCalendarAlt, FaHistory } from 'react-icons/fa';
// Import modern UI components individually
import GlassCard from '../ui/modern/GlassCard';
import GlowButton from '../ui/modern/GlowButton';
import StyledSlider from '../ui/modern/StyledSlider';
import TooltipOverlay from '../ui/modern/TooltipOverlay';
import AnimatedNumberDisplay from '../ui/modern/AnimatedNumberDisplay';
import NumericInput from '../ui/NumericInput';
import ChartWrapper from '../ui/ChartWrapper';
import ResponsiveFormSection from '../ui/ResponsiveFormSection';
import ResponsiveContainer from '../ui/ResponsiveContainer';
import ResponsiveGrid from '../ui/ResponsiveGrid';
import RegulatoryDisclaimer from '../ui/RegulatoryDisclaimer';
import MobileSelectDropdown from '../ui/MobileSelectDropdown';
import { useLocale } from '../../contexts/LocaleContext';
// Import config directly
import stampDutyConfig from '../../config/stampDutyConfig.json';
// Import new components
import StampDutyEducation from './StampDutyEducation';
import StampDutyHistorical from './StampDutyHistorical';
import PropertyTypeSelector from './PropertyTypeSelector';

// Calculates property purchase taxes (stamp duty) for different regions
// Uses official tax formulas from UK HMRC and Indian state guidelines
// Sources: gov.uk/stamp-duty-land-tax, revenue.scot, gov.wales, igrs.maharashtra.gov.in
const StampDutyCalculator = ({
  loanTypeId = 'mortgage',
  onCalculationComplete = null
}) => {
  const { t } = useTranslation();
  const {
    locale,
    currentLocale,
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatCompactNumber
  } = useLocale();

  // Check if we're on mobile for responsive adjustments
  const [isMobile, setIsMobile] = useState(false);

  // Set mobile state based on window width
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640);
      }
    };

    // Initial check
    checkMobile();

    // Add resize listener
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Get available locations based on current locale
  const localeConfig = stampDutyConfig[locale] || stampDutyConfig['en-GB'];
  const availableLocations = Object.keys(localeConfig);

  // Get stamp duty rates from config based on locale
  const getStampDutyRates = () => {
    return localeConfig;
  };

  // Get current stamp duty rates
  const stampDutyRates = getStampDutyRates();

  // Get region-specific default property values
  const getDefaultPropertyValue = () => {
    if (loanTypeId === 'investment') {
      // Investment properties typically have higher values
      if (locale === 'en-IN') return 5000000; // ₹50 Lakhs for India
      if (locale === 'en-US') return 400000; // $400k for US
      return 300000; // £300k for UK
    } else {
      // Regular residential properties
      if (locale === 'en-IN') return 3000000; // ₹30 Lakhs for India
      if (locale === 'en-US') return 250000; // $250k for US
      return 200000; // £200k for UK
    }
  };

  // State for property value and location
  const [propertyValue, setPropertyValue] = useState(getDefaultPropertyValue());
  const [location, setLocation] = useState(availableLocations[0] || 'england');
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false);
  const [isAdditionalProperty, setIsAdditionalProperty] = useState(loanTypeId === 'investment');
  const [isNonResident, setIsNonResident] = useState(false);

  // Get the current location config
  const currentLocationConfig = stampDutyRates[location] || {};

  // Get available property types for the current location
  const availablePropertyTypes = currentLocationConfig.propertyTypes || [
    { id: 'residential', name: 'Residential', isDefault: true }
  ];

  // State for property type
  const [propertyType, setPropertyType] = useState(() => {
    const defaultType = availablePropertyTypes.find(type => type.isDefault)?.id || 'residential';
    return defaultType;
  });

  // State for historical rates
  const [useHistoricalRates, setUseHistoricalRates] = useState(false);
  const [selectedHistoricalPeriod, setSelectedHistoricalPeriod] = useState(0);

  // Get historical periods if available
  const historicalPeriods = currentLocationConfig.historicalRates || [];

  // State for results
  const [stampDutyResults, setStampDutyResults] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [effectiveRateData, setEffectiveRateData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Refs
  const resultsRef = useRef(null);

  // We no longer calculate automatically on input change
  // Instead, we'll use a button to trigger the calculation

  // Calculate stamp duty
  const calculateStampDuty = () => {
    // Set calculating state
    setIsCalculating(true);

    // Get the location config
    const locationConfig = stampDutyRates[location];

    // Get the rate table based on historical period if selected
    let rateTableSource = locationConfig;

    if (useHistoricalRates && historicalPeriods.length > 0) {
      const selectedPeriod = historicalPeriods[selectedHistoricalPeriod];
      if (selectedPeriod) {
        rateTableSource = selectedPeriod;
      }
    }

    // Determine which rate table to use based on property type and buyer status
    let rateTable;

    // First check if we should use a property-type specific table
    if (propertyType !== 'residential' && locationConfig[propertyType]) {
      rateTable = locationConfig[propertyType];
    }
    // If not, use the standard buyer status tables
    else if (isAdditionalProperty) {
      rateTable = rateTableSource.additionalProperty;
    } else if (isFirstTimeBuyer) {
      rateTable = rateTableSource.firstTimeBuyer;
    } else {
      rateTable = rateTableSource.standard;
    }

    // Calculate stamp duty for each band
    let remainingValue = propertyValue;
    let totalTax = 0;
    const bands = [];

    for (let i = 0; i < rateTable.length; i++) {
      const currentBand = rateTable[i];
      const nextBand = rateTable[i + 1];

      const bandStart = currentBand.threshold;
      const bandEnd = nextBand ? nextBand.threshold - 1 : Infinity;
      const bandRate = currentBand.rate / 100;

      const valueInBand = Math.min(
        Math.max(0, remainingValue - bandStart),
        bandEnd - bandStart + 1
      );

      const taxInBand = valueInBand * bandRate;

      if (valueInBand > 0) {
        bands.push({
          start: bandStart,
          end: bandEnd,
          rate: currentBand.rate,
          valueInBand,
          taxInBand
        });
      }

      totalTax += taxInBand;
      remainingValue -= valueInBand;

      if (remainingValue <= 0) break;
    }

    // Apply non-resident surcharge if applicable
    let nonResidentSurcharge = 0;
    if (isNonResident && locationConfig && locationConfig.nonResidentSurcharge) {
      nonResidentSurcharge = propertyValue * (locationConfig.nonResidentSurcharge / 100);
      totalTax += nonResidentSurcharge;
    }

    // Apply registration fee for Indian properties
    let registrationFee = 0;
    if (locale === 'en-IN' && locationConfig && locationConfig.registrationFee) {
      if (locationConfig.registrationFeeCap) {
        // If there's a cap, calculate as percentage but cap at maximum
        registrationFee = Math.min(
          propertyValue * (locationConfig.registrationFee / 100),
          locationConfig.registrationFeeCap
        );
      } else {
        // Fixed fee
        registrationFee = locationConfig.registrationFee;
      }
      totalTax += registrationFee;
    }

    // Apply additional charges if applicable
    let additionalCharges = [];
    if (locationConfig && locationConfig.additionalCharges) {
      locationConfig.additionalCharges.forEach(charge => {
        if (!charge.isVariable && charge.rate) {
          const chargeAmount = propertyValue * (charge.rate / 100);
          additionalCharges.push({
            name: charge.name,
            amount: chargeAmount
          });
          totalTax += chargeAmount;
        }
      });
    }

    // Calculate effective tax rate
    const effectiveRate = (totalTax / propertyValue) * 100;

    // Create results object
    const results = {
      propertyValue,
      location,
      propertyType,
      isFirstTimeBuyer,
      isAdditionalProperty,
      isNonResident,
      useHistoricalRates,
      selectedHistoricalPeriod: useHistoricalRates ? selectedHistoricalPeriod : null,
      bands,
      totalTax,
      nonResidentSurcharge,
      registrationFee,
      additionalCharges,
      effectiveRate,
      taxName: stampDutyRates[location].name || t('stampDuty.title'),
      historicalPeriod: useHistoricalRates && historicalPeriods[selectedHistoricalPeriod]
        ? historicalPeriods[selectedHistoricalPeriod].description
        : null
    };

    // Set results
    setStampDutyResults(results);

    // Prepare chart data
    prepareChartData(bands);
    prepareEffectiveRateData();

    // Reset calculating state
    setIsCalculating(false);

    // Call the onCalculationComplete callback if provided
    if (onCalculationComplete && typeof onCalculationComplete === 'function') {
      onCalculationComplete(results);
    }

    // Scroll to results
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  // Prepare chart data for visualization
  const prepareChartData = (bands) => {
    if (!bands || bands.length === 0) return;

    const labels = bands.map(band => {
      if (band.end === Infinity) {
        return `Over ${formatCompactNumber(band.start)}`;
      }
      // Shorten labels for better display
      return `${formatCompactNumber(band.start)}${band.end < 1000000 ? '' : '+'}`;
    });

    const data = bands.map(band => band.taxInBand);

    // Get the tax name from the location config or use a default
    const taxName = stampDutyRates &&
                    location &&
                    stampDutyRates[location] &&
                    stampDutyRates[location].name
                      ? stampDutyRates[location].name
                      : t('stampDuty.title');

    setChartData({
      labels,
      datasets: [
        {
          label: taxName,
          data,
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(59, 130, 246, 0.8)';
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.5)');
            return gradient;
          },
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
          hoverBorderColor: 'rgba(59, 130, 246, 1)',
          hoverBorderWidth: 2
        }
      ]
    });
  };

  // Prepare effective rate chart data
  const prepareEffectiveRateData = () => {
    // Generate data points for property values from £50,000 to £2,000,000
    const dataPoints = [];
    const values = [];

    // Use fewer data points on mobile for better performance and readability
    const stepSize = isMobile ? 250000 : 100000;
    const maxValue = 2000000;

    for (let value = 50000; value <= maxValue; value += stepSize) {
      values.push(value);

      // Calculate stamp duty for this value
      let rateTable;
      if (isAdditionalProperty) {
        rateTable = stampDutyRates[location].additionalProperty;
      } else if (isFirstTimeBuyer) {
        rateTable = stampDutyRates[location].firstTimeBuyer;
      } else {
        rateTable = stampDutyRates[location].standard;
      }

      let remainingValue = value;
      let totalTax = 0;

      for (let i = 0; i < rateTable.length; i++) {
        const currentBand = rateTable[i];
        const nextBand = rateTable[i + 1];

        const bandStart = currentBand.threshold;
        const bandEnd = nextBand ? nextBand.threshold - 1 : Infinity;
        const bandRate = currentBand.rate / 100;

        const valueInBand = Math.min(
          Math.max(0, remainingValue - bandStart),
          bandEnd - bandStart + 1
        );

        totalTax += valueInBand * bandRate;
        remainingValue -= valueInBand;

        if (remainingValue <= 0) break;
      }

      // Apply non-resident surcharge if applicable
      if (isNonResident && stampDutyRates[location].nonResidentSurcharge) {
        totalTax += value * (stampDutyRates[location].nonResidentSurcharge / 100);
      }

      // Add registration fee if applicable (for Indian locale)
      if (locale === 'en-IN' && stampDutyRates[location].registrationFee > 0) {
        const regFeePercent = stampDutyRates[location].registrationFee / 100;
        let regFee = value * regFeePercent;

        // Apply cap if exists
        if (stampDutyRates[location].registrationFeeCap && regFee > stampDutyRates[location].registrationFeeCap) {
          regFee = stampDutyRates[location].registrationFeeCap;
        }

        totalTax += regFee;
      }

      // Calculate effective tax rate and cap it at 10% for better visualization
      let effectiveRate = (totalTax / value) * 100;

      // Cap extreme values to prevent chart distortion
      if (effectiveRate > 10) {
        effectiveRate = 10;
      }

      dataPoints.push(effectiveRate);
    }

    setEffectiveRateData({
      labels: values.map(value => {
        // Format the labels with the currency symbol but without the full formatting
        return `${formatCompactNumber(value)}`;
      }),
      datasets: [
        {
          label: 'Effective Rate (%)',
          data: dataPoints,
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: window.innerWidth < 640 ? 1.5 : 2,
          fill: true,
          tension: 0.4,
          pointRadius: window.innerWidth < 640 ? 2 : 3,
          pointHoverRadius: window.innerWidth < 640 ? 4 : 6,
          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
          pointHoverBackgroundColor: 'rgba(16, 185, 129, 1)',
          pointBorderColor: '#fff',
          pointHoverBorderColor: '#fff',
          pointBorderWidth: window.innerWidth < 640 ? 1 : 2,
          pointHoverBorderWidth: window.innerWidth < 640 ? 1 : 2
        }
      ]
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // We're now using the formatCurrency and formatPercentage functions from the locale context

  return (
    <div className="stamp-duty-calculator">
      {/* Educational Information */}
      <StampDutyEducation locationConfig={currentLocationConfig} location={location} />

      {/* Calculator Form */}
      <GlassCard
        className="mb-4"
        title="Stamp Duty Calculator"
        icon={<FaStamp className="h-5 w-5" />}
        variant="primary"
        effect="glow"
        animate={true}
      >
        <div className="p-3 sm:p-4">

          <ResponsiveGrid cols={2} mobileCols={1} gap="6">
            {/* Property Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('stampDuty.propertyValue', 'Property Value')}
              </label>
              <NumericInput
                value={propertyValue}
                onChange={setPropertyValue}
                min={50000}
                max={10000000}
                step={1000}
                prefix={currentLocale.currency}
                thousandSeparator={true}
                decimalScale={0}
                className="text-base sm:text-lg"
              />
              <StyledSlider
                min={50000}
                max={2000000}
                step={isMobile ? 25000 : 10000}
                value={propertyValue}
                onChange={setPropertyValue}
                className="mt-2"
                symbol={currentLocale.currency}
                symbolPosition="prefix"
                formatValue={(val) => val.toLocaleString()}
                leftLabel={`${currentLocale.currency}${isMobile ? '50K' : '50,000'}`}
                rightLabel={`${currentLocale.currency}${isMobile ? '2M' : '2,000,000'}`}
                trackColor="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400"
                thumbSize={isMobile ? "sm" : "md"}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {locale === 'en-GB'
                  ? t('stampDuty.propertyLocation', 'Property Location')
                  : locale === 'en-US'
                    ? t('stampDuty.propertyState', 'Property State')
                    : t('stampDuty.propertyRegion', 'Property Region')}
              </label>
              {/* Use different dropdown component based on screen size */}
              {isMobile ? (
                <MobileSelectDropdown
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  options={availableLocations.map(loc => ({
                    value: loc,
                    label: t(`stampDuty.${loc}`, { defaultValue: loc.charAt(0).toUpperCase() + loc.slice(1) })
                  }))}
                  ariaLabel={t('stampDuty.location')}
                  className="mb-2"
                  buttonClassName="py-3 text-base" // Larger touch target for mobile
                  dropdownClassName="max-h-[50vh] overflow-y-auto" // Limit height on mobile
                />
              ) : (
                <div className="relative">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="select select-loanviz w-full appearance-none"
                    aria-label={t('stampDuty.location')}
                  >
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {t(`stampDuty.${loc}`, { defaultValue: loc.charAt(0).toUpperCase() + loc.slice(1) })}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Property Type Selector */}
              {availablePropertyTypes.length > 1 && (
                <PropertyTypeSelector
                  propertyTypes={availablePropertyTypes}
                  selectedType={propertyType}
                  onSelect={setPropertyType}
                />
              )}

              {/* Historical Rates Selector */}
              {historicalPeriods.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="useHistoricalRates"
                      checked={useHistoricalRates}
                      onChange={(e) => setUseHistoricalRates(e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <label htmlFor="useHistoricalRates" className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                      <FaHistory className="mr-1 h-4 w-4" />
                      Use historical rates
                    </label>
                    <TooltipOverlay content="Calculate using rates from a previous time period">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </TooltipOverlay>
                  </div>

                  {useHistoricalRates && (
                    <div className="mt-2">
                      {isMobile ? (
                        <MobileSelectDropdown
                          value={selectedHistoricalPeriod.toString()}
                          onChange={(e) => setSelectedHistoricalPeriod(Number(e.target.value))}
                          options={historicalPeriods.map((period, index) => ({
                            value: index.toString(),
                            label: `${period.description} (${formatDate(period.startDate)} - ${formatDate(period.endDate)})`
                          }))}
                          ariaLabel="Historical period"
                          className="mb-2"
                          buttonClassName="py-3 text-base" // Larger touch target for mobile
                          dropdownClassName="max-h-[40vh] overflow-y-auto" // Limit height on mobile
                        />
                      ) : (
                        <div className="relative">
                          <select
                            value={selectedHistoricalPeriod}
                            onChange={(e) => setSelectedHistoricalPeriod(Number(e.target.value))}
                            className="select select-loanviz w-full appearance-none"
                            aria-label="Historical period"
                          >
                            {historicalPeriods.map((period, index) => (
                              <option key={index} value={index}>
                                {period.description} ({formatDate(period.startDate)} - {formatDate(period.endDate)})
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Buyer Status */}
              <div className="mt-4 space-y-2">
                {loanTypeId === 'mortgage' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="firstTimeBuyer"
                      checked={isFirstTimeBuyer}
                      onChange={(e) => {
                        setIsFirstTimeBuyer(e.target.checked);
                        if (e.target.checked) {
                          setIsAdditionalProperty(false);
                        }
                      }}
                      className="checkbox checkbox-primary"
                      disabled={isAdditionalProperty}
                    />
                    <label htmlFor="firstTimeBuyer" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      First-time buyer
                    </label>
                    <TooltipOverlay content="First-time buyers may pay less or no stamp duty.">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </TooltipOverlay>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="additionalProperty"
                    checked={isAdditionalProperty}
                    onChange={(e) => {
                      setIsAdditionalProperty(e.target.checked);
                      if (e.target.checked) {
                        setIsFirstTimeBuyer(false);
                      }
                    }}
                    className="checkbox checkbox-primary"
                    disabled={isFirstTimeBuyer}
                  />
                  <label htmlFor="additionalProperty" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Additional property
                  </label>
                  <TooltipOverlay content="Higher rates apply if this is an additional property (e.g., second home or buy-to-let).">
                    <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  </TooltipOverlay>
                </div>

                {/* Only show Non-UK resident option for UK locale */}
                {locale === 'en-GB' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="nonResident"
                      checked={isNonResident}
                      onChange={(e) => setIsNonResident(e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <label htmlFor="nonResident" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t('stampDuty.nonResident', 'Non-UK resident')}
                    </label>
                    <TooltipOverlay content={`Non-UK residents pay an additional ${stampDutyRates[location]?.nonResidentSurcharge || 2}% surcharge.`}>
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </TooltipOverlay>
                  </div>
                )}
              </div>
            </div>
          </ResponsiveGrid>

          {/* Calculate Button */}
          <div className="mt-6 sm:mt-8 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-2/3 md:w-1/2"
            >
              <GlowButton
                variant="primary"
                size="xl"
                onClick={calculateStampDuty}
                disabled={isCalculating}
                effect="glow"
                fullWidth
              >
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 1 }}
                  animate={isCalculating ? {} : {
                    y: [0, -2, 0],
                    transition: {
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin mr-3 h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
                      <span className="text-lg">Calculating...</span>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ rotate: [0, 15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        className="mr-3"
                      >
                        <FaStamp className="h-5 w-5" />
                      </motion.div>
                      <span className="text-lg font-medium">Calculate Stamp Duty</span>
                    </>
                  )}
                </motion.div>
              </GlowButton>
            </motion.div>
          </div>
        </div>
      </GlassCard>

      {/* Historical Rates Information */}
      <StampDutyHistorical locationConfig={currentLocationConfig} location={location} />

      {/* Results */}
      {stampDutyResults && (
        <div ref={resultsRef}>
          {/* Summary Card */}
          <GlassCard
            className="mb-4"
            title="Stamp Duty Summary"
            icon={<FaStamp className="h-5 w-5" />}
            variant="success"
            effect="glow"
            animate={true}
          >
            <div className="p-4">
              {/* Historical Rate Notice */}
              {stampDutyResults.useHistoricalRates && stampDutyResults.historicalPeriod && (
                <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border-l-4 border-amber-500">
                  <div className="flex items-start">
                    <FaHistory className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-300">Historical Rate Calculation</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        This calculation uses rates from: {stampDutyResults.historicalPeriod}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <ResponsiveGrid cols={3} tabletCols={2} mobileCols={1} gap={isMobile ? "3" : "6"}>
                {/* Total Stamp Duty */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm sm:text-md font-semibold mb-1 sm:mb-2 text-blue-700 dark:text-blue-300">
                    {stampDutyResults.taxName || t('stampDuty.totalStampDuty')}
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
                    <AnimatedNumberDisplay
                      value={stampDutyResults.totalTax}
                      useCurrencySymbol={true}
                      decimals={0}
                      size={isMobile ? "lg" : "xl"}
                      color="text-blue-800 dark:text-blue-200"
                      effect="gradient"
                      animate={true}
                      separateDigits={true}
                      highlightChange={true}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">
                    For a property value of {currentLocale.currency}{stampDutyResults.propertyValue.toLocaleString(locale)}
                  </p>
                </div>

                {/* Effective Rate */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm sm:text-md font-semibold mb-1 sm:mb-2 text-green-700 dark:text-green-300">
                    Effective Tax Rate
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">
                    <AnimatedNumberDisplay
                      value={stampDutyResults.effectiveRate}
                      suffix="%"
                      decimals={2}
                      size={isMobile ? "lg" : "xl"}
                      color="text-green-800 dark:text-green-200"
                      effect="gradient"
                      animate={true}
                      highlightChange={true}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
                    Percentage of property value
                  </p>
                </div>

                {/* Property Details */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm sm:text-md font-semibold mb-1 sm:mb-2 text-purple-700 dark:text-purple-300">
                    Property Details
                  </h4>
                  <div className="text-sm sm:text-md text-purple-800 dark:text-purple-200">
                    <p className="mb-1">Location: {t(`stampDuty.${location}`, { defaultValue: location.charAt(0).toUpperCase() + location.slice(1) })}</p>

                    {/* Property Type */}
                    {stampDutyResults.propertyType && stampDutyResults.propertyType !== 'residential' && (
                      <p className="mb-1">
                        Type: {availablePropertyTypes.find(t => t.id === stampDutyResults.propertyType)?.name || stampDutyResults.propertyType}
                      </p>
                    )}

                    {isFirstTimeBuyer && <p className="mb-1">{t('stampDuty.firstTimeBuyer', 'First-time buyer')}</p>}
                    {isAdditionalProperty && <p className="mb-1">{t('stampDuty.additionalProperty', 'Additional property')}</p>}
                    {isNonResident && (
                      <p className="mb-1">
                        {t('stampDuty.nonResident', 'Non-UK resident')}
                        {stampDutyRates[location] && stampDutyRates[location].nonResidentSurcharge &&
                          ` (+${stampDutyRates[location].nonResidentSurcharge}% ${t('regionSpecific.nonResidentSurcharge', 'surcharge')})`
                        }
                      </p>
                    )}
                    {locale === 'en-IN' && stampDutyRates[location] && stampDutyRates[location].registrationFee > 0 && (
                      <p className="mb-1">
                        {t('regionSpecific.registrationFee', 'Registration Fee')}:
                        {stampDutyRates[location].registrationFeeCap
                          ? ` ${stampDutyRates[location].registrationFee}% (max ${formatCurrency(stampDutyRates[location].registrationFeeCap)})`
                          : ` ${formatCurrency(stampDutyRates[location].registrationFee)}`
                        }
                      </p>
                    )}

                    {/* Additional Charges */}
                    {stampDutyResults.additionalCharges && stampDutyResults.additionalCharges.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Additional Charges:</p>
                        {stampDutyResults.additionalCharges.map((charge, index) => (
                          <p key={index} className="text-xs ml-2">
                            {charge.name}: {formatCurrency(charge.amount)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ResponsiveGrid>

              {/* Tax Breakdown */}
              {stampDutyResults.bands && stampDutyResults.bands.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md sm:text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Tax Breakdown by Band
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="px-4 py-2 text-left">Band</th>
                          <th className="px-4 py-2 text-left">Rate</th>
                          <th className="px-4 py-2 text-left">Value in Band</th>
                          <th className="px-4 py-2 text-left">Tax in Band</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stampDutyResults.bands.map((band, index) => (
                          <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="px-4 py-2">
                              {band.end === Infinity
                                ? `Over ${formatCurrency(band.start)}`
                                : `${formatCurrency(band.start)} to ${formatCurrency(band.end)}`
                              }
                            </td>
                            <td className="px-4 py-2">{formatPercentage(band.rate / 100)}</td>
                            <td className="px-4 py-2">{formatCurrency(band.valueInBand)}</td>
                            <td className="px-4 py-2">{formatCurrency(band.taxInBand)}</td>
                          </tr>
                        ))}
                        {/* Additional rows for surcharges and fees */}
                        {stampDutyResults.nonResidentSurcharge > 0 && stampDutyRates[location] && (
                          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                            <td className="px-4 py-2" colSpan="3">Non-resident surcharge ({stampDutyRates[location].nonResidentSurcharge}%)</td>
                            <td className="px-4 py-2">{formatCurrency(stampDutyResults.nonResidentSurcharge)}</td>
                          </tr>
                        )}
                        {stampDutyResults.registrationFee > 0 && (
                          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                            <td className="px-4 py-2" colSpan="3">Registration Fee</td>
                            <td className="px-4 py-2">{formatCurrency(stampDutyResults.registrationFee)}</td>
                          </tr>
                        )}
                        {/* Total row */}
                        <tr className="font-bold bg-gray-100 dark:bg-gray-800">
                          <td className="px-4 py-2" colSpan="3">Total {stampDutyResults.taxName}</td>
                          <td className="px-4 py-2">{formatCurrency(stampDutyResults.totalTax)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Regulatory Disclaimer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6"
              >
                <RegulatoryDisclaimer
                  variant="subtle"
                  showIcon={true}
                />
              </motion.div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default StampDutyCalculator;
