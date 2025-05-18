import { render, screen, fireEvent } from '@testing-library/react';
import InvestmentAffordabilityCalculator from './InvestmentAffordabilityCalculator';

// Mock the useAffordability hook
jest.mock('../../hooks/useAffordability', () => {
  return () => ({
    results: null,
    isCalculating: false,
    calculateAffordabilityDetails: jest.fn().mockResolvedValue({
      maxPrice: 500000,
      conservativePrice: 450000,
      maxLoanAmount: 450000,
      conservativeLoanAmount: 400000,
      maxMonthlyPayment: 2000,
      conservativeMonthlyPayment: 1800,
      downPayment: 50000,
      debtToIncomeRatio: 0.36,
      maxBudgetImpact: 25,
      conservativeBudgetImpact: 22.5,
      remainingBudgetMax: 6000,
      remainingBudgetConservative: 6200,
      monthlyIncome: 8000,
      monthlyExpenses: 2000,
      monthlyDebts: 2000,
      disposableIncome: 6000
    }),
    resetCalculations: jest.fn(),
    getBudgetRecommendations: jest.fn().mockReturnValue({
      housing: 1800,
      savings: 1600,
      debts: 2000,
      otherExpenses: 2600,
      totalIncome: 8000
    })
  });
});

// Mock the ChartWrapper component
jest.mock('../ui/ChartWrapper', () => {
  return function MockChartWrapper(props) {
    return <div data-testid="chart-wrapper">{props.type} chart</div>;
  };
});

describe('InvestmentAffordabilityCalculator', () => {
  test('renders the calculator form', () => {
    render(<InvestmentAffordabilityCalculator />);
    
    // Check that the component renders with the correct title
    expect(screen.getByText('Investment Budget Calculator')).toBeInTheDocument();
    
    // Check that the form inputs are rendered
    expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    expect(screen.getByText('Monthly Debts & Obligations')).toBeInTheDocument();
    expect(screen.getByText('Monthly Investment Contribution')).toBeInTheDocument();
    expect(screen.getByText('Initial Investment')).toBeInTheDocument();
    expect(screen.getByText('Expected Annual Return')).toBeInTheDocument();
    expect(screen.getByText('Investment Period')).toBeInTheDocument();
    
    // Check that the action buttons are rendered
    expect(screen.getByText('Calculate')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
  
  test('calculates investment potential when Calculate button is clicked', async () => {
    render(<InvestmentAffordabilityCalculator />);
    
    // Click the Calculate button
    fireEvent.click(screen.getByText('Calculate'));
    
    // Check that the results section appears
    expect(await screen.findByText('Investment Potential')).toBeInTheDocument();
    expect(await screen.findByText('Portfolio Growth Over Time')).toBeInTheDocument();
    
    // Check that the charts are rendered
    expect(screen.getAllByTestId('chart-wrapper').length).toBe(2);
    
    // Check that the investment summary is displayed
    expect(screen.getByText(/Investment Summary:/)).toBeInTheDocument();
  });
});
