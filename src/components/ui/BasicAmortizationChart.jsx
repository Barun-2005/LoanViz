import React from 'react';
import { useLocale } from '../../contexts/LocaleContext';

/**
 * BasicAmortizationChart - An extremely simple chart component for amortization data
 * @param {Object} props - Component props
 * @param {Array} props.schedule - Amortization schedule array
 * @returns {JSX.Element} Basic amortization chart
 */
const BasicAmortizationChart = ({ schedule }) => {
  // Get locale information
  const { currentLocale } = useLocale();

  // Only use first 12 months of data for simplicity
  const limitedSchedule = schedule && schedule.length > 0
    ? schedule.slice(0, Math.min(12, schedule.length))
    : [];

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

  // Calculate year 1 totals
  const principalYear1 = limitedSchedule.reduce((sum, payment) => sum + payment.principalPayment, 0);
  const interestYear1 = limitedSchedule.reduce((sum, payment) => sum + payment.interestPayment, 0);
  const remainingBalance = limitedSchedule.length > 0 ? limitedSchedule[limitedSchedule.length - 1].balance : 0;

  return (
    <div className="basic-amortization-chart">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        First Year Payment Breakdown
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principal (Year 1)</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(principalYear1)}
          </p>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest (Year 1)</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(interestYear1)}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remaining Balance</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(remainingBalance)}
          </p>
        </div>
      </div>

      {/* Simple color legend */}
      <div className="flex justify-center gap-6 mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Principal</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-indigo-500 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Interest</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Balance</span>
        </div>
      </div>

      {/* Super simple bar representation */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Composition</p>
          <div className="h-8 flex rounded-md overflow-hidden">
            <div
              className="bg-blue-500"
              style={{ width: `${(principalYear1 / (principalYear1 + interestYear1)) * 100}%` }}
            ></div>
            <div
              className="bg-indigo-500"
              style={{ width: `${(interestYear1 / (principalYear1 + interestYear1)) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round((principalYear1 / (principalYear1 + interestYear1)) * 100)}% Principal
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round((interestYear1 / (principalYear1 + interestYear1)) * 100)}% Interest
            </span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Payment Trend</p>
          <div className="flex items-end h-8 space-x-1">
            {limitedSchedule.map((payment, index) => (
              <div
                key={index}
                className="bg-blue-500 w-full"
                style={{
                  height: `${(payment.principalPayment / (payment.principalPayment + payment.interestPayment)) * 100}%`,
                  backgroundColor: index % 2 === 0 ? '#3b82f6' : '#4f46e5'
                }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Month 1</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Month 12</span>
          </div>
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Principal</th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interest</th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {limitedSchedule.map((payment, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Month {payment.month}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium">{formatCurrency(payment.principalPayment)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400 font-medium">{formatCurrency(payment.interestPayment)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">{formatCurrency(payment.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BasicAmortizationChart;
