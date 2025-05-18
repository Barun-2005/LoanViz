import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChartLine, FaTable } from 'react-icons/fa';
import GlassCard from '../../components/ui/modern/GlassCard';
import AmortizationCalculator from '../../components/services/AmortizationCalculator';
import AmortizationSchedule from '../../components/services/AmortizationSchedule';
import useLoanCalculations from '../../hooks/useLoanCalculations';

const Amortization = ({ loanType = 'mortgage' }) => {
  const params = useParams();
  const currentLoanType = params.loanType || loanType;
  const [loanDetails, setLoanDetails] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Use the loan calculations hook
  const {
    results,
    amortizationSchedule,
    isCalculating,
    calculateLoan
  } = useLoanCalculations(currentLoanType);

  // Define loan-specific ranges and fees
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
      },
      additionalFees: {
        arrangementFee: 995,
        valuationFee: 300,
        legalFees: 1200
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
      },
      additionalFees: {
        arrangementFee: 195
      }
    },
    auto: {
      ranges: {
        principal: { min: 5000, max: 100000, step: 500 },
        rate: { min: 2, max: 20, step: 0.1 },
        termYears: { min: 1, max: 7, step: 1 },
        downPayment: { min: 0, max: 50000, step: 500 },
        tradeInValue: { min: 0, max: 30000, step: 500 },
      },
      initialValues: {
        principal: 25000,
        rate: 5.9,
        termYears: 5,
        type: 'repayment',
        downPayment: 5000,
        tradeInValue: 0,
      },
      additionalFees: {
        documentationFee: 150
      }
    },
    student: {
      ranges: {
        principal: { min: 1000, max: 100000, step: 500 },
        rate: { min: 1, max: 12, step: 0.1 },
        termYears: { min: 5, max: 30, step: 1 },
        gracePeriodMonths: { min: 0, max: 24, step: 1 },
      },
      initialValues: {
        principal: 40000,
        rate: 4.5,
        termYears: 20,
        type: 'repayment',
        gracePeriodMonths: 6,
      },
      additionalFees: {}
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
      },
      additionalFees: {
        arrangementFee: 1495,
        valuationFee: 500,
        legalFees: 1500
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
      },
      additionalFees: {
        arrangementFee: 495
      }
    }
  };

  // Get config for current loan type, fallback to mortgage if not found
  const config = loanConfig[currentLoanType] || loanConfig.mortgage;

  // Handle calculation results - using useCallback to avoid dependency issues
  const handleCalculate = useCallback(async (params) => {
    try {
      console.log("handleCalculate called with params:", params);

      // Call the calculateLoan function from the hook with the provided parameters
      const results = await calculateLoan(params);
      console.log("calculateLoan results:", results);

      // Set loan details for the amortization schedule
      setLoanDetails({
        principal: results.principal || config.initialValues.principal,
        rate: results.rate || config.initialValues.rate,
        termYears: results.termYears || config.initialValues.termYears,
        monthlyPayment: results.monthlyPayment,
        totalInterest: results.totalInterest,
        totalRepayment: results.totalRepayment,
        gracePeriodMonths: params.gracePeriodMonths || 0,
        gracePeriodInterest: results.gracePeriodInterest || 0,
      });

      // Force a re-render to ensure the amortization schedule is displayed
      setForceUpdate(prev => prev + 1);

      return results;
    } catch (error) {
      console.error('Error calculating loan details:', error);
      throw error;
    }
  }, [calculateLoan, config]);

  // We no longer calculate initial loan details automatically
  // This ensures the user must click the "Generate Schedule" button first

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard
          className="mb-4"
          title={`${currentLoanType.charAt(0).toUpperCase() + currentLoanType.slice(1)} Amortization Schedule`}
          icon={<FaChartLine className="h-5 w-5" />}
          variant="primary"
          effect="glow"
          animate={true}
        >
          <div className="p-4">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              An amortization schedule shows how your loan balance decreases over time as you make payments. It breaks down each payment into principal and interest portions, helping you understand how your loan is paid off over the term.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Enter your loan details below to generate a detailed amortization schedule with visual charts and payment breakdowns.
            </p>
          </div>
        </GlassCard>

        <AmortizationCalculator
          loanTypeId={currentLoanType}
          initialValues={config.initialValues}
          ranges={config.ranges}
          additionalFees={config.additionalFees}
          onCalculate={handleCalculate}
          onResultsGenerated={() => {
            // Scroll to the results section after a short delay to allow for rendering
            setTimeout(() => {
              const resultsElement = document.querySelector('.amortization-schedule');
              if (resultsElement) {
                resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }}
        />

        {/* Debug information */}
        <div className="hidden">
          <p>Has loan details: {loanDetails ? 'Yes' : 'No'}</p>
          <p>Schedule length: {amortizationSchedule ? amortizationSchedule.length : 0}</p>
          <p>Is calculating: {isCalculating ? 'Yes' : 'No'}</p>
        </div>

        <AmortizationSchedule
          key={`amortization-${forceUpdate}`}
          loanTypeId={currentLoanType}
          loanDetails={loanDetails}
          schedule={amortizationSchedule}
          loading={isCalculating}
          hasCalculated={!!loanDetails}
        />
      </motion.div>
    </div>
  );
};

export default Amortization;
