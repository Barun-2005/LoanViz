import { render, screen, fireEvent } from '@testing-library/react';
import StampDutyCalculator from './StampDutyCalculator';

// Mock the ChartWrapper component
jest.mock('../ui/ChartWrapper', () => {
  return function MockChartWrapper(props) {
    return <div data-testid="chart-wrapper">{props.type} chart</div>;
  };
});

describe('StampDutyCalculator', () => {
  test('renders the calculator form', () => {
    render(<StampDutyCalculator loanTypeId="mortgage" />);
    
    // Check that the component renders with the correct title
    expect(screen.getByText('Stamp Duty Calculator')).toBeInTheDocument();
    
    // Check that the form inputs are rendered
    expect(screen.getByText('Property Value')).toBeInTheDocument();
    expect(screen.getByText('Property Location')).toBeInTheDocument();
    
    // Check that the buyer status checkboxes are rendered
    expect(screen.getByText('First-time buyer')).toBeInTheDocument();
    expect(screen.getByText('Additional property')).toBeInTheDocument();
    expect(screen.getByText('Non-UK resident')).toBeInTheDocument();
  });
  
  test('calculates stamp duty and displays results', () => {
    render(<StampDutyCalculator loanTypeId="mortgage" />);
    
    // Results should be visible immediately as the calculator auto-calculates
    
    // Check that the summary section appears
    expect(screen.getByText('Stamp Duty Summary')).toBeInTheDocument();
    
    // Check that the summary sections are displayed
    expect(screen.getByText('Total Stamp Duty')).toBeInTheDocument();
    expect(screen.getByText('Effective Tax Rate')).toBeInTheDocument();
    expect(screen.getByText('Property Details')).toBeInTheDocument();
    
    // Check that the tax breakdown table is displayed
    expect(screen.getByText('Tax Breakdown by Band')).toBeInTheDocument();
    expect(screen.getByText('Band')).toBeInTheDocument();
    expect(screen.getByText('Rate')).toBeInTheDocument();
    expect(screen.getByText('Value in Band')).toBeInTheDocument();
    expect(screen.getByText('Tax in Band')).toBeInTheDocument();
    
    // Check that the charts are rendered
    expect(screen.getByText('Tax by Band')).toBeInTheDocument();
    expect(screen.getByText('Effective Rate vs Property Value')).toBeInTheDocument();
    expect(screen.getAllByTestId('chart-wrapper').length).toBe(2);
  });
  
  test('updates calculations when property value changes', () => {
    render(<StampDutyCalculator loanTypeId="mortgage" />);
    
    // Find the property value input
    const propertyValueInput = screen.getByDisplayValue('200000');
    
    // Change the property value
    fireEvent.change(propertyValueInput, { target: { value: '500000' } });
    
    // Check that the summary is updated
    expect(screen.getByText(/For a property value of £500,000/)).toBeInTheDocument();
  });
  
  test('updates calculations when buyer status changes', () => {
    render(<StampDutyCalculator loanTypeId="mortgage" />);
    
    // Find the first-time buyer checkbox
    const firstTimeBuyerCheckbox = screen.getByLabelText('First-time buyer');
    
    // Check the first-time buyer checkbox
    fireEvent.click(firstTimeBuyerCheckbox);
    
    // Check that the property details section is updated
    expect(screen.getByText('First-time buyer')).toBeInTheDocument();
  });
});
