import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LoanCalculator from '../../components/services/LoanCalculator';

const BasicCalculator = ({ loanType = 'mortgage' }) => {
  const params = useParams();
  const currentLoanType = params.loanType || loanType;
  const [calculationResults, setCalculationResults] = useState(null);
  const [key, setKey] = useState(Date.now()); // Add a key to force re-render

  // Force re-render when loan type changes
  useEffect(() => {
    // Reset the key to force a complete re-render of the calculator
    setKey(Date.now());
  }, [currentLoanType]);

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

  // Handle calculation results
  const handleCalculate = (results) => {
    setCalculationResults(results);
    // Additional logic can be added here if needed
  };

  return (
    <div className="p-4">
      <LoanCalculator
        key={key} // Use key to force re-render when loan type changes
        loanTypeId={currentLoanType}
        initialValues={config.initialValues}
        ranges={config.ranges}
        additionalFees={config.additionalFees}
        onCalculate={handleCalculate}
      />
    </div>
  );
};

export default BasicCalculator;
