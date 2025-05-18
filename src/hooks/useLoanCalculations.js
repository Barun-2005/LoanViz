import { useState, useCallback, useRef } from 'react';
import { calculateMortgage, generateAmortizationSchedule, calculateAffordability } from '../utils/mortgage';

// Hook for handling loan calculations with support for different loan types
const useLoanCalculations = (loanType = 'mortgage') => {
  // Store loanType in a ref to avoid dependency changes
  const loanTypeRef = useRef(loanType);
  loanTypeRef.current = loanType; // Update ref value

  // State for calculation results and status
  const [state, setState] = useState({
    results: null,
    schedule: [],
    isCalculating: false,
    errors: {}
  });

  // Calculate loan details with support for various loan parameters
  const calculateLoan = useCallback(async ({
    principal,
    rate,
    termYears,
    type = 'repayment',
    fees = {},
    downPayment = 0,
    tradeInValue = 0,
    gracePeriodMonths = 0
  }) => {
    // Update calculating state
    setState(prevState => ({
      ...prevState,
      isCalculating: true,
      errors: {}
    }));

    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Calculate total fees
      const totalFees = Object.values(fees).reduce((sum, fee) => sum + (parseFloat(fee) || 0), 0);

      // Calculate loan details
      const calculationResults = calculateMortgage({
        principal,
        rate,
        termYears,
        type,
        fees,
        downPayment,
        tradeInValue,
        gracePeriodMonths
      });

      // Add fees to total repayment
      calculationResults.totalRepayment += totalFees;
      calculationResults.fees = totalFees;

      // Generate amortization schedule
      const schedule = generateAmortizationSchedule(
        calculationResults.principal,
        rate,
        termYears,
        gracePeriodMonths
      );

      // Store schedule in the results object
      calculationResults.amortizationSchedule = schedule;

      // Update state with results
      setState(prevState => ({
        ...prevState,
        results: calculationResults,
        schedule: schedule,
        isCalculating: false
      }));

      return calculationResults;
    } catch (error) {
      // Update state with error
      setState(prevState => ({
        ...prevState,
        errors: { calculation: error.message || 'Error calculating loan details' },
        isCalculating: false
      }));
      throw error;
    }
  }, []);

  // Calculate maximum affordable loan amount based on income and existing debts
  const calculateAffordabilityDetails = useCallback(async ({
    monthlyIncome,
    monthlyDebts,
    downPayment,
    rate,
    termYears,
    debtToIncomeRatio = 0.36
  }) => {
    // Update calculating state
    setState(prevState => ({
      ...prevState,
      isCalculating: true,
      errors: {}
    }));

    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

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

      // Calculate loan amount for both scenarios
      const maxLoanAmount = maxPrice - downPayment;
      const conservativeLoanAmount = conservativePrice - downPayment;

      // Calculate monthly payments for both scenarios
      const maxPayment = calculateMortgage({
        principal: maxLoanAmount,
        rate,
        termYears
      }).monthlyPayment;

      const conservativePayment = calculateMortgage({
        principal: conservativeLoanAmount,
        rate,
        termYears
      }).monthlyPayment;

      const affordabilityResults = {
        maxPrice: Math.round(maxPrice),
        conservativePrice: Math.round(conservativePrice),
        maxLoanAmount: Math.round(maxLoanAmount),
        conservativeLoanAmount: Math.round(conservativeLoanAmount),
        maxPayment,
        conservativePayment,
        downPayment,
        debtToIncomeRatio
      };

      // Update state with results
      setState(prevState => ({
        ...prevState,
        results: affordabilityResults,
        isCalculating: false
      }));

      return affordabilityResults;
    } catch (error) {
      // Update state with error
      setState(prevState => ({
        ...prevState,
        errors: { calculation: error.message || 'Error calculating affordability' },
        isCalculating: false
      }));
      throw error;
    }
  }, []);

  // Clear all calculation results
  const resetCalculations = useCallback(() => {
    setState({
      results: null,
      schedule: [],
      isCalculating: false,
      errors: {}
    });
  }, []);

  // Extract values from state for return
  const { results, schedule, isCalculating, errors } = state;

  return {
    loanType: loanTypeRef.current,
    results,
    amortizationSchedule: results?.amortizationSchedule || schedule,
    isCalculating,
    errors,
    calculateLoan,
    calculateAffordabilityDetails,
    resetCalculations
  };
};

export default useLoanCalculations;
