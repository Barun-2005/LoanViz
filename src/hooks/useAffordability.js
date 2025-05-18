import { useState, useCallback } from 'react';
import { calculateAffordability, calculateMortgage } from '../utils/mortgage';

// Hook for calculating how much a user can afford to borrow
const useAffordability = (loanType = 'mortgage') => {
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState({});

    // Calculate maximum affordable loan amount based on financial situation
  const calculateAffordabilityDetails = useCallback(async ({
    monthlyIncome,
    monthlyExpenses = 0,
    monthlyDebts,
    downPayment,
    rate,
    termYears,
    debtToIncomeRatio = 0.36,
    additionalParams = {}
  }) => {
    setIsCalculating(true);
    setErrors({});

    try {
      // Input validation
      if (!monthlyIncome || monthlyIncome <= 0) {
        setErrors({ monthlyIncome: 'Monthly income must be greater than zero' });
        setIsCalculating(false);
        return null;
      }

      if (monthlyDebts < 0) {
        setErrors({ monthlyDebts: 'Monthly debts cannot be negative' });
        setIsCalculating(false);
        return null;
      }

      if (downPayment < 0) {
        setErrors({ downPayment: 'Down payment cannot be negative' });
        setIsCalculating(false);
        return null;
      }

      if (rate < 0.1 || rate > 30) {
        setErrors({ rate: 'Interest rate must be between 0.1% and 30%' });
        setIsCalculating(false);
        return null;
      }

      if (termYears < 1 || termYears > 50) {
        setErrors({ termYears: 'Loan term must be between 1 and 50 years' });
        setIsCalculating(false);
        return null;
      }

      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Ensure all inputs are valid numbers with reasonable defaults
      monthlyIncome = Math.max(0, parseFloat(monthlyIncome) || 0);
      monthlyExpenses = Math.max(0, parseFloat(monthlyExpenses) || 0);
      monthlyDebts = Math.max(0, parseFloat(monthlyDebts) || 0);
      downPayment = Math.max(0, parseFloat(downPayment) || 0);
      rate = Math.min(30, Math.max(0.1, parseFloat(rate) || 3.5));
      termYears = Math.min(50, Math.max(1, parseFloat(termYears) || 30));
      debtToIncomeRatio = Math.min(0.5, Math.max(0.1, parseFloat(debtToIncomeRatio) || 0.36));

      // Calculate disposable income (after expenses but before debt payments)
      const disposableIncome = Math.max(0, monthlyIncome - monthlyExpenses);

      // Calculate maximum affordable price
      const maxPrice = calculateAffordability(
        monthlyIncome,
        monthlyDebts,
        downPayment,
        rate,
        termYears,
        debtToIncomeRatio
      );

      // Calculate conservative price (90% of max)
      const conservativePrice = maxPrice * 0.9;

      // Calculate loan amounts
      const maxLoanAmount = Math.max(0, maxPrice - downPayment);
      const conservativeLoanAmount = Math.max(0, conservativePrice - downPayment);

      // Calculate maximum affordable monthly payment based on DTI
      const maxAffordablePayment = Math.max(0, (monthlyIncome * debtToIncomeRatio) - monthlyDebts);
      const conservativeAffordablePayment = maxAffordablePayment * 0.9;

      // Calculate actual monthly payments based on loan amounts
      let maxMonthlyPayment = 0;
      let conservativeMonthlyPayment = 0;

      try {
        if (maxLoanAmount > 0) {
          const maxPaymentResult = calculateMortgage({
            principal: maxLoanAmount,
            rate,
            termYears
          });
          maxMonthlyPayment = maxPaymentResult.monthlyPayment;
        }

        if (conservativeLoanAmount > 0) {
          const conservativePaymentResult = calculateMortgage({
            principal: conservativeLoanAmount,
            rate,
            termYears
          });
          conservativeMonthlyPayment = conservativePaymentResult.monthlyPayment;
        }
      } catch (error) {
        console.error('Error calculating monthly payments:', error);
        // Fallback to simple calculation
        maxMonthlyPayment = maxLoanAmount > 0 ? (maxLoanAmount / (termYears * 12)) * (1 + (rate / 100)) : 0;
        conservativeMonthlyPayment = conservativeLoanAmount > 0 ? (conservativeLoanAmount / (termYears * 12)) * (1 + (rate / 100)) : 0;
      }

      console.log('Affordability calculation:', {
        monthlyIncome,
        monthlyExpenses,
        monthlyDebts,
        disposableIncome,
        debtToIncomeRatio,
        maxAffordablePayment,
        conservativeAffordablePayment,
        actualMaxMonthlyPayment: maxMonthlyPayment,
        actualConservativeMonthlyPayment: conservativeMonthlyPayment,
        maxPrice,
        conservativePrice,
        maxLoanAmount,
        conservativeLoanAmount
      });

      // Calculate budget impact - ensure percentages are positive
      const maxBudgetImpact = Math.max(0, (maxMonthlyPayment / monthlyIncome) * 100);
      const conservativeBudgetImpact = Math.max(0, (conservativeMonthlyPayment / monthlyIncome) * 100);

      // Calculate remaining monthly budget after loan payment - ensure values are positive
      const remainingBudgetMax = Math.max(0, monthlyIncome - monthlyExpenses - monthlyDebts - maxMonthlyPayment);
      const remainingBudgetConservative = Math.max(0, monthlyIncome - monthlyExpenses - monthlyDebts - conservativeMonthlyPayment);

      // Apply loan-specific adjustments if needed
      let adjustedResults = {
        maxPrice: Math.round(maxPrice),
        conservativePrice: Math.round(conservativePrice),
        maxLoanAmount: Math.round(maxLoanAmount),
        conservativeLoanAmount: Math.round(conservativeLoanAmount),
        maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
        conservativeMonthlyPayment: Math.round(conservativeMonthlyPayment * 100) / 100,
        downPayment,
        debtToIncomeRatio,
        maxBudgetImpact: Math.round(maxBudgetImpact * 10) / 10,
        conservativeBudgetImpact: Math.round(conservativeBudgetImpact * 10) / 10,
        remainingBudgetMax: Math.round(remainingBudgetMax),
        remainingBudgetConservative: Math.round(remainingBudgetConservative),
        monthlyIncome,
        monthlyExpenses,
        monthlyDebts,
        disposableIncome
      };

      // Apply loan-specific adjustments
      switch (loanType) {
        case 'mortgage':
          // Add property tax and insurance estimates (typically 1-2% of home value annually)
          const annualTaxInsurance = maxPrice * 0.015; // 1.5% of home value
          const monthlyTaxInsurance = annualTaxInsurance / 12;
          adjustedResults.estimatedTaxInsurance = Math.round(monthlyTaxInsurance);
          adjustedResults.totalMonthlyPaymentMax = Math.round((maxMonthlyPayment + monthlyTaxInsurance) * 100) / 100;
          adjustedResults.totalMonthlyPaymentConservative = Math.round((conservativeMonthlyPayment + monthlyTaxInsurance) * 100) / 100;
          break;

        case 'auto':
          // Add auto-specific adjustments (insurance, maintenance)
          const monthlyInsurance = Math.min(500, Math.max(50, maxPrice * 0.0015)); // Roughly 1.5-2% of car value annually
          const monthlyMaintenance = Math.min(300, Math.max(30, maxPrice * 0.001)); // Roughly 1% of car value annually
          adjustedResults.estimatedInsurance = Math.round(monthlyInsurance);
          adjustedResults.estimatedMaintenance = Math.round(monthlyMaintenance);
          adjustedResults.totalMonthlyPaymentMax = Math.round((maxMonthlyPayment + monthlyInsurance + monthlyMaintenance) * 100) / 100;
          adjustedResults.totalMonthlyPaymentConservative = Math.round((conservativeMonthlyPayment + monthlyInsurance + monthlyMaintenance) * 100) / 100;
          break;

        case 'student':
          // Student loan specific adjustments (income-based repayment options)
          const incomeDrivenPayment = monthlyIncome * 0.1; // 10% of income
          adjustedResults.incomeDrivenPayment = Math.round(incomeDrivenPayment * 100) / 100;
          adjustedResults.standardPayment = Math.round(maxMonthlyPayment * 100) / 100;
          adjustedResults.paymentDifference = Math.round((maxMonthlyPayment - incomeDrivenPayment) * 100) / 100;
          break;

        case 'personal':
          // Personal loan specific adjustments
          const debtToIncomeAfterLoan = ((monthlyDebts + maxMonthlyPayment) / monthlyIncome) * 100;
          adjustedResults.debtToIncomeAfterLoan = Math.round(debtToIncomeAfterLoan * 10) / 10;
          adjustedResults.recommendedMaximum = debtToIncomeAfterLoan > 43 ?
            Math.round(maxPrice * 0.8) : // If DTI too high, recommend lower amount
            Math.round(maxPrice);
          break;

        case 'investment':
          // Investment specific calculations
          const expectedReturn = additionalParams.expectedReturn || 7;
          const investmentPeriod = additionalParams.investmentPeriod || 20;

          // Calculate future value with compound interest
          const calculateFutureValue = (principal, monthlyAddition, rate, years) => {
            const monthlyRate = rate / 100 / 12;
            const months = years * 12;
            const principalFV = principal * Math.pow(1 + monthlyRate, months);
            const additionsFV = monthlyAddition * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
            return principalFV + additionsFV;
          };

          const futureValue = calculateFutureValue(
            downPayment, // Initial investment
            maxMonthlyPayment, // Monthly contribution
            expectedReturn,
            investmentPeriod
          );

          adjustedResults.futureValue = Math.round(futureValue);
          adjustedResults.expectedReturn = expectedReturn;
          adjustedResults.investmentPeriod = investmentPeriod;
          break;

        case 'debt-consolidation':
          // Debt consolidation specific calculations
          const currentDebts = additionalParams.currentDebts || [];
          const totalCurrentDebt = currentDebts.reduce((sum, debt) => sum + debt.balance, 0);
          const avgInterestRate = currentDebts.reduce((sum, debt) => sum + (debt.rate * debt.balance), 0) /
            (totalCurrentDebt || 1); // Avoid division by zero

          adjustedResults.totalCurrentDebt = totalCurrentDebt;
          adjustedResults.avgInterestRate = Math.round(avgInterestRate * 100) / 100;
          adjustedResults.newInterestRate = rate;
          adjustedResults.interestSavings = Math.round((avgInterestRate - rate) * totalCurrentDebt / 100);
          break;

        default:
          adjustedResults.totalMonthlyPaymentMax = adjustedResults.maxMonthlyPayment;
          adjustedResults.totalMonthlyPaymentConservative = adjustedResults.conservativeMonthlyPayment;
      }

      // Include any additional parameters
      adjustedResults = { ...adjustedResults, ...additionalParams };

      // Log the final results
      console.log('Final adjusted results:', adjustedResults);

      // Ensure all values are valid numbers
      Object.keys(adjustedResults).forEach(key => {
        if (typeof adjustedResults[key] === 'number' && isNaN(adjustedResults[key])) {
          console.error(`Invalid value for ${key}:`, adjustedResults[key]);
          adjustedResults[key] = 0; // Set to 0 if NaN
        }
      });

      console.log('Sanitized results:', adjustedResults);
      setResults(adjustedResults);
      setIsCalculating(false);

      return adjustedResults;
    } catch (error) {
      setErrors({ calculation: error.message || 'Error calculating affordability' });
      setIsCalculating(false);
      throw error;
    }
  }, [loanType]);

    // Clear all calculation results
  const resetCalculations = useCallback(() => {
    setResults(null);
    setErrors({});
    setIsCalculating(false);
  }, []);

    // Generate budget allocation suggestions based on income and affordability
  const getBudgetRecommendations = useCallback(() => {
    if (!results) return null;

    const { monthlyIncome, monthlyExpenses, monthlyDebts, conservativeMonthlyPayment } = results;

    // Calculate recommended budget allocations
    const housing = conservativeMonthlyPayment;
    const savings = monthlyIncome * 0.2; // 20% for savings
    const otherExpenses = monthlyIncome - housing - monthlyDebts - savings;

    return {
      housing,
      savings,
      debts: monthlyDebts,
      otherExpenses,
      totalIncome: monthlyIncome
    };
  }, [results]);

  return {
    loanType,
    results,
    isCalculating,
    errors,
    calculateAffordabilityDetails,
    resetCalculations,
    getBudgetRecommendations
  };
};

export default useAffordability;
