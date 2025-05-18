import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaPlus, FaTrash, FaEdit, FaSave, FaSnowflake, FaWater, FaChartLine, FaFileDownload, FaPrint } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import NumericInput from '../ui/NumericInput';
import ChartWrapper from '../ui/ChartWrapper';
import AnimatedNumber from '../ui/AnimatedNumber';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useLocale } from '../../contexts/LocaleContext';

/**
 * DebtConsolidationTool component for comparing debt payoff strategies
 * @param {Object} props - Component props
 * @returns {JSX.Element} Debt consolidation tool component
 */
const DebtConsolidationTool = () => {
  // Get locale information
  const { currentLocale } = useLocale();

  // State for debts
  const [debts, setDebts] = useState([
    { id: '1', name: 'Credit Card', balance: 5000, rate: 18.9, minPayment: 150 },
    { id: '2', name: 'Personal Loan', balance: 10000, rate: 9.5, minPayment: 250 },
    { id: '3', name: 'Store Card', balance: 2000, rate: 22.5, minPayment: 60 }
  ]);

  // State for new debt form
  const [newDebt, setNewDebt] = useState({
    name: '',
    balance: 1000,
    rate: 10,
    minPayment: 50
  });

  // State for editing
  const [editingDebt, setEditingDebt] = useState(null);

  // State for extra payment
  const [extraPayment, setExtraPayment] = useState(100);

  // State for results
  const [avalancheResults, setAvalancheResults] = useState(null);
  const [snowballResults, setSnowballResults] = useState(null);
  const [consolidationResults, setConsolidationResults] = useState(null);
  const [activeStrategy, setActiveStrategy] = useState('avalanche');
  const [chartData, setChartData] = useState(null);
  const [payoffChartData, setPayoffChartData] = useState(null);

  // Refs
  const resultsRef = useRef(null);
  const chartRef = useRef(null);

  // Calculate results when debts or extra payment changes
  useEffect(() => {
    if (debts.length > 0) {
      calculateStrategies();
    }
  }, [debts, extraPayment]);

  // Generate a unique ID for new debts
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Add a new debt
  const addDebt = () => {
    if (!newDebt.name || newDebt.balance <= 0 || newDebt.rate <= 0 || newDebt.minPayment <= 0) {
      return; // Validate inputs
    }

    const newDebtWithId = {
      ...newDebt,
      id: generateId()
    };

    setDebts([...debts, newDebtWithId]);

    // Reset form
    setNewDebt({
      name: '',
      balance: 1000,
      rate: 10,
      minPayment: 50
    });
  };

  // Remove a debt
  const removeDebt = (id) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  // Start editing a debt
  const editDebt = (debt) => {
    setEditingDebt({ ...debt });
  };

  // Update the editing debt
  const updateEditingDebt = (field, value) => {
    setEditingDebt(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save the editing debt
  const saveDebt = () => {
    if (!editingDebt.name || editingDebt.balance <= 0 || editingDebt.rate <= 0 || editingDebt.minPayment <= 0) {
      return; // Validate inputs
    }

    setDebts(debts.map(debt =>
      debt.id === editingDebt.id ? editingDebt : debt
    ));

    setEditingDebt(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingDebt(null);
  };

  // Calculate debt payoff strategies
  const calculateStrategies = () => {
    // Calculate total debt
    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0);

    // Calculate avalanche strategy (highest interest rate first)
    const avalancheDebts = [...debts].sort((a, b) => b.rate - a.rate);
    const avalancheResult = calculatePayoffStrategy(avalancheDebts, extraPayment);
    setAvalancheResults(avalancheResult);

    // Calculate snowball strategy (lowest balance first)
    const snowballDebts = [...debts].sort((a, b) => a.balance - b.balance);
    const snowballResult = calculatePayoffStrategy(snowballDebts, extraPayment);
    setSnowballResults(snowballResult);

    // Calculate consolidation option (all debts combined at average rate)
    const avgRate = debts.reduce((sum, debt) => sum + (debt.rate * debt.balance), 0) / totalDebt;
    const consolidationResult = calculateConsolidation(totalDebt, avgRate, totalMinPayment + extraPayment);
    setConsolidationResults(consolidationResult);

    // Prepare chart data
    prepareChartData(avalancheResult, snowballResult, consolidationResult);
    preparePayoffChartData(avalancheResult, snowballResult, consolidationResult);

    // Scroll to results
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Calculate payoff strategy (avalanche or snowball)
  const calculatePayoffStrategy = (sortedDebts, extraPayment) => {
    // Clone debts to avoid modifying the original
    const workingDebts = sortedDebts.map(debt => ({ ...debt }));

    // Initialize results
    const monthlyPayments = [];
    const balances = [];
    const interestPaid = [];
    let totalInterestPaid = 0;
    let monthsToPayoff = 0;
    let totalPaid = 0;

    // Continue until all debts are paid off
    while (workingDebts.some(debt => debt.balance > 0)) {
      monthsToPayoff++;

      let monthlyPayment = 0;
      let monthlyInterest = 0;
      let remainingExtra = extraPayment;

      // Make minimum payments on all debts
      workingDebts.forEach(debt => {
        if (debt.balance <= 0) return;

        // Calculate interest for this month
        const interest = debt.balance * (debt.rate / 100 / 12);
        monthlyInterest += interest;
        totalInterestPaid += interest;

        // Apply minimum payment
        let payment = Math.min(debt.minPayment, debt.balance + interest);
        debt.balance = Math.max(0, debt.balance + interest - payment);
        monthlyPayment += payment;
      });

      // Apply extra payment to highest priority debt (first in the sorted list)
      for (let i = 0; i < workingDebts.length && remainingExtra > 0; i++) {
        const debt = workingDebts[i];
        if (debt.balance <= 0) continue;

        const extraToApply = Math.min(remainingExtra, debt.balance);
        debt.balance -= extraToApply;
        monthlyPayment += extraToApply;
        remainingExtra -= extraToApply;

        if (debt.balance <= 0) {
          // Debt is paid off, redistribute its minimum payment as extra
          remainingExtra += debt.minPayment;
        }
      }

      // Record monthly data
      monthlyPayments.push(monthlyPayment);
      balances.push(workingDebts.reduce((sum, debt) => sum + debt.balance, 0));
      interestPaid.push(monthlyInterest);
      totalPaid += monthlyPayment;
    }

    return {
      monthsToPayoff,
      totalInterestPaid,
      totalPaid,
      monthlyPayments,
      balances,
      interestPaid
    };
  };

  // Calculate consolidation option
  const calculateConsolidation = (totalDebt, rate, monthlyPayment) => {
    // Initialize results
    const monthlyPayments = [];
    const balances = [];
    const interestPaid = [];
    let totalInterestPaid = 0;
    let monthsToPayoff = 0;
    let totalPaid = 0;
    let balance = totalDebt;

    // Continue until debt is paid off
    while (balance > 0) {
      monthsToPayoff++;

      // Calculate interest for this month
      const interest = balance * (rate / 100 / 12);
      totalInterestPaid += interest;

      // Apply payment
      const payment = Math.min(monthlyPayment, balance + interest);
      balance = Math.max(0, balance + interest - payment);

      // Record monthly data
      monthlyPayments.push(payment);
      balances.push(balance);
      interestPaid.push(interest);
      totalPaid += payment;
    }

    return {
      monthsToPayoff,
      totalInterestPaid,
      totalPaid,
      monthlyPayments,
      balances,
      interestPaid
    };
  };

  // Prepare chart data for comparison
  const prepareChartData = (avalanche, snowball, consolidation) => {
    setChartData({
      labels: ['Total Interest Paid', 'Time to Payoff (Months)', 'Total Amount Paid'],
      datasets: [
        {
          label: 'Avalanche Method',
          data: [
            avalanche.totalInterestPaid,
            avalanche.monthsToPayoff,
            avalanche.totalPaid
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        },
        {
          label: 'Snowball Method',
          data: [
            snowball.totalInterestPaid,
            snowball.monthsToPayoff,
            snowball.totalPaid
          ],
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        },
        {
          label: 'Consolidation',
          data: [
            consolidation.totalInterestPaid,
            consolidation.monthsToPayoff,
            consolidation.totalPaid
          ],
          backgroundColor: 'rgba(249, 115, 22, 0.7)',
          borderColor: 'rgba(249, 115, 22, 1)',
          borderWidth: 1
        }
      ]
    });
  };

  // Prepare payoff chart data
  const preparePayoffChartData = (avalanche, snowball, consolidation) => {
    // Find the maximum number of months
    const maxMonths = Math.max(
      avalanche.monthsToPayoff,
      snowball.monthsToPayoff,
      consolidation.monthsToPayoff
    );

    // Create labels for each month
    const labels = Array.from({ length: maxMonths }, (_, i) => `Month ${i + 1}`);

    // Extend arrays to match the maximum length
    const extendArray = (arr, length, fillValue = 0) => {
      if (arr.length >= length) return arr;
      return [...arr, ...Array(length - arr.length).fill(fillValue)];
    };

    setPayoffChartData({
      labels,
      datasets: [
        {
          label: 'Avalanche Method',
          data: extendArray(avalanche.balances, maxMonths),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Snowball Method',
          data: extendArray(snowball.balances, maxMonths),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Consolidation',
          data: extendArray(consolidation.balances, maxMonths),
          borderColor: 'rgba(249, 115, 22, 1)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    return `${currentLocale.currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format months as years and months
  const formatMonths = (months) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  };

  // Export results to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('Debt Payoff Strategy Comparison', 105, 20, { align: 'center' });

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

    // Add debt summary
    doc.setFontSize(14);
    doc.text('Your Debts', 20, 40);

    // Create debt table
    const debtTableBody = debts.map(debt => [
      debt.name,
      formatCurrency(debt.balance),
      `${debt.rate}%`,
      formatCurrency(debt.minPayment)
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Debt Name', 'Balance', 'Interest Rate', 'Minimum Payment']],
      body: debtTableBody,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Add strategy comparison
    doc.setFontSize(14);
    doc.text('Strategy Comparison', 20, doc.lastAutoTable.finalY + 20);

    // Create strategy table
    const strategyTableBody = [
      ['Avalanche Method', formatMonths(avalancheResults.monthsToPayoff), formatCurrency(avalancheResults.totalInterestPaid), formatCurrency(avalancheResults.totalPaid)],
      ['Snowball Method', formatMonths(snowballResults.monthsToPayoff), formatCurrency(snowballResults.totalInterestPaid), formatCurrency(snowballResults.totalPaid)],
      ['Consolidation', formatMonths(consolidationResults.monthsToPayoff), formatCurrency(consolidationResults.totalInterestPaid), formatCurrency(consolidationResults.totalPaid)]
    ];

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 25,
      head: [['Strategy', 'Time to Payoff', 'Total Interest', 'Total Amount Paid']],
      body: strategyTableBody,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Add recommendation
    doc.setFontSize(14);
    doc.text('Recommendation', 20, doc.lastAutoTable.finalY + 20);

    // Determine best strategy
    let bestStrategy;
    if (avalancheResults.totalInterestPaid <= snowballResults.totalInterestPaid &&
        avalancheResults.totalInterestPaid <= consolidationResults.totalInterestPaid) {
      bestStrategy = 'Avalanche Method';
    } else if (snowballResults.totalInterestPaid <= avalancheResults.totalInterestPaid &&
               snowballResults.totalInterestPaid <= consolidationResults.totalInterestPaid) {
      bestStrategy = 'Snowball Method';
    } else {
      bestStrategy = 'Consolidation';
    }

    doc.setFontSize(12);
    doc.text(`Based on your debts, the ${bestStrategy} will save you the most money in interest.`, 20, doc.lastAutoTable.finalY + 30);

    // Add notes
    doc.setFontSize(10);
    doc.text('Notes:', 20, doc.lastAutoTable.finalY + 45);
    doc.text('- Avalanche Method: Pay minimum on all debts, then extra to highest interest rate first', 25, doc.lastAutoTable.finalY + 55);
    doc.text('- Snowball Method: Pay minimum on all debts, then extra to lowest balance first', 25, doc.lastAutoTable.finalY + 65);
    doc.text('- Consolidation: Combine all debts into one loan at the weighted average interest rate', 25, doc.lastAutoTable.finalY + 75);

    // Save the PDF
    doc.save('debt-payoff-comparison.pdf');
  };

  // Print results
  const printResults = () => {
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <html>
        <head>
          <title>Debt Payoff Strategy Comparison</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #3b82f6; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .recommendation { margin-top: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <h1>Debt Payoff Strategy Comparison</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>

          <h2>Your Debts</h2>
          <table>
            <thead>
              <tr>
                <th>Debt Name</th>
                <th>Balance</th>
                <th>Interest Rate</th>
                <th>Minimum Payment</th>
              </tr>
            </thead>
            <tbody>
              ${debts.map(debt => `
                <tr>
                  <td>${debt.name}</td>
                  <td>${formatCurrency(debt.balance)}</td>
                  <td>${debt.rate}%</td>
                  <td>${formatCurrency(debt.minPayment)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Strategy Comparison</h2>
          <table>
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Time to Payoff</th>
                <th>Total Interest</th>
                <th>Total Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Avalanche Method</td>
                <td>${formatMonths(avalancheResults.monthsToPayoff)}</td>
                <td>${formatCurrency(avalancheResults.totalInterestPaid)}</td>
                <td>${formatCurrency(avalancheResults.totalPaid)}</td>
              </tr>
              <tr>
                <td>Snowball Method</td>
                <td>${formatMonths(snowballResults.monthsToPayoff)}</td>
                <td>${formatCurrency(snowballResults.totalInterestPaid)}</td>
                <td>${formatCurrency(snowballResults.totalPaid)}</td>
              </tr>
              <tr>
                <td>Consolidation</td>
                <td>${formatMonths(consolidationResults.monthsToPayoff)}</td>
                <td>${formatCurrency(consolidationResults.totalInterestPaid)}</td>
                <td>${formatCurrency(consolidationResults.totalPaid)}</td>
              </tr>
            </tbody>
          </table>

          <div class="recommendation">
            <h2>Recommendation</h2>
            <p>Based on your debts, the ${
              avalancheResults.totalInterestPaid <= snowballResults.totalInterestPaid &&
              avalancheResults.totalInterestPaid <= consolidationResults.totalInterestPaid ? 'Avalanche Method' :
              snowballResults.totalInterestPaid <= avalancheResults.totalInterestPaid &&
              snowballResults.totalInterestPaid <= consolidationResults.totalInterestPaid ? 'Snowball Method' :
              'Consolidation'
            } will save you the most money in interest.</p>
          </div>

          <h2>Notes</h2>
          <ul>
            <li><strong>Avalanche Method:</strong> Pay minimum on all debts, then extra to highest interest rate first</li>
            <li><strong>Snowball Method:</strong> Pay minimum on all debts, then extra to lowest balance first</li>
            <li><strong>Consolidation:</strong> Combine all debts into one loan at the weighted average interest rate</li>
          </ul>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="debt-consolidation-tool">
      {/* Debt List */}
      <Card className="mb-4">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
            Your Debts
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Debt Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Interest Rate</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Min. Payment</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {debts.map((debt) => (
                  <tr key={debt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{debt.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatCurrency(debt.balance)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{debt.rate}%</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatCurrency(debt.minPayment)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editDebt(debt)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          aria-label={`Edit ${debt.name}`}
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => removeDebt(debt.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          aria-label={`Delete ${debt.name}`}
                          disabled={debts.length <= 1}
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
      {/* Add New Debt */}
      <Card className="mb-4">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
            Add New Debt
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Debt Name
              </label>
              <input
                type="text"
                value={newDebt.name}
                onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                className="input input-loanviz w-full"
                placeholder="Credit Card, Loan, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Balance
              </label>
              <NumericInput
                value={newDebt.balance}
                onChange={(value) => setNewDebt({ ...newDebt, balance: value })}
                min={1}
                max={1000000}
                prefix="£"
                thousandSeparator={true}
                decimalScale={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interest Rate
              </label>
              <NumericInput
                value={newDebt.rate}
                onChange={(value) => setNewDebt({ ...newDebt, rate: value })}
                min={0}
                max={100}
                suffix="%"
                decimalScale={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min. Payment
              </label>
              <NumericInput
                value={newDebt.minPayment}
                onChange={(value) => setNewDebt({ ...newDebt, minPayment: value })}
                min={1}
                max={10000}
                prefix="£"
                thousandSeparator={true}
                decimalScale={2}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={addDebt}
                variant="primary"
                fullWidth
                icon={<FaPlus className="h-4 w-4" />}
              >
                Add Debt
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Extra Payment */}
      <Card className="mb-4">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
            Extra Monthly Payment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                How much extra can you pay each month beyond the minimum payments?
              </p>
              <NumericInput
                value={extraPayment}
                onChange={setExtraPayment}
                min={0}
                max={10000}
                prefix="£"
                thousandSeparator={true}
                decimalScale={2}
              />
            </div>

            <div className="flex items-end justify-end">
              <Button
                onClick={calculateStrategies}
                variant="primary"
                size="lg"
                icon={<FaChartLine className="h-4 w-4" />}
              >
                Calculate Strategies
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {avalancheResults && snowballResults && consolidationResults && (
        <div ref={resultsRef}>
          {/* Strategy Tabs */}
          <Card className="mb-4">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Debt Payoff Strategies
                </h3>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToPDF}
                    icon={<FaFileDownload className="h-4 w-4" />}
                  >
                    Export PDF
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={printResults}
                    icon={<FaPrint className="h-4 w-4" />}
                  >
                    Print
                  </Button>
                </div>
              </div>

              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                  className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                    activeStrategy === 'avalanche'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveStrategy('avalanche')}
                >
                  <div className="flex items-center">
                    <FaWater className="mr-2 h-4 w-4" />
                    Avalanche Method
                  </div>
                </button>

                <button
                  className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                    activeStrategy === 'snowball'
                      ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveStrategy('snowball')}
                >
                  <div className="flex items-center">
                    <FaSnowflake className="mr-2 h-4 w-4" />
                    Snowball Method
                  </div>
                </button>

                <button
                  className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                    activeStrategy === 'consolidation'
                      ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveStrategy('consolidation')}
                >
                  <div className="flex items-center">
                    <FaCreditCard className="mr-2 h-4 w-4" />
                    Consolidation
                  </div>
                </button>
              </div>

              {/* Strategy Content */}
              <div className="strategy-content">
                {activeStrategy === 'avalanche' && (
                  <div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                      <h4 className="text-md font-semibold mb-2 text-blue-700 dark:text-blue-300">
                        Avalanche Method
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                        Pay minimum on all debts, then put extra money toward the debt with the highest interest rate.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-blue-500 dark:text-blue-300">Time to Payoff</p>
                          <p className="text-lg font-bold text-blue-700 dark:text-blue-200">
                            {formatMonths(avalancheResults.monthsToPayoff)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-500 dark:text-blue-300">Total Interest</p>
                          <p className="text-lg font-bold text-blue-700 dark:text-blue-200">
                            {formatCurrency(avalancheResults.totalInterestPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-500 dark:text-blue-300">Total Amount Paid</p>
                          <p className="text-lg font-bold text-blue-700 dark:text-blue-200">
                            {formatCurrency(avalancheResults.totalPaid)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStrategy === 'snowball' && (
                  <div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                      <h4 className="text-md font-semibold mb-2 text-green-700 dark:text-green-300">
                        Snowball Method
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                        Pay minimum on all debts, then put extra money toward the debt with the lowest balance.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-green-500 dark:text-green-300">Time to Payoff</p>
                          <p className="text-lg font-bold text-green-700 dark:text-green-200">
                            {formatMonths(snowballResults.monthsToPayoff)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-green-500 dark:text-green-300">Total Interest</p>
                          <p className="text-lg font-bold text-green-700 dark:text-green-200">
                            {formatCurrency(snowballResults.totalInterestPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-green-500 dark:text-green-300">Total Amount Paid</p>
                          <p className="text-lg font-bold text-green-700 dark:text-green-200">
                            {formatCurrency(snowballResults.totalPaid)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStrategy === 'consolidation' && (
                  <div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-4">
                      <h4 className="text-md font-semibold mb-2 text-orange-700 dark:text-orange-300">
                        Consolidation
                      </h4>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                        Combine all debts into one loan at the weighted average interest rate.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-orange-500 dark:text-orange-300">Time to Payoff</p>
                          <p className="text-lg font-bold text-orange-700 dark:text-orange-200">
                            {formatMonths(consolidationResults.monthsToPayoff)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-orange-500 dark:text-orange-300">Total Interest</p>
                          <p className="text-lg font-bold text-orange-700 dark:text-orange-200">
                            {formatCurrency(consolidationResults.totalInterestPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-orange-500 dark:text-orange-300">Total Amount Paid</p>
                          <p className="text-lg font-bold text-orange-700 dark:text-orange-200">
                            {formatCurrency(consolidationResults.totalPaid)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Comparison Chart */}
          <Card className="mb-4" ref={chartRef}>
            <div className="p-4">
              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                Strategy Comparison
              </h3>

              <div className="h-80 mb-6">
                <ChartWrapper
                  type="bar"
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                      x: {
                        ticks: {
                          callback: function(value) {
                            if (value >= 1000000) {
                              return '£' + (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                              return '£' + (value / 1000).toFixed(0) + 'K';
                            }
                            return value;
                          }
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const value = context.parsed.x;
                            const dataIndex = context.dataIndex;

                            if (dataIndex === 0) {
                              return `${context.dataset.label}: ${formatCurrency(value)}`;
                            } else if (dataIndex === 1) {
                              return `${context.dataset.label}: ${formatMonths(value)}`;
                            } else {
                              return `${context.dataset.label}: ${formatCurrency(value)}`;
                            }
                          }
                        }
                      }
                    }
                  }}
                />
              </div>

              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                Balance Payoff Over Time
              </h3>

              <div className="h-80">
                <ChartWrapper
                  type="line"
                  data={payoffChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'Remaining Balance (£)',
                          font: {
                            weight: 'bold',
                            size: 12
                          }
                        },
                        ticks: {
                          callback: function(value) {
                            if (value >= 1000000) {
                              return '£' + (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                              return '£' + (value / 1000).toFixed(0) + 'K';
                            }
                            return '£' + value;
                          }
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Month',
                          font: {
                            weight: 'bold',
                            size: 12
                          }
                        },
                        ticks: {
                          maxTicksLimit: 12,
                          callback: function(value, index) {
                            if (index % 6 === 0) {
                              return `Month ${index + 1}`;
                            }
                            return '';
                          }
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const value = context.parsed.y;
                            return `${context.dataset.label}: ${formatCurrency(value)}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Recommendation */}
          <Card className="mb-4">
            <div className="p-4">
              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                Recommendation
              </h3>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">
                  {avalancheResults.totalInterestPaid <= snowballResults.totalInterestPaid &&
                   avalancheResults.totalInterestPaid <= consolidationResults.totalInterestPaid ? (
                    <>
                      <FaWater className="inline-block mr-2 h-5 w-5 text-blue-600" />
                      Avalanche Method
                    </>
                  ) : snowballResults.totalInterestPaid <= avalancheResults.totalInterestPaid &&
                     snowballResults.totalInterestPaid <= consolidationResults.totalInterestPaid ? (
                    <>
                      <FaSnowflake className="inline-block mr-2 h-5 w-5 text-green-600" />
                      Snowball Method
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="inline-block mr-2 h-5 w-5 text-orange-600" />
                      Consolidation
                    </>
                  )}
                </h4>

                <p className="text-gray-700 dark:text-gray-300">
                  Based on your debts, the {
                    avalancheResults.totalInterestPaid <= snowballResults.totalInterestPaid &&
                    avalancheResults.totalInterestPaid <= consolidationResults.totalInterestPaid ? 'Avalanche Method' :
                    snowballResults.totalInterestPaid <= avalancheResults.totalInterestPaid &&
                    snowballResults.totalInterestPaid <= consolidationResults.totalInterestPaid ? 'Snowball Method' :
                    'Consolidation'
                  } will save you the most money in interest.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h5 className="text-sm font-semibold mb-1 text-blue-700 dark:text-blue-300">Avalanche Method</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Pay minimum on all debts, then extra to highest interest rate first.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <span className="font-semibold">Best for:</span> Saving the most money in interest.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h5 className="text-sm font-semibold mb-1 text-green-700 dark:text-green-300">Snowball Method</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Pay minimum on all debts, then extra to lowest balance first.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <span className="font-semibold">Best for:</span> Psychological wins from paying off debts quickly.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h5 className="text-sm font-semibold mb-1 text-orange-700 dark:text-orange-300">Consolidation</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Combine all debts into one loan at the weighted average interest rate.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <span className="font-semibold">Best for:</span> Simplifying payments and potentially lower rates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Debt Modal */}
      <AnimatePresence>
        {editingDebt && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                  Edit Debt
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Debt Name
                    </label>
                    <input
                      type="text"
                      value={editingDebt.name}
                      onChange={(e) => updateEditingDebt('name', e.target.value)}
                      className="input input-loanviz w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Balance
                    </label>
                    <NumericInput
                      value={editingDebt.balance}
                      onChange={(value) => updateEditingDebt('balance', value)}
                      min={1}
                      max={1000000}
                      prefix="£"
                      thousandSeparator={true}
                      decimalScale={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interest Rate
                    </label>
                    <NumericInput
                      value={editingDebt.rate}
                      onChange={(value) => updateEditingDebt('rate', value)}
                      min={0}
                      max={100}
                      suffix="%"
                      decimalScale={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Minimum Payment
                    </label>
                    <NumericInput
                      value={editingDebt.minPayment}
                      onChange={(value) => updateEditingDebt('minPayment', value)}
                      min={1}
                      max={10000}
                      prefix="£"
                      thousandSeparator={true}
                      decimalScale={2}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={cancelEditing}
                    className="text-white dark:text-white"
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="primary"
                    onClick={saveDebt}
                    icon={<FaSave className="h-4 w-4" />}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DebtConsolidationTool;
