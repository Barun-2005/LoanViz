import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalculator, FaMoneyBillWave, FaPercentage, FaCalendarAlt, FaChartPie, FaInfoCircle, FaUndo, FaPoundSign, FaCreditCard } from 'react-icons/fa';
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
import { useLocale } from '../../contexts/LocaleContext';

/**
 * InvestmentAffordabilityCalculator component for determining investment capacity
 * @param {Object} props - Component props
 * @param {Object} props.initialValues - Initial values for the calculator
 * @param {Object} props.ranges - Min/max ranges for inputs
 * @param {Function} props.onCalculate - Callback when calculation is performed
 * @returns {JSX.Element} Investment affordability calculator component
 */
const InvestmentAffordabilityCalculator = ({
  initialValues = {
    monthlyIncome: 8000,
    monthlyDebts: 2000,
    downPayment: 50000,
    rate: 4.2,
    termYears: 25,
    debtToIncomeRatio: 0.36,
  },
  ranges = {
    monthlyIncome: { min: 2000, max: 30000, step: 100 },
    monthlyDebts: { min: 0, max: 15000, step: 100 },
    downPayment: { min: 0, max: 300000, step: 1000 },
    rate: { min: 0.5, max: 15, step: 0.1 },
    termYears: { min: 5, max: 30, step: 1 },
    debtToIncomeRatio: { min: 0.28, max: 0.43, step: 0.01 },
  },
  onCalculate = () => {},
}) => {
  // Get locale information
  const { currentLocale } = useLocale();

  // State for form inputs
  const [monthlyIncome, setMonthlyIncome] = useState(initialValues.monthlyIncome);
  const [monthlyDebts, setMonthlyDebts] = useState(initialValues.monthlyDebts);
  const [initialInvestment, setInitialInvestment] = useState(initialValues.downPayment);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [expectedReturn, setExpectedReturn] = useState(initialValues.rate);
  const [investmentPeriod, setInvestmentPeriod] = useState(initialValues.termYears);
  const [errors, setErrors] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Use the affordability hook
  const {
    results,
    isCalculating,
    calculateAffordabilityDetails,
    resetCalculations,
    getBudgetRecommendations
  } = useAffordability('investment');

  // Create a ref for the results section
  const resultsRef = useRef(null);

  // Handle calculation
  const handleCalculate = async () => {
    // Reset errors
    setErrors({});

    try {
      // Calculate disposable income (after debts)
      const disposableIncome = monthlyIncome - monthlyDebts;

      // Calculate maximum monthly contribution (50% of disposable income)
      const maxMonthlyContribution = disposableIncome * 0.5;

      // Calculate conservative monthly contribution (30% of disposable income)
      const conservativeMonthlyContribution = disposableIncome * 0.3;

      // Calculate future value with compound interest
      const calculateFutureValue = (principal, monthlyAddition, rate, years) => {
        const monthlyRate = rate / 100 / 12;
        const months = years * 12;

        // Future value of initial principal
        const principalFV = principal * Math.pow(1 + monthlyRate, months);

        // Future value of monthly additions
        const additionsFV = monthlyAddition * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

        return principalFV + additionsFV;
      };

      // Calculate maximum and conservative portfolio values
      const maxPortfolioValue = calculateFutureValue(
        initialInvestment,
        maxMonthlyContribution,
        expectedReturn,
        investmentPeriod
      );

      const conservativePortfolioValue = calculateFutureValue(
        initialInvestment,
        conservativeMonthlyContribution,
        expectedReturn,
        investmentPeriod
      );

      // Calculate user's chosen portfolio value
      const chosenPortfolioValue = calculateFutureValue(
        initialInvestment,
        monthlyContribution,
        expectedReturn,
        investmentPeriod
      );

      // Create affordability results object
      const affordabilityResults = {
        monthlyIncome,
        monthlyDebts,
        disposableIncome,
        initialInvestment,
        monthlyContribution,
        maxMonthlyContribution,
        conservativeMonthlyContribution,
        maxPortfolioValue,
        conservativePortfolioValue,
        chosenPortfolioValue,
        expectedReturn,
        investmentPeriod,
        // Map to standard affordability result properties for compatibility
        maxPrice: maxPortfolioValue,
        conservativePrice: conservativePortfolioValue,
        maxLoanAmount: maxPortfolioValue - initialInvestment,
        conservativeLoanAmount: conservativePortfolioValue - initialInvestment,
        maxMonthlyPayment: maxMonthlyContribution,
        conservativeMonthlyPayment: conservativeMonthlyContribution,
        downPayment: initialInvestment
      };

      // Show results with animation
      setShowResults(true);

      // Call the onCalculate callback
      onCalculate(affordabilityResults);

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
      setErrors({ calculation: error.message || 'Error calculating investment affordability' });
    }
  };

  // Reset the calculator
  const handleReset = () => {
    setMonthlyIncome(initialValues.monthlyIncome);
    setMonthlyDebts(initialValues.monthlyDebts);
    setInitialInvestment(initialValues.downPayment);
    setMonthlyContribution(1000);
    setExpectedReturn(initialValues.rate);
    setInvestmentPeriod(initialValues.termYears);
    setErrors({});
    setShowResults(false);
    resetCalculations();
  };

  // Prepare chart data for investment visualization
  const prepareChartData = () => {
    if (!showResults) return null;

    // Calculate future values for different monthly contributions
    const calculateFutureValue = (principal, monthlyAddition, rate, years) => {
      const monthlyRate = rate / 100 / 12;
      const months = years * 12;

      // Future value of initial principal
      const principalFV = principal * Math.pow(1 + monthlyRate, months);

      // Future value of monthly additions
      const additionsFV = monthlyAddition * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

      return principalFV + additionsFV;
    };

    // Calculate portfolio values for different contribution levels
    const lowContribution = Math.max(100, monthlyContribution * 0.5);
    const mediumContribution = monthlyContribution;
    const highContribution = monthlyContribution * 1.5;

    const lowValue = calculateFutureValue(initialInvestment, lowContribution, expectedReturn, investmentPeriod);
    const mediumValue = calculateFutureValue(initialInvestment, mediumContribution, expectedReturn, investmentPeriod);
    const highValue = calculateFutureValue(initialInvestment, highContribution, expectedReturn, investmentPeriod);

    return {
      labels: [`${currentLocale.currency}${lowContribution}/mo`, `${currentLocale.currency}${mediumContribution}/mo`, `${currentLocale.currency}${highContribution}/mo`],
      datasets: [
        {
          label: 'Portfolio Value After ' + investmentPeriod + ' Years',
          data: [lowValue, mediumValue, highValue],
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)'
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)'
          ],
          borderWidth: 1,
        }
      ]
    };
  };

  // Prepare growth chart data
  const prepareGrowthChartData = () => {
    if (!showResults) return null;

    // Calculate portfolio value over time
    const calculateValueOverTime = (principal, monthlyAddition, rate, years) => {
      const monthlyRate = rate / 100 / 12;
      const yearlyValues = [];

      let currentValue = principal;
      yearlyValues.push(currentValue);

      for (let year = 1; year <= years; year++) {
        // Calculate value after one year of monthly contributions
        for (let month = 1; month <= 12; month++) {
          currentValue = currentValue * (1 + monthlyRate) + monthlyAddition;
        }
        yearlyValues.push(currentValue);
      }

      return yearlyValues;
    };

    const yearlyValues = calculateValueOverTime(
      initialInvestment,
      monthlyContribution,
      expectedReturn,
      investmentPeriod
    );

    const labels = Array.from({ length: investmentPeriod + 1 }, (_, i) => `Year ${i}`);

    return {
      labels,
      datasets: [
        {
          label: 'Portfolio Value',
          data: yearlyValues,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  return (
    <div className="investment-affordability-calculator pb-16">
      <GlassCard
        className="mb-4 overflow-visible"
        title="Investment Budget Calculator"
        icon={<FaMoneyBillWave className="h-5 w-5" />}
        variant="primary"
        effect="glow"
        animate={true}
      >
        <div className="p-3 sm:p-4 pb-12">

          <ResponsiveGrid cols={2} mobileCols={1} gap="6">
            {/* Income and Expenses */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Income & Expenses
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaPoundSign className="mr-2 text-blue-500 h-4 w-4" />
                    Monthly Income
                    <TooltipOverlay content="Your total monthly income after taxes">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </TooltipOverlay>
                  </label>
                  <NumericInput
                    value={monthlyIncome}
                    onChange={setMonthlyIncome}
                    min={ranges.monthlyIncome.min}
                    max={ranges.monthlyIncome.max}
                    step={ranges.monthlyIncome.step}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                  />
                  <StyledSlider
                    min={ranges.monthlyIncome.min}
                    max={ranges.monthlyIncome.max}
                    step={ranges.monthlyIncome.step}
                    value={monthlyIncome}
                    onChange={setMonthlyIncome}
                    className="mt-2"
                    symbol={currentLocale.currency}
                    symbolPosition="prefix"
                    formatValue={(val) => val.toLocaleString()}
                    leftLabel={`${currentLocale.currency}${ranges.monthlyIncome.min.toLocaleString()}`}
                    rightLabel={`${currentLocale.currency}${ranges.monthlyIncome.max.toLocaleString()}`}
                    trackColor="bg-gradient-to-r from-blue-500 to-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaCreditCard className="mr-2 text-green-500 h-4 w-4" />
                    Monthly Debts & Obligations
                    <TooltipOverlay content="Total monthly payments for loans, credit cards, etc.">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </TooltipOverlay>
                  </label>
                  <NumericInput
                    value={monthlyDebts}
                    onChange={setMonthlyDebts}
                    min={ranges.monthlyDebts.min}
                    max={ranges.monthlyDebts.max}
                    step={ranges.monthlyDebts.step}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                  />
                  <StyledSlider
                    min={ranges.monthlyDebts.min}
                    max={ranges.monthlyDebts.max}
                    step={ranges.monthlyDebts.step}
                    value={monthlyDebts}
                    onChange={setMonthlyDebts}
                    className="mt-2"
                    symbol={currentLocale.currency}
                    symbolPosition="prefix"
                    formatValue={(val) => val.toLocaleString()}
                    leftLabel={`${currentLocale.currency}${ranges.monthlyDebts.min.toLocaleString()}`}
                    rightLabel={`${currentLocale.currency}${ranges.monthlyDebts.max.toLocaleString()}`}
                    trackColor="bg-gradient-to-r from-green-500 to-teal-500"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaMoneyBillWave className="mr-2 text-purple-500 h-4 w-4" />
                    Monthly Investment Contribution
                    <TooltipOverlay content="How much you can invest each month">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </TooltipOverlay>
                  </label>
                  <NumericInput
                    value={monthlyContribution}
                    onChange={setMonthlyContribution}
                    min={0}
                    max={5000}
                    step={50}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                  />
                  <StyledSlider
                    min={0}
                    max={5000}
                    step={50}
                    value={monthlyContribution}
                    onChange={setMonthlyContribution}
                    className="mt-2"
                    symbol={currentLocale.currency}
                    symbolPosition="prefix"
                    formatValue={(val) => val.toLocaleString()}
                    leftLabel={`${currentLocale.currency}0`}
                    rightLabel={`${currentLocale.currency}5,000`}
                    trackColor="bg-gradient-to-r from-purple-500 to-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Investment Parameters */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Investment Parameters
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaPoundSign className="mr-2 text-blue-500 h-4 w-4" />
                    Initial Investment
                    <TooltipOverlay content="Amount you can invest upfront">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </TooltipOverlay>
                  </label>
                  <NumericInput
                    value={initialInvestment}
                    onChange={setInitialInvestment}
                    min={ranges.downPayment.min}
                    max={ranges.downPayment.max}
                    step={ranges.downPayment.step}
                    prefix={currentLocale.currency}
                    thousandSeparator={true}
                    decimalScale={0}
                  />
                  <StyledSlider
                    min={ranges.downPayment.min}
                    max={ranges.downPayment.max}
                    step={ranges.downPayment.step}
                    value={initialInvestment}
                    onChange={setInitialInvestment}
                    className="mt-2"
                    symbol={currentLocale.currency}
                    symbolPosition="prefix"
                    formatValue={(val) => val.toLocaleString()}
                    leftLabel={`${currentLocale.currency}${ranges.downPayment.min.toLocaleString()}`}
                    rightLabel={`${currentLocale.currency}${ranges.downPayment.max.toLocaleString()}`}
                    trackColor="bg-gradient-to-r from-blue-500 to-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaPercentage className="mr-2 text-purple-500 h-4 w-4" />
                    Expected Annual Return
                    <TooltipOverlay content="Estimated annual return on your investments">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </TooltipOverlay>
                  </label>
                  <NumericInput
                    value={expectedReturn}
                    onChange={setExpectedReturn}
                    min={ranges.rate.min}
                    max={ranges.rate.max}
                    step={ranges.rate.step}
                    suffix="%"
                    decimalScale={2}
                  />
                  <StyledSlider
                    min={ranges.rate.min}
                    max={ranges.rate.max}
                    step={ranges.rate.step}
                    value={expectedReturn}
                    onChange={setExpectedReturn}
                    className="mt-2"
                    symbol="%"
                    symbolPosition="suffix"
                    formatValue={(val) => val.toFixed(2)}
                    leftLabel={`${ranges.rate.min}%`}
                    rightLabel={`${ranges.rate.max}%`}
                    trackColor="bg-gradient-to-r from-purple-500 to-violet-500"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaCalendarAlt className="mr-2 text-pink-500 h-4 w-4" />
                    Investment Period
                    <TooltipOverlay content="How long you plan to invest">
                      <FaInfoCircle className="ml-1 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    </TooltipOverlay>
                  </label>
                  <NumericInput
                    value={investmentPeriod}
                    onChange={setInvestmentPeriod}
                    min={ranges.termYears.min}
                    max={ranges.termYears.max}
                    step={ranges.termYears.step}
                    suffix=" years"
                    decimalScale={0}
                  />
                  <StyledSlider
                    min={ranges.termYears.min}
                    max={ranges.termYears.max}
                    step={ranges.termYears.step}
                    value={investmentPeriod}
                    onChange={setInvestmentPeriod}
                    className="mt-2"
                    symbol=" years"
                    symbolPosition="suffix"
                    formatValue={(val) => val}
                    leftLabel={`${ranges.termYears.min} years`}
                    rightLabel={`${ranges.termYears.max} years`}
                    trackColor="bg-gradient-to-r from-pink-500 to-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="col-span-1 md:col-span-2 mt-4 mb-10">
              <ResponsiveFormSection direction="row" gap="3">
              <div className="col-span-3">
                <GlowButton
                  onClick={handleCalculate}
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={isCalculating}
                  ariaLabel="Calculate investment affordability"
                  effect="glow"
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
              <div className="col-span-1">
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
              </ResponsiveFormSection>
            </div>
          </ResponsiveGrid>
        </div>
      </GlassCard>

      {/* Results Section */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard
              className="mb-4"
              title="Investment Potential"
              icon={<FaMoneyBillWave className="h-5 w-5" />}
              variant="success"
              effect="glow"
              animate={true}
            >
              <div className="p-4">

                <ResponsiveGrid cols={2} mobileCols={1} gap="4">
                  {/* Results Text */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Projected Portfolio Value</p>
                      {/* Calculate the future value directly and display it */}
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-200 dark:to-blue-200">
                        {formatCurrencyWithLocale(calculateFutureValue(
                          initialInvestment,
                          monthlyContribution,
                          expectedReturn,
                          investmentPeriod
                        ), currentLocale)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        After {investmentPeriod} years with {formatCurrencyWithLocale(monthlyContribution, currentLocale)}/month
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Conservative Recommendation</p>
                      {/* Calculate the future value directly and display it */}
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-200 dark:to-teal-200">
                        {formatCurrencyWithLocale(calculateFutureValue(
                          initialInvestment,
                          (monthlyIncome - monthlyDebts) * 0.3,
                          expectedReturn,
                          investmentPeriod
                        ), currentLocale)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        30% of disposable income ({formatCurrencyWithLocale(Math.round((monthlyIncome - monthlyDebts) * 0.3), currentLocale)}/month)
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Maximum Potential</p>
                      {/* Calculate the future value directly and display it */}
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-200 dark:to-indigo-200">
                        {formatCurrencyWithLocale(calculateFutureValue(
                          initialInvestment,
                          (monthlyIncome - monthlyDebts) * 0.5,
                          expectedReturn,
                          investmentPeriod
                        ), currentLocale)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        50% of disposable income ({formatCurrencyWithLocale(Math.round((monthlyIncome - monthlyDebts) * 0.5), currentLocale)}/month)
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-80">
                    <ChartWrapper
                      type="bar"
                      data={prepareChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              boxWidth: 12,
                              padding: 15,
                              font: {
                                size: 12
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                  label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                  label += formatCurrencyWithLocale(context.parsed.y, currentLocale);
                                }
                                return label;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false
                            },
                            ticks: {
                              font: {
                                size: 11
                              }
                            }
                          },
                          y: {
                            beginAtZero: true,
                            grid: {
                              borderDash: [2, 4],
                              color: 'rgba(156, 163, 175, 0.2)'
                            },
                            ticks: {
                              padding: 8,
                              font: {
                                size: 11
                              },
                              callback: function(value) {
                                if (value >= 1000000) {
                                  return formatCurrencyWithLocale(value, currentLocale, {
                                    notation: 'compact',
                                    compactDisplay: 'short',
                                    maximumFractionDigits: 1
                                  });
                                } else if (value >= 1000) {
                                  return formatCurrencyWithLocale(value, currentLocale, {
                                    notation: 'compact',
                                    compactDisplay: 'short',
                                    maximumFractionDigits: 0
                                  });
                                }
                                return formatCurrencyWithLocale(value, currentLocale);
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </ResponsiveGrid>
              </div>
            </GlassCard>

            {/* Growth Chart */}
            <GlassCard
              className="mb-4"
              title="Portfolio Growth Over Time"
              icon={<FaChartPie className="h-5 w-5" />}
              variant="primary"
              effect="glow"
              animate={true}
            >
              <div className="p-4">

                {/* Responsive chart container */}
                <ResponsiveContainer className="h-[20rem] sm:h-[24rem] md:h-[28rem]" enableScroll={true}>
                  <ChartWrapper
                    type="line"
                    data={prepareGrowthChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      layout: {
                        padding: {
                          bottom: 40 // Increased padding at the bottom of the chart
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                label += ': ';
                              }
                              if (context.parsed.y !== null) {
                                label += formatCurrencyWithLocale(context.parsed.y, currentLocale);
                              }
                              return label;
                            }
                          }
                        },
                        legend: {
                          position: 'top',
                          labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: {
                              size: 12
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            autoSkip: true,
                            maxTicksLimit: 10,
                            font: {
                              size: 10
                            },
                            padding: 10 // Add padding to x-axis ticks
                          }
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            borderDash: [2, 4],
                            color: 'rgba(156, 163, 175, 0.2)'
                          },
                          ticks: {
                            padding: 8,
                            font: {
                              size: 11
                            },
                            callback: function(value) {
                              if (value >= 1000000) {
                                return formatCurrencyWithLocale(value, currentLocale, {
                                  notation: 'compact',
                                  compactDisplay: 'short',
                                  maximumFractionDigits: 1
                                });
                              } else if (value >= 1000) {
                                return formatCurrencyWithLocale(value, currentLocale, {
                                  notation: 'compact',
                                  compactDisplay: 'short',
                                  maximumFractionDigits: 0
                                });
                              }
                              return formatCurrencyWithLocale(value, currentLocale);
                            }
                          }
                        }
                      }
                    }}
                  />
                </ResponsiveContainer>

                {/* Increased margin-top from mt-4 to mt-10 to provide more space between chart and summary */}
                <div className="mt-10 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Investment Summary:</span> With an initial investment of {formatCurrencyWithLocale(initialInvestment, currentLocale)} and monthly contributions of {formatCurrencyWithLocale(monthlyContribution, currentLocale)}, your portfolio could grow to approximately {formatCurrencyWithLocale(calculateFutureValue(initialInvestment, monthlyContribution, expectedReturn, investmentPeriod), currentLocale)} after {investmentPeriod} years, assuming an annual return of {expectedReturn}%.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {errors.calculation && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300">
          <p className="font-bold">Error</p>
          <p>{errors.calculation}</p>
        </div>
      )}
    </div>
  );
};

// Helper function for formatting currency with proper locale and currency code
const formatCurrencyWithLocale = (value, locale, options = {}) => {
  // Map locale to currency code
  const currencyCodes = {
    'en-GB': 'GBP',
    'en-IN': 'INR',
    'en-US': 'USD'
  };

  // Get the currency code based on locale code, with fallback to GBP
  const currencyCode = currencyCodes[locale.locale] || 'GBP';

  // Default options
  const defaultOptions = {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  };

  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };

  return new Intl.NumberFormat(locale.locale, mergedOptions).format(value);
};

// Helper function for calculating future value with compound interest
const calculateFutureValue = (principal, monthlyAddition, rate, years) => {
  // Log input values for debugging
  console.log('calculateFutureValue inputs:', { principal, monthlyAddition, rate, years });

  // Ensure all inputs are valid numbers
  if (isNaN(principal) || isNaN(monthlyAddition) || isNaN(rate) || isNaN(years)) {
    console.error('Invalid inputs to calculateFutureValue:', { principal, monthlyAddition, rate, years });
    return 0;
  }

  // Convert to numbers to ensure proper calculation
  const p = Number(principal);
  const m = Number(monthlyAddition);
  const r = Number(rate);
  const y = Number(years);

  const monthlyRate = r / 100 / 12;
  const months = y * 12;

  // Future value of initial principal
  const principalFV = p * Math.pow(1 + monthlyRate, months);

  // Future value of monthly additions
  const additionsFV = m * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  const result = principalFV + additionsFV;

  // Log result for debugging
  console.log('calculateFutureValue result:', result);

  return result;
};

export default InvestmentAffordabilityCalculator;
