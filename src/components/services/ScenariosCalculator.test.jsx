import { render, screen, fireEvent } from '@testing-library/react';
import ScenariosCalculator from './ScenariosCalculator';

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
      totalRepayment: 300000,
      amortizationSchedule: Array(300).fill().map((_, i) => ({
        month: i + 1,
        payment: 1000,
        principalPayment: 600 + (i * 0.5),
        interestPayment: 400 - (i * 0.5),
        balance: 200000 - (600 * i) - (i * (i - 1) * 0.25)
      }))
    }),
    isCalculating: false
  });
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ScenariosCalculator', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the scenarios list and add button', () => {
    render(
      <ScenariosCalculator
        loanTypeId="mortgage"
        initialScenario={{
          name: 'Scenario 1',
          principal: 200000,
          rate: 3.5,
          termYears: 25,
          type: 'repayment',
          extraPayment: 0
        }}
        ranges={{
          principal: { min: 10000, max: 1000000, step: 1000 },
          rate: { min: 0.1, max: 15, step: 0.1 },
          termYears: { min: 5, max: 35, step: 1 },
          extraPayment: { min: 0, max: 2000, step: 10 }
        }}
      />
    );
    
    // Check that the component renders with the correct title
    expect(screen.getByText('Loan Scenarios')).toBeInTheDocument();
    
    // Check that the add scenario button is rendered
    expect(screen.getByText('Add Scenario')).toBeInTheDocument();
    
    // Check that the table headers are rendered
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Rate')).toBeInTheDocument();
    expect(screen.getByText('Term')).toBeInTheDocument();
    expect(screen.getByText('Extra')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Total Interest')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
  
  test('displays comparison charts when scenarios are available', async () => {
    render(
      <ScenariosCalculator
        loanTypeId="mortgage"
        initialScenario={{
          name: 'Scenario 1',
          principal: 200000,
          rate: 3.5,
          termYears: 25,
          type: 'repayment',
          extraPayment: 0
        }}
        ranges={{
          principal: { min: 10000, max: 1000000, step: 1000 },
          rate: { min: 0.1, max: 15, step: 0.1 },
          termYears: { min: 5, max: 35, step: 1 },
          extraPayment: { min: 0, max: 2000, step: 10 }
        }}
      />
    );
    
    // Wait for the scenarios to be calculated
    expect(await screen.findByText('Scenario Comparison')).toBeInTheDocument();
    
    // Check that the chart buttons are rendered
    expect(screen.getByText('Monthly Payment')).toBeInTheDocument();
    expect(screen.getByText('Total Interest')).toBeInTheDocument();
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    
    // Check that the charts are rendered
    expect(screen.getAllByTestId('chart-wrapper').length).toBe(1);
    
    // Check that the detailed comparison table is displayed
    expect(screen.getByText('Detailed Comparison')).toBeInTheDocument();
  });
});
