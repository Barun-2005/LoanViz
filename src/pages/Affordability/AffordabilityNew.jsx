import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalculator, FaMoneyBillWave } from 'react-icons/fa';
import { GlassCard } from '../../components/ui/modern';
import AffordabilityCalculator from '../../components/services/AffordabilityCalculator';
import InvestmentAffordabilityCalculator from '../../components/services/InvestmentAffordabilityCalculator';
import useAffordability from '../../hooks/useAffordability';

const Affordability = ({ loanType = 'mortgage' }) => {
  const params = useParams();
  const currentLoanType = params.loanType || loanType;
  const [affordabilityResults, setAffordabilityResults] = useState(null);

  // Use the affordability hook
  const {
    results,
    calculateAffordabilityDetails,
    getBudgetRecommendations
  } = useAffordability(currentLoanType);

  // Define loan-specific ranges and initial values
  const loanConfig = {
    mortgage: {
      ranges: {
        monthlyIncome: { min: 1000, max: 20000, step: 100 },
        monthlyDebts: { min: 0, max: 10000, step: 100 },
        downPayment: { min: 0, max: 200000, step: 1000 },
        rate: { min: 0.1, max: 15, step: 0.1 },
        termYears: { min: 5, max: 35, step: 1 },
        debtToIncomeRatio: { min: 0.28, max: 0.43, step: 0.01 },
      },
      initialValues: {
        monthlyIncome: 5000,
        monthlyDebts: 500,
        downPayment: 20000,
        rate: 3.5,
        termYears: 25,
        debtToIncomeRatio: 0.36,
      }
    },
    personal: {
      ranges: {
        monthlyIncome: { min: 1000, max: 15000, step: 100 },
        monthlyDebts: { min: 0, max: 5000, step: 100 },
        downPayment: { min: 0, max: 10000, step: 500 },
        rate: { min: 3, max: 25, step: 0.1 },
        termYears: { min: 1, max: 7, step: 1 },
        debtToIncomeRatio: { min: 0.28, max: 0.43, step: 0.01 },
      },
      initialValues: {
        monthlyIncome: 4000,
        monthlyDebts: 400,
        downPayment: 1000,
        rate: 8.9,
        termYears: 5,
        debtToIncomeRatio: 0.36,
      }
    },
    auto: {
      ranges: {
        monthlyIncome: { min: 1000, max: 15000, step: 100 },
        monthlyDebts: { min: 0, max: 5000, step: 100 },
        downPayment: { min: 0, max: 20000, step: 500 },
        rate: { min: 2, max: 20, step: 0.1 },
        termYears: { min: 1, max: 7, step: 1 },
        debtToIncomeRatio: { min: 0.28, max: 0.43, step: 0.01 },
      },
      initialValues: {
        monthlyIncome: 4500,
        monthlyDebts: 450,
        downPayment: 5000,
        rate: 5.9,
        termYears: 5,
        debtToIncomeRatio: 0.36,
      }
    },
    student: {
      ranges: {
        monthlyIncome: { min: 1000, max: 15000, step: 100 },
        monthlyDebts: { min: 0, max: 5000, step: 100 },
        downPayment: { min: 0, max: 10000, step: 500 },
        rate: { min: 1, max: 12, step: 0.1 },
        termYears: { min: 5, max: 30, step: 1 },
        debtToIncomeRatio: { min: 0.28, max: 0.43, step: 0.01 },
      },
      initialValues: {
        monthlyIncome: 3500,
        monthlyDebts: 300,
        downPayment: 0,
        rate: 4.5,
        termYears: 20,
        debtToIncomeRatio: 0.36,
      }
    },
    investment: {
      ranges: {
        monthlyIncome: { min: 2000, max: 30000, step: 100 },
        monthlyDebts: { min: 0, max: 15000, step: 100 },
        downPayment: { min: 0, max: 300000, step: 1000 },
        rate: { min: 0.5, max: 15, step: 0.1 },
        termYears: { min: 5, max: 30, step: 1 },
        debtToIncomeRatio: { min: 0.28, max: 0.43, step: 0.01 },
      },
      initialValues: {
        monthlyIncome: 8000,
        monthlyDebts: 2000,
        downPayment: 50000,
        rate: 4.2,
        termYears: 25,
        debtToIncomeRatio: 0.36,
      }
    },
    debt: {
      ranges: {
        monthlyIncome: { min: 1000, max: 15000, step: 100 },
        monthlyDebts: { min: 0, max: 10000, step: 100 },
        downPayment: { min: 0, max: 10000, step: 500 },
        rate: { min: 3, max: 20, step: 0.1 },
        termYears: { min: 1, max: 10, step: 1 },
        debtToIncomeRatio: { min: 0.28, max: 0.43, step: 0.01 },
      },
      initialValues: {
        monthlyIncome: 4000,
        monthlyDebts: 1500,
        downPayment: 0,
        rate: 7.5,
        termYears: 5,
        debtToIncomeRatio: 0.36,
      }
    }
  };

  // Get config for current loan type, fallback to mortgage if not found
  const config = loanConfig[currentLoanType] || loanConfig.mortgage;

  // Handle calculation results
  const handleCalculate = (results) => {
    setAffordabilityResults(results);
  };

  // Get budget recommendations when results change
  useEffect(() => {
    if (results) {
      const recommendations = getBudgetRecommendations();
      console.log('Budget Recommendations:', recommendations);
    }
  }, [results, getBudgetRecommendations]);

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard
          className="mb-4"
          title={`${currentLoanType.charAt(0).toUpperCase() + currentLoanType.slice(1)} ${currentLoanType === 'investment' ? 'Budget' : 'Affordability'} Calculator`}
          icon={currentLoanType === 'investment' ? <FaMoneyBillWave className="h-5 w-5" /> : <FaCalculator className="h-5 w-5" />}
          variant="primary"
          effect="glow"
          animate={true}
        >
          <div className="p-4">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {currentLoanType === 'investment'
                ? "Calculate your investment potential based on your income, existing obligations, and investment timeframe. See how different monthly contributions can grow your portfolio over time."
                : "Find out how much you can afford based on your income and existing debts. Your down payment will be added to your loan affordability to determine your total purchasing power. This calculator provides both a maximum and a more conservative recommendation."
              }
            </p>
          </div>
        </GlassCard>

        {currentLoanType === 'investment' ? (
          <InvestmentAffordabilityCalculator
            initialValues={config.initialValues}
            ranges={config.ranges}
            onCalculate={handleCalculate}
          />
        ) : (
          <AffordabilityCalculator
            loanTypeId={currentLoanType}
            initialValues={config.initialValues}
            ranges={config.ranges}
            onCalculate={handleCalculate}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Affordability;
