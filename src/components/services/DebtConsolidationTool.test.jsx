import { render, screen, fireEvent } from '@testing-library/react';
import DebtConsolidationTool from './DebtConsolidationTool';

// Mock the ChartWrapper component
jest.mock('../ui/ChartWrapper', () => {
  return function MockChartWrapper(props) {
    return <div data-testid="chart-wrapper">{props.type} chart</div>;
  };
});

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => {
    return {
      text: jest.fn(),
      setFontSize: jest.fn(),
      autoTable: jest.fn().mockReturnValue({
        finalY: 100
      }),
      save: jest.fn()
    };
  });
});

// Mock jspdf-autotable
jest.mock('jspdf-autotable', () => ({}));

describe('DebtConsolidationTool', () => {
  test('renders the debt list and form', () => {
    render(<DebtConsolidationTool />);
    
    // Check that the component renders with the correct title
    expect(screen.getByText('Your Debts')).toBeInTheDocument();
    
    // Check that the initial debts are rendered
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    expect(screen.getByText('Personal Loan')).toBeInTheDocument();
    expect(screen.getByText('Store Card')).toBeInTheDocument();
    
    // Check that the add debt form is rendered
    expect(screen.getByText('Add New Debt')).toBeInTheDocument();
    expect(screen.getByText('Debt Name')).toBeInTheDocument();
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('Interest Rate')).toBeInTheDocument();
    expect(screen.getByText('Min. Payment')).toBeInTheDocument();
    expect(screen.getByText('Add Debt')).toBeInTheDocument();
    
    // Check that the extra payment section is rendered
    expect(screen.getByText('Extra Monthly Payment')).toBeInTheDocument();
    expect(screen.getByText('Calculate Strategies')).toBeInTheDocument();
  });
  
  test('calculates debt payoff strategies when Calculate Strategies button is clicked', () => {
    render(<DebtConsolidationTool />);
    
    // Click the Calculate Strategies button
    fireEvent.click(screen.getByText('Calculate Strategies'));
    
    // Check that the results section appears
    expect(screen.getByText('Debt Payoff Strategies')).toBeInTheDocument();
    
    // Check that all three strategies are available
    expect(screen.getByText('Avalanche Method')).toBeInTheDocument();
    expect(screen.getByText('Snowball Method')).toBeInTheDocument();
    expect(screen.getByText('Consolidation')).toBeInTheDocument();
    
    // Check that the charts are rendered
    expect(screen.getAllByTestId('chart-wrapper').length).toBe(2);
    
    // Check that the recommendation section is displayed
    expect(screen.getByText('Recommendation')).toBeInTheDocument();
    
    // Check that the export/print buttons are available
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
    expect(screen.getByText('Print')).toBeInTheDocument();
  });
});
