import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChartBar, FaTable, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ResponsiveContainer from './ResponsiveContainer';
import ResponsiveGrid from './ResponsiveGrid';
import { useLocale } from '../../contexts/LocaleContext';

/**
 * EnhancedAmortizationChart - A more professional chart component for amortization data
 * @param {Object} props - Component props
 * @param {Array} props.schedule - Amortization schedule array
 * @returns {JSX.Element} Enhanced amortization chart with yearly view and tabs
 */
const EnhancedAmortizationChart = ({ schedule }) => {
  // Get locale information
  const { currentLocale } = useLocale();

  const [activeTab, setActiveTab] = useState('visual');
  const [currentYear, setCurrentYear] = useState(1);

  // Calculate total years in the schedule
  const totalYears = schedule && schedule.length > 0
    ? Math.ceil(schedule.length / 12)
    : 0;

  // Format currency
  const formatCurrency = (value) => {
    // Map locale to currency code
    const currencyCodes = {
      'en-GB': 'GBP',
      'en-IN': 'INR',
      'en-US': 'USD'
    };

    // Get the currency code based on locale, with fallback to GBP
    const currencyCode = currencyCodes[currentLocale.locale] || 'GBP';

    return new Intl.NumberFormat(currentLocale.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get data for the current year
  const getYearData = (yearNum) => {
    if (!schedule || schedule.length === 0) return { payments: [], totals: { principal: 0, interest: 0 } };

    const startIndex = (yearNum - 1) * 12;
    const endIndex = Math.min(startIndex + 12, schedule.length);
    const yearPayments = schedule.slice(startIndex, endIndex);

    const principalTotal = yearPayments.reduce((sum, payment) => sum + payment.principalPayment, 0);
    const interestTotal = yearPayments.reduce((sum, payment) => sum + payment.interestPayment, 0);
    const startBalance = yearPayments.length > 0 ? (startIndex > 0 ? schedule[startIndex - 1].balance : schedule[0].loanAmount) : 0;
    const endBalance = yearPayments.length > 0 ? yearPayments[yearPayments.length - 1].balance : 0;

    return {
      payments: yearPayments,
      totals: {
        principal: principalTotal,
        interest: interestTotal,
        startBalance,
        endBalance
      }
    };
  };

  const currentYearData = getYearData(currentYear);

  // Calculate cumulative totals up to the current year
  const getCumulativeTotals = (yearNum) => {
    if (!schedule || schedule.length === 0) return { principal: 0, interest: 0 };

    const endIndex = Math.min(yearNum * 12, schedule.length);
    const payments = schedule.slice(0, endIndex);

    return {
      principal: payments.reduce((sum, payment) => sum + payment.principalPayment, 0),
      interest: payments.reduce((sum, payment) => sum + payment.interestPayment, 0)
    };
  };

  const cumulativeTotals = getCumulativeTotals(currentYear);

  // Navigate between years
  const goToPreviousYear = () => {
    if (currentYear > 1) {
      setCurrentYear(currentYear - 1);
    }
  };

  const goToNextYear = () => {
    if (currentYear < totalYears) {
      setCurrentYear(currentYear + 1);
    }
  };

  return (
    <div className="enhanced-amortization-chart">
      {/* Tabs for switching between chart and table views - Styled as pills */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 shadow-inner">
          <motion.button
            className={`py-1.5 px-4 rounded-full text-sm font-medium focus:outline-none transition-all duration-200 ${
              activeTab === 'visual'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('visual')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaChartBar className="inline mr-1.5 text-xs" />
            Graph
          </motion.button>

          <motion.button
            className={`py-1.5 px-4 rounded-full text-sm font-medium focus:outline-none transition-all duration-200 ${
              activeTab === 'table'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('table')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaTable className="inline mr-1.5 text-xs" />
            Table
          </motion.button>
        </div>
      </div>

      {/* Year navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
          <span className="hidden sm:inline">{activeTab === 'visual' ? 'Payment Breakdown' : 'Payment Details'} - </span>
          Year {currentYear} of {totalYears}
        </h3>

        <div className="flex space-x-2">
          <button
            onClick={goToPreviousYear}
            disabled={currentYear === 1}
            className={`p-2 rounded-full ${
              currentYear === 1
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20'
            }`}
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={goToNextYear}
            disabled={currentYear === totalYears}
            className={`p-2 rounded-full ${
              currentYear === totalYears
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20'
            }`}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Visual Chart Tab */}
      {activeTab === 'visual' && (
        <div className="visual-chart-content">
          {/* Year summary cards */}
          <ResponsiveGrid cols={3} tabletCols={2} mobileCols={1} gap="4" className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principal (Year {currentYear})</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(currentYearData.totals.principal)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total to date: {formatCurrency(cumulativeTotals.principal)}
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest (Year {currentYear})</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(currentYearData.totals.interest)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total to date: {formatCurrency(cumulativeTotals.interest)}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Balance Reduction</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(currentYearData.totals.startBalance - currentYearData.totals.endBalance)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ending balance: {formatCurrency(currentYearData.totals.endBalance)}
              </p>
            </div>
          </ResponsiveGrid>

          {/* Payment composition bar */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year {currentYear} Payment Composition</p>
            <div className="h-10 flex rounded-md overflow-hidden">
              <div
                className="bg-blue-500"
                style={{
                  width: `${(currentYearData.totals.principal / (currentYearData.totals.principal + currentYearData.totals.interest)) * 100}%`
                }}
              ></div>
              <div
                className="bg-indigo-500"
                style={{
                  width: `${(currentYearData.totals.interest / (currentYearData.totals.principal + currentYearData.totals.interest)) * 100}%`
                }}
              ></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between mt-2 gap-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Principal: {Math.round((currentYearData.totals.principal / (currentYearData.totals.principal + currentYearData.totals.interest)) * 100)}%
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-indigo-500 rounded-sm mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Interest: {Math.round((currentYearData.totals.interest / (currentYearData.totals.principal + currentYearData.totals.interest)) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Monthly trend chart */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Payment Breakdown</p>
            <ResponsiveContainer className="h-40 sm:h-48 md:h-56" enableScroll={true}>
              <div className="h-full flex items-end space-x-1 min-w-[500px]">
              {currentYearData.payments.map((payment, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full flex flex-col-reverse h-32">
                    <div
                      className="bg-blue-500 w-full"
                      style={{
                        height: `${(payment.principalPayment / payment.payment) * 100}%`
                      }}
                    ></div>
                    <div
                      className="bg-indigo-500 w-full"
                      style={{
                        height: `${(payment.interestPayment / payment.payment) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{index + 1 + (currentYear - 1) * 12}</span>
                </div>
              ))}
              </div>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Table Tab */}
      {activeTab === 'table' && (
        <div className="table-content">
          <ResponsiveContainer enableScroll={true} className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                  <th scope="col" className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Principal</th>
                  <th scope="col" className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interest</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {currentYearData.payments.map((payment, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Month {payment.month}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-medium">{formatCurrency(payment.payment)}</td>
                    <td className="hidden sm:table-cell px-3 py-2 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium">{formatCurrency(payment.principalPayment)}</td>
                    <td className="hidden sm:table-cell px-3 py-2 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400 font-medium">{formatCurrency(payment.interestPayment)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">{formatCurrency(payment.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default EnhancedAmortizationChart;
