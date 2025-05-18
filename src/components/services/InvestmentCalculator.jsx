import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaInfoCircle, FaPoundSign, FaPercentage, FaCalendarAlt, FaCalculator, FaUndo } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import NumericInput from '../ui/NumericInput';
import RangeSlider from '../ui/RangeSlider';
import ChartWrapper from '../ui/ChartWrapper';
import AnimatedNumber from '../ui/AnimatedNumber';
import useLoanCalculations from '../../hooks/useLoanCalculations';
import { useLocale } from '../../contexts/LocaleContext';
import GlowButton from '../ui/modern/GlowButton';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/**
 * InvestmentCalculator component for calculating investment growth with compound interest
 * @param {Object} props - Component props
 * @param {string} props.loanTypeId - Type of loan (should be 'investment')
 * @returns {JSX.Element} Investment calculator component
 */
const InvestmentCalculator = ({
  loanTypeId = 'investment'
}) => {
  // Get locale information
  const { currentLocale } = useLocale();

  // Responsive state
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Chart refs for responsive handling
  const growthChartRef = useRef(null);
  const breakdownChartRef = useRef(null);

  // State for investment parameters
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [termYears, setTermYears] = useState(10);
  const [additionalContribution, setAdditionalContribution] = useState(100);
  const [contributionFrequency, setContributionFrequency] = useState('monthly');
  const [compoundingFrequency, setCompoundingFrequency] = useState('monthly');

  // State for results
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [breakdownData, setBreakdownData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState({});

  // Refs
  const resultsRef = useRef(null);

  // Add resize listener for responsive charts
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Force chart re-render when window width changes between mobile and desktop breakpoints
  useEffect(() => {
    // Only trigger re-render when crossing the mobile breakpoint (640px)
    const isMobileWidth = windowWidth < 640;

    // Update growth chart if it exists
    if (growthChartRef.current && growthChartRef.current.isMobile !== isMobileWidth) {
      growthChartRef.current.isMobile = isMobileWidth;
      if (chartData) {
        setChartData({...chartData});
      }
    }

    // Update breakdown chart if it exists
    if (breakdownChartRef.current && breakdownChartRef.current.isMobile !== isMobileWidth) {
      breakdownChartRef.current.isMobile = isMobileWidth;
      if (breakdownData) {
        setBreakdownData({...breakdownData});
      }
    }
  }, [windowWidth, chartData, breakdownData]);

  // Handle calculation
  const handleCalculate = () => {
    // Reset errors
    setErrors({});
    setIsCalculating(true);

    // Add a small delay for better UX
    setTimeout(() => {
      try {
        calculateInvestment();
        setShowResults(true);
        setIsCalculating(false);

        // Scroll to results section after a short delay
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } catch (error) {
        setErrors({ calculation: error.message || 'Error calculating investment growth' });
        setIsCalculating(false);
      }
    }, 300);
  };

  // Reset the calculator
  const handleReset = () => {
    setPrincipal(10000);
    setRate(5);
    setTermYears(10);
    setAdditionalContribution(100);
    setContributionFrequency('monthly');
    setCompoundingFrequency('monthly');
    setErrors({});
    setShowResults(false);
    setResults(null);
    setChartData(null);
    setBreakdownData(null);
  };

  // Calculate investment growth
  const calculateInvestment = () => {
    // Convert annual rate to decimal
    const annualRate = rate / 100;

    // Determine number of compounding periods per year
    let periodsPerYear;
    switch (compoundingFrequency) {
      case 'daily':
        periodsPerYear = 365;
        break;
      case 'weekly':
        periodsPerYear = 52;
        break;
      case 'monthly':
        periodsPerYear = 12;
        break;
      case 'quarterly':
        periodsPerYear = 4;
        break;
      case 'semi-annually':
        periodsPerYear = 2;
        break;
      case 'annually':
        periodsPerYear = 1;
        break;
      default:
        periodsPerYear = 12; // Default to monthly
    }

    // Calculate rate per period
    const ratePerPeriod = annualRate / periodsPerYear;

    // Determine number of contribution periods per year
    let contributionsPerYear;
    switch (contributionFrequency) {
      case 'monthly':
        contributionsPerYear = 12;
        break;
      case 'quarterly':
        contributionsPerYear = 4;
        break;
      case 'semi-annually':
        contributionsPerYear = 2;
        break;
      case 'annually':
        contributionsPerYear = 1;
        break;
      default:
        contributionsPerYear = 12; // Default to monthly
    }

    // Calculate contribution per period
    const contributionPerPeriod = additionalContribution * (periodsPerYear / contributionsPerYear);

    // Calculate total number of periods
    const totalPeriods = periodsPerYear * termYears;

    // Initialize variables for tracking growth
    let currentBalance = principal;
    let totalContributions = principal;
    let totalInterest = 0;

    // Arrays to store data for chart
    const balanceData = [principal];
    const contributionData = [principal];
    const interestData = [0];
    const labels = ['Start'];

    // Calculate growth for each period
    for (let period = 1; period <= totalPeriods; period++) {
      // Calculate interest for this period
      const interestForPeriod = currentBalance * ratePerPeriod;
      totalInterest += interestForPeriod;

      // Add contribution if this is a contribution period
      let contributionForPeriod = 0;
      if (period % (periodsPerYear / contributionsPerYear) === 0) {
        contributionForPeriod = additionalContribution;
        totalContributions += additionalContribution;
      }

      // Update balance
      currentBalance += interestForPeriod + contributionForPeriod;

      // Store data for chart at yearly intervals
      if (period % periodsPerYear === 0) {
        const year = period / periodsPerYear;
        balanceData.push(currentBalance);
        contributionData.push(totalContributions);
        interestData.push(currentBalance - totalContributions);
        labels.push(`Year ${year}`);
      }
    }

    // Calculate final values
    const finalBalance = currentBalance;
    const totalReturn = finalBalance - totalContributions;
    const returnRate = (totalReturn / totalContributions) * 100;

    // Log values for debugging
    console.log('Currency symbol:', currentLocale.currency);
    console.log('Final Balance:', finalBalance);
    console.log('Total Return:', totalReturn);
    console.log('Total Contributions:', totalContributions);

    // Set results
    setResults({
      principal,
      additionalContribution,
      contributionFrequency,
      compoundingFrequency,
      termYears,
      rate,
      finalBalance,
      totalContributions,
      totalInterest,
      totalReturn,
      returnRate
    });

    // Prepare chart data with enhanced visuals for mobile
    setChartData({
      labels,
      datasets: [
        {
          label: 'Total Balance',
          data: balanceData,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(59, 130, 246, 0.1)';
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');
            return gradient;
          },
          borderWidth: isMobile ? 3 : 2,
          fill: true,
          tension: 0.4,
          pointRadius: isMobile ? 4 : 3,
          pointHoverRadius: isMobile ? 6 : 5,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: document.documentElement.classList.contains('dark') ? 'rgba(30, 41, 59, 1)' : 'rgba(255, 255, 255, 1)',
          pointBorderWidth: 2
        }
      ]
    });

    // Prepare breakdown data with enhanced visuals for mobile
    setBreakdownData({
      labels,
      datasets: [
        {
          label: 'Contributions',
          data: contributionData,
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(16, 185, 129, 0.7)';
            const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.6)');
            return gradient;
          },
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: isMobile ? 2 : 1,
          stack: 'Stack 0',
          hoverBackgroundColor: 'rgba(16, 185, 129, 0.9)',
          borderRadius: isMobile ? 4 : 0
        },
        {
          label: 'Interest',
          data: interestData,
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(99, 102, 241, 0.7)';
            const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.6)');
            return gradient;
          },
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: isMobile ? 2 : 1,
          stack: 'Stack 0',
          hoverBackgroundColor: 'rgba(99, 102, 241, 0.9)',
          borderRadius: isMobile ? 4 : 0
        }
      ]
    });

    // Scroll to results
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Format currency
  const formatCurrency = (value) => {
    // Map locale to currency code
    const currencyCodes = {
      'en-GB': 'GBP',
      'en-IN': 'INR',
      'en-US': 'USD'
    };

    // Get the currency code based on locale, with fallback to GBP
    const currencyCode = currencyCodes[currentLocale.locale] || 'GBP';

    // Use Intl.NumberFormat for better locale support
    return new Intl.NumberFormat(currentLocale.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format currency for display in charts
  const formatCurrencyForChart = (value) => {
    // Map locale to currency code
    const currencyCodes = {
      'en-GB': 'GBP',
      'en-IN': 'INR',
      'en-US': 'USD'
    };

    // Get the currency code based on locale, with fallback to GBP
    const currencyCode = currencyCodes[currentLocale.locale] || 'GBP';

    // Get the currency symbol from the locale
    const formatter = new Intl.NumberFormat(currentLocale.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    // Extract just the currency symbol
    const parts = formatter.formatToParts(0);
    const currencySymbol = parts.find(part => part.type === 'currency')?.value || currentLocale.currency;

    if (value >= 1000000) {
      return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${currencySymbol}${(value / 1000).toFixed(0)}K`;
    }
    return formatter.format(value);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="investment-calculator">
      {/* Calculator Form */}
      <Card className="mb-4">
        <div className="p-3 sm:p-4">
          <h3 className="text-lg font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">
            Investment Calculator
          </h3>

          {/* Mobile-optimized form layout */}
          <div className="flex flex-col gap-6 sm:gap-5">
            {/* Initial Investment */}
            <div className="w-full">
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-0 sm:mr-2 w-full sm:w-auto">
                    Initial Investment
                  </label>
                  <div className="flex items-center">
                    <Tooltip content="The amount you start with">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </Tooltip>
                  </div>
                </div>
                <div className="w-full">
                  <NumericInput
                    value={principal}
                    onChange={setPrincipal}
                    min={100}
                    max={1000000}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                    className="w-full"
                  />
                </div>
                <div className="mt-3 px-1">
                  <RangeSlider
                    min={100}
                    max={100000}
                    step={100}
                    value={principal}
                    onChange={setPrincipal}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{currentLocale.currency}100</span>
                    <span>{currentLocale.currency}100,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Regular Contribution */}
            <div className="w-full">
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-0 sm:mr-2 w-full sm:w-auto">
                    Regular Contribution
                  </label>
                  <div className="flex items-center">
                    <Tooltip content="Additional amount you add regularly">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </Tooltip>
                  </div>
                </div>
                <div className="w-full">
                  <NumericInput
                    value={additionalContribution}
                    onChange={setAdditionalContribution}
                    min={0}
                    max={10000}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                    className="w-full"
                  />
                </div>
                <div className="mt-3 px-1">
                  <RangeSlider
                    min={0}
                    max={1000}
                    step={10}
                    value={additionalContribution}
                    onChange={setAdditionalContribution}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{currentLocale.currency}0</span>
                    <span>{currentLocale.currency}1,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contribution Frequency */}
            <div className="w-full">
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-0 sm:mr-2 w-full sm:w-auto">
                    Contribution Frequency
                  </label>
                  <div className="flex items-center">
                    <Tooltip content="How often you add to your investment">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </Tooltip>
                  </div>
                </div>
                <div className="w-full">
                  <select
                    value={contributionFrequency}
                    onChange={(e) => setContributionFrequency(e.target.value)}
                    className="select select-loanviz w-full h-12 sm:h-auto text-base"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annually">Semi-Annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Annual Interest Rate */}
            <div className="w-full">
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-0 sm:mr-2 w-full sm:w-auto">
                    Annual Interest Rate
                  </label>
                  <div className="flex items-center">
                    <Tooltip content="The annual rate of return on your investment">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </Tooltip>
                  </div>
                </div>
                <div className="w-full">
                  <NumericInput
                    value={rate}
                    onChange={setRate}
                    min={0.1}
                    max={30}
                    step={0.1}
                    suffix="%"
                    decimalScale={2}
                    className="w-full"
                  />
                </div>
                <div className="mt-3 px-1">
                  <RangeSlider
                    min={0.1}
                    max={15}
                    step={0.1}
                    value={rate}
                    onChange={setRate}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>0.1%</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compounding Frequency */}
            <div className="w-full">
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-0 sm:mr-2 w-full sm:w-auto">
                    Compounding Frequency
                  </label>
                  <div className="flex items-center">
                    <Tooltip content="How often interest is calculated and added to your investment">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </Tooltip>
                  </div>
                </div>
                <div className="w-full">
                  <select
                    value={compoundingFrequency}
                    onChange={(e) => setCompoundingFrequency(e.target.value)}
                    className="select select-loanviz w-full h-12 sm:h-auto text-base"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annually">Semi-Annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Investment Period */}
            <div className="w-full">
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-0 sm:mr-2 w-full sm:w-auto">
                    Investment Period
                  </label>
                  <div className="flex items-center">
                    <Tooltip content="How long you plan to keep the investment">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </Tooltip>
                  </div>
                </div>
                <div className="w-full">
                  <NumericInput
                    value={termYears}
                    onChange={setTermYears}
                    min={1}
                    max={50}
                    step={1}
                    suffix=" years"
                    decimalScale={0}
                    className="w-full"
                  />
                </div>
                <div className="mt-3 px-1">
                  <RangeSlider
                    min={1}
                    max={30}
                    step={1}
                    value={termYears}
                    onChange={setTermYears}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>1 year</span>
                    <span>30 years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Mobile-optimized layout */}
            <div className="w-full mt-6 mb-2">
              <div className="flex flex-col gap-3">
                <motion.div
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GlowButton
                    onClick={handleCalculate}
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isCalculating}
                    ariaLabel="Calculate investment growth"
                    effect="glow"
                    className="py-3 rounded-lg"
                    icon={
                      <motion.div
                        animate={isCalculating ? { rotate: 360 } : { rotate: 0 }}
                        transition={isCalculating ?
                          { duration: 2, repeat: Infinity, ease: "linear" } :
                          { type: "spring", stiffness: 200, damping: 10 }
                        }
                      >
                        <FaCalculator className="h-5 w-5 mr-2" aria-hidden="true" />
                      </motion.div>
                    }
                  >
                    Calculate
                  </GlowButton>
                </motion.div>
                <motion.div
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GlowButton
                    onClick={handleReset}
                    variant="secondary"
                    fullWidth
                    size="lg"
                    ariaLabel="Reset calculator"
                    className="py-3 rounded-lg"
                    icon={<FaUndo className="h-4 w-4 mr-2" />}
                  >
                    Reset
                  </GlowButton>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {showResults && results && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Summary Card */}
            <Card className="mb-4">
              <div className="p-3 sm:p-4">
                <h3 className="text-lg font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">
                  Investment Summary
                </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {/* Final Balance */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
                  <h4 className="text-md font-semibold mb-1 sm:mb-2 text-blue-700 dark:text-blue-300">
                    Final Balance
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
                    <AnimatedNumber
                      value={results.finalBalance}
                      formatValue={formatCurrency}
                      duration={500}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">
                    After {results.termYears} years
                  </p>
                </div>

                {/* Total Return */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4">
                  <h4 className="text-md font-semibold mb-1 sm:mb-2 text-green-700 dark:text-green-300">
                    Total Return
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">
                    <AnimatedNumber
                      value={results.totalReturn}
                      formatValue={formatCurrency}
                      duration={500}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
                    Return Rate: {formatPercentage(results.returnRate)}
                  </p>
                </div>

                {/* Contributions */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 sm:p-4 sm:col-span-2 md:col-span-1">
                  <h4 className="text-md font-semibold mb-1 sm:mb-2 text-purple-700 dark:text-purple-300">
                    Total Contributions
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-200">
                    <AnimatedNumber
                      value={results.totalContributions}
                      formatValue={formatCurrency}
                      duration={500}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 mt-1">
                    {isMobile ? (
                      <>Initial: {formatCurrency(results.principal)}<br />Additional: {formatCurrency(results.totalContributions - results.principal)}</>
                    ) : (
                      <>Initial: {formatCurrency(results.principal)} + Additional: {formatCurrency(results.totalContributions - results.principal)}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Growth Chart */}
          {chartData && (
            <Card className="mb-4">
              <div className="p-3 sm:p-4">
                <h3 className="text-lg font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">
                  Investment Growth
                </h3>

                <div className="h-[380px] sm:h-[350px] w-full relative overflow-visible">
                  <ChartWrapper
                    ref={growthChartRef}
                    key={`growth-chart-${windowWidth < 640 ? 'mobile' : 'desktop'}`}
                    type="line"
                    title="Investment Growth"
                    description="Line chart showing investment balance growth over time"
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      layout: {
                        padding: {
                          left: isMobile ? 5 : 10,
                          right: isMobile ? 5 : 10,
                          top: isMobile ? 5 : 10,
                          bottom: isMobile ? 25 : 20
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            display: !isMobile // Hide grid on mobile
                          },
                          ticks: {
                            maxRotation: isMobile ? 50 : 45,
                            minRotation: isMobile ? 50 : 45,
                            font: {
                              size: isMobile ? 8 : 10,
                              weight: 'bold'
                            },
                            autoSkip: true,
                            maxTicksLimit: isMobile ? 5 : 10,
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                            padding: 8
                          }
                        },
                        y: {
                          title: {
                            display: !isMobile, // Hide title on mobile
                            text: `Balance (${currentLocale.currency})`,
                            font: {
                              weight: 'bold',
                              size: 12
                            },
                            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#4b5563',
                            padding: { bottom: 10 }
                          },
                          grid: {
                            borderDash: [2, 4],
                            color: 'rgba(156, 163, 175, 0.2)',
                            drawBorder: !isMobile
                          },
                          ticks: {
                            callback: function(value) {
                              return formatCurrencyForChart(value);
                            },
                            font: {
                              size: isMobile ? 9 : 11,
                              weight: isMobile ? 'bold' : 'normal'
                            },
                            maxTicksLimit: isMobile ? 5 : 8,
                            padding: isMobile ? 2 : 5
                          },
                          beginAtZero: true
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed.y;
                              return `Balance: ${formatCurrency(value)}`;
                            }
                          },
                          backgroundColor: document.documentElement.classList.contains('dark') ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          titleColor: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1e293b',
                          bodyColor: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1e293b',
                          borderColor: document.documentElement.classList.contains('dark') ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                          borderWidth: 1,
                          padding: isMobile ? 8 : 10,
                          cornerRadius: 8,
                          displayColors: true,
                          boxPadding: isMobile ? 2 : 3,
                          titleFont: {
                            size: isMobile ? 11 : 13,
                            weight: 'bold'
                          },
                          bodyFont: {
                            size: isMobile ? 10 : 12
                          },
                          // Ensure tooltip is fully visible on mobile
                          position: isMobile ? 'nearest' : 'average'
                        },
                        legend: {
                          display: !isMobile, // Hide legend on mobile to save space
                          labels: {
                            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1e293b',
                            font: {
                              size: 12
                            },
                            boxWidth: isMobile ? 8 : 12
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Breakdown Chart */}
          {breakdownData && (
            <Card className="mb-4">
              <div className="p-3 sm:p-4">
                <h3 className="text-lg font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">
                  Contributions vs. Interest
                </h3>

                <div className="h-[380px] sm:h-[350px] w-full relative overflow-visible">
                  <ChartWrapper
                    ref={breakdownChartRef}
                    key={`breakdown-chart-${windowWidth < 640 ? 'mobile' : 'desktop'}`}
                    type="bar"
                    title="Contributions vs. Interest"
                    description="Stacked bar chart showing contributions and interest earned over time"
                    data={breakdownData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      layout: {
                        padding: {
                          left: isMobile ? 5 : 10,
                          right: isMobile ? 5 : 10,
                          top: isMobile ? 10 : 10,
                          bottom: isMobile ? 25 : 20
                        }
                      },
                      scales: {
                        x: {
                          stacked: true,
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            display: !isMobile // Hide grid on mobile
                          },
                          ticks: {
                            maxRotation: isMobile ? 50 : 45,
                            minRotation: isMobile ? 50 : 45,
                            font: {
                              size: isMobile ? 8 : 10,
                              weight: 'bold'
                            },
                            autoSkip: true,
                            maxTicksLimit: isMobile ? 5 : 10,
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                            padding: 8
                          }
                        },
                        y: {
                          stacked: true,
                          title: {
                            display: !isMobile, // Hide title on mobile
                            text: `Amount (${currentLocale.currency})`,
                            font: {
                              weight: 'bold',
                              size: 12
                            },
                            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#4b5563',
                            padding: { bottom: 10 }
                          },
                          grid: {
                            borderDash: [2, 4],
                            color: 'rgba(156, 163, 175, 0.2)',
                            drawBorder: !isMobile
                          },
                          ticks: {
                            callback: function(value) {
                              return formatCurrencyForChart(value);
                            },
                            font: {
                              size: isMobile ? 9 : 11,
                              weight: isMobile ? 'bold' : 'normal'
                            },
                            maxTicksLimit: isMobile ? 5 : 8,
                            padding: isMobile ? 2 : 5
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed.y;
                              return `${context.dataset.label}: ${formatCurrency(value)}`;
                            },
                            // Add total to tooltip
                            afterBody: function(tooltipItems) {
                              const item = tooltipItems[0];
                              const contributionValue = breakdownData.datasets[0].data[item.dataIndex];
                              const interestValue = breakdownData.datasets[1].data[item.dataIndex];
                              const total = contributionValue + interestValue;
                              return [`Total: ${formatCurrency(total)}`];
                            }
                          },
                          backgroundColor: document.documentElement.classList.contains('dark') ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          titleColor: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1e293b',
                          bodyColor: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1e293b',
                          borderColor: document.documentElement.classList.contains('dark') ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                          borderWidth: 1,
                          padding: isMobile ? 8 : 10,
                          cornerRadius: 8,
                          displayColors: true,
                          boxPadding: isMobile ? 2 : 3,
                          titleFont: {
                            size: isMobile ? 11 : 13,
                            weight: 'bold'
                          },
                          bodyFont: {
                            size: isMobile ? 10 : 12
                          },
                          // Ensure tooltip is fully visible on mobile
                          position: isMobile ? 'nearest' : 'average'
                        },
                        legend: {
                          position: isMobile ? 'bottom' : 'top',
                          labels: {
                            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1e293b',
                            font: {
                              size: isMobile ? 10 : 12
                            },
                            boxWidth: isMobile ? 8 : 12,
                            padding: isMobile ? 8 : 10
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </Card>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvestmentCalculator;
