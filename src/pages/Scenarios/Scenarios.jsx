import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import ScenariosCalculator from '../../components/services/ScenariosCalculator';

const Scenarios = ({ loanType = 'mortgage' }) => {
  const params = useParams();
  const currentLoanType = params.loanType || loanType;

  // Define loan-specific ranges and initial scenarios
  const loanConfig = {
    mortgage: {
      ranges: {
        principal: { min: 10000, max: 1000000, step: 1000 },
        rate: { min: 0.1, max: 15, step: 0.1 },
        termYears: { min: 5, max: 35, step: 1 },
        extraPayment: { min: 0, max: 2000, step: 10 }
      },
      initialScenario: {
        name: 'Scenario 1',
        principal: 200000,
        rate: 3.5,
        termYears: 25,
        type: 'repayment',
        extraPayment: 0
      }
    },
    personal: {
      ranges: {
        principal: { min: 1000, max: 50000, step: 500 },
        rate: { min: 3, max: 25, step: 0.1 },
        termYears: { min: 1, max: 7, step: 1 },
        extraPayment: { min: 0, max: 500, step: 10 }
      },
      initialScenario: {
        name: 'Scenario 1',
        principal: 10000,
        rate: 8.9,
        termYears: 5,
        type: 'repayment',
        extraPayment: 0
      }
    },
    auto: {
      ranges: {
        principal: { min: 5000, max: 100000, step: 500 },
        rate: { min: 2, max: 20, step: 0.1 },
        termYears: { min: 1, max: 7, step: 1 },
        extraPayment: { min: 0, max: 500, step: 10 }
      },
      initialScenario: {
        name: 'Scenario 1',
        principal: 25000,
        rate: 5.9,
        termYears: 5,
        type: 'repayment',
        extraPayment: 0
      }
    },
    student: {
      ranges: {
        principal: { min: 1000, max: 100000, step: 500 },
        rate: { min: 1, max: 12, step: 0.1 },
        termYears: { min: 5, max: 30, step: 1 },
        extraPayment: { min: 0, max: 500, step: 10 }
      },
      initialScenario: {
        name: 'Scenario 1',
        principal: 40000,
        rate: 4.5,
        termYears: 20,
        type: 'repayment',
        extraPayment: 0
      }
    },
    investment: {
      ranges: {
        principal: { min: 10000, max: 2000000, step: 5000 },
        rate: { min: 0.5, max: 15, step: 0.1 },
        termYears: { min: 5, max: 30, step: 1 },
        extraPayment: { min: 0, max: 5000, step: 100 }
      },
      initialScenario: {
        name: 'Scenario 1',
        principal: 300000,
        rate: 4.2,
        termYears: 25,
        type: 'interest-only',
        extraPayment: 0
      }
    },
    debt: {
      ranges: {
        principal: { min: 5000, max: 100000, step: 1000 },
        rate: { min: 3, max: 20, step: 0.1 },
        termYears: { min: 1, max: 10, step: 1 },
        extraPayment: { min: 0, max: 1000, step: 50 }
      },
      initialScenario: {
        name: 'Scenario 1',
        principal: 30000,
        rate: 7.5,
        termYears: 5,
        type: 'repayment',
        extraPayment: 0
      }
    }
  };

  // Get config for current loan type, fallback to mortgage if not found
  const config = loanConfig[currentLoanType] || loanConfig.mortgage;

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
              {currentLoanType.charAt(0).toUpperCase() + currentLoanType.slice(1)} Scenarios
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create and compare different loan scenarios to find the best option for your needs. Add multiple scenarios with different loan amounts, interest rates, terms, and extra payments to see how they affect your monthly payments, total interest, and loan term.
            </p>
          </div>
        </Card>

        <ScenariosCalculator
          loanTypeId={currentLoanType}
          initialScenario={config.initialScenario}
          ranges={config.ranges}
        />
      </motion.div>
    </div>
  );
};

export default Scenarios;
