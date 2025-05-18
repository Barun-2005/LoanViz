import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaSave, FaBalanceScale, FaChartBar } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import NumericInput from '../ui/NumericInput';
import RangeSlider from '../ui/RangeSlider';
import ChartWrapper from '../ui/ChartWrapper';
import AnimatedNumber from '../ui/AnimatedNumber';
import useLoanCalculations from '../../hooks/useLoanCalculations';
import { useLocale } from '../../contexts/LocaleContext';

/**
 * LoanComparison component for comparing multiple loan scenarios
 * @param {Object} props - Component props
 * @param {string} props.loanTypeId - Type of loan (e.g., 'mortgage', 'personal', 'auto')
 * @param {Object} props.initialScenario - Initial scenario values
 * @param {Object} props.ranges - Min/max ranges for inputs
 * @returns {JSX.Element} Loan comparison component
 */
const LoanComparison = ({
  loanTypeId = 'mortgage',
  initialScenario = {
    name: 'Scenario 1',
    principal: 200000,
    rate: 3.5,
    termYears: 25,
    type: 'repayment',
  },
  ranges = {
    principal: { min: 10000, max: 1000000, step: 1000 },
    rate: { min: 0.1, max: 15, step: 0.1 },
    termYears: { min: 5, max: 35, step: 1 },
  },
}) => {
  // Get locale information
  const { currentLocale } = useLocale();

  const [scenarios, setScenarios] = useState([]);
  const [editingScenario, setEditingScenario] = useState(null);
  const [scenarioResults, setScenarioResults] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [storageKey] = useState(`loanviz-${loanTypeId}-scenarios`);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const chartRef = useRef(null);

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
    const isMobile = windowWidth < 640;
    const wasMobile = chartRef.current?.isMobile;

    if (chartRef.current && isMobile !== wasMobile) {
      // Store current mobile state
      chartRef.current.isMobile = isMobile;

      // If we have chart data, force a re-render by making a shallow copy
      if (chartData) {
        setChartData({...chartData});
      }
    }
  }, [windowWidth, chartData]);

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
          // If saved scenarios array is empty, don't initialize with any scenarios
          setScenarios([]);
        }
      } catch (error) {
        console.error('Error loading saved scenarios:', error);
        // Don't initialize with any scenarios on error
        setScenarios([]);
      }
    } else {
      // Don't initialize with any scenarios by default
      setScenarios([]);
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
              type: scenario.type,
            });
            return {
              id: scenario.id,
              name: scenario.name,
              ...result,
            };
          } catch (error) {
            console.error(`Error calculating scenario ${scenario.name}:`, error);
            return {
              id: scenario.id,
              name: scenario.name,
              error: error.message,
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
    if (scenarioResults.length > 0) {
      prepareChartData();
    }
  }, [scenarioResults]);

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
      name: `Scenario ${scenarios.length + 1}`,
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

  // Prepare chart data with improved styling and visualization
  const prepareChartData = () => {
    const labels = scenarioResults.map(result => result.name);
    const monthlyPayments = scenarioResults.map(result => result.monthlyPayment || 0);
    const totalInterests = scenarioResults.map(result => result.totalInterest || 0);
    const totalRepayments = scenarioResults.map(result => result.totalRepayment || 0);
    const principals = scenarioResults.map(result => result.principal || 0);

    // Generate gradient colors for better visual appeal
    const getGradient = (ctx, color1, color2) => {
      if (!ctx) return color1;
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      return gradient;
    };

    // Create a grouped bar chart with separate sections for each metric
    setChartData({
      labels,
      datasets: [
        // Monthly Payment - use a separate dataset for monthly payments
        {
          label: 'Monthly Payment',
          data: monthlyPayments,
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(59, 130, 246, 0.8)';
            return getGradient(ctx, 'rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.5)');
          },
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
          hoverBorderColor: 'rgba(59, 130, 246, 1)',
          hoverBorderWidth: 2,
          // Store principals for tooltip
          principals: principals,
          // This will be used in a separate chart
          hidden: true,
        },
        // Total Interest
        {
          label: 'Total Interest',
          data: totalInterests,
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(99, 102, 241, 0.8)';
            return getGradient(ctx, 'rgba(99, 102, 241, 0.8)', 'rgba(99, 102, 241, 0.5)');
          },
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(99, 102, 241, 0.9)',
          hoverBorderColor: 'rgba(99, 102, 241, 1)',
          hoverBorderWidth: 2,
          barPercentage: 0.8,
          categoryPercentage: 0.7,
        },
        // Total Repayment
        {
          label: 'Total Repayment',
          data: totalRepayments,
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(16, 185, 129, 0.8)';
            return getGradient(ctx, 'rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.5)');
          },
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(16, 185, 129, 0.9)',
          hoverBorderColor: 'rgba(16, 185, 129, 1)',
          hoverBorderWidth: 2,
          barPercentage: 0.8,
          categoryPercentage: 0.7,
        }
      ]
    });

    // Scroll to chart after a short delay to allow for rendering
    setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return (
    <div className="loan-comparison">
      {/* Scenarios List */}
      <Card className="mb-4">
        <div className="p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
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
            >
              Add Scenario
            </Button>
          </div>

          {/* Mobile Card View (visible on small screens) */}
          <div className="block sm:hidden">
            {scenarios.map((scenario) => {
              const result = scenarioResults.find(r => r.id === scenario.id) || {};
              return (
                <div
                  key={scenario.id}
                  className="mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{scenario.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editScenario(scenario)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                        aria-label={`Edit ${scenario.name}`}
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => deleteScenario(scenario.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                        aria-label={`Delete ${scenario.name}`}
                        disabled={scenarios.length <= 1}
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{currentLocale.currency}{scenario.principal.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Rate:</span>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{scenario.rate}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Term:</span>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{scenario.termYears} years</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Monthly:</span>
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        {result.monthlyPayment ? `${currentLocale.currency}${result.monthlyPayment.toFixed(2)}` : '-'}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Total Interest:</span>
                      <div className="font-medium text-indigo-600 dark:text-indigo-400">
                        {result.totalInterest ? `${currentLocale.currency}${result.totalInterest.toLocaleString()}` : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (visible on medium screens and up) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rate</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Term</th>
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
        </div>
      </Card>

      {/* Comparison Charts - only show when there are at least 2 scenarios */}
      {chartData && scenarios.length >= 2 ? (
        <>
          {/* Total Costs Chart */}
          <Card className="mb-4 overflow-hidden" ref={chartRef}>
            <div className="p-2 sm:p-4 pb-4 sm:pb-8">
              <h3 className="text-lg font-bold mb-2 sm:mb-4 text-gray-800 dark:text-white">
                Total Costs Comparison
              </h3>

              <div className="h-70 sm:h-80 w-full relative p-1 sm:p-4">
                <ChartWrapper
                  type="bar"
                  data={{
                    ...chartData,
                    // Ensure we don't have duplicate labels
                    labels: [...new Set(chartData.labels)],
                  }}
                  options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: {
                    padding: {
                      left: window.innerWidth < 640 ? 10 : 20,
                      right: window.innerWidth < 640 ? 15 : 40,
                      top: window.innerWidth < 640 ? 30 : 20,
                      bottom: window.innerWidth < 640 ? 15 : 40
                    }
                  },
                  animation: {
                    duration: 1500,
                    easing: 'easeOutQuart',
                    delay: (context) => {
                      // Delay each bar's animation based on its dataset and index
                      return context.datasetIndex * 100 + context.dataIndex * 50;
                    },
                    // Add a growing animation for bars
                    onProgress: function(animation) {
                      const chart = animation.chart;
                      const ctx = chart.ctx;

                      // Add subtle glow effect during animation
                      if (animation.currentStep < animation.numSteps) {
                        chart.data.datasets.forEach((dataset, i) => {
                          const meta = chart.getDatasetMeta(i);
                          if (!meta.hidden) {
                            meta.data.forEach((bar, index) => {
                              const glowColor = dataset.borderColor;
                              ctx.save();
                              ctx.shadowColor = glowColor;
                              ctx.shadowBlur = 10 * (animation.currentStep / animation.numSteps);
                              ctx.shadowOffsetX = 0;
                              ctx.shadowOffsetY = 0;
                              ctx.restore();
                            });
                          }
                        });
                      }
                    }
                  },
                  scales: {
                    y: {
                      title: {
                        display: window.innerWidth >= 640, // Only show title on larger screens
                        text: `Amount (${currentLocale.currency})`,
                        font: {
                          weight: 'bold',
                          size: window.innerWidth < 640 ? 10 : 12
                        },
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#4b5563',
                        padding: { bottom: window.innerWidth < 640 ? 5 : 10 }
                      },
                      grid: {
                        color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderDash: [2, 4]
                      },
                      ticks: {
                        callback: function(value) {
                          if (value >= 1000000) {
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
                        padding: window.innerWidth < 640 ? 5 : 10,
                        maxTicksLimit: window.innerWidth < 640 ? 4 : 8,
                        count: window.innerWidth < 640 ? 4 : undefined
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
                        padding: window.innerWidth < 640 ? 5 : 15,
                        maxRotation: window.innerWidth < 640 ? 0 : 0,
                        minRotation: 0,
                        autoSkip: true,
                        autoSkipPadding: window.innerWidth < 640 ? 20 : 15
                      },
                      offset: true,
                      border: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: window.innerWidth < 640 ? 'bottom' : 'top',
                      align: 'start',
                      labels: {
                        boxWidth: window.innerWidth < 640 ? 8 : 15,
                        padding: window.innerWidth < 640 ? 10 : 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                          size: window.innerWidth < 640 ? 9 : 12
                        }
                      },
                      maxHeight: window.innerWidth < 640 ? 50 : 40,
                      onClick: null // Disable legend click to prevent toggling datasets
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
                        title: function(tooltipItems) {
                          return tooltipItems[0].label;
                        },
                        label: function(context) {
                          const datasetIndex = context.datasetIndex;
                          const dataIndex = context.dataIndex;
                          const value = context.parsed.y;

                          // For all datasets
                          let label = context.dataset.label || '';
                          if (label) {
                            label = label + ': ';
                          }

                          if (value !== null) {
                            label += currentLocale.currency + value.toLocaleString();
                          }

                          return label;
                        },
                        // Add footer with additional information
                        footer: function(tooltipItems) {
                          const dataIndex = tooltipItems[0].dataIndex;
                          const principal = chartData.datasets[0].principals[dataIndex];

                          if (principal) {
                            return [`Principal: ${currentLocale.currency}${principal.toLocaleString()}`];
                          }
                          return [];
                        },
                        labelTextColor: function(context) {
                          const colors = ['#3b82f6', '#6366f1', '#10b981'];
                          return colors[context.datasetIndex % colors.length];
                        }
                      }
                    }
                  },
                  // Hover effects
                  onHover: (event, chartElements) => {
                    if (chartElements && chartElements.length) {
                      // Add glow effect on hover
                      const chart = chartElements[0].chart;
                      const ctx = chart.ctx;
                      const index = chartElements[0].index;
                      const datasetIndex = chartElements[0].datasetIndex;

                      // Get the bar element
                      const meta = chart.getDatasetMeta(datasetIndex);
                      const bar = meta.data[index];

                      // Add glow effect
                      ctx.save();
                      ctx.shadowColor = chart.data.datasets[datasetIndex].borderColor;
                      ctx.shadowBlur = 15;
                      ctx.shadowOffsetX = 0;
                      ctx.shadowOffsetY = 0;
                      ctx.restore();
                    }
                  },
                  // Improve bar appearance
                  barPercentage: window.innerWidth < 640 ? 0.7 : 0.8,
                  categoryPercentage: window.innerWidth < 640 ? 0.6 : 0.7,
                  // Limit the number of bars shown at once on mobile
                  maxBarThickness: window.innerWidth < 640 ? 30 : 50
                }}
              />
            </div>
          </div>
        </Card>

        {/* Monthly Payment Chart - Optimized for Mobile */}
        <Card className="mb-4 overflow-hidden">
          <div className="p-2 sm:p-4 pb-4 sm:pb-8">
            <h3 className="text-lg font-bold mb-2 sm:mb-4 text-gray-800 dark:text-white">
              Monthly Payment Comparison
            </h3>

            <div className="h-[350px] sm:h-80 w-full relative p-1 sm:p-4 overflow-visible">
              <ChartWrapper
                title="Monthly Payment Comparison"
                description="Horizontal bar chart comparing monthly payments across different loan scenarios"
                ref={chartRef}
                key={`monthly-payment-chart-${windowWidth < 640 ? 'mobile' : 'desktop'}`}
                type="bar"
                data={{
                  // Ensure we don't have duplicate labels
                  labels: [...new Set(chartData.labels)],
                  datasets: [{
                    label: 'Monthly Payment',
                    data: chartData.datasets[0].data,
                    backgroundColor: function(context) {
                      const chart = context.chart;
                      const {ctx, chartArea} = chart;
                      if (!chartArea) return 'rgba(59, 130, 246, 0.8)';
                      const gradient = ctx.createLinearGradient(0, chartArea.top, chartArea.right, 0);
                      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
                      gradient.addColorStop(1, 'rgba(79, 70, 229, 0.8)');
                      return gradient;
                    },
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                    hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
                    hoverBorderColor: 'rgba(59, 130, 246, 1)',
                    hoverBorderWidth: 2,
                    // Optimize bar size for mobile
                    barPercentage: windowWidth < 640 ? 0.7 : 0.6,
                    categoryPercentage: windowWidth < 640 ? 0.8 : 0.8,
                    // Add max thickness to control bar height
                    maxBarThickness: windowWidth < 640 ? 40 : 50,
                    // Add min length to ensure bars are visible
                    minBarLength: 20,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  layout: {
                    padding: {
                      // Adjust padding for mobile
                      left: windowWidth < 640 ? 60 : 80,
                      right: windowWidth < 640 ? 15 : 20,
                      top: windowWidth < 640 ? 15 : 20,
                      bottom: windowWidth < 640 ? 20 : 40
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: true,
                        color: 'rgba(200, 200, 200, 0.15)',
                        lineWidth: 0.5
                      },
                      ticks: {
                        callback: function(value) {
                          // Improved currency formatting for mobile
                          if (value >= 1000) {
                            return currentLocale.currency + (value / 1000).toFixed(0) + 'K';
                          }
                          return currentLocale.currency + value.toFixed(0);
                        },
                        font: {
                          size: windowWidth < 640 ? 9 : 10,
                          weight: 'bold'
                        },
                        color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                        maxRotation: 0,
                        minRotation: 0,
                        padding: windowWidth < 640 ? 3 : 5,
                        autoSkip: true,
                        // Show fewer ticks on mobile
                        maxTicksLimit: windowWidth < 640 ? 4 : 5
                      },
                      beginAtZero: true,
                      border: {
                        display: false
                      }
                    },
                    y: {
                      position: 'left',
                      grid: {
                        display: false
                      },
                      border: {
                        display: false
                      },
                      ticks: {
                        padding: windowWidth < 640 ? 5 : 8,
                        font: {
                          size: windowWidth < 640 ? 10 : 11,
                          weight: 'bold'
                        },
                        color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                        // Position labels to the left of the axis
                        mirror: true,
                        // Limit label length - shorter on mobile
                        callback: function(value) {
                          const label = this.getLabelForValue(value);
                          const maxLength = windowWidth < 640 ? 6 : 8;
                          if (label.length > maxLength) {
                            return label.substring(0, maxLength) + '...';
                          }
                          return label;
                        },
                        z: 1
                      },
                      afterFit: function(scaleInstance) {
                        // Adjust width based on screen size
                        scaleInstance.width = windowWidth < 640 ? 55 : 75;
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      enabled: true,
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      titleFont: {
                        family: "'Plus Jakarta Sans', sans-serif",
                        size: windowWidth < 640 ? 12 : 14,
                        weight: 'bold',
                      },
                      bodyFont: {
                        family: "'Plus Jakarta Sans', sans-serif",
                        size: windowWidth < 640 ? 11 : 13,
                      },
                      // Smaller padding on mobile for more compact tooltip
                      padding: windowWidth < 640 ? 10 : 15,
                      cornerRadius: 8,
                      displayColors: false,
                      // Ensure tooltip is fully visible on mobile
                      position: windowWidth < 640 ? 'nearest' : 'average',
                      callbacks: {
                        title: function(tooltipItems) {
                          return tooltipItems[0].label;
                        },
                        label: function(context) {
                          return `Monthly Payment: ${currentLocale.currency}${context.raw.toFixed(2)}`;
                        },
                        footer: function(tooltipItems) {
                          const dataIndex = tooltipItems[0].dataIndex;
                          const scenarioData = scenarios[dataIndex];
                          if (scenarioData) {
                            return [
                              `Loan: ${currentLocale.currency}${scenarioData.principal.toLocaleString()}`,
                              `Rate: ${scenarioData.rate}%`,
                              `Term: ${scenarioData.termYears} years`
                            ];
                          }
                          return [];
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </Card>
        </>
      ) : (
        scenarios.length === 1 && (
          <Card className="mb-4 p-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-center mb-4">
                <FaBalanceScale className="h-12 w-12 mx-auto mb-4 text-blue-500 opacity-70" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  Add Another Scenario to Compare
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  You need at least two scenarios to generate a comparison chart. Add another scenario to see how different loan options compare.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={addScenario}
                disabled={isCalculating}
                icon={<FaPlus className="h-4 w-4" />}
              >
                Add Another Scenario
              </Button>
            </div>
          </Card>
        )
      )}

      {/* Edit Scenario Modal */}
      <AnimatePresence>
        {editingScenario && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              // Close modal when clicking outside
              if (e.target === e.currentTarget) {
                cancelEditing();
              }
            }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md my-2 sm:my-4 relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Close button */}
              <button
                className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={cancelEditing}
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-3 sm:p-5 max-h-[85vh] overflow-y-auto">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white pr-6">
                  {editingScenario.id ? 'Edit Scenario' : 'Add Scenario'}
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Scenario Name
                    </label>
                    <input
                      type="text"
                      value={editingScenario.name}
                      onChange={(e) => updateEditingScenario('name', e.target.value)}
                      className="input input-loanviz w-full text-sm sm:text-base py-2"
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
                      className="text-sm sm:text-base py-2"
                    />
                    <div className="mt-2 px-1">
                      <RangeSlider
                        min={ranges.principal.min}
                        max={ranges.principal.max}
                        step={ranges.principal.step}
                        value={editingScenario.principal}
                        onChange={(value) => updateEditingScenario('principal', value)}
                        className="mt-1"
                        leftLabel={`${currentLocale.currency}${ranges.principal.min.toLocaleString()}`}
                        rightLabel={`${currentLocale.currency}${ranges.principal.max.toLocaleString()}`}
                      />
                    </div>
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
                      className="text-sm sm:text-base py-2"
                    />
                    <div className="mt-2 px-1">
                      <RangeSlider
                        min={ranges.rate.min}
                        max={ranges.rate.max}
                        step={ranges.rate.step}
                        value={editingScenario.rate}
                        onChange={(value) => updateEditingScenario('rate', value)}
                        className="mt-1"
                        leftLabel={`${ranges.rate.min}%`}
                        rightLabel={`${ranges.rate.max}%`}
                      />
                    </div>
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
                      className="text-sm sm:text-base py-2"
                    />
                    <div className="mt-2 px-1">
                      <RangeSlider
                        min={ranges.termYears.min}
                        max={ranges.termYears.max}
                        step={ranges.termYears.step}
                        value={editingScenario.termYears}
                        onChange={(value) => updateEditingScenario('termYears', value)}
                        className="mt-1"
                        leftLabel={`${ranges.termYears.min} years`}
                        rightLabel={`${ranges.termYears.max} years`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Repayment Type
                    </label>
                    <select
                      value={editingScenario.type}
                      onChange={(e) => updateEditingScenario('type', e.target.value)}
                      className="select select-loanviz w-full text-sm sm:text-base py-2"
                    >
                      <option value="repayment">Repayment</option>
                      <option value="interest-only">Interest Only</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
                  <Button
                    variant="secondary"
                    onClick={cancelEditing}
                    className="text-white dark:text-white w-full sm:w-auto"
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="primary"
                    onClick={saveScenario}
                    icon={<FaSave className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                  >
                    Save
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

export default LoanComparison;
