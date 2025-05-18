import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalculator, FaMoneyBillWave, FaPercentage, FaCalendarAlt, FaHome, FaInfoCircle, FaUndo, FaCreditCard } from 'react-icons/fa';
// Import modern UI components individually instead of using destructuring
import GlassCard from '../ui/modern/GlassCard';
import GlowButton from '../ui/modern/GlowButton';
import StyledSlider from '../ui/modern/StyledSlider';
import TooltipOverlay from '../ui/modern/TooltipOverlay';
import AnimatedNumberDisplay from '../ui/modern/AnimatedNumberDisplay';
import AnimatedResultCard from '../ui/modern/AnimatedResultCard';
import NumericInput from '../ui/NumericInput';
import ChartWrapper from '../ui/ChartWrapper';
import ResponsiveFormSection from '../ui/ResponsiveFormSection';
import ResponsiveContainer from '../ui/ResponsiveContainer';
import ResponsiveGrid from '../ui/ResponsiveGrid';
import useAffordability from '../../hooks/useAffordability';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../../contexts/LocaleContext';
import { useTheme } from '../../contexts/ThemeContext';
import { announceToScreenReader } from '../../utils/accessibilityUtils';

/**
 * AffordabilityCalculator component for determining what a user can afford
 * @param {Object} props - Component props
 * @param {string} props.loanTypeId - Type of loan (e.g., 'mortgage', 'personal', 'auto')
 * @param {Object} props.initialValues - Initial values for the calculator
 * @param {Object} props.ranges - Min/max ranges for inputs
 * @param {Function} props.onCalculate - Callback when calculation is performed
 * @returns {JSX.Element} Affordability calculator component
 */
const AffordabilityCalculator = ({
  loanTypeId = 'mortgage',
  initialValues = {
    monthlyIncome: 5000,
    monthlyDebts: 500,
    downPayment: 20000,
    rate: 3.5,
    termYears: 25,
    debtToIncomeRatio: 0.36,
  },
  ranges = {
    monthlyIncome: { min: 1000, max: 20000, step: 100 },
    monthlyDebts: { min: 0, max: 10000, step: 100 },
    downPayment: { min: 0, max: 200000, step: 1000 },
    rate: { min: 0.1, max: 15, step: 0.1 },
    termYears: { min: 5, max: 35, step: 1 },
    debtToIncomeRatio: { min: 0.28, max: 0.43, step: 0.01 },
  },
  onCalculate = () => {},
}) => {
  const { t } = useTranslation();
  const { currentLocale, formatCurrency, formatNumber, formatPercentage, formatChartCurrency } = useLocale();
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

  // State for form inputs
  const [monthlyIncome, setMonthlyIncome] = useState(initialValues.monthlyIncome);
  const [monthlyDebts, setMonthlyDebts] = useState(initialValues.monthlyDebts);
  const [downPayment, setDownPayment] = useState(initialValues.downPayment);
  const [interestRate, setInterestRate] = useState(initialValues.rate);
  const [loanTerm, setLoanTerm] = useState(initialValues.termYears);
  const [debtToIncomeRatio, setDebtToIncomeRatio] = useState(initialValues.debtToIncomeRatio);
  const [errors, setErrors] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [localResults, setLocalResults] = useState(null);

  // Use the affordability hook
  const {
    results,
    isCalculating,
    calculateAffordabilityDetails,
    resetCalculations,
    getBudgetRecommendations
  } = useAffordability(loanTypeId);

  // Use either local results or hook results
  const displayResults = localResults || results;

  // Debug the results and ensure chart updates
  useEffect(() => {
    console.log('Current displayResults:', displayResults);
    console.log('formatCurrency function available:', typeof formatCurrency === 'function');
    console.log('Current locale:', currentLocale);

    // If we have results but the chart isn't showing, force a re-render
    if (displayResults && !showResults) {
      setShowResults(true);
    }
  }, [displayResults, showResults, formatCurrency, currentLocale]);

  // Create a ref for the results section
  const resultsRef = useRef(null);

  // Automatically calculate debt-to-income ratio when income or debts change
  useEffect(() => {
    if (monthlyIncome > 0) {
      // Calculate debt-to-income ratio (monthly debts / monthly income)
      const calculatedRatio = monthlyDebts / monthlyIncome;

      // Update the debt-to-income ratio without clamping
      setDebtToIncomeRatio(calculatedRatio);
    }
  }, [monthlyIncome, monthlyDebts]);

  // Handle calculation
  const handleCalculate = async () => {
    // Reset errors
    setErrors({});

    try {
      // Use a standard maximum DTI (36%) for affordability calculations
      // This is the industry standard maximum, regardless of current DTI
      const standardMaxDTI = 0.36; // 36%

      // Check if current debts already exceed the standard maximum DTI
      const maxAllowableDebt = monthlyIncome * standardMaxDTI;
      if (monthlyDebts > maxAllowableDebt) {
        setErrors({
          calculation: 'Your debt-to-income ratio is too high. Consider reducing your monthly debts or increasing your income.'
        });
        return;
      }

      // Calculate affordability with monthly expenses (estimated as 50% of income minus debts)
      const estimatedMonthlyExpenses = (monthlyIncome * 0.5) - monthlyDebts;

      console.log('Starting affordability calculation with inputs:', {
        monthlyIncome,
        monthlyExpenses: estimatedMonthlyExpenses,
        monthlyDebts,
        downPayment,
        rate: interestRate,
        termYears: loanTerm,
        currentDTI: debtToIncomeRatio,
        standardMaxDTI,
        maxAllowableDebt: monthlyIncome * standardMaxDTI,
        remainingDebtCapacity: (monthlyIncome * standardMaxDTI) - monthlyDebts
      });

      const affordabilityResults = await calculateAffordabilityDetails({
        monthlyIncome,
        monthlyExpenses: estimatedMonthlyExpenses,
        monthlyDebts,
        downPayment,
        rate: interestRate,
        termYears: loanTerm,
        debtToIncomeRatio: standardMaxDTI, // Use the standard max DTI instead of current DTI
        additionalParams: {
          loanType: loanTypeId,
          currentDTI: debtToIncomeRatio // Pass the current DTI as an additional parameter for reference
        }
      });

      // Ensure all values are valid numbers
      const sanitizedResults = { ...affordabilityResults };
      Object.keys(sanitizedResults).forEach(key => {
        if (typeof sanitizedResults[key] === 'number' && isNaN(sanitizedResults[key])) {
          console.error(`Invalid value for ${key}:`, sanitizedResults[key]);
          sanitizedResults[key] = 0; // Set to 0 if NaN
        }
      });

      // Check if the calculation returned only the down payment
      if (sanitizedResults.maxPrice === downPayment && sanitizedResults.maxMonthlyPayment <= 0) {
        console.warn('Affordability calculation returned only the down payment');
        // Add an error message and don't show the results section
        setErrors({
          calculation: 'Based on your income and debts, you can only afford what you have as a down payment. Consider reducing your debts or increasing your income.'
        });

        // Don't show results when user can only afford down payment
        setShowResults(false);
        return;
      }

      // First, set showResults to false to ensure components re-render
      setShowResults(false);

      // Clear previous results
      setLocalResults(null);

      // Wait for state to update
      setTimeout(() => {
        // Store results in local state to ensure they're available for display
        // Create a new object to ensure React detects the change
        setLocalResults({
          ...sanitizedResults,
          // Add a timestamp to force re-renders
          _timestamp: Date.now()
        });

        // Show results with animation
        setShowResults(true);

        // Log the results for debugging
        console.log('Affordability results stored in local state:', sanitizedResults);
      }, 100);

      // Call the onCalculate callback
      onCalculate(sanitizedResults);

      // Announce results to screen readers
      const resultsAnnouncement = `Affordability calculation complete.
        Maximum affordable price: ${formatCurrency(sanitizedResults.maxPrice || 0)}.
        Conservative recommendation: ${formatCurrency(sanitizedResults.conservativePrice || 0)}.
        Maximum monthly payment: ${formatCurrency(sanitizedResults.maxMonthlyPayment || 0)}.`;

      announceToScreenReader(resultsAnnouncement, 'assertive');

      // Scroll to results section after a short delay to allow for rendering
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error in affordability calculation:', error);
      setErrors({ calculation: error.message || 'Error calculating affordability' });
    }
  };

  // Reset the calculator
  const handleReset = () => {
    setMonthlyIncome(initialValues.monthlyIncome);
    setMonthlyDebts(initialValues.monthlyDebts);
    setDownPayment(initialValues.downPayment);
    setInterestRate(initialValues.rate);
    setLoanTerm(initialValues.termYears);
    setDebtToIncomeRatio(initialValues.debtToIncomeRatio);
    setErrors({});
    setShowResults(false);
    setLocalResults(null);
    resetCalculations();
  };

  // Prepare chart data for affordability visualization
  const prepareChartData = () => {
    // Always return valid chart data
    const defaultData = {
      labels: ['Conservative', 'Maximum'],
      datasets: [
        {
          label: 'Affordable Price',
          data: [100000, 120000], // Default placeholder values
          backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(59, 130, 246, 0.7)'],
          borderColor: ['rgba(16, 185, 129, 1)', 'rgba(59, 130, 246, 1)'],
          borderWidth: 1,
        }
      ]
    };

    if (!displayResults) {
      console.log('No display results available for chart');
      return defaultData;
    }

    // Log the results object to see what properties are available
    console.log('Results object in prepareChartData:', displayResults);

    // Make sure the properties exist before using them and ensure they're positive
    const conservativePrice = Math.max(0, displayResults.conservativePrice || 0);
    const maxPrice = Math.max(0, displayResults.maxPrice || 0);

    // If both values are 0, return default data to ensure chart displays something
    if (conservativePrice === 0 && maxPrice === 0) {
      console.log('Both conservative and max price are 0, using default data');
      return defaultData;
    }

    console.log('Chart values - Conservative:', conservativePrice, 'Maximum:', maxPrice);

    // If both values are 0 or equal to down payment, create a chart showing just the down payment
    if ((conservativePrice === 0 && maxPrice === 0) ||
        (conservativePrice === downPayment && maxPrice === downPayment)) {
      console.log('Only down payment available, creating chart with down payment');

      // Use down payment for both values, but make them slightly different for visual clarity
      return {
        labels: ['Down Payment', 'Down Payment'],
        datasets: [
          {
            label: 'Available Funds',
            data: [downPayment, downPayment],
            backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(59, 130, 246, 0.7)'],
            borderColor: ['rgba(16, 185, 129, 1)', 'rgba(59, 130, 246, 1)'],
            borderWidth: 1,
          }
        ]
      };
    }

    // If only the conservative price is equal to down payment, adjust the labels
    if (conservativePrice === downPayment && maxPrice > downPayment) {
      return {
        labels: ['Down Payment', 'Maximum'],
        datasets: [
          {
            label: 'Affordable Price',
            data: [conservativePrice, maxPrice],
            backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(59, 130, 246, 0.7)'],
            borderColor: ['rgba(16, 185, 129, 1)', 'rgba(59, 130, 246, 1)'],
            borderWidth: 1,
          }
        ]
      };
    }

    // Normal case - both values are valid
    return {
      labels: ['Conservative', 'Maximum'],
      datasets: [
        {
          label: 'Affordable Price',
          data: [conservativePrice, maxPrice],
          backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(59, 130, 246, 0.7)'],
          borderColor: ['rgba(16, 185, 129, 1)', 'rgba(59, 130, 246, 1)'],
          borderWidth: 1,
        }
      ]
    };
  };

  return (
    <div className="affordability-calculator pb-16">
      <GlassCard
        className="mb-4 overflow-visible"
        title={`${loanTypeId.charAt(0).toUpperCase() + loanTypeId.slice(1)} Affordability Calculator`}
        icon={<FaCalculator className="h-5 w-5" />}
        variant="primary"
        effect="glow"
        animate={true}
      >
        <div className="p-2 sm:p-4 pb-8 sm:pb-12">

          <ResponsiveGrid cols={2} mobileCols={1} gap="4">
            {/* Monthly Income */}
            <div className="mb-3">
              <label htmlFor="monthly-income" className="flex items-center form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaMoneyBillWave className="mr-2 text-blue-500 h-4 w-4" />
                Monthly Income
                <TooltipOverlay content="Your total monthly household income before taxes">
                  <FaInfoCircle className="ml-1 inline-block h-3 w-3 text-gray-400" />
                </TooltipOverlay>
              </label>
              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="w-full">
                  <NumericInput
                    id="monthly-income"
                    name="monthly-income"
                    value={monthlyIncome}
                    onChange={setMonthlyIncome}
                    min={ranges.monthlyIncome.min}
                    max={ranges.monthlyIncome.max}
                    step={ranges.monthlyIncome.step}
                    error={errors.monthlyIncome}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                    icon={<FaMoneyBillWave className="h-4 w-4" />}
                    inputClassName="py-2 sm:py-3" // Smaller height on mobile
                  />
                </div>
                <div className="w-full">
                  <StyledSlider
                    min={ranges.monthlyIncome.min}
                    max={ranges.monthlyIncome.max}
                    step={ranges.monthlyIncome.step}
                    value={monthlyIncome}
                    onChange={setMonthlyIncome}
                    formatValue={(val) => val.toLocaleString()}
                    leftLabel={`${currentLocale.currency}${ranges.monthlyIncome.min.toLocaleString()}`}
                    rightLabel={`${currentLocale.currency}${ranges.monthlyIncome.max.toLocaleString()}`}
                    trackColor="bg-gradient-to-r from-blue-500 to-indigo-500"
                    symbol={currentLocale.currency}
                    symbolPosition="prefix"
                    className="mt-0 mb-0" // Reduce vertical spacing on mobile
                  />
                </div>
              </div>
            </div>

            {/* Monthly Debts */}
            <div className="mb-3">
              <label htmlFor="monthly-debts" className="flex items-center form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaCreditCard className="mr-2 text-green-500 h-4 w-4" />
                Monthly Debts
                <TooltipOverlay content="Your existing monthly debt payments (credit cards, loans, etc.)">
                  <FaInfoCircle className="ml-1 inline-block h-3 w-3 text-gray-400" />
                </TooltipOverlay>
              </label>
              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="w-full">
                  <NumericInput
                    id="monthly-debts"
                    name="monthly-debts"
                    value={monthlyDebts}
                    onChange={setMonthlyDebts}
                    min={ranges.monthlyDebts.min}
                    max={ranges.monthlyDebts.max}
                    step={ranges.monthlyDebts.step}
                    error={errors.monthlyDebts}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                    icon={<FaMoneyBillWave className="h-4 w-4" />}
                    inputClassName="py-2 sm:py-3" // Smaller height on mobile
                  />
                </div>
                <div className="w-full">
                  <StyledSlider
                    min={ranges.monthlyDebts.min}
                    max={ranges.monthlyDebts.max}
                    step={ranges.monthlyDebts.step}
                    value={monthlyDebts}
                    onChange={setMonthlyDebts}
                    formatValue={(val) => val.toLocaleString()}
                    leftLabel={`${currentLocale.currency}${ranges.monthlyDebts.min.toLocaleString()}`}
                    rightLabel={`${currentLocale.currency}${ranges.monthlyDebts.max.toLocaleString()}`}
                    trackColor="bg-gradient-to-r from-green-500 to-teal-500"
                    symbol={currentLocale.currency}
                    symbolPosition="prefix"
                    className="mt-0 mb-0" // Reduce vertical spacing on mobile
                  />
                </div>
              </div>
            </div>

            {/* Down Payment */}
            <div className="mb-3">
              <label htmlFor="down-payment" className="flex items-center form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaMoneyBillWave className="mr-2 text-blue-500 h-4 w-4" />
                Down Payment
                <TooltipOverlay content="The amount you plan to pay upfront">
                  <FaInfoCircle className="ml-1 inline-block h-3 w-3 text-gray-400" />
                </TooltipOverlay>
              </label>
              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="w-full">
                  <NumericInput
                    id="down-payment"
                    name="down-payment"
                    value={downPayment}
                    onChange={setDownPayment}
                    min={ranges.downPayment.min}
                    max={ranges.downPayment.max}
                    step={ranges.downPayment.step}
                    error={errors.downPayment}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                    icon={<FaMoneyBillWave className="h-4 w-4" />}
                    inputClassName="py-2 sm:py-3" // Smaller height on mobile
                  />
                </div>
                <div className="w-full">
                  <StyledSlider
                    min={ranges.downPayment.min}
                    max={ranges.downPayment.max}
                    step={ranges.downPayment.step}
                    value={downPayment}
                    onChange={setDownPayment}
                    formatValue={(val) => val.toLocaleString()}
                    leftLabel={`${currentLocale.currency}${ranges.downPayment.min.toLocaleString()}`}
                    rightLabel={`${currentLocale.currency}${ranges.downPayment.max.toLocaleString()}`}
                    trackColor="bg-gradient-to-r from-blue-500 to-indigo-500"
                    symbol={currentLocale.currency}
                    symbolPosition="prefix"
                    className="mt-0 mb-0" // Reduce vertical spacing on mobile
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
              <div className="flex flex-col gap-1 sm:gap-2">
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
                    inputClassName="py-2 sm:py-3" // Smaller height on mobile
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
                    className="mt-0 mb-0" // Reduce vertical spacing on mobile
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
              <div className="flex flex-col gap-1 sm:gap-2">
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
                    inputClassName="py-2 sm:py-3" // Smaller height on mobile
                  />
                </div>
                <div className="w-full">
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
                    className="mt-0 mb-0" // Reduce vertical spacing on mobile
                  />
                </div>
              </div>
            </div>

            {/* Debt-to-Income Ratio */}
            <div className="mb-3">
              <label className="flex items-center form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FaPercentage className="mr-2 text-purple-500 h-4 w-4" />
                Debt-to-Income Ratio
                <TooltipOverlay content="The percentage of your income that goes toward paying debts. This is automatically calculated based on your income and debts.">
                  <FaInfoCircle className="ml-1 inline-block h-3 w-3 text-gray-400" />
                </TooltipOverlay>
              </label>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-3 sm:p-4 border border-purple-100 dark:border-purple-800/30 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Current Ratio:</span>
                  <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                    {(debtToIncomeRatio * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="mt-2 sm:mt-3 flex items-center">
                  <div className={`h-2 flex-grow rounded-full overflow-hidden ${
                    debtToIncomeRatio < 0.3
                      ? "bg-gradient-to-r from-green-200 to-green-300 dark:from-green-900/30 dark:to-green-800/30"
                      : debtToIncomeRatio < 0.36
                      ? "bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-900/30 dark:to-yellow-800/30"
                      : "bg-gradient-to-r from-red-200 to-red-300 dark:from-red-900/30 dark:to-red-800/30"
                  }`}>
                    <div className={`h-full ${
                      debtToIncomeRatio < 0.3
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : debtToIncomeRatio < 0.36
                        ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                        : "bg-gradient-to-r from-red-500 to-rose-500"
                    }`} style={{ width: `${Math.min(debtToIncomeRatio * 100 * 2, 100)}%` }}></div>
                  </div>
                </div>

                <div className="mt-2 sm:mt-3">
                  <span className={`text-xs sm:text-sm font-semibold ${
                    debtToIncomeRatio < 0.3
                      ? "text-green-600 dark:text-green-400"
                      : debtToIncomeRatio < 0.36
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {debtToIncomeRatio < 0.3 ? "Excellent" :
                     debtToIncomeRatio < 0.36 ? "Good" : "High"}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 ml-1">
                    - {debtToIncomeRatio < 0.3
                      ? "Your debt-to-income ratio is in excellent range."
                      : debtToIncomeRatio < 0.36
                      ? "Your debt-to-income ratio is in a good range."
                      : "Your debt-to-income ratio is high. Consider reducing debts."}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.calculation && (
              <div className="col-span-1 md:col-span-2 mb-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                  <p className="flex items-center">
                    <FaInfoCircle className="mr-2 h-5 w-5" />
                    <span>{errors.calculation}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Warning Message */}
            {errors.warning && (
              <div className="col-span-1 md:col-span-2 mb-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg">
                  <p className="flex items-center">
                    <FaInfoCircle className="mr-2 h-5 w-5" />
                    <span>{errors.warning}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="col-span-1 md:col-span-2 mt-3 sm:mt-4 mb-6 sm:mb-10">
              <ResponsiveFormSection direction="row" gap="2" className="flex-col sm:flex-row">
                <div className="w-full mb-2 sm:mb-0">
                  <GlowButton
                    onClick={handleCalculate}
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isCalculating}
                    ariaLabel="Calculate affordability"
                    effect="glow"
                    className="py-3 sm:py-4 text-base sm:text-lg" // Larger touch target on mobile
                    icon={
                      <motion.div
                        animate={isCalculating ? { rotate: 360 } : { rotate: 0 }}
                        transition={isCalculating ?
                          { duration: 2, repeat: Infinity, ease: "linear" } :
                          { type: "spring", stiffness: 200, damping: 10 }
                        }
                      >
                        <FaCalculator className="h-5 w-5" aria-hidden="true" />
                      </motion.div>
                    }
                  >
                    Calculate
                  </GlowButton>
                </div>

                <div className="w-full sm:w-auto relative z-20">
                  <GlowButton
                    onClick={handleReset}
                    variant="secondary"
                    fullWidth
                    size="lg"
                    disabled={isCalculating}
                    ariaLabel="Reset calculator"
                    className="py-3 sm:py-4" // Larger touch target on mobile
                    icon={<FaUndo className="h-4 w-4" />}
                  >
                    Reset
                  </GlowButton>
                </div>
              </ResponsiveFormSection>
            </div>
          </ResponsiveGrid>
        </div>
      </GlassCard>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {showResults && (
          <motion.div
            ref={resultsRef}
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-4 sm:mt-6"
            role="region"
            aria-label={t('affordability.title', 'Affordability Results')}
            tabIndex="0"
          >
            <GlassCard
              className="results-card"
              title="Affordability Results"
              titleClassName="text-base sm:text-lg" // Smaller title on mobile
              icon={<FaHome className="h-4 w-4 sm:h-5 sm:w-5" />} // Smaller icon on mobile
              variant="success"
              effect="glow"
              animate={true}
            >
              <div className="p-3 sm:p-4">
                {/* Debug info - hidden in production */}
                {false && (
                  <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Results available: {displayResults ? 'Yes' : 'No'} |
                      Max Price: {displayResults ? formatCurrency(displayResults.maxPrice || 0) : '£0'} |
                      Conservative Price: {displayResults ? formatCurrency(displayResults.conservativePrice || 0) : '£0'}
                    </p>
                  </div>
                )}

                <ResponsiveGrid cols={2} mobileCols={1} gap="3">
                  {/* Left Column - Price Cards */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* Maximum Affordable Price Card */}
                    <div className={`p-3 sm:p-4 rounded-lg ${localIsDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                      <p className={`text-xs sm:text-sm mb-1 ${localIsDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Maximum Affordable Price</p>
                      {displayResults && displayResults.maxPrice ? (
                        <AnimatedNumberDisplay
                          value={Math.max(0, displayResults.maxPrice)}
                          useCurrencySymbol={true}
                          decimals={0}
                          size="lg" // Smaller on mobile
                          color="text-blue-600 dark:text-blue-400"
                          effect="gradient"
                          animate={true}
                          separateDigits={true}
                          highlightChange={true}
                          // Force component to re-render by using a unique key that changes when the value changes
                          key={`max-price-${displayResults.maxPrice}-${Date.now()}`}
                        />
                      ) : (
                        <div className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(0)}
                        </div>
                      )}
                    </div>

                    {/* Conservative Recommendation Card */}
                    <div className={`p-3 sm:p-4 rounded-lg ${localIsDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                      <p className={`text-xs sm:text-sm mb-1 ${localIsDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Conservative Recommendation</p>
                      {displayResults && displayResults.conservativePrice ? (
                        <AnimatedNumberDisplay
                          value={Math.max(0, displayResults.conservativePrice)}
                          useCurrencySymbol={true}
                          decimals={0}
                          size="lg" // Smaller on mobile
                          color="text-green-600 dark:text-green-400"
                          effect="gradient"
                          animate={true}
                          separateDigits={true}
                          highlightChange={true}
                          // Force component to re-render by using a unique key that changes when the value changes
                          key={`conservative-price-${displayResults.conservativePrice}-${Date.now()}`}
                        />
                      ) : (
                        <div className="text-lg sm:text-xl font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(0)}
                        </div>
                      )}
                    </div>

                    {/* Monthly Payment Cards */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {/* Max Monthly Payment Card */}
                      <div className={`p-2 sm:p-3 rounded-lg ${localIsDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${localIsDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Max Monthly Payment</p>
                        <AnimatedNumberDisplay
                          value={displayResults ? Math.max(0, displayResults.maxMonthlyPayment || 0) : 0}
                          useCurrencySymbol={true}
                          decimals={2}
                          size="sm" // Smaller on mobile
                          color="text-blue-600 dark:text-blue-400"
                          effect="gradient"
                          animate={true}
                          highlightChange={true}
                        />
                      </div>

                      {/* Conservative Payment Card */}
                      <div className={`p-2 sm:p-3 rounded-lg ${localIsDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${localIsDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conservative Payment</p>
                        <AnimatedNumberDisplay
                          value={displayResults ? Math.max(0, displayResults.conservativeMonthlyPayment || 0) : 0}
                          useCurrencySymbol={true}
                          decimals={2}
                          size="sm" // Smaller on mobile
                          color="text-green-600 dark:text-green-400"
                          effect="gradient"
                          animate={true}
                          highlightChange={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Chart and Budget Impact */}
                  <div className="flex flex-col items-center justify-center mt-4 sm:mt-0">
                    {/* Price Comparison Chart */}
                    <ChartWrapper
                      type="bar"
                      data={prepareChartData()}
                      height={180} // Slightly smaller on mobile
                      title={t('affordability.affordablePriceComparison', 'Affordable Price Comparison')}
                      description={`This chart compares the maximum affordable price of ${formatCurrency(displayResults ? Math.max(0, displayResults.maxPrice || 0) : 0)} with the conservative recommendation of ${formatCurrency(displayResults ? Math.max(0, displayResults.conservativePrice || 0) : 0)}.`}
                      key={`chart-${displayResults ? JSON.stringify({
                        max: displayResults.maxPrice,
                        conservative: displayResults.conservativePrice
                      }) : 'initial'}`}
                      options={{
                        indexAxis: 'y',
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return formatCurrency(context.raw);
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            title: {
                              display: window.innerWidth >= 640, // Only show title on larger screens
                              text: t('affordability.price', 'Price') + ` (${currentLocale.currency})`,
                              font: {
                                weight: 'bold',
                                size: window.innerWidth < 640 ? 10 : 12
                              }
                            },
                            ticks: {
                              font: {
                                size: window.innerWidth < 640 ? 9 : 11
                              },
                              callback: function(value) {
                                return formatChartCurrency(value);
                              }
                            }
                          },
                          y: {
                            title: {
                              display: window.innerWidth >= 640, // Only show title on larger screens
                              text: t('affordability.recommendation', 'Recommendation'),
                              font: {
                                weight: 'bold',
                                size: window.innerWidth < 640 ? 10 : 12
                              }
                            },
                            ticks: {
                              font: {
                                size: window.innerWidth < 640 ? 10 : 12
                              }
                            }
                          }
                        }
                      }}
                    />

                    {/* Income and Debts Summary */}
                    <div className="mt-3 sm:mt-4 text-center">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        Based on your income of <span className="font-semibold">{formatCurrency(monthlyIncome)}/month</span> and
                        debts of <span className="font-semibold">{formatCurrency(monthlyDebts)}/month</span>
                      </p>
                    </div>

                    {/* Budget Impact Section */}
                    <div className="mt-4 sm:mt-6 w-full">
                      <h4 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-gray-700 dark:text-gray-300">Budget Impact</h4>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg">
                        {/* Monthly Payment Row */}
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{t('affordability.monthlyPayment', 'Monthly Payment')}</span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {formatCurrency(displayResults ? Math.max(0, displayResults.conservativeMonthlyPayment || 0) : 0)}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                            style={{ width: `${displayResults && displayResults.conservativeBudgetImpact ? Math.max(0, displayResults.conservativeBudgetImpact) : 0}%` }}
                          ></div>
                        </div>
                        {/* Budget Details Row */}
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatPercentage(displayResults && displayResults.conservativeBudgetImpact ? Math.max(0, displayResults.conservativeBudgetImpact) : 0)} {t('affordability.ofIncome', 'of Income')}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t('affordability.remaining', 'Remaining')}: {formatCurrency(displayResults && displayResults.remainingBudgetConservative ? Math.max(0, displayResults.remainingBudgetConservative) : 0)}/mo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ResponsiveGrid>

                {/* Methodology Note */}
                <div className={`mt-4 sm:mt-6 p-2 sm:p-3 rounded-lg ${localIsDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                  <div className="flex items-start sm:items-center">
                    <FaInfoCircle className={`mr-2 h-3 w-3 sm:h-4 sm:w-4 mt-0.5 sm:mt-0 ${localIsDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <p className={`text-xs ${localIsDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Calculations follow standard banking guidelines using a maximum debt-to-income ratio of 36%. The conservative recommendation provides a 10% buffer for financial flexibility.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AffordabilityCalculator;
