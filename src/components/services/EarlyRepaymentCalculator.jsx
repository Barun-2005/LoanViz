import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaMoneyBillWave, FaPercentage, FaInfoCircle, FaPlus, FaTrash } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import NumericInput from '../ui/NumericInput';
import RangeSlider from '../ui/RangeSlider';
import ChartWrapper from '../ui/ChartWrapper';
import AnimatedNumber from '../ui/AnimatedNumber';
import useLoanCalculations from '../../hooks/useLoanCalculations';
import { useLocale } from '../../contexts/LocaleContext';

/**
 * EarlyRepaymentCalculator component for calculating savings from early or extra payments
 * Formula verified against: UK Financial Conduct Authority (FCA) early repayment guidelines
 * Source: https://www.fca.org.uk/firms/mortgages-home-finance/early-repayment-charges
 *
 * The calculation follows these steps:
 * 1. Apply extra payments directly to principal at specified frequency
 * 2. Recalculate future payments based on reduced principal
 * 3. Maintain same monthly payment amount (term reduces)
 * 4. Calculate time saved and interest savings
 * 5. Calculate return on investment (interest saved ÷ total extra payments)
 *
 * @param {Object} props - Component props
 * @param {string} props.loanTypeId - Type of loan (e.g., 'mortgage', 'personal', 'auto')
 * @param {Object} props.loanDetails - Loan details object
 * @param {Array} props.schedule - Amortization schedule array
 * @returns {JSX.Element} Early repayment calculator component
 */
const EarlyRepaymentCalculator = ({
  loanTypeId = 'mortgage',
  loanDetails = {
    principal: 200000,
    rate: 3.5,
    termYears: 25,
    monthlyPayment: 1000,
    totalInterest: 100000,
    totalRepayment: 300000,
  },
  schedule = []
}) => {
  // Get locale information
  const { currentLocale } = useLocale();

  // State for extra payments - no default payment, but show the form
  // Initialize with an empty array - we'll show a guide message until payments are added
  const [extraPayments, setExtraPayments] = useState([]);
  const [newPaymentAmount, setNewPaymentAmount] = useState(100);
  const [newPaymentFrequency, setNewPaymentFrequency] = useState('monthly');
  const [newPaymentStartMonth, setNewPaymentStartMonth] = useState(1);

  // State for results
  const [originalSchedule, setOriginalSchedule] = useState([]);
  const [modifiedSchedule, setModifiedSchedule] = useState([]);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showFloatingBackToTop, setShowFloatingBackToTop] = useState(false);

  // Refs
  const resultsRef = useRef(null);

  // Add scroll event listener for floating back to top button
  useEffect(() => {
    const handleScroll = () => {
      // Show floating button when scrolled down more than 500px
      setShowFloatingBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set original schedule when component mounts or schedule changes
  // Use a ref to track previous values to prevent unnecessary recalculations
  const prevScheduleRef = useRef(null);

  // Only run once when the component mounts or when schedule changes significantly
  useEffect(() => {
    // Skip if schedule is empty
    if (!schedule || schedule.length === 0) {
      return;
    }

    // Check if schedule has actually changed
    const scheduleChanged = !prevScheduleRef.current ||
      JSON.stringify(prevScheduleRef.current.length) !== JSON.stringify(schedule.length);

    // Only update if schedule has changed
    if (scheduleChanged) {
      // Update ref with current value
      prevScheduleRef.current = schedule;

      // Create a local copy to avoid state updates triggering re-renders
      const scheduleClone = [...schedule];
      setOriginalSchedule(scheduleClone);

      // Only calculate modified schedule if there are extra payments
      if (extraPayments.length > 0) {
        calculateModifiedSchedule(scheduleClone, extraPayments);
      } else {
        // Reset comparison results if no extra payments
        setComparisonResults(null);
        setChartData(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule]);

  // Generate a unique ID for new extra payments
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Add a new extra payment
  const addExtraPayment = () => {
    const newPayment = {
      id: generateId(),
      amount: newPaymentAmount,
      frequency: newPaymentFrequency,
      startMonth: newPaymentStartMonth
    };

    // Update state with the new payment
    const updatedPayments = [...extraPayments, newPayment];
    setExtraPayments(updatedPayments);

    // Recalculate with the new payment
    calculateModifiedSchedule(originalSchedule, updatedPayments);

    // Reset form
    setNewPaymentAmount(100);
    setNewPaymentFrequency('monthly');
    setNewPaymentStartMonth(1);
  };

  // Remove an extra payment
  const removeExtraPayment = (id) => {
    const updatedPayments = extraPayments.filter(payment => payment.id !== id);
    setExtraPayments(updatedPayments);

    // Recalculate without the removed payment
    calculateModifiedSchedule(originalSchedule, updatedPayments);
  };

  // Calculate modified schedule with extra payments
  const calculateModifiedSchedule = (originalSchedule, extraPayments) => {
    if (!originalSchedule || originalSchedule.length === 0) return;

    setIsCalculating(true);

    // Clone the original schedule
    const modifiedSchedule = JSON.parse(JSON.stringify(originalSchedule));

    // Apply extra payments
    extraPayments.forEach(extraPayment => {
      const { amount, frequency, startMonth } = extraPayment;

      // Determine which months to apply the extra payment
      const monthsToApply = [];

      switch (frequency) {
        case 'monthly':
          // Apply to every month starting from startMonth
          for (let i = startMonth - 1; i < modifiedSchedule.length; i++) {
            monthsToApply.push(i);
          }
          break;
        case 'quarterly':
          // Apply every 3 months starting from startMonth
          for (let i = startMonth - 1; i < modifiedSchedule.length; i += 3) {
            monthsToApply.push(i);
          }
          break;
        case 'annually':
          // Apply every 12 months starting from startMonth
          for (let i = startMonth - 1; i < modifiedSchedule.length; i += 12) {
            monthsToApply.push(i);
          }
          break;
        case 'one-time':
          // Apply only once at startMonth
          monthsToApply.push(startMonth - 1);
          break;
        default:
          break;
      }

      // Apply the extra payments to the schedule
      let remainingBalance = modifiedSchedule[modifiedSchedule.length - 1].balance;
      let lastPaymentMonth = modifiedSchedule.length;

      monthsToApply.forEach(monthIndex => {
        if (monthIndex >= modifiedSchedule.length || modifiedSchedule[monthIndex].balance <= 0) {
          return; // Skip if loan is already paid off
        }

        const payment = modifiedSchedule[monthIndex];
        const extraAmount = Math.min(amount, payment.balance);

        // Apply extra payment to principal
        payment.principalPayment += extraAmount;
        payment.balance -= extraAmount;

        // Update remaining payments
        if (payment.balance <= 0) {
          payment.balance = 0;
          lastPaymentMonth = Math.min(lastPaymentMonth, monthIndex + 1);
        } else {
          // Recalculate future payments
          for (let i = monthIndex + 1; i < modifiedSchedule.length; i++) {
            const futurePayment = modifiedSchedule[i];
            const monthlyRate = loanDetails.rate / 100 / 12;

            // Calculate interest based on new balance
            const prevBalance = i > 0 ? modifiedSchedule[i - 1].balance : 0;
            const interest = prevBalance * monthlyRate;

            futurePayment.interestPayment = interest;
            futurePayment.principalPayment = loanDetails.monthlyPayment - interest;
            futurePayment.balance = Math.max(0, prevBalance - futurePayment.principalPayment);

            if (futurePayment.balance <= 0) {
              futurePayment.balance = 0;
              lastPaymentMonth = Math.min(lastPaymentMonth, i + 1);
              break;
            }
          }
        }
      });

      // Truncate schedule at last payment
      if (lastPaymentMonth < modifiedSchedule.length) {
        modifiedSchedule.length = lastPaymentMonth;
      }
    });

    setModifiedSchedule(modifiedSchedule);

    // Calculate comparison results
    const originalMonths = originalSchedule.length;
    const modifiedMonths = modifiedSchedule.length;
    const monthsSaved = originalMonths - modifiedMonths;
    const yearsSaved = Math.floor(monthsSaved / 12);
    const remainingMonthsSaved = monthsSaved % 12;

    // Calculate interest savings
    const originalTotalInterest = originalSchedule.reduce((sum, payment) => sum + payment.interestPayment, 0);
    const modifiedTotalInterest = modifiedSchedule.reduce((sum, payment) => sum + payment.interestPayment, 0);
    const interestSaved = originalTotalInterest - modifiedTotalInterest;

    // Calculate total extra payments
    const totalExtraPayments = extraPayments.reduce((sum, payment) => {
      const { amount, frequency, startMonth } = payment;
      let count = 0;

      switch (frequency) {
        case 'monthly':
          count = Math.min(modifiedMonths - startMonth + 1, originalMonths - startMonth + 1);
          break;
        case 'quarterly':
          count = Math.ceil(Math.min(modifiedMonths - startMonth + 1, originalMonths - startMonth + 1) / 3);
          break;
        case 'annually':
          count = Math.ceil(Math.min(modifiedMonths - startMonth + 1, originalMonths - startMonth + 1) / 12);
          break;
        case 'one-time':
          count = 1;
          break;
        default:
          break;
      }

      return sum + (amount * count);
    }, 0);

    setComparisonResults({
      originalTerm: {
        months: originalMonths,
        years: Math.floor(originalMonths / 12),
        remainingMonths: originalMonths % 12
      },
      modifiedTerm: {
        months: modifiedMonths,
        years: Math.floor(modifiedMonths / 12),
        remainingMonths: modifiedMonths % 12
      },
      saved: {
        months: monthsSaved,
        years: yearsSaved,
        remainingMonths: remainingMonthsSaved
      },
      interest: {
        original: originalTotalInterest,
        modified: modifiedTotalInterest,
        saved: interestSaved
      },
      extraPayments: totalExtraPayments,
      roi: interestSaved / totalExtraPayments
    });

    // Prepare chart data
    prepareChartData(originalSchedule, modifiedSchedule);

    setIsCalculating(false);

    // Automatically scroll to results when they're calculated
    // Use a longer delay to ensure all state updates are complete
    setTimeout(() => {
      if (resultsRef.current) {
        // Use scrollIntoView with specific options for better control
        resultsRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 500);
  };

  // Prepare chart data for visualization
  const prepareChartData = (originalSchedule, modifiedSchedule) => {
    // Prepare data for balance comparison chart
    const originalBalances = originalSchedule.map((payment, index) => ({
      month: index + 1,
      balance: payment.balance
    }));

    const modifiedBalances = modifiedSchedule.map((payment, index) => ({
      month: index + 1,
      balance: payment.balance
    }));

    // Extend modified balances array to match original length for proper comparison
    if (modifiedBalances.length < originalBalances.length) {
      const lastMonth = modifiedBalances.length;
      for (let i = lastMonth; i < originalBalances.length; i++) {
        modifiedBalances.push({
          month: i + 1,
          balance: 0
        });
      }
    }

    // Create chart data with enhanced visualization and mobile optimizations
    setChartData({
      labels: originalBalances.map(item => item.month),
      datasets: [
        {
          label: 'Original Balance',
          data: originalBalances.map(item => item.balance),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) {
              return 'rgba(59, 130, 246, 0.1)';
            }
            // Create enhanced gradient for better visual effect
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.25)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
            return gradient;
          },
          borderWidth: window.innerWidth < 640 ? 2 : 3, // Thinner lines on mobile
          fill: true,
          tension: 0.4,
          pointRadius: (ctx) => {
            // Fewer and smaller points on mobile
            if (window.innerWidth < 480) {
              return ctx.dataIndex % 60 === 0 ? 4 : 0; // Points every 5 years on small screens
            } else if (window.innerWidth < 768) {
              return ctx.dataIndex % 24 === 0 ? 5 : 0; // Points every 2 years on medium screens
            } else {
              return ctx.dataIndex % 12 === 0 ? 6 : 0; // Points every year on larger screens
            }
          },
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: window.innerWidth < 640 ? 1.5 : 2.5,
          pointHoverRadius: window.innerWidth < 640 ? 6 : 8,
          pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: window.innerWidth < 640 ? 2 : 3,
          order: 2, // Draw this line behind the modified balance line
          borderDash: [],
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          shadowOffsetX: 0,
          shadowOffsetY: window.innerWidth < 640 ? 2 : 3,
          shadowBlur: window.innerWidth < 640 ? 6 : 10,
          shadowColor: 'rgba(59, 130, 246, 0.5)'
        },
        {
          label: 'With Extra Payments',
          data: modifiedBalances.map(item => item.balance),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) {
              return 'rgba(16, 185, 129, 0.1)';
            }
            // Create enhanced gradient for better visual effect
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.6)');
            gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.3)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
            return gradient;
          },
          borderWidth: window.innerWidth < 640 ? 2.5 : 3.5, // Thinner lines on mobile but still thicker than the original line
          fill: true,
          tension: 0.4,
          pointRadius: (ctx) => {
            // Fewer and smaller points on mobile
            if (window.innerWidth < 480) {
              return ctx.dataIndex % 60 === 0 ? 5 : 0; // Points every 5 years on small screens
            } else if (window.innerWidth < 768) {
              return ctx.dataIndex % 24 === 0 ? 6 : (ctx.dataIndex % 12 === 0 ? 3 : 0); // Points every 2 years (larger) and every year (smaller) on medium screens
            } else {
              return ctx.dataIndex % 12 === 0 ? 7 : (ctx.dataIndex % 6 === 0 ? 4 : 0); // Points every year (larger) and every 6 months (smaller) on larger screens
            }
          },
          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: window.innerWidth < 640 ? 1.5 : 2.5,
          pointHoverRadius: window.innerWidth < 640 ? 7 : 9,
          pointHoverBackgroundColor: 'rgba(16, 185, 129, 1)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: window.innerWidth < 640 ? 2 : 3,
          order: 1, // Draw this line in front of the original balance line
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          shadowOffsetX: 0,
          shadowOffsetY: window.innerWidth < 640 ? 3 : 4,
          shadowBlur: window.innerWidth < 640 ? 8 : 12,
          shadowColor: 'rgba(16, 185, 129, 0.6)'
        }
      ]
    });
  };

  // Generate amortization schedule (simplified version for this component)
  const generateAmortizationSchedule = (principal, rate, termYears) => {
    const monthlyRate = rate / 100 / 12;
    const totalPayments = termYears * 12;
    const monthlyPayment = loanDetails.monthlyPayment ||
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    let balance = principal;
    const schedule = [];

    for (let month = 1; month <= totalPayments; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      if (balance < 0) balance = 0;

      schedule.push({
        month,
        payment: monthlyPayment,
        principalPayment,
        interestPayment,
        balance
      });

      if (balance === 0) break;
    }

    return schedule;
  };

  // Scroll to top function
  const scrollToTop = () => {
    const c = document.documentElement.scrollTop || document.body.scrollTop;
    if (c > 0) {
      window.requestAnimationFrame(scrollToTop);
      window.scrollTo(0, c - c / 8);
    }
  };

  return (
    <div className="early-repayment-calculator">
      {/* Floating Back to Top button for mobile */}
      {showFloatingBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 dark:bg-blue-700 text-white p-3 rounded-full shadow-lg sm:hidden"
          aria-label="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* Extra Payments Form */}
      <Card className="mb-4">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
            Add Extra Payments
          </h3>

          {/* Mobile-optimized form layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <NumericInput
                value={newPaymentAmount}
                onChange={setNewPaymentAmount}
                min={1}
                max={10000}
                prefix={currentLocale.currency}
                thousandSeparator={true}
                decimalScale={0}
                className="text-base" // Slightly larger text for mobile
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select
                value={newPaymentFrequency}
                onChange={(e) => setNewPaymentFrequency(e.target.value)}
                className="select select-loanviz w-full h-[42px]" // Increased height for better touch target
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
                <option value="one-time">One-time</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Month
              </label>
              <NumericInput
                value={newPaymentStartMonth}
                onChange={setNewPaymentStartMonth}
                min={1}
                max={loanDetails.termYears * 12}
                decimalScale={0}
                className="text-base" // Slightly larger text for mobile
              />
            </div>

            <div className="col-span-1 sm:col-span-2 md:col-span-1 flex items-end">
              <Button
                onClick={addExtraPayment}
                variant="primary"
                fullWidth
                icon={<FaPlus className="h-4 w-4" />}
                className="py-2.5" // Increased padding for better touch target
              >
                Add Payment
              </Button>
            </div>

            {comparisonResults && (
              <div className="col-span-1 sm:col-span-2 md:col-span-1 flex items-end">
                <Button
                  onClick={() => {
                    if (resultsRef.current) {
                      // Smooth scroll to results
                      resultsRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                  variant="secondary"
                  fullWidth
                  className="py-2.5" // Increased padding for better touch target
                >
                  View Results
                </Button>
              </div>
            )}
          </div>

          {/* Extra Payments List or Guide Message */}
          {extraPayments.length > 0 ? (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">
                  Extra Payments
                </h4>

                {comparisonResults && (
                  <button
                    onClick={() => {
                      if (resultsRef.current) {
                        // Smooth scroll to results
                        resultsRef.current.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                  >
                    <span>View Results</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Mobile-optimized table with responsive design */}
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Frequency</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Start Month</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {extraPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="font-medium">{currentLocale.currency}{payment.amount.toLocaleString()}</div>
                          {/* Mobile-only info */}
                          <div className="sm:hidden mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {payment.frequency.charAt(0).toUpperCase() + payment.frequency.slice(1)} •
                            Starting month {payment.startMonth}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                          {payment.frequency.charAt(0).toUpperCase() + payment.frequency.slice(1)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">Month {payment.startMonth}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <button
                            onClick={() => removeExtraPayment(payment.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 -m-2"
                            aria-label="Remove payment"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 dark:text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Add Extra Payments to See Results
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
                  Use the form above to add extra payments to your loan. Once added, you'll see how much time and interest you can save.
                </p>
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span>Try adding a monthly extra payment to start</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      {comparisonResults && (
        <div ref={resultsRef}>
          {/* Summary Card */}
          <Card className="mb-4">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Early Repayment Summary
                </h3>

                {/* Mobile-optimized Back to Top button */}
                <button
                  onClick={scrollToTop}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center p-2 -m-2"
                  aria-label="Scroll back to top"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="hidden sm:inline">Back to Top</span>
                </button>
              </div>

              {/* Mobile-optimized summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Time Saved */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-5">
                  <h4 className="text-md font-semibold mb-2 text-blue-700 dark:text-blue-300">
                    Time Saved
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {comparisonResults.saved.years > 0 && (
                      <span>{comparisonResults.saved.years} {comparisonResults.saved.years === 1 ? 'year' : 'years'}</span>
                    )}
                    {comparisonResults.saved.remainingMonths > 0 && (
                      <span> {comparisonResults.saved.years > 0 ? '&' : ''} {comparisonResults.saved.remainingMonths} {comparisonResults.saved.remainingMonths === 1 ? 'month' : 'months'}</span>
                    )}
                    {comparisonResults.saved.years === 0 && comparisonResults.saved.remainingMonths === 0 && (
                      <span>None</span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <span className="inline-block w-[85px] opacity-75">Original term:</span> {comparisonResults.originalTerm.years} years {comparisonResults.originalTerm.remainingMonths > 0 ? `& ${comparisonResults.originalTerm.remainingMonths} months` : ''}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <span className="inline-block w-[85px] opacity-75">New term:</span> {comparisonResults.modifiedTerm.years} years {comparisonResults.modifiedTerm.remainingMonths > 0 ? `& ${comparisonResults.modifiedTerm.remainingMonths} months` : ''}
                    </p>
                  </div>
                </div>

                {/* Interest Saved */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-5">
                  <h4 className="text-md font-semibold mb-2 text-green-700 dark:text-green-300">
                    Interest Saved
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">
                    {currentLocale.currency}{comparisonResults.interest.saved.toLocaleString()}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      <span className="inline-block w-[85px] opacity-75">Original:</span> {currentLocale.currency}{comparisonResults.interest.original.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      <span className="inline-block w-[85px] opacity-75">New:</span> {currentLocale.currency}{comparisonResults.interest.modified.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Return on Investment */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 sm:p-5 sm:col-span-2 md:col-span-1">
                  <h4 className="text-md font-semibold mb-2 text-purple-700 dark:text-purple-300">
                    Return on Investment
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {(comparisonResults.roi * 100).toFixed(2)}%
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      <span className="inline-block w-[85px] opacity-75">Extra paid:</span> {currentLocale.currency}{comparisonResults.extraPayments.toLocaleString()}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      For every {currentLocale.currency}1 paid early, you save {currentLocale.currency}{comparisonResults.roi.toFixed(2)} in interest
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Balance Comparison Chart */}
          {chartData && (
            <Card className="mb-4">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Balance Comparison
                  </h3>

                  {/* Mobile-optimized Back to Top button */}
                  <button
                    onClick={scrollToTop}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center p-2 -m-2"
                    aria-label="Scroll back to top"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="hidden sm:inline">Back to Top</span>
                  </button>
                </div>

                {/* Mobile-optimized chart container */}
                <div className="h-80 sm:h-96 p-2 sm:p-4 mb-4 sm:mb-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-inner relative overflow-hidden group">
                  {/* Add subtle animated background elements */}
                  <div className="absolute inset-0 overflow-hidden opacity-10 dark:opacity-20 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-blue-500/20 dark:bg-blue-500/30 blur-3xl"></div>
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-green-500/20 dark:bg-green-500/30 blur-3xl"></div>
                  </div>
                  {/* Mobile-optimized chart */}
                  <ChartWrapper
                    type="line"
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: {
                        duration: 1500,
                        easing: 'easeOutQuart'
                      },
                      interaction: {
                        mode: 'index',
                        intersect: false
                      },
                      scales: {
                        x: {
                          title: {
                            display: window.innerWidth > 640, // Hide title on small mobile screens
                            text: 'Month',
                            font: {
                              weight: 'bold',
                              size: window.innerWidth < 640 ? 10 : 12
                            },
                            padding: { top: 10 }
                          },
                          grid: {
                            color: 'rgba(200, 200, 200, 0.2)',
                            drawOnChartArea: window.innerWidth > 480, // Fewer grid lines on mobile
                            drawTicks: true
                          },
                          border: {
                            display: true,
                            color: 'rgba(200, 200, 200, 0.3)'
                          },
                          ticks: {
                            callback: function(value, index, values) {
                              // Show year markers instead of every month
                              // On mobile, show fewer year markers
                              if (window.innerWidth < 480) {
                                if (value % 60 === 0) { // Every 5 years on small screens
                                  return `Y${value / 12}`;
                                }
                                return '';
                              } else if (window.innerWidth < 768) {
                                if (value % 24 === 0) { // Every 2 years on medium screens
                                  return `Y${value / 12}`;
                                }
                                return '';
                              } else {
                                if (value % 12 === 0) { // Every year on larger screens
                                  return `Year ${value / 12}`;
                                }
                                return '';
                              }
                            },
                            font: {
                              size: window.innerWidth < 640 ? 9 : 11,
                              weight: 'bold'
                            },
                            maxRotation: 0,
                            minRotation: 0,
                            padding: window.innerWidth < 640 ? 8 : 15,
                            autoSkip: true,
                            autoSkipPadding: window.innerWidth < 640 ? 15 : 30,
                            align: 'center',
                            color: 'rgba(100, 116, 139, 0.8)'
                          },
                          afterFit: (axis) => {
                            // Add extra padding at the bottom to ensure labels fit
                            axis.paddingBottom = window.innerWidth < 640 ? 10 : 20;
                          }
                        },
                        y: {
                          title: {
                            display: window.innerWidth > 640, // Hide title on small mobile screens
                            text: `Balance (${currentLocale.currency})`,
                            font: {
                              weight: 'bold',
                              size: window.innerWidth < 640 ? 10 : 12
                            },
                            padding: { right: 10 }
                          },
                          grid: {
                            color: 'rgba(200, 200, 200, 0.2)',
                            drawOnChartArea: true,
                            drawTicks: true
                          },
                          border: {
                            display: true,
                            color: 'rgba(200, 200, 200, 0.3)'
                          },
                          ticks: {
                            callback: function(value) {
                              // Simplified labels on mobile
                              if (window.innerWidth < 480) {
                                if (currentLocale.locale === 'en-IN' && value >= 100000) {
                                  return `${(value / 100000).toFixed(0)}L`;
                                } else if (value >= 1000000) {
                                  return `${(value / 1000000).toFixed(0)}M`;
                                } else if (value >= 1000) {
                                  return `${(value / 1000).toFixed(0)}K`;
                                }
                                return value;
                              } else {
                                if (currentLocale.locale === 'en-IN' && value >= 100000) {
                                  return `${currentLocale.currency}${(value / 100000).toFixed(1)}L`;
                                } else if (value >= 1000000) {
                                  return `${currentLocale.currency}${(value / 1000000).toFixed(1)}M`;
                                } else if (value >= 1000) {
                                  return `${currentLocale.currency}${(value / 1000).toFixed(0)}K`;
                                }
                                return `${currentLocale.currency}${value}`;
                              }
                            },
                            font: {
                              size: window.innerWidth < 640 ? 9 : 11,
                              weight: 'bold'
                            },
                            padding: window.innerWidth < 640 ? 6 : 12,
                            color: 'rgba(100, 116, 139, 0.8)',
                            maxTicksLimit: window.innerWidth < 480 ? 5 : 8 // Fewer ticks on mobile
                          },
                          afterFit: (axis) => {
                            // Add extra padding to ensure labels fit
                            axis.paddingLeft = window.innerWidth < 640 ? 8 : 15;
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                          align: 'center',
                          labels: {
                            usePointStyle: true,
                            boxWidth: window.innerWidth < 640 ? 8 : 12,
                            padding: window.innerWidth < 640 ? 10 : 20,
                            font: {
                              family: "'Plus Jakarta Sans', sans-serif",
                              size: window.innerWidth < 640 ? 10 : 13,
                              weight: 'bold'
                            },
                            color: (context) => {
                              return context.chart.options.color;
                            },
                            filter: (item, chart) => {
                              // Add a bit of spacing between legend items
                              item.marginLeft = window.innerWidth < 640 ? 5 : 10;
                              return true;
                            }
                          },
                          onClick: (e, legendItem, legend) => {
                            // Add animation when toggling datasets
                            const index = legendItem.datasetIndex;
                            const ci = legend.chart;

                            if (ci.isDatasetVisible(index)) {
                              ci.hide(index);
                              legendItem.hidden = true;
                            } else {
                              ci.show(index);
                              legendItem.hidden = false;
                            }

                            // Add a subtle animation when toggling
                            ci.update('active');
                          }
                        },
                        tooltip: {
                          enabled: true,
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          titleFont: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: window.innerWidth < 640 ? 12 : 15,
                            weight: 'bold'
                          },
                          bodyFont: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: window.innerWidth < 640 ? 11 : 14
                          },
                          padding: window.innerWidth < 640 ? 10 : 14,
                          cornerRadius: 8,
                          boxPadding: window.innerWidth < 640 ? 4 : 8,
                          usePointStyle: true,
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          borderWidth: 1,
                          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                          animation: {
                            duration: 150,
                            easing: 'easeOutQuad'
                          },
                          // Optimize tooltip position for mobile
                          position: window.innerWidth < 640 ? 'nearest' : 'average',
                          // Increase touch radius for better mobile interaction
                          caretSize: window.innerWidth < 640 ? 6 : 5,
                          callbacks: {
                            label: function(context) {
                              const label = context.dataset.label || '';
                              const value = context.parsed.y;
                              // Simplified format for mobile
                              if (window.innerWidth < 480) {
                                return `${label}: ${value.toLocaleString()}`;
                              }
                              return `${label}: ${currentLocale.currency}${value.toLocaleString()}`;
                            },
                            title: function(tooltipItems) {
                              const monthValue = tooltipItems[0].parsed.x;
                              const years = Math.floor(monthValue / 12);
                              const months = monthValue % 12;
                              // Simplified format for mobile
                              if (window.innerWidth < 480) {
                                return `Y${years + 1}, M${months === 0 ? 12 : months}`;
                              }
                              return `Year ${years + 1}, Month ${months === 0 ? 12 : months}`;
                            },
                            labelTextColor: function(context) {
                              // Customize text color based on dataset
                              return context.datasetIndex === 0 ?
                                'rgba(147, 197, 253, 1)' : 'rgba(167, 243, 208, 1)';
                            }
                          }
                        },
                        // Add subtle grid background pattern
                        beforeDraw: (chart) => {
                          const ctx = chart.ctx;
                          const chartArea = chart.chartArea;

                          if (!chartArea) {
                            return;
                          }

                          // Draw enhanced grid pattern with gradient
                          ctx.save();

                          // Create gradient for grid lines
                          const gridGradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                          gridGradient.addColorStop(0, 'rgba(200, 200, 200, 0.08)');
                          gridGradient.addColorStop(1, 'rgba(200, 200, 200, 0.03)');

                          ctx.strokeStyle = gridGradient;
                          ctx.lineWidth = 0.7;

                          // Draw vertical lines with varying opacity
                          for (let i = 0; i < chartArea.width; i += 25) {
                            const opacity = 0.05 + (Math.sin(i * 0.05) * 0.03); // Subtle variation
                            ctx.globalAlpha = opacity;
                            ctx.beginPath();
                            ctx.moveTo(chartArea.left + i, chartArea.top);
                            ctx.lineTo(chartArea.left + i, chartArea.bottom);
                            ctx.stroke();
                          }

                          // Draw horizontal lines with varying opacity
                          for (let i = 0; i < chartArea.height; i += 25) {
                            const opacity = 0.05 + (Math.cos(i * 0.05) * 0.03); // Subtle variation
                            ctx.globalAlpha = opacity;
                            ctx.beginPath();
                            ctx.moveTo(chartArea.left, chartArea.top + i);
                            ctx.lineTo(chartArea.right, chartArea.top + i);
                            ctx.stroke();
                          }

                          // Add subtle dots at intersections
                          ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
                          for (let x = 0; x < chartArea.width; x += 50) {
                            for (let y = 0; y < chartArea.height; y += 50) {
                              ctx.beginPath();
                              ctx.arc(chartArea.left + x, chartArea.top + y, 1, 0, Math.PI * 2);
                              ctx.fill();
                            }
                          }

                          ctx.globalAlpha = 1;
                          ctx.restore();
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default EarlyRepaymentCalculator;
