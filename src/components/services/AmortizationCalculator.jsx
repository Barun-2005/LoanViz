import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCalculator, FaMoneyBillWave, FaPercentage, FaCalendarAlt, FaClock, FaInfoCircle, FaUndo } from 'react-icons/fa';
import GlassCard from '../ui/modern/GlassCard';
import GlowButton from '../ui/modern/GlowButton';
import StyledSlider from '../ui/modern/StyledSlider';
import TooltipOverlay from '../ui/modern/TooltipOverlay';
import NumericInput from '../ui/NumericInput';
import Select from '../ui/Select';
import { useLocale } from '../../contexts/LocaleContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * AmortizationCalculator component specifically for generating amortization schedules
 * @param {Object} props - Component props
 * @param {string} props.loanTypeId - Type of loan (e.g., 'mortgage', 'personal', 'auto')
 * @param {Object} props.initialValues - Initial values for the calculator
 * @param {Object} props.ranges - Min/max ranges for inputs
 * @param {Object} props.additionalFees - Additional fees for the loan
 * @param {Function} props.onCalculate - Callback when calculation is performed
 * @param {Function} props.onResultsGenerated - Callback when results are generated to scroll to results
 * @returns {JSX.Element} Amortization calculator component
 */
const AmortizationCalculator = ({
  loanTypeId = 'mortgage',
  initialValues = {
    principal: 200000,
    rate: 3.5,
    termYears: 25,
    type: 'repayment',
    downPayment: 0,
    tradeInValue: 0,
    gracePeriodMonths: 0,
  },
  ranges = {
    principal: { min: 10000, max: 1000000, step: 1000 },
    rate: { min: 0.1, max: 15, step: 0.1 },
    termYears: { min: 5, max: 35, step: 1 },
  },
  additionalFees = {},
  onCalculate = () => {},
  onResultsGenerated = () => {},
}) => {
  // Get locale information and theme
  const { currentLocale } = useLocale();
  const { isDarkMode } = useTheme();

  // Track theme changes with local state
  const [localIsDarkMode, setLocalIsDarkMode] = useState(isDarkMode);

  // Update local dark mode state when theme context changes
  useEffect(() => {
    setLocalIsDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Also listen for theme changes at the document level as a fallback
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newIsDarkMode = document.documentElement.classList.contains('dark');
          setLocalIsDarkMode(newIsDarkMode);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // State for form values
  const [loanAmount, setLoanAmount] = useState(initialValues.principal);
  const [interestRate, setInterestRate] = useState(initialValues.rate);
  const [loanTerm, setLoanTerm] = useState(initialValues.termYears);
  const [repaymentType, setRepaymentType] = useState(initialValues.type);
  const [downPayment, setDownPayment] = useState(initialValues.downPayment || 0);
  const [tradeInValue, setTradeInValue] = useState(initialValues.tradeInValue || 0);
  const [gracePeriodMonths, setGracePeriodMonths] = useState(initialValues.gracePeriodMonths || 0);
  const [fees, setFees] = useState(additionalFees);
  const [errors, setErrors] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Reference to the results section for scrolling
  const resultsRef = useRef(null);

  // Handle calculation
  const handleCalculate = async () => {
    // Reset errors
    setErrors({});
    console.log("Calculating amortization schedule with values:", {
      principal: loanAmount,
      rate: interestRate,
      termYears: loanTerm,
      type: repaymentType,
      fees,
      downPayment,
      tradeInValue,
      gracePeriodMonths
    });

    try {
      // Call the onCalculate callback with the current values
      const results = await onCalculate({
        principal: loanAmount,
        rate: interestRate,
        termYears: loanTerm,
        type: repaymentType,
        fees,
        downPayment,
        tradeInValue,
        gracePeriodMonths
      });

      console.log("Calculation results:", results);

      // Show results with animation
      setShowResults(true);

      // Notify parent component that results are ready to be displayed
      // This will trigger scrolling to the results section in the parent component
      setTimeout(() => {
        onResultsGenerated();
      }, 300);

      return results;
    } catch (error) {
      console.error("Calculation error:", error);
      setErrors({ calculation: error.message || 'Error calculating loan' });
      throw error;
    }
  };

  // Reset the calculator
  const handleReset = () => {
    setLoanAmount(initialValues.principal);
    setInterestRate(initialValues.rate);
    setLoanTerm(initialValues.termYears);
    setRepaymentType(initialValues.type);
    setDownPayment(initialValues.downPayment || 0);
    setTradeInValue(initialValues.tradeInValue || 0);
    setGracePeriodMonths(initialValues.gracePeriodMonths || 0);
    setFees(additionalFees);
    setErrors({});
    setShowResults(false);
  };

  return (
    <div className="amortization-calculator">
      <GlassCard
        className="mb-4 overflow-visible"
        title={`${loanTypeId.charAt(0).toUpperCase() + loanTypeId.slice(1)} Amortization Calculator`}
        icon={<FaCalculator className="h-5 w-5" />}
        variant="primary"
        effect="glow"
        animate={true}
      >
        <div className="p-4 pb-12">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {/* Loan Amount */}
            <div className="mb-3">
              <label htmlFor="loan-amount" className="flex items-center form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaMoneyBillWave className="mr-2 text-blue-500 h-4 w-4" />
                Loan Amount
                <TooltipOverlay content="The total amount you wish to borrow">
                  <FaInfoCircle className="ml-1 inline-block h-3 w-3 text-gray-400" />
                </TooltipOverlay>
              </label>
              <div className="flex flex-col gap-2">
                <div className="w-full">
                  <NumericInput
                    id="loan-amount"
                    name="loan-amount"
                    value={loanAmount}
                    onChange={setLoanAmount}
                    min={ranges.principal.min}
                    max={ranges.principal.max}
                    step={ranges.principal.step}
                    error={errors.principal}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                    icon={<FaMoneyBillWave className="h-4 w-4" />}
                  />
                </div>
                <div className="w-full">
                  <StyledSlider
                    min={ranges.principal.min}
                    max={ranges.principal.max}
                    step={ranges.principal.step}
                    value={loanAmount}
                    onChange={setLoanAmount}
                    formatValue={(val) => val.toLocaleString()}
                    leftLabel={`${currentLocale.currency}${ranges.principal.min.toLocaleString()}`}
                    rightLabel={`${currentLocale.currency}${ranges.principal.max.toLocaleString()}`}
                    trackColor="bg-gradient-to-r from-blue-500 to-indigo-500"
                    symbol={currentLocale.currency}
                    symbolPosition="prefix"
                  />
                </div>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-3">
              <label htmlFor="interest-rate" className="flex items-center form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaPercentage className="mr-2 text-purple-500 h-4 w-4" />
                Interest Rate
              </label>
              <div className="flex flex-col gap-2">
                <div className="w-full">
                  <NumericInput
                    id="interest-rate"
                    name="interest-rate"
                    value={interestRate}
                    onChange={setInterestRate}
                    min={ranges.rate.min}
                    max={ranges.rate.max}
                    step={ranges.rate.step}
                    error={errors.rate}
                    suffix="%"
                    decimalScale={2}
                    icon={<FaPercentage className="h-4 w-4" />}
                  />
                </div>
                <div className="w-full">
                  <StyledSlider
                    min={ranges.rate.min}
                    max={ranges.rate.max}
                    step={ranges.rate.step}
                    value={interestRate}
                    onChange={setInterestRate}
                    formatValue={(val) => val.toFixed(2)}
                    leftLabel={`${ranges.rate.min}%`}
                    rightLabel={`${ranges.rate.max}%`}
                    symbol="%"
                    symbolPosition="suffix"
                    trackColor="bg-gradient-to-r from-purple-500 to-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Loan Term */}
            <div className="mb-3">
              <label htmlFor="loan-term" className="flex items-center form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaCalendarAlt className="mr-2 text-pink-500 h-4 w-4" />
                Loan Term
              </label>
              <div className="flex flex-col gap-2">
                <div className="w-full">
                  <NumericInput
                    id="loan-term"
                    name="loan-term"
                    value={loanTerm}
                    onChange={setLoanTerm}
                    min={ranges.termYears.min}
                    max={ranges.termYears.max}
                    step={ranges.termYears.step}
                    error={errors.termYears}
                    suffix=" years"
                    decimalScale={0}
                    icon={<FaCalendarAlt className="h-4 w-4" />}
                  />
                </div>
                <div className="w-full relative">
                  <div className="flex justify-between mb-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{ranges.termYears.min} yrs</span>
                    <span>{ranges.termYears.max} yrs</span>
                  </div>
                  <StyledSlider
                    min={ranges.termYears.min}
                    max={ranges.termYears.max}
                    step={ranges.termYears.step}
                    value={loanTerm}
                    onChange={setLoanTerm}
                    formatValue={(val) => val}
                    leftLabel={`${ranges.termYears.min} yrs`}
                    rightLabel={`${ranges.termYears.max} yrs`}
                    symbol=" yrs"
                    symbolPosition="suffix"
                    trackColor="bg-gradient-to-r from-pink-500 to-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Repayment Type */}
            <div className="mb-3">
              <label htmlFor="repayment-type" className="flex items-center form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaCalculator className="mr-2 text-green-500 h-4 w-4" />
                Repayment Type
                <TooltipOverlay content="Repayment: Pay principal and interest each month. Interest-only: Pay only interest during the term.">
                  <FaInfoCircle className="ml-1 inline-block h-3 w-3 text-gray-400" />
                </TooltipOverlay>
              </label>
              <Select
                id="repayment-type"
                name="repayment-type"
                value={repaymentType}
                onChange={(e) => setRepaymentType(e.target.value)}
                options={[
                  { value: 'repayment', label: 'Repayment (Principal & Interest)' },
                  { value: 'interest-only', label: 'Interest Only' },
                ]}
                error={errors.type}
              />
            </div>

            {/* Conditional fields based on loan type */}
            {loanTypeId === 'auto' && (
              <>
                {/* Down Payment */}
                <div className="mb-3">
                  <label htmlFor="down-payment" className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Down Payment
                  </label>
                  <NumericInput
                    id="down-payment"
                    name="down-payment"
                    value={downPayment}
                    onChange={setDownPayment}
                    min={0}
                    max={loanAmount}
                    step={500}
                    error={errors.downPayment}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                    icon={<FaMoneyBillWave className="h-4 w-4" />}
                  />
                </div>

                {/* Trade-In Value */}
                <div className="mb-3">
                  <label htmlFor="trade-in-value" className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trade-In Value
                  </label>
                  <NumericInput
                    id="trade-in-value"
                    name="trade-in-value"
                    value={tradeInValue}
                    onChange={setTradeInValue}
                    min={0}
                    max={loanAmount}
                    step={500}
                    error={errors.tradeInValue}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                    icon={<FaMoneyBillWave className="h-4 w-4" />}
                  />
                </div>
              </>
            )}

            {/* Grace Period for Student Loans */}
            {loanTypeId === 'student' && (
              <div className="mb-3">
                <label htmlFor="grace-period" className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grace Period (Months)
                  <TooltipOverlay content="Period after graduation before repayment begins. Interest may still accrue during this time.">
                    <FaInfoCircle className="ml-1 inline-block h-3 w-3 text-gray-400" />
                  </TooltipOverlay>
                </label>
                <NumericInput
                  id="grace-period"
                  name="grace-period"
                  value={gracePeriodMonths}
                  onChange={setGracePeriodMonths}
                  min={0}
                  max={24}
                  step={1}
                  error={errors.gracePeriodMonths}
                  suffix=" months"
                  decimalScale={0}
                  icon={<FaClock className="h-4 w-4" />}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="col-span-1 md:col-span-2 mt-4 mb-10">
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-grow"
                >
                  <GlowButton
                    onClick={handleCalculate}
                    variant="primary"
                    fullWidth
                    size="lg"
                    ariaLabel="Generate amortization schedule"
                    icon={<FaCalculator className="h-5 w-5" aria-hidden="true" />}
                    effect="glow"
                  >
                    <span className="flex items-center justify-center">
                      <span className="mr-2">Generate</span>
                      <span className="hidden sm:inline">Schedule & View Chart</span>
                    </span>
                  </GlowButton>
                </motion.div>

                <div className="relative z-20">
                  <GlowButton
                    onClick={handleReset}
                    variant="secondary"
                    fullWidth
                    size="lg"
                    ariaLabel="Reset calculator"
                    icon={<FaUndo className="h-4 w-4" />}
                  >
                    Reset
                  </GlowButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default AmortizationCalculator;
