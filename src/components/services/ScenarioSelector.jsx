import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap, FaInfoCircle, FaChartLine, FaMoneyBillWave, FaPercentage, FaCalendarAlt } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import NumericInput from '../ui/NumericInput';
import RangeSlider from '../ui/RangeSlider';
import ChartWrapper from '../ui/ChartWrapper';
import AnimatedNumber from '../ui/AnimatedNumber';
import useLoanCalculations from '../../hooks/useLoanCalculations';

/**
 * ScenarioSelector component for student loan repayment plans
 * @param {Object} props - Component props
 * @param {string} props.loanTypeId - Type of loan (should be 'student')
 * @returns {JSX.Element} Scenario selector component
 */
const ScenarioSelector = ({ loanTypeId = 'student' }) => {
  // State for form inputs
  const [loanAmount, setLoanAmount] = useState(40000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [gracePeriodMonths, setGracePeriodMonths] = useState(6);
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [scenarios, setScenarios] = useState([]);
  const [errors, setErrors] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Use the loan calculations hook
  const {
    results,
    isCalculating,
    calculateLoan,
    resetCalculations
  } = useLoanCalculations(loanTypeId);

  // Define repayment plans
  const repaymentPlans = [
    {
      id: 'standard',
      name: 'Standard Repayment',
      description: '10-year term with fixed monthly payments',
      termYears: 10,
      type: 'repayment'
    },
    {
      id: 'extended',
      name: 'Extended Repayment',
      description: '25-year term with lower monthly payments',
      termYears: 25,
      type: 'repayment'
    },
    {
      id: 'graduated',
      name: 'Graduated Repayment',
      description: 'Payments start low and increase over time',
      termYears: 10,
      type: 'graduated'
    },
    {
      id: 'income-based',
      name: 'Income-Based Repayment',
      description: 'Payments based on your income',
      termYears: 20,
      type: 'income-based'
    }
  ];

  // Calculate scenarios when inputs change
  useEffect(() => {
    const calculateScenarios = async () => {
      try {
        const results = await Promise.all(
          repaymentPlans.map(async (plan) => {
            const result = await calculateLoan({
              principal: loanAmount,
              rate: interestRate,
              termYears: plan.termYears,
              type: 'repayment', // For simplicity, we're using repayment for all plans
              gracePeriodMonths: gracePeriodMonths
            });
            
            return {
              ...plan,
              monthlyPayment: result.monthlyPayment,
              totalInterest: result.totalInterest,
              totalRepayment: result.totalRepayment,
              gracePeriodInterest: result.gracePeriodInterest
            };
          })
        );
        
        setScenarios(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error calculating scenarios:', error);
        setErrors({ calculation: error.message || 'Error calculating scenarios' });
      }
    };
    
    calculateScenarios();
  }, [loanAmount, interestRate, gracePeriodMonths, calculateLoan]);

  // Prepare chart data
  const prepareChartData = () => {
    if (scenarios.length === 0) return null;
    
    return {
      labels: scenarios.map(scenario => scenario.name),
      datasets: [
        {
          label: 'Monthly Payment',
          data: scenarios.map(scenario => scenario.monthlyPayment),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total Interest',
          data: scenarios.map(scenario => scenario.totalInterest),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  // Handle plan selection
  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  return (
    <div className="scenario-selector">
      <Card className="mb-4">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Student Loan Repayment Plans
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Loan Amount */}
            <div className="mb-3">
              <label htmlFor="loan-amount" className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Loan Amount
              </label>
              <div className="flex flex-col gap-2">
                <div className="w-full">
                  <NumericInput
                    id="loan-amount"
                    name="loan-amount"
                    value={loanAmount}
                    onChange={setLoanAmount}
                    min={1000}
                    max={100000}
                    step={1000}
                    error={errors.loanAmount}
                    prefix="£"
                    thousandSeparator={true}
                    decimalScale={0}
                    icon={<FaMoneyBillWave className="h-4 w-4" />}
                  />
                </div>
                <div className="w-full">
                  <RangeSlider
                    min={1000}
                    max={100000}
                    step={1000}
                    value={loanAmount}
                    onChange={setLoanAmount}
                    formatValue={(val) => val.toLocaleString()}
                    leftLabel="£1,000"
                    rightLabel="£100,000"
                  />
                </div>
              </div>
            </div>
            
            {/* Interest Rate */}
            <div className="mb-3">
              <label htmlFor="interest-rate" className="form-label mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Interest Rate
              </label>
              <div className="flex flex-col gap-2">
                <div className="w-full">
                  <NumericInput
                    id="interest-rate"
                    name="interest-rate"
                    value={interestRate}
                    onChange={setInterestRate}
                    min={1}
                    max={12}
                    step={0.1}
                    error={errors.interestRate}
                    suffix="%"
                    decimalScale={2}
                    icon={<FaPercentage className="h-4 w-4" />}
                  />
                </div>
                <div className="w-full">
                  <RangeSlider
                    min={1}
                    max={12}
                    step={0.1}
                    value={interestRate}
                    onChange={setInterestRate}
                    formatValue={(val) => val.toFixed(1)}
                    leftLabel="1%"
                    rightLabel="12%"
                  />
                </div>
              </div>
            </div>
            
            {/* Grace Period */}
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
                    min={0}
                    max={24}
                    step={1}
                    error={errors.gracePeriodMonths}
                    suffix=" months"
                    decimalScale={0}
                    icon={<FaGraduationCap className="h-4 w-4" />}
                  />
                </div>
                <div className="w-full">
                  <RangeSlider
                    min={0}
                    max={24}
                    step={1}
                    value={gracePeriodMonths}
                    onChange={setGracePeriodMonths}
                    formatValue={(val) => val}
                    leftLabel="0 months"
                    rightLabel="24 months"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Comparison Chart */}
      {showResults && scenarios.length > 0 && (
        <Card className="mb-4">
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
              Repayment Plan Comparison
            </h3>
            
            <div className="h-80 mb-4">
              <ChartWrapper
                type="bar"
                data={prepareChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Amount (£)'
                      },
                      ticks: {
                        callback: function(value) {
                          if (value >= 1000000) {
                            return `£${(value / 1000000).toFixed(1)}M`;
                          } else if (value >= 1000) {
                            return `£${(value / 1000).toFixed(0)}K`;
                          }
                          return `£${value}`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            
            {/* Repayment Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {scenarios.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  <h4 className="font-bold text-gray-800 dark:text-white mb-1">{plan.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{plan.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Payment</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        £{plan.monthlyPayment.toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Interest</p>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        £{plan.totalInterest.toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Term</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {plan.termYears} years
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ScenarioSelector;
