import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { FaCalculator, FaMoneyBillWave, FaPercentage, FaCalendarAlt, FaCar, FaGraduationCap, FaInfoCircle, FaChartLine } from 'react-icons/fa';
import Card from '../ui/Card';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import Toggle from '../ui/Toggle';
import NumericInput from '../ui/NumericInput';
import RangeSlider from '../ui/RangeSlider';
import DonutChart from '../ui/DonutChart';
import AnimatedNumber from '../ui/AnimatedNumber';
import EnhancedResultsSection from '../ui/EnhancedResultsSection';
import ResponsiveFormSection from '../ui/ResponsiveFormSection';
import ResponsiveContainer from '../ui/ResponsiveContainer';
import ResponsiveGrid from '../ui/ResponsiveGrid';
import RegulatoryDisclaimer from '../ui/RegulatoryDisclaimer';
import useLoanCalculations from '../../hooks/useLoanCalculations';
import loanConfigData, { loanParams } from '../../config/loanConfig';
import InvestmentCalculator from './InvestmentCalculator';
import { useLocale } from '../../contexts/LocaleContext';

// Simple function to calculate monthly payment
function calculateMonthlyPayment(principal, annualRate, termYears, type = 'repayment') {
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = termYears * 12;

  if (type === 'interest-only') {
    return principal * monthlyRate;
  } else {
    if (monthlyRate === 0) return principal / totalPayments;
    const x = Math.pow(1 + monthlyRate, totalPayments);
    return (principal * monthlyRate * x) / (x - 1);
  }
}

// Validation schema for loan calculator
const LoanCalcSchema = z.object({
  principal: z.number().min(1000, 'Loan amount must be at least 1,000').max(10000000, 'Loan amount cannot exceed 10,000,000'),
  rate: z.number().min(0, 'Interest rate cannot be negative').max(30, 'Interest rate cannot exceed 30%'),
  termYears: z.number().min(1, 'Loan term must be at least 1 year').max(40, 'Loan term cannot exceed 40 years'),
  type: z.enum(['repayment', 'interest-only']),
  downPayment: z.number().optional(),
  tradeInValue: z.number().optional(),
  gracePeriodMonths: z.number().min(0).max(60).optional(),
});

/**
 * LoanCalculator component for calculating loan payments
 * @param {Object} props - Component props
 * @param {string} props.loanTypeId - Type of loan (e.g., 'mortgage', 'personal', 'auto')
 * @param {Object} props.initialValues - Initial values for the calculator
 * @param {Object} props.ranges - Min/max ranges for inputs
 * @param {Object} props.additionalFees - Additional fees specific to the loan type
 * @param {Function} props.onCalculate - Callback when calculation is performed
 * @returns {JSX.Element} Loan calculator component
 */
const LoanCalculator = ({
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
    downPayment: { min: 0, max: 100000, step: 500 },
    tradeInValue: { min: 0, max: 50000, step: 500 },
    gracePeriodMonths: { min: 0, max: 60, step: 1 },
  },
  additionalFees = {},
  onCalculate = () => {},
}) => {
  // Get locale information
  const { currentLocale } = useLocale();

  // State for form inputs
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
  const [localResults, setLocalResults] = useState(null);

  // Use the loan calculations hook
  const {
    results,
    isCalculating,
    calculateLoan,
    resetCalculations
  } = useLoanCalculations(loanTypeId);

  // Reset form values when loanTypeId changes
  useEffect(() => {
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
    setLocalResults(null);
    if (resetCalculations) {
      resetCalculations();
    }
  }, [loanTypeId, initialValues, additionalFees, resetCalculations]);

  // Show results if they exist
  useEffect(() => {
    if (results) {
      console.log("Results available:", results);
      // Automatically show results when they're available
      setShowResults(true);

      // Scroll to results section
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 200);
    }
  }, [results]);

  // Create a ref for the results section
  const resultsRef = useRef(null);

  // Check if dark mode is active
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  // Update dark mode state when theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Handle fee changes
  const handleFeeChange = (feeKey, value) => {
    setFees(prevFees => ({
      ...prevFees,
      [feeKey]: value
    }));
  };

  // Handle calculation
  const handleCalculate = () => {
    // Reset errors
    setErrors({});

    try {
      // Validate inputs using Zod schema
      const validationData = {
        principal: loanAmount,
        rate: interestRate,
        termYears: loanTerm,
        type: repaymentType
      };

      // Add auto loan specific parameters
      if (loanTypeId === 'auto') {
        validationData.downPayment = downPayment;
        validationData.tradeInValue = tradeInValue;
      }

      // Add student loan specific parameters
      if (loanTypeId === 'student') {
        validationData.gracePeriodMonths = gracePeriodMonths;
      }

      // Validate the data
      const validatedData = LoanCalcSchema.parse(validationData);

      // Create simple calculation results directly
      const monthlyPayment = calculateMonthlyPayment(
        validatedData.principal,
        validatedData.rate,
        validatedData.termYears,
        validatedData.type
      );

      const totalFees = Object.values(fees).reduce((sum, fee) => sum + (parseFloat(fee) || 0), 0);
      const totalInterest = validatedData.type === 'interest-only'
        ? monthlyPayment * 12 * validatedData.termYears
        : (monthlyPayment * 12 * validatedData.termYears) - validatedData.principal;

      // Create the results object
      const calculationResults = {
        principal: validatedData.principal,
        originalPrincipal: validatedData.principal,
        rate: validatedData.rate,
        termYears: validatedData.termYears,
        type: validatedData.type,
        monthlyPayment: monthlyPayment,
        totalInterest: totalInterest,
        totalRepayment: validatedData.principal + totalInterest + totalFees,
        fees: totalFees
      };

      console.log("Created calculation results:", calculationResults);

      // Store results in local state
      setLocalResults(calculationResults);

      // Call the onCalculate callback
      onCalculate(calculationResults);

      // Show results with animation
      setShowResults(true);

      // Scroll to results section
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach(err => {
          const field = err.path[0];
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ calculation: error.message || 'Error calculating loan details' });
      }
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
    setLocalResults(null);
    resetCalculations();
  };

  // Check if this is an investment calculator
  const isInvestmentCalculator = loanTypeId === 'investment';

  // If this is an investment calculator, render the InvestmentCalculator component
  if (isInvestmentCalculator) {
    return <InvestmentCalculator loanTypeId={loanTypeId} />;
  }

  return (
    <div className="loan-calculator">
      <GlassmorphicCard
        className="mb-4"
        variant="primary"
        effect="glow"
        borderStyle="neon"
        blurStrength={10}
        animate={true}
        title={`${loanTypeId.charAt(0).toUpperCase() + loanTypeId.slice(1)} Calculator`}
        icon={<FaCalculator className="h-5 w-5" />}
      >
        <div className="p-2 sm:p-4">

          <ResponsiveGrid cols={2} mobileCols={1} gap="4">
            {/* Loan Amount */}
            <motion.div
              className="mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label htmlFor="loan-amount" className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <motion.span
                  className="mr-1"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <FaMoneyBillWave className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                </motion.span>
                Loan Amount
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
                    className="glassmorphic-input"
                  />
                </div>
                <div className="w-full">
                  <RangeSlider
                    min={ranges.principal.min}
                    max={ranges.principal.max}
                    step={ranges.principal.step}
                    value={loanAmount}
                    onChange={setLoanAmount}
                    formatValue={(val) => val.toLocaleString()}
                    leftLabel={`${currentLocale.currency}${ranges.principal.min.toLocaleString()}`}
                    rightLabel={`${currentLocale.currency}${ranges.principal.max.toLocaleString()}`}
                    trackColor="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400"
                    className="glassmorphic-slider"
                  />
                </div>
              </div>
            </motion.div>

            {/* Interest Rate */}
            <motion.div
              className="mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label htmlFor="interest-rate" className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <motion.span
                  className="mr-1"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.5
                  }}
                >
                  <FaPercentage className="h-4 w-4 text-green-500 dark:text-green-400" />
                </motion.span>
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
                    className="glassmorphic-input"
                  />
                </div>
                <div className="w-full">
                  <RangeSlider
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
                    trackColor="bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-400 dark:to-teal-400"
                    className="glassmorphic-slider"
                  />
                </div>
              </div>
            </motion.div>

            {/* Loan Term */}
            <motion.div
              className="mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label htmlFor="loan-term" className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <motion.span
                  className="mr-1"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 1
                  }}
                >
                  <FaCalendarAlt className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                </motion.span>
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
                    className="glassmorphic-input"
                  />
                </div>
                <div className="w-full">
                  <RangeSlider
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
                    trackColor="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400"
                    className="glassmorphic-slider"
                  />
                </div>
              </div>
            </motion.div>

            {/* Repayment Type */}
            <motion.div
              className="mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <motion.span
                  className="mr-1"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 1.5
                  }}
                >
                  <FaChartLine className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                </motion.span>
                Repayment Type
              </label>
              <div className="mt-2">
                <Toggle
                  options={[
                    { value: 'repayment', label: 'Repayment' },
                    { value: 'interest-only', label: 'Interest Only' }
                  ]}
                  value={repaymentType}
                  onChange={setRepaymentType}
                  error={errors.type}
                  className="glassmorphic-toggle"
                />
              </div>
            </motion.div>

            {/* Auto Loan: Down Payment - Only show for auto loans */}
            {loanTypeId === 'auto' && (
              <div className="mb-3">
                <label htmlFor="down-payment" className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Down Payment
                  <Tooltip content="Initial payment made when buying a vehicle">
                    <FaInfoCircle className="ml-1 inline-block h-3 w-3 text-gray-400" />
                  </Tooltip>
                </label>
                <div className="flex flex-col gap-2">
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
                    />
                  </div>
                  <div className="w-full">
                    <RangeSlider
                      min={ranges.downPayment.min}
                      max={ranges.downPayment.max}
                      step={ranges.downPayment.step}
                      value={downPayment}
                      onChange={setDownPayment}
                      formatValue={(val) => val.toLocaleString()}
                      leftLabel={`${currentLocale.currency}${ranges.downPayment.min.toLocaleString()}`}
                      rightLabel={`${currentLocale.currency}${ranges.downPayment.max.toLocaleString()}`}
                      trackColor="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Auto Loan: Trade-In Value - Only show for auto loans */}
            {loanTypeId === 'auto' && (
              <div className="mb-3">
                <label htmlFor="trade-in-value" className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trade-In Value
                  <Tooltip content="Value of your current vehicle that will be applied to the purchase">
                    <FaInfoCircle className="ml-1 inline-block h-3 w-3 text-gray-400" />
                  </Tooltip>
                </label>
                <div className="flex flex-col gap-2">
                  <div className="w-full">
                    <NumericInput
                      id="trade-in-value"
                      name="trade-in-value"
                      value={tradeInValue}
                      onChange={setTradeInValue}
                      min={ranges.tradeInValue.min}
                      max={ranges.tradeInValue.max}
                      step={ranges.tradeInValue.step}
                      error={errors.tradeInValue}
                      prefix={currentLocale.currency}
                      thousandSeparator={true}
                      decimalScale={0}
                      icon={<FaCar className="h-4 w-4" />}
                    />
                  </div>
                  <div className="w-full">
                    <RangeSlider
                      min={ranges.tradeInValue.min}
                      max={ranges.tradeInValue.max}
                      step={ranges.tradeInValue.step}
                      value={tradeInValue}
                      onChange={setTradeInValue}
                      formatValue={(val) => val.toLocaleString()}
                      leftLabel={`${currentLocale.currency}${ranges.tradeInValue.min.toLocaleString()}`}
                      rightLabel={`${currentLocale.currency}${ranges.tradeInValue.max.toLocaleString()}`}
                      trackColor="bg-gradient-to-r from-pink-500 to-rose-500 dark:from-pink-400 dark:to-rose-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Student Loan: Grace Period - Only show for student loans */}
            {loanTypeId === 'student' && (
              <div className="mb-3">
                <label htmlFor="grace-period" className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grace Period (Months)
                  <Tooltip content="Period after graduation before repayments begin">
                    <FaInfoCircle className="ml-1 inline-block h-3 w-3 text-gray-400" />
                  </Tooltip>
                </label>
                <div className="flex flex-col gap-2">
                  <div className="w-full">
                    <NumericInput
                      id="grace-period"
                      name="grace-period"
                      value={gracePeriodMonths}
                      onChange={setGracePeriodMonths}
                      min={ranges.gracePeriodMonths.min}
                      max={ranges.gracePeriodMonths.max}
                      step={ranges.gracePeriodMonths.step}
                      error={errors.gracePeriodMonths}
                      suffix=" months"
                      decimalScale={0}
                      icon={<FaGraduationCap className="h-4 w-4" />}
                    />
                  </div>
                  <div className="w-full">
                    <RangeSlider
                      min={ranges.gracePeriodMonths.min}
                      max={ranges.gracePeriodMonths.max}
                      step={ranges.gracePeriodMonths.step}
                      value={gracePeriodMonths}
                      onChange={setGracePeriodMonths}
                      formatValue={(val) => val}
                      leftLabel={`${ranges.gracePeriodMonths.min} months`}
                      rightLabel={`${ranges.gracePeriodMonths.max} months`}
                      trackColor="bg-gradient-to-r from-rose-500 to-red-500 dark:from-rose-400 dark:to-red-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Fees */}
            {Object.keys(fees).length > 0 && (
              <div className="col-span-1 md:col-span-2 mb-3">
                <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-white">Additional Fees</h3>
                <ResponsiveGrid cols={3} tabletCols={2} mobileCols={1} gap="3">
                  {Object.entries(fees).map(([key, value]) => (
                    <div key={key}>
                      <label htmlFor={`fee-${key}`} className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
                      </label>
                      <NumericInput
                        id={`fee-${key}`}
                        name={`fee-${key}`}
                        value={value}
                        onChange={(val) => handleFeeChange(key, val)}
                        min={0}
                        prefix={currentLocale.currency}
                        thousandSeparator={true}
                        decimalScale={0}
                      />
                    </div>
                  ))}
                </ResponsiveGrid>
              </div>
            )}

            {/* Action Buttons */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <ResponsiveFormSection direction="row" gap="3">
              {/* Calculate button (using the working implementation) */}
              <motion.button
                className="flex items-center justify-center gap-2 px-4 py-3 glassmorphic-btn-primary rounded-lg w-full"
                onClick={() => {
                  // Create properly calculated results
                  const totalFees = Object.values(fees).reduce((sum, fee) => sum + (parseFloat(fee) || 0), 0);

                  // Calculate monthly payment properly based on loan type
                  let monthlyPaymentValue;
                  let totalInterestValue;

                  if (repaymentType === 'interest-only') {
                    // For interest-only loans, monthly payment is just the interest
                    monthlyPaymentValue = (loanAmount * interestRate / 100) / 12;
                    totalInterestValue = monthlyPaymentValue * 12 * loanTerm;
                  } else {
                    // For repayment loans, use the standard formula
                    const monthlyRate = interestRate / 100 / 12;
                    const totalPayments = loanTerm * 12;
                    monthlyPaymentValue = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
                    totalInterestValue = (monthlyPaymentValue * totalPayments) - loanAmount;
                  }

                  const dummyResults = {
                    principal: loanAmount,
                    originalPrincipal: loanAmount,
                    rate: interestRate,
                    termYears: loanTerm,
                    type: repaymentType,
                    monthlyPayment: monthlyPaymentValue,
                    totalInterest: totalInterestValue,
                    totalRepayment: loanAmount + totalInterestValue + totalFees,
                    fees: totalFees
                  };

                  // Log the calculated values for debugging
                  console.log("Calculated values:", {
                    monthlyPayment: monthlyPaymentValue,
                    totalInterest: totalInterestValue,
                    totalRepayment: loanAmount + totalInterestValue + totalFees
                  });

                  setLocalResults(dummyResults);
                  setShowResults(true);
                  console.log("Created dummy results:", dummyResults);

                  // Enhanced auto-scroll to results with better timing and behavior
                  setTimeout(() => {
                    if (resultsRef.current) {
                      resultsRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });

                      // Add a subtle highlight effect to the results section
                      resultsRef.current.classList.add('highlight-pulse');
                      setTimeout(() => {
                        resultsRef.current.classList.remove('highlight-pulse');
                      }, 1500);
                    }
                  }, 150);
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
                disabled={isCalculating}
                aria-label="Calculate loan payments"
              >
                <FaCalculator className="h-5 w-5" aria-hidden="true" />
                <span>Calculate</span>
              </motion.button>

              {/* Reset button */}
              <motion.button
                className="flex items-center justify-center gap-2 px-4 py-3 glassmorphic-btn border-gray-200/50 dark:border-gray-700/50 text-gray-800 dark:text-white rounded-lg w-full"
                onClick={handleReset}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 15px rgba(107, 114, 128, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                aria-label="Reset calculator"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Reset</span>
              </motion.button>
              </ResponsiveFormSection>
            </div>
          </ResponsiveGrid>
        </div>
      </GlassmorphicCard>

      {/* Instructions Banner - Only show if no results */}
      {!localResults && !results && (
        <GlassmorphicCard
          className="mb-4"
          variant="default"
          effect="shimmer"
          borderStyle="thin"
          blurStrength={8}
          animate={true}
        >
          <div className="flex items-center p-4">
            <motion.div
              className="mr-5 text-blue-500 dark:text-blue-400"
              animate={{
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              <FaCalculator className="h-6 w-6" />
            </motion.div>
            <div>
              <h3 className="text-gray-800 dark:text-white font-medium mb-2">
                Fill in the details above and click "Calculate" to see your loan breakdown
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Adjust the loan amount, interest rate, term, and other options to calculate your monthly payments and total costs.
              </p>
            </div>
          </div>
        </GlassmorphicCard>
      )}



      {/* Enhanced Results Section */}
      <EnhancedResultsSection
        results={localResults || results}
        isVisible={showResults && (localResults || results)}
        loanType={loanTypeId}
        ref={resultsRef}
      />

      {/* Regulatory Disclaimer */}
      {showResults && (localResults || results) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4"
        >
          <RegulatoryDisclaimer variant="subtle" />
        </motion.div>
      )}
    </div>
  );
};

export default LoanCalculator;
