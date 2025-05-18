import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLayerGroup, FaPlus, FaTrash, FaEdit, FaSave, FaChartBar } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import NumericInput from '../ui/NumericInput';
import RangeSlider from '../ui/RangeSlider';
import ChartWrapper from '../ui/ChartWrapper';
import AnimatedNumber from '../ui/AnimatedNumber';
import useLoanCalculations from '../../hooks/useLoanCalculations';
import { useLocale } from '../../contexts/LocaleContext';

/**
 * ScenariosCalculator component for comparing different loan scenarios
 * @param {Object} props - Component props
 * @param {string} props.loanTypeId - Type of loan (e.g., 'mortgage', 'personal', 'auto')
 * @param {Object} props.initialScenario - Initial scenario values
 * @param {Object} props.ranges - Min/max ranges for inputs
 * @returns {JSX.Element} Scenarios calculator component
 */
const ScenariosCalculator = ({
  loanTypeId = 'mortgage',
  initialScenario = {
    name: 'Scenario 1',
    principal: 200000,
    rate: 3.5,
    termYears: 25,
    type: 'repayment',
    extraPayment: 0
  },
  ranges = {
    principal: { min: 10000, max: 1000000, step: 1000 },
    rate: { min: 0.1, max: 15, step: 0.1 },
    termYears: { min: 5, max: 35, step: 1 },
    extraPayment: { min: 0, max: 2000, step: 10 }
  }
}) => {
  // Get locale information
  const { currentLocale } = useLocale();

  const [scenarios, setScenarios] = useState([]);
  const [editingScenario, setEditingScenario] = useState(null);
  const [scenarioResults, setScenarioResults] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [activeChart, setActiveChart] = useState('monthly');
  const [storageKey] = useState(`loanviz-${loanTypeId}-scenarios-advanced`);
  const chartRef = useRef(null);

  // Use the loan calculations hook
  const { calculateLoan, isCalculating } = useLoanCalculations(loanTypeId);

  // Load saved scenarios from localStorage on component mount
  useEffect(() => {
    const savedScenarios = localStorage.getItem(storageKey);
    if (savedScenarios) {
      try {
        const parsedScenarios = JSON.parse(savedScenarios);
        if (parsedScenarios.length > 0) {
          setScenarios(parsedScenarios);
        } else {
          // If saved scenarios array is empty, initialize with one scenario
          setScenarios([{ ...initialScenario, id: generateId() }]);
        }
      } catch (error) {
        console.error('Error loading saved scenarios:', error);
        // Initialize with one scenario on error
        setScenarios([{ ...initialScenario, id: generateId() }]);
      }
    } else {
      // Initialize with one scenario by default
      setScenarios([{ ...initialScenario, id: generateId() }]);
    }
  }, [storageKey, initialScenario]);

  // Calculate results when scenarios change
  useEffect(() => {
    const calculateScenarios = async () => {
      const results = await Promise.all(
        scenarios.map(async (scenario) => {
          try {
            const result = await calculateLoan({
              principal: scenario.principal,
              rate: scenario.rate,
              termYears: scenario.termYears,
              type: scenario.type
            });

            // Calculate early payoff if extra payment is specified
            let earlyPayoffMonths = 0;
            let interestSaved = 0;

            if (scenario.extraPayment > 0) {
              const regularSchedule = result.amortizationSchedule || [];
              const modifiedSchedule = calculateModifiedSchedule(
                regularSchedule,
                scenario.extraPayment
              );

              earlyPayoffMonths = regularSchedule.length - modifiedSchedule.length;

              const regularInterest = regularSchedule.reduce(
                (sum, payment) => sum + payment.interestPayment, 0
              );

              const modifiedInterest = modifiedSchedule.reduce(
                (sum, payment) => sum + payment.interestPayment, 0
              );

              interestSaved = regularInterest - modifiedInterest;
            }

            return {
              id: scenario.id,
              name: scenario.name,
              ...result,
              extraPayment: scenario.extraPayment,
              earlyPayoffMonths,
              interestSaved
            };
          } catch (error) {
            console.error(`Error calculating scenario ${scenario.name}:`, error);
            return {
              id: scenario.id,
              name: scenario.name,
              error: error.message
            };
          }
        })
      );
      setScenarioResults(results);
    };

    if (scenarios.length > 0) {
      calculateScenarios();
    }
  }, [scenarios, calculateLoan]);

  // Update chart data when scenario results change
  useEffect(() => {
    // Only prepare chart data if we have at least 2 scenarios
    if (scenarioResults.length >= 2) {
      prepareChartData();
    }
  }, [scenarioResults, activeChart]);

  // Save scenarios to localStorage when they change
  useEffect(() => {
    if (scenarios.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(scenarios));
    }
  }, [scenarios, storageKey]);

  // Generate a unique ID for new scenarios
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Add a new scenario
  const addScenario = () => {
    const newScenario = {
      ...initialScenario,
      id: generateId(),
      name: `Scenario ${scenarios.length + 1}`
    };
    setScenarios([...scenarios, newScenario]);
    setEditingScenario(newScenario);
  };

  // Delete a scenario
  const deleteScenario = (id) => {
    setScenarios(scenarios.filter(scenario => scenario.id !== id));
    if (editingScenario && editingScenario.id === id) {
      setEditingScenario(null);
    }
  };

  // Start editing a scenario
  const editScenario = (scenario) => {
    setEditingScenario({ ...scenario });
  };

  // Update the editing scenario
  const updateEditingScenario = (field, value) => {
    setEditingScenario(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save the editing scenario
  const saveScenario = () => {
    setScenarios(scenarios.map(scenario =>
      scenario.id === editingScenario.id ? editingScenario : scenario
    ));
    setEditingScenario(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingScenario(null);
  };

  // Calculate modified schedule with extra payments
  const calculateModifiedSchedule = (originalSchedule, extraPayment) => {
    if (!originalSchedule || originalSchedule.length === 0 || extraPayment <= 0) {
      return originalSchedule;
    }

    // Clone the original schedule
    const modifiedSchedule = JSON.parse(JSON.stringify(originalSchedule));

    // Apply extra payments to each month
    let lastPaymentMonth = modifiedSchedule.length;

    for (let i = 0; i < modifiedSchedule.length; i++) {
      const payment = modifiedSchedule[i];
      const extraAmount = Math.min(extraPayment, payment.balance);

      // Apply extra payment to principal
      payment.principalPayment += extraAmount;
      payment.balance -= extraAmount;

      // Update remaining payments
      if (payment.balance <= 0) {
        payment.balance = 0;
        lastPaymentMonth = Math.min(lastPaymentMonth, i + 1);
        break;
      } else {
        // Recalculate future payments
        for (let j = i + 1; j < modifiedSchedule.length; j++) {
          const futurePayment = modifiedSchedule[j];
          const monthlyRate = originalSchedule[0].interestPayment / originalSchedule[0].balance;

          // Calculate interest based on new balance
          const prevBalance = modifiedSchedule[j - 1].balance;
          const interest = prevBalance * monthlyRate;

          futurePayment.interestPayment = interest;
          futurePayment.principalPayment = futurePayment.payment - interest;
          futurePayment.balance = Math.max(0, prevBalance - futurePayment.principalPayment);

          if (futurePayment.balance <= 0) {
            futurePayment.balance = 0;
            lastPaymentMonth = Math.min(lastPaymentMonth, j + 1);
            break;
          }
        }
      }
    }

    // Truncate schedule at last payment
    if (lastPaymentMonth < modifiedSchedule.length) {
      modifiedSchedule.length = lastPaymentMonth;
    }

    return modifiedSchedule;
  };

  // Prepare chart data with improved styling and visualization
  const prepareChartData = () => {
    const labels = scenarioResults.map(result => result.name);

    // Prepare datasets based on active chart type
    let datasets = [];

    switch (activeChart) {
      case 'monthly':
        datasets = [{
          label: 'Monthly Payment',
          data: scenarioResults.map(result => result.monthlyPayment || 0),
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
        }];
        break;
      case 'interest':
        datasets = [{
          label: 'Total Interest',
          data: scenarioResults.map(result => result.totalInterest || 0),
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(99, 102, 241, 0.8)';
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.5)');
            return gradient;
          },
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(99, 102, 241, 0.9)',
          hoverBorderColor: 'rgba(99, 102, 241, 1)',
          hoverBorderWidth: 2
        }];
        break;
      case 'total':
        datasets = [{
          label: 'Total Repayment',
          data: scenarioResults.map(result => result.totalRepayment || 0),
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(16, 185, 129, 0.8)';
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.5)');
            return gradient;
          },
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(16, 185, 129, 0.9)',
          hoverBorderColor: 'rgba(16, 185, 129, 1)',
          hoverBorderWidth: 2
        }];
        break;
      case 'savings':
        datasets = [{
          label: 'Interest Saved',
          data: scenarioResults.map(result => result.interestSaved || 0),
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(249, 115, 22, 0.8)';
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(249, 115, 22, 0.8)');
            gradient.addColorStop(1, 'rgba(249, 115, 22, 0.5)');
            return gradient;
          },
          borderColor: 'rgba(249, 115, 22, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(249, 115, 22, 0.9)',
          hoverBorderColor: 'rgba(249, 115, 22, 1)',
          hoverBorderWidth: 2
        }];
        break;
      case 'time':
        datasets = [{
          label: 'Months Saved',
          data: scenarioResults.map(result => result.earlyPayoffMonths || 0),
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(139, 92, 246, 0.8)';
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0.5)');
            return gradient;
          },
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(139, 92, 246, 0.9)',
          hoverBorderColor: 'rgba(139, 92, 246, 1)',
          hoverBorderWidth: 2
        }];
        break;
      default:
        break;
    }

    setChartData({
      labels,
      datasets
    });

    // Scroll to chart after a short delay to allow for rendering
    // Only auto-scroll if we have at least 2 scenarios
    if (scenarios.length >= 2) {
      setTimeout(() => {
        if (chartRef.current) {
          chartRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 300);
    }
  };

  return (
    <div className="scenarios-calculator">
      {/* Scenarios List */}
      <Card className="mb-4">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Loan Scenarios
            </h2>

            <Button
              variant="primary"
              size="sm"
              onClick={addScenario}
              disabled={isCalculating}
              icon={<FaPlus className="h-4 w-4" />}
              className="w-full sm:w-auto"
              fullWidth={true}
            >
              Add Scenario
            </Button>
          </div>

          <div>
            {/* Desktop and Tablet View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rate</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Term</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Extra</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monthly</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Interest</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {scenarios.map((scenario) => {
                    const result = scenarioResults.find(r => r.id === scenario.id) || {};
                    return (
                      <tr key={scenario.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{scenario.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{currentLocale.currency}{scenario.principal.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{scenario.rate}%</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{scenario.termYears} years</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {scenario.extraPayment > 0 ? `${currentLocale.currency}${scenario.extraPayment}/mo` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">
                          {result.monthlyPayment ? `${currentLocale.currency}${result.monthlyPayment.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400">
                          {result.totalInterest ? `${currentLocale.currency}${result.totalInterest.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editScenario(scenario)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              aria-label={`Edit ${scenario.name}`}
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => deleteScenario(scenario.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              aria-label={`Delete ${scenario.name}`}
                              disabled={scenarios.length <= 1}
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden space-y-4">
              {scenarios.map((scenario) => {
                const result = scenarioResults.find(r => r.id === scenario.id) || {};
                return (
                  <div key={scenario.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">{scenario.name}</h4>
                      <div className="flex space-x-3 -mr-2">
                        <button
                          onClick={() => editScenario(scenario)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          aria-label={`Edit ${scenario.name}`}
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteScenario(scenario.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          aria-label={`Delete ${scenario.name}`}
                          disabled={scenarios.length <= 1}
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-500 dark:text-gray-400">Amount</span>
                        <span className="font-medium text-gray-900 dark:text-white">{currentLocale.currency}{scenario.principal.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 dark:text-gray-400">Rate</span>
                        <span className="font-medium text-gray-900 dark:text-white">{scenario.rate}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 dark:text-gray-400">Term</span>
                        <span className="font-medium text-gray-900 dark:text-white">{scenario.termYears} years</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 dark:text-gray-400">Extra Payment</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {scenario.extraPayment > 0 ? `${currentLocale.currency}${scenario.extraPayment}/mo` : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Monthly Payment</span>
                        {result.monthlyPayment ? (
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {currentLocale.currency}{result.monthlyPayment.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">Calculating...</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Total Interest</span>
                        {result.totalInterest ? (
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {currentLocale.currency}{result.totalInterest.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">Calculating...</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
      {/* Comparison Charts - only show when there are at least 2 scenarios */}
      {chartData && scenarios.length >= 2 ? (
        <>
          {/* Chart Controls */}
          <Card className="mb-4" ref={chartRef}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Scenario Comparison
                </h3>

                {/* Desktop/Tablet Chart Controls */}
                <div className="hidden sm:flex space-x-2">
                  <Button
                    variant={activeChart === 'monthly' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveChart('monthly')}
                  >
                    Monthly Payment
                  </Button>
                  <Button
                    variant={activeChart === 'interest' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveChart('interest')}
                  >
                    Total Interest
                  </Button>
                  <Button
                    variant={activeChart === 'total' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveChart('total')}
                  >
                    Total Cost
                  </Button>
                  {scenarioResults.some(result => result.extraPayment > 0) && (
                    <>
                      <Button
                        variant={activeChart === 'savings' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveChart('savings')}
                      >
                        Interest Saved
                      </Button>
                      <Button
                        variant={activeChart === 'time' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveChart('time')}
                      >
                        Time Saved
                      </Button>
                    </>
                  )}
                </div>

                {/* Mobile Chart Controls */}
                <div className="sm:hidden">
                  <select
                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                    value={activeChart}
                    onChange={(e) => setActiveChart(e.target.value)}
                    aria-label="Select chart type"
                  >
                    <option value="monthly">Monthly Payment</option>
                    <option value="interest">Total Interest</option>
                    <option value="total">Total Cost</option>
                    {scenarioResults.some(result => result.extraPayment > 0) && (
                      <>
                        <option value="savings">Interest Saved</option>
                        <option value="time">Time Saved</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="h-60 sm:h-80">
                <ChartWrapper
                  type="bar"
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                      padding: {
                        left: window.innerWidth < 640 ? 10 : 20,
                        right: window.innerWidth < 640 ? 20 : 40,
                        top: window.innerWidth < 640 ? 10 : 20,
                        bottom: window.innerWidth < 640 ? 20 : 40
                      }
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: activeChart === 'time' ? 'Months' : 'Amount (£)',
                          font: {
                            weight: 'bold',
                            size: window.innerWidth < 640 ? 10 : 12
                          },
                          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#4b5563',
                          padding: { bottom: 10 }
                        },
                        ticks: {
                          callback: function(value) {
                            if (activeChart === 'time') {
                              return value;
                            }

                            if (currentLocale.locale === 'en-IN' && value >= 100000) {
                              return currentLocale.currency + (value / 100000).toFixed(1) + 'L';
                            } else if (value >= 1000000) {
                              return currentLocale.currency + (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                              return currentLocale.currency + (value / 1000).toFixed(0) + 'K';
                            }
                            return currentLocale.currency + value.toLocaleString();
                          },
                          font: {
                            size: window.innerWidth < 640 ? 9 : 11
                          },
                          maxRotation: 0,
                          padding: 10
                        },
                        beginAtZero: true
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          font: {
                            weight: 'bold',
                            size: window.innerWidth < 640 ? 9 : 11
                          },
                          padding: window.innerWidth < 640 ? 8 : 15,
                          maxRotation: 0,
                          autoSkip: true,
                          autoSkipPadding: 15
                        },
                        offset: true,
                        border: {
                          display: false
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        titleFont: {
                          family: "'Plus Jakarta Sans', sans-serif",
                          size: window.innerWidth < 640 ? 12 : 14,
                          weight: 'bold',
                        },
                        bodyFont: {
                          family: "'Plus Jakarta Sans', sans-serif",
                          size: window.innerWidth < 640 ? 11 : 13,
                        },
                        padding: window.innerWidth < 640 ? 8 : 12,
                        cornerRadius: 8,
                        boxPadding: window.innerWidth < 640 ? 3 : 5,
                        usePointStyle: true,
                        callbacks: {
                          label: function(context) {
                            const value = context.parsed.y;

                            if (activeChart === 'time') {
                              const years = Math.floor(value / 12);
                              const months = value % 12;
                              return `Time Saved: ${years > 0 ? `${years} years ` : ''}${months > 0 ? `${months} months` : ''}`;
                            }

                            return `${context.dataset.label}: ${currentLocale.currency}${value.toLocaleString()}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Detailed Comparison Table */}
          <Card className="mb-4">
            <div className="p-4">
              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                Detailed Comparison
              </h3>

              {/* Desktop/Tablet View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Scenario</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monthly Payment</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Interest</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Cost</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Loan Term</th>
                      {scenarioResults.some(result => result.extraPayment > 0) && (
                        <>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Interest Saved</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time Saved</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {scenarioResults.map((result) => {
                      const earlyPayoffYears = Math.floor(result.earlyPayoffMonths / 12);
                      const earlyPayoffRemainingMonths = result.earlyPayoffMonths % 12;

                      return (
                        <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{result.name}</td>
                          <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">
                            {currentLocale.currency}{result.monthlyPayment ? result.monthlyPayment.toFixed(2) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400">
                            {currentLocale.currency}{result.totalInterest ? result.totalInterest.toLocaleString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                            {currentLocale.currency}{result.totalRepayment ? result.totalRepayment.toLocaleString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {result.termYears} years
                            {result.extraPayment > 0 && result.earlyPayoffMonths > 0 && (
                              <span className="text-green-600 dark:text-green-400 ml-2">
                                (-{earlyPayoffYears > 0 ? `${earlyPayoffYears}y ` : ''}
                                {earlyPayoffRemainingMonths > 0 ? `${earlyPayoffRemainingMonths}m` : ''})
                              </span>
                            )}
                          </td>
                          {scenarioResults.some(result => result.extraPayment > 0) && (
                            <>
                              <td className="px-4 py-3 text-sm text-orange-600 dark:text-orange-400">
                                {result.interestSaved ? `${currentLocale.currency}${result.interestSaved.toLocaleString()}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-purple-600 dark:text-purple-400">
                                {result.earlyPayoffMonths > 0 ? (
                                  <>
                                    {earlyPayoffYears > 0 ? `${earlyPayoffYears} years ` : ''}
                                    {earlyPayoffRemainingMonths > 0 ? `${earlyPayoffRemainingMonths} months` : ''}
                                  </>
                                ) : '-'}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="sm:hidden space-y-4">
                {scenarioResults.map((result) => {
                  const earlyPayoffYears = Math.floor(result.earlyPayoffMonths / 12);
                  const earlyPayoffRemainingMonths = result.earlyPayoffMonths % 12;
                  const hasExtraPayments = scenarioResults.some(r => r.extraPayment > 0);

                  return (
                    <div key={result.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">{result.name}</h4>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Monthly Payment</span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {currentLocale.currency}{result.monthlyPayment ? result.monthlyPayment.toFixed(2) : '-'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Total Interest</span>
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {currentLocale.currency}{result.totalInterest ? result.totalInterest.toLocaleString() : '-'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Total Cost</span>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {currentLocale.currency}{result.totalRepayment ? result.totalRepayment.toLocaleString() : '-'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Loan Term</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {result.termYears} years
                            {result.extraPayment > 0 && result.earlyPayoffMonths > 0 && (
                              <span className="text-green-600 dark:text-green-400 ml-2">
                                (-{earlyPayoffYears > 0 ? `${earlyPayoffYears}y ` : ''}
                                {earlyPayoffRemainingMonths > 0 ? `${earlyPayoffRemainingMonths}m` : ''})
                              </span>
                            )}
                          </span>
                        </div>

                        {hasExtraPayments && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Interest Saved</span>
                              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                {result.interestSaved ? `${currentLocale.currency}${result.interestSaved.toLocaleString()}` : '-'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Time Saved</span>
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                {result.earlyPayoffMonths > 0 ? (
                                  <>
                                    {earlyPayoffYears > 0 ? `${earlyPayoffYears} years ` : ''}
                                    {earlyPayoffRemainingMonths > 0 ? `${earlyPayoffRemainingMonths} months` : ''}
                                  </>
                                ) : '-'}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card className="mb-4 p-4">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-center mb-4">
              <FaLayerGroup className="h-12 w-12 mx-auto mb-4 text-blue-500 opacity-70" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                {scenarios.length === 0 ? "Add Scenarios to Compare" : "Add One More Scenario"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {scenarios.length === 0
                  ? "You need to add scenarios to generate comparison charts. Add scenarios with different loan amounts, interest rates, terms, and extra payments to find the best option for you."
                  : "You need at least 2 scenarios to generate comparison charts. Add another scenario with different parameters to compare options."}
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={addScenario}
              disabled={isCalculating}
              icon={<FaPlus className="h-4 w-4" />}
              className="w-full sm:w-auto"
              fullWidth={true}
            >
              Add {scenarios.length === 0 ? "Scenario" : "Another Scenario"}
            </Button>
          </div>
        </Card>
      )}

      {/* Edit Scenario Modal */}
      <AnimatePresence>
        {editingScenario && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-4 sm:p-6 flex-none">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {editingScenario.id ? 'Edit Scenario' : 'Add Scenario'}
                  </h3>
                  <button
                    onClick={cancelEditing}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 sm:hidden"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="px-4 sm:px-6 overflow-y-auto flex-grow">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Scenario Name
                    </label>
                    <input
                      type="text"
                      value={editingScenario.name}
                      onChange={(e) => updateEditingScenario('name', e.target.value)}
                      className="input input-loanviz w-full text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loan Amount
                    </label>
                    <NumericInput
                      value={editingScenario.principal}
                      onChange={(value) => updateEditingScenario('principal', value)}
                      min={ranges.principal.min}
                      max={ranges.principal.max}
                      step={ranges.principal.step}
                      prefix={currentLocale.currency}
                      thousandSeparator={true}
                      decimalScale={0}
                    />
                    <RangeSlider
                      min={ranges.principal.min}
                      max={ranges.principal.max}
                      step={ranges.principal.step}
                      value={editingScenario.principal}
                      onChange={(value) => updateEditingScenario('principal', value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interest Rate
                    </label>
                    <NumericInput
                      value={editingScenario.rate}
                      onChange={(value) => updateEditingScenario('rate', value)}
                      min={ranges.rate.min}
                      max={ranges.rate.max}
                      step={ranges.rate.step}
                      suffix="%"
                      decimalScale={2}
                    />
                    <RangeSlider
                      min={ranges.rate.min}
                      max={ranges.rate.max}
                      step={ranges.rate.step}
                      value={editingScenario.rate}
                      onChange={(value) => updateEditingScenario('rate', value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loan Term
                    </label>
                    <NumericInput
                      value={editingScenario.termYears}
                      onChange={(value) => updateEditingScenario('termYears', value)}
                      min={ranges.termYears.min}
                      max={ranges.termYears.max}
                      step={ranges.termYears.step}
                      suffix=" years"
                      decimalScale={0}
                    />
                    <RangeSlider
                      min={ranges.termYears.min}
                      max={ranges.termYears.max}
                      step={ranges.termYears.step}
                      value={editingScenario.termYears}
                      onChange={(value) => updateEditingScenario('termYears', value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Repayment Type
                    </label>
                    <select
                      value={editingScenario.type}
                      onChange={(e) => updateEditingScenario('type', e.target.value)}
                      className="select select-loanviz w-full"
                    >
                      <option value="repayment">Repayment</option>
                      <option value="interest-only">Interest Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monthly Extra Payment
                    </label>
                    <NumericInput
                      value={editingScenario.extraPayment || 0}
                      onChange={(value) => updateEditingScenario('extraPayment', value)}
                      min={ranges.extraPayment.min}
                      max={ranges.extraPayment.max}
                      step={ranges.extraPayment.step}
                      prefix={currentLocale.currency}
                      thousandSeparator={true}
                      decimalScale={0}
                    />
                    <RangeSlider
                      min={ranges.extraPayment.min}
                      max={ranges.extraPayment.max}
                      step={ranges.extraPayment.step}
                      value={editingScenario.extraPayment || 0}
                      onChange={(value) => updateEditingScenario('extraPayment', value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-none">
                <div className="flex justify-between sm:justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={cancelEditing}
                    className="text-white dark:text-white hidden sm:flex"
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="primary"
                    onClick={saveScenario}
                    icon={<FaSave className="h-4 w-4" />}
                    className="flex-1 sm:flex-initial"
                  >
                    Save Scenario
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScenariosCalculator;
