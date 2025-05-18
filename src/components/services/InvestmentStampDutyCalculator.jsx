import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FaStamp,
  FaBuilding,
  FaInfoCircle,
  FaChartBar,
  FaChartLine,
  FaPercentage,
  FaMoneyBillWave,
  FaHistory,
  FaCalculator
} from 'react-icons/fa';

// Import UI components
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
import { useLocale } from '../../contexts/LocaleContext';

// Import config and components
import stampDutyConfig from '../../config/stampDutyConfig.json';
import StampDutyEducation from './StampDutyEducation';
import StampDutyHistorical from './StampDutyHistorical';
import PropertyTypeSelector from './PropertyTypeSelector';
import StampDutyCalculator from './StampDutyCalculator';

/**
 * InvestmentStampDutyCalculator component for calculating transfer tax specifically for investment properties
 *
 * This component extends the standard StampDutyCalculator with investment-specific features:
 * - Pre-selects "Additional Property" option
 * - Focuses on commercial and mixed-use property types
 * - Provides option to calculate ROI impact based on transfer tax costs
 * - Provides investment-specific guidance
 *
 * @returns {JSX.Element} Investment-focused transfer tax calculator
 */
const InvestmentStampDutyCalculator = () => {
  const { t } = useTranslation();
  const {
    locale,
    currentLocale,
    formatCurrency,
    formatNumber,
    formatPercentage
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

  // Investment-specific state
  const [rentalYield, setRentalYield] = useState(5.0);
  const [annualAppreciation, setAnnualAppreciation] = useState(3.0);
  const [holdingPeriod, setHoldingPeriod] = useState(5);
  const [showRoiCalculator, setShowRoiCalculator] = useState(false);
  const [roiResults, setRoiResults] = useState(null);
  const [stampDutyResults, setStampDutyResults] = useState(null);

  // Refs
  const roiResultsRef = useRef(null);

  // Calculate ROI based on stamp duty and investment parameters
  const calculateROI = () => {
    if (!stampDutyResults) return;

    const propertyValue = stampDutyResults.propertyValue;
    const stampDutyAmount = stampDutyResults.totalTax;

    // Initial investment (property value + stamp duty)
    const initialInvestment = propertyValue + stampDutyAmount;

    // Annual rental income
    const annualRentalIncome = propertyValue * (rentalYield / 100);

    // Calculate property value after appreciation
    let finalPropertyValue = propertyValue;
    for (let i = 0; i < holdingPeriod; i++) {
      finalPropertyValue *= (1 + annualAppreciation / 100);
    }

    // Total rental income over holding period
    const totalRentalIncome = annualRentalIncome * holdingPeriod;

    // Capital gain
    const capitalGain = finalPropertyValue - propertyValue;

    // Total return
    const totalReturn = totalRentalIncome + capitalGain;

    // ROI percentage
    const roi = (totalReturn / initialInvestment) * 100;

    // Annualized ROI
    const annualizedRoi = Math.pow((1 + roi / 100), 1 / holdingPeriod) - 1;

    // Impact of stamp duty on ROI
    const roiWithoutStampDuty = (totalReturn / propertyValue) * 100;
    const stampDutyImpact = roiWithoutStampDuty - roi;

    const results = {
      initialInvestment,
      annualRentalIncome,
      finalPropertyValue,
      totalRentalIncome,
      capitalGain,
      totalReturn,
      roi,
      annualizedRoi: annualizedRoi * 100,
      stampDutyImpact,
      stampDutyPercentage: (stampDutyAmount / propertyValue) * 100
    };

    setRoiResults(results);

    // Scroll to ROI results after a short delay
    setTimeout(() => {
      if (roiResultsRef.current) {
        roiResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  };

  // Handle stamp duty calculation complete
  const handleStampDutyCalculated = (results) => {
    if (results) {
      setStampDutyResults(results);
      setShowRoiCalculator(false); // Reset ROI calculator visibility
      setRoiResults(null); // Clear previous ROI results
    }
  };

  return (
    <div className="investment-stamp-duty-calculator">
      {/* Investment Property Transfer Tax Information - Collapsible */}
      <GlassCard
        className="mb-4"
        title="Investment Property Transfer Tax"
        icon={<FaBuilding className="h-5 w-5" />}
        variant="info"
        effect="glow"
        animate={true}
        collapsible={true}
        defaultCollapsed={true}
      >
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            When purchasing an investment property, you'll typically pay higher transfer taxes than for a primary residence.
            This is because investment properties are usually considered "additional properties" and are subject to surcharges.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Key Points:</h4>
            <ul className="list-disc pl-5 text-sm text-blue-700 dark:text-blue-300">
              <li>Higher tax rates apply for investment properties</li>
              <li>Commercial properties may have different rate structures</li>
              <li>Transfer tax is a one-time cost that affects your overall ROI</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Standard Stamp Duty Calculator with investment preset */}
      <StampDutyCalculator
        loanTypeId="investment"
        onCalculationComplete={handleStampDutyCalculated}
      />

      {/* Show ROI Calculator Button - Only shown after calculation */}
      {stampDutyResults && !showRoiCalculator && (
        <div className="mt-6 flex justify-center">
          <GlowButton
            variant="secondary"
            size="lg"
            onClick={() => {
              setShowRoiCalculator(true);
              // Wait for the component to render before scrolling
              setTimeout(() => {
                if (roiResultsRef.current) {
                  roiResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }}
            effect="glow"
            className="w-full sm:w-auto"
          >
            <div className="flex items-center">
              <FaChartLine className="mr-2 h-5 w-5" />
              <span>Calculate Investment Returns</span>
            </div>
          </GlowButton>
        </div>
      )}

      {/* ROI Calculator - Only shown when user clicks the button */}
      {showRoiCalculator && stampDutyResults && (
        <div ref={roiResultsRef}>
          <GlassCard
            className="mb-4 mt-6"
            title="Investment Return Calculator"
            icon={<FaChartLine className="h-5 w-5" />}
            variant="secondary"
            effect="glow"
            animate={true}
            collapsible={true}
            defaultCollapsed={false}
          >
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                See how transfer tax affects your investment returns. Enter your expected parameters below.
              </p>

              <ResponsiveGrid cols={3} mobileCols={1} gap="4" className="mb-4">
                {/* Rental Yield Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rental Yield (%)
                  </label>
                  <NumericInput
                    value={rentalYield}
                    onChange={setRentalYield}
                    min={1}
                    max={15}
                    step={0.1}
                    suffix="%"
                    className="text-sm"
                  />
                </div>

                {/* Appreciation Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Annual Appreciation (%)
                  </label>
                  <NumericInput
                    value={annualAppreciation}
                    onChange={setAnnualAppreciation}
                    min={0}
                    max={10}
                    step={0.1}
                    suffix="%"
                    className="text-sm"
                  />
                </div>

                {/* Holding Period Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Holding Period (Years)
                  </label>
                  <NumericInput
                    value={holdingPeriod}
                    onChange={setHoldingPeriod}
                    min={1}
                    max={30}
                    step={1}
                    className="text-sm"
                  />
                </div>
              </ResponsiveGrid>

              {/* Calculate Button */}
              <div className="flex justify-center mb-4">
                <GlowButton
                  variant="primary"
                  size="md"
                  onClick={calculateROI}
                  effect="glow"
                  className="w-full sm:w-auto"
                >
                  <div className="flex items-center">
                    <FaCalculator className="mr-2 h-4 w-4" />
                    <span>Calculate ROI</span>
                  </div>
                </GlowButton>
              </div>

              {/* ROI Results - More compact layout */}
              {roiResults && (
                <div>
                  <ResponsiveGrid cols={2} mobileCols={1} gap="4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-blue-700 dark:text-blue-300 text-sm mb-2">Return Metrics</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total ROI:</span>
                          <span className="font-medium text-blue-700 dark:text-blue-300">{formatPercentage(roiResults.roi / 100)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Annualized ROI:</span>
                          <span className="font-medium text-blue-700 dark:text-blue-300">{formatPercentage(roiResults.annualizedRoi / 100)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tax Impact:</span>
                          <span className="font-medium text-red-600 dark:text-red-400">-{formatPercentage(roiResults.stampDutyImpact / 100)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-green-700 dark:text-green-300 text-sm mb-2">Financial Breakdown</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Initial Investment:</span>
                          <span className="font-medium text-green-700 dark:text-green-300">{formatCurrency(roiResults.initialInvestment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Annual Rental Income:</span>
                          <span className="font-medium text-green-700 dark:text-green-300">{formatCurrency(roiResults.annualRentalIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Final Property Value:</span>
                          <span className="font-medium text-green-700 dark:text-green-300">{formatCurrency(roiResults.finalPropertyValue)}</span>
                        </div>
                      </div>
                    </div>
                  </ResponsiveGrid>

                  <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-500">
                    <div className="flex items-start">
                      <FaInfoCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        Transfer tax represents {formatPercentage(roiResults.stampDutyPercentage / 100)} of your property value,
                        reducing your overall ROI by approximately {formatPercentage(roiResults.stampDutyImpact / 100)}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default InvestmentStampDutyCalculator;
