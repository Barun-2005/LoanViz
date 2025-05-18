import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import EarlyRepaymentCalculator from '../../components/services/EarlyRepaymentCalculator';
import { calculateMortgage, generateAmortizationSchedule } from '../../utils/mortgage';

const EarlyRepayment = ({ loanType = 'mortgage' }) => {
  const params = useParams();
  const location = useLocation();
  const currentLoanType = params.loanType || loanType;
  const [loanDetails, setLoanDetails] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // We don't need to force re-renders based on location changes
  // The key in the LoanFeature component will handle that

  // Define loan-specific ranges and initial values
  const loanConfig = {
    mortgage: {
      ranges: {
        principal: { min: 10000, max: 1000000, step: 1000 },
        rate: { min: 0.1, max: 15, step: 0.1 },
        termYears: { min: 5, max: 35, step: 1 },
      },
      initialValues: {
        principal: 200000,
        rate: 3.5,
        termYears: 25,
        type: 'repayment',
      }
    },
    personal: {
      ranges: {
        principal: { min: 1000, max: 50000, step: 500 },
        rate: { min: 3, max: 25, step: 0.1 },
        termYears: { min: 1, max: 7, step: 1 },
      },
      initialValues: {
        principal: 10000,
        rate: 8.9,
        termYears: 5,
        type: 'repayment',
      }
    },
    auto: {
      ranges: {
        principal: { min: 5000, max: 100000, step: 500 },
        rate: { min: 2, max: 20, step: 0.1 },
        termYears: { min: 1, max: 7, step: 1 },
      },
      initialValues: {
        principal: 25000,
        rate: 5.9,
        termYears: 5,
        type: 'repayment',
      }
    },
    student: {
      ranges: {
        principal: { min: 1000, max: 100000, step: 500 },
        rate: { min: 1, max: 12, step: 0.1 },
        termYears: { min: 5, max: 30, step: 1 },
      },
      initialValues: {
        principal: 40000,
        rate: 4.5,
        termYears: 20,
        type: 'repayment',
      }
    },
    investment: {
      ranges: {
        principal: { min: 10000, max: 2000000, step: 5000 },
        rate: { min: 0.5, max: 15, step: 0.1 },
        termYears: { min: 5, max: 30, step: 1 },
      },
      initialValues: {
        principal: 300000,
        rate: 4.2,
        termYears: 25,
        type: 'interest-only',
      }
    },
    debt: {
      ranges: {
        principal: { min: 5000, max: 100000, step: 1000 },
        rate: { min: 3, max: 20, step: 0.1 },
        termYears: { min: 1, max: 10, step: 1 },
      },
      initialValues: {
        principal: 30000,
        rate: 7.5,
        termYears: 5,
        type: 'repayment',
      }
    }
  };

  // Get config for current loan type, fallback to mortgage if not found
  const config = loanConfig[currentLoanType] || loanConfig.mortgage;

  // Direct calculation function
  const calculateLoan = useCallback(async (params) => {
    setIsCalculating(true);

    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Calculate loan details
      const calculationResults = calculateMortgage(params);

      // Generate amortization schedule
      const schedule = generateAmortizationSchedule(
        calculationResults.principal,
        params.rate,
        params.termYears
      );

      // Store schedule in the results object
      calculationResults.amortizationSchedule = schedule;

      setIsCalculating(false);
      return calculationResults;
    } catch (error) {
      console.error("Error calculating loan:", error);
      setIsCalculating(false);
      throw error;
    }
  }, []);

  // Initialize loan details and schedule - only run once
  useEffect(() => {
    // Only run once when the component mounts
    if (!loanDetails) {
      const initializeLoan = async () => {
        try {
          const results = await calculateLoan({
            principal: config.initialValues.principal,
            rate: config.initialValues.rate,
            termYears: config.initialValues.termYears,
            type: config.initialValues.type
          });

          setLoanDetails(results);
          setAmortizationSchedule(results.amortizationSchedule);
        } catch (error) {
          console.error("Error initializing loan:", error);
        }
      };

      initializeLoan();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-4">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {currentLoanType.charAt(0).toUpperCase() + currentLoanType.slice(1)} Early Repayment Calculator
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Calculate how much time and interest you can save by making extra payments on your loan. Add one-time, monthly, quarterly, or annual extra payments to see the impact on your loan term and total interest.
            </p>
          </div>
        </Card>

        {/* Always render the calculator, even if loanDetails is still loading */}
        <EarlyRepaymentCalculator
          loanTypeId={currentLoanType}
          loanDetails={loanDetails || {
            principal: config.initialValues.principal,
            rate: config.initialValues.rate,
            termYears: config.initialValues.termYears,
            type: config.initialValues.type,
            monthlyPayment: 1000, // Default value until real calculation is done
            totalInterest: 100000, // Default value until real calculation is done
            totalRepayment: config.initialValues.principal + 100000 // Default value until real calculation is done
          }}
          schedule={amortizationSchedule}
        />
      </motion.div>
    </div>
  );
};

export default EarlyRepayment;
