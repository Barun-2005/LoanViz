import React from 'react';
import { useLocale } from '../../contexts/LocaleContext';

/**
 * SimpleAmortizationChart - A basic chart component for amortization data
 * @param {Object} props - Component props
 * @param {Array} props.schedule - Amortization schedule array
 * @returns {JSX.Element} Simple amortization chart
 */
const SimpleAmortizationChart = ({ schedule }) => {
  // Get locale information
  const { currentLocale } = useLocale();

  // Only use first 12 months of data for simplicity
  const limitedSchedule = schedule && schedule.length > 0
    ? schedule.slice(0, Math.min(12, schedule.length))
    : [];

  // Calculate max values for scaling
  const maxPayment = limitedSchedule.length > 0
    ? Math.max(...limitedSchedule.map(item => item.payment || 0))
    : 0;

  const maxBalance = limitedSchedule.length > 0
    ? Math.max(...limitedSchedule.map(item => item.balance || 0))
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

  return (
    <div className="simple-amortization-chart p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        First Year Payment Breakdown
      </h3>

      {limitedSchedule.length > 0 ? (
        <div className="chart-container">
          {/* Chart Legend */}
          <div className="flex justify-center gap-4 mb-4">
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

          {/* Simple Bar Chart */}
          <div className="relative h-64 mt-6">
            <div className="absolute inset-0 flex items-end justify-between">
              {limitedSchedule.map((payment, index) => (
                <div key={index} className="flex flex-col items-center w-full">
                  {/* Principal Bar */}
                  <div
                    className="w-4 bg-blue-500 rounded-t-sm mx-auto"
                    style={{
                      height: `${(payment.principalPayment / maxPayment) * 100}%`,
                      maxHeight: '80%'
                    }}
                  ></div>

                  {/* Interest Bar */}
                  <div
                    className="w-4 bg-indigo-500 rounded-t-sm mx-auto mt-1"
                    style={{
                      height: `${(payment.interestPayment / maxPayment) * 100}%`,
                      maxHeight: '80%'
                    }}
                  ></div>

                  {/* Month Label */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {payment.month}
                  </div>
                </div>
              ))}
            </div>

            {/* Balance Line */}
            <div className="absolute inset-0 pointer-events-none">
              {limitedSchedule.map((payment, index) => {
                if (index === limitedSchedule.length - 1) return null;

                const currentX = (index / (limitedSchedule.length - 1)) * 100;
                const nextX = ((index + 1) / (limitedSchedule.length - 1)) * 100;
                const currentY = 100 - ((payment.balance / maxBalance) * 80);
                const nextY = 100 - ((limitedSchedule[index + 1].balance / maxBalance) * 80);

                return (
                  <svg key={index} className="absolute inset-0 h-full w-full">
                    <line
                      x1={`${currentX}%`}
                      y1={`${currentY}%`}
                      x2={`${nextX}%`}
                      y2={`${nextY}%`}
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                    <circle
                      cx={`${currentX}%`}
                      cy={`${currentY}%`}
                      r="3"
                      fill="#10b981"
                    />
                  </svg>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Principal (Year 1)</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(limitedSchedule.reduce((sum, payment) => sum + payment.principalPayment, 0))}
              </p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Interest (Year 1)</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(limitedSchedule.reduce((sum, payment) => sum + payment.interestPayment, 0))}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Remaining Balance</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(limitedSchedule[limitedSchedule.length - 1]?.balance || 0)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">No data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAmortizationChart;
