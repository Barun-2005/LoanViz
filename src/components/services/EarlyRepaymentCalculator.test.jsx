import { render, screen, fireEvent } from '@testing-library/react';
import EarlyRepaymentCalculator from './EarlyRepaymentCalculator';

// Mock the ChartWrapper component
jest.mock('../ui/ChartWrapper', () => {
  return function MockChartWrapper(props) {
    return <div data-testid="chart-wrapper">{props.type} chart</div>;
  };
});

// Mock useLoanCalculations hook
jest.mock('../../hooks/useLoanCalculations', () => {
  return () => ({
    calculateLoan: jest.fn().mockResolvedValue({
      principal: 200000,
      rate: 3.5,
      termYears: 25,
      monthlyPayment: 1000,
      totalInterest: 100000,
      totalRepayment: 300000
    }),
    isCalculating: false,
    amortizationSchedule: Array(300).fill().map((_, i) => ({
      month: i + 1,
      payment: 1000,
      principalPayment: 600 + (i * 0.5),
      interestPayment: 400 - (i * 0.5),
      balance: 200000 - (600 * i) - (i * (i - 1) * 0.25)
    }))
  });
});

describe('EarlyRepaymentCalculator', () => {
  test('renders the extra payments form', () => {
    render(
      <EarlyRepaymentCalculator
        loanTypeId="mortgage"
        loanDetails={{
          principal: 200000,
          rate: 3.5,
          termYears: 25,
          monthlyPayment: 1000,
          totalInterest: 100000,
          totalRepayment: 300000
        }}
        schedule={[]}
      />
    );
    
    // Check that the component renders with the correct title
    expect(screen.getByText('Add Extra Payments')).toBeInTheDocument();
    
    // Check that the form inputs are rendered
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Frequency')).toBeInTheDocument();
    expect(screen.getByText('Start Month')).toBeInTheDocument();
    expect(screen.getByText('Add Payment')).toBeInTheDocument();
  });
  
  test('displays results when extra payments are added', () => {
    const mockSchedule = Array(300).fill().map((_, i) => ({
      month: i + 1,
      payment: 1000,
      principalPayment: 600 + (i * 0.5),
      interestPayment: 400 - (i * 0.5),
      balance: 200000 - (600 * i) - (i * (i - 1) * 0.25)
    }));
    
    render(
      <EarlyRepaymentCalculator
        loanTypeId="mortgage"
        loanDetails={{
          principal: 200000,
          rate: 3.5,
          termYears: 25,
          monthlyPayment: 1000,
          totalInterest: 100000,
          totalRepayment: 300000
        }}
        schedule={mockSchedule}
      />
    );
    
    // Check that the results section appears
    expect(screen.getByText('Early Repayment Summary')).toBeInTheDocument();
    
    // Check that the summary sections are displayed
    expect(screen.getByText('Time Saved')).toBeInTheDocument();
    expect(screen.getByText('Interest Saved')).toBeInTheDocument();
    expect(screen.getByText('Return on Investment')).toBeInTheDocument();
    
    // Check that the chart is rendered
    expect(screen.getByText('Balance Comparison')).toBeInTheDocument();
    expect(screen.getByTestId('chart-wrapper')).toBeInTheDocument();
  });
});
