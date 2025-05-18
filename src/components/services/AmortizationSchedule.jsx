import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaTable, FaFileDownload, FaPrint, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { GlassCard, GlowButton, AnimatedNumberDisplay } from '../ui/modern';
import AnimatedNumber from '../ui/AnimatedNumber';
import EnhancedAmortizationChart from '../ui/EnhancedAmortizationChart';
import ResponsiveContainer from '../ui/ResponsiveContainer';
import ResponsiveGrid from '../ui/ResponsiveGrid';
import RegulatoryDisclaimer from '../ui/RegulatoryDisclaimer';
import { exportToCSV } from '../../utils/mortgage';
// Import jsPDF and jspdf-autotable properly
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLocale } from '../../contexts/LocaleContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * AmortizationSchedule component for displaying loan amortization details
 * @param {Object} props - Component props
 * @param {string} props.loanTypeId - Type of loan (e.g., 'mortgage', 'personal', 'auto')
 * @param {Object} props.loanDetails - Loan details object
 * @param {Array} props.schedule - Amortization schedule array
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.hasCalculated - Whether a calculation has been performed
 * @returns {JSX.Element} Amortization schedule component
 */
const AmortizationSchedule = ({
  loanTypeId = 'mortgage',
  loanDetails = {
    principal: 0,
    rate: 0,
    termYears: 0,
    monthlyPayment: 0,
    totalInterest: 0,
    totalRepayment: 0,
  },
  schedule = [],
  loading = false,
  hasCalculated = false,
}) => {
  // Get locale information and theme
  const { currentLocale } = useLocale();
  const { isDarkMode } = useTheme();

  // Track theme changes with local state
  const [localIsDarkMode, setLocalIsDarkMode] = useState(isDarkMode);

  // Update local dark mode state when theme context changes
  useEffect(() => {
    setLocalIsDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Also listen for theme changes at the document level as a fallback
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newIsDarkMode = document.documentElement.classList.contains('dark');
          setLocalIsDarkMode(newIsDarkMode);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const [expandedYears, setExpandedYears] = useState({});
  const [activeTab, setActiveTab] = useState('chart');
  const tableRef = useRef(null);
  const chartRef = useRef(null);
  const resultSectionRef = useRef(null);

  // Function to scroll to results section
  const scrollToResults = () => {
    if (resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Function to scroll to active tab content
  const scrollToTabContent = (tab) => {
    setTimeout(() => {
      if (tab === 'chart' && chartRef.current) {
        chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tab === 'table' && tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Toggle year expansion in the table
  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  // Chart data preparation is now handled by the RechartsAmortizationChart component

  // Export schedule to CSV
  const handleExportCSV = () => {
    if (!schedule || schedule.length === 0) return;

    try {
      // Generate CSV content with headers, data, and loan details
      // Pass the current locale's currency symbol
      const csvContent = exportToCSV(schedule, loanDetails, currentLocale.currency);

      // Create a blob and download link with BOM for Excel compatibility
      const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Set filename with loan type and date
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      link.setAttribute('download', `${loanTypeId}-amortization-schedule-${date}.csv`);

      // Trigger download and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the URL to free up memory
      setTimeout(() => URL.revokeObjectURL(url), 100);

      // Show success message (could be implemented with a toast notification)
      console.log('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      // Show error message (could be implemented with a toast notification)
    }
  };

  // Print the amortization schedule
  const handlePrint = () => {
    if (!schedule || schedule.length === 0) return;

    try {
      // Create a new jsPDF instance with landscape orientation for better table display
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add logo and header
      doc.setFontSize(22);
      doc.setTextColor(59, 130, 246); // Blue color
      doc.text('LoanViz', 14, 15);

      // Add title
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(`${loanTypeId.charAt(0).toUpperCase() + loanTypeId.slice(1)} Amortization Schedule`, 14, 25);

      // Add date
      const currentDate = new Date().toLocaleDateString(currentLocale.locale || 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${currentDate}`, 14, 32);

      // Add loan details in a box
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(14, 38, 260, 40, 3, 3, 'FD');

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Loan Summary', 20, 46);

      doc.setFontSize(10);
      doc.text(`Loan Amount: ${currentLocale.currency}${loanDetails.principal.toLocaleString()}`, 20, 54);
      doc.text(`Interest Rate: ${loanDetails.rate}%`, 20, 60);
      doc.text(`Term: ${loanDetails.termYears} years`, 20, 66);

      // Check if there's grace period info (for student loans)
      if (loanDetails.gracePeriodMonths > 0) {
        doc.text(`Grace Period: ${loanDetails.gracePeriodMonths} months`, 20, 72);
        doc.text(`Grace Period Interest: ${currentLocale.currency}${loanDetails.gracePeriodInterest?.toFixed(2) || '0.00'}`, 20, 78);
      }

      doc.text(`Monthly Payment: ${currentLocale.currency}${loanDetails.monthlyPayment.toFixed(2)}`, 150, 54);
      doc.text(`Total Interest: ${currentLocale.currency}${loanDetails.totalInterest.toLocaleString()}`, 150, 60);
      doc.text(`Total Repayment: ${currentLocale.currency}${loanDetails.totalRepayment.toLocaleString()}`, 150, 66);

      // Prepare table data - limit to first 100 payments to avoid huge PDFs
      const maxPayments = 100;
      const displaySchedule = schedule.slice(0, maxPayments);

      // Add table with improved styling
      const tableData = displaySchedule.map(payment => [
        payment.isGracePeriod ? `${payment.month} (Grace)` : payment.month,
        payment.isGracePeriod ? 'No Payment' : `${currentLocale.currency}${payment.payment.toFixed(2)}`,
        payment.isGracePeriod ? '-' : `${currentLocale.currency}${payment.principalPayment.toFixed(2)}`,
        payment.isGracePeriod ? `${currentLocale.currency}${payment.interestPayment.toFixed(2)} (accruing)` : `${currentLocale.currency}${payment.interestPayment.toFixed(2)}`,
        `${currentLocale.currency}${payment.balance.toFixed(2)}`,
      ]);

      // Add note if we're showing truncated data
      if (schedule.length > maxPayments) {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Note: Showing first ${maxPayments} of ${schedule.length} payments. Export to CSV for complete data.`, 14, 85);
      }

      // Use the imported autoTable function directly
      autoTable(doc, {
        startY: schedule.length > maxPayments ? 90 : 85,
        head: [['Month', 'Payment', 'Principal', 'Interest', 'Balance']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center' },
          1: { halign: 'right' },
          2: { halign: 'right', fillColor: [240, 247, 255] },
          3: { halign: 'right', fillColor: [238, 242, 255] },
          4: { halign: 'right' }
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { top: 85 }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('LoanViz Financial Calculator | www.loanviz.com', 14, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
      }

      // Save the PDF with date in filename
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      doc.save(`${loanTypeId}-amortization-schedule-${date}.pdf`);

      console.log('PDF exported successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Show error message (could be implemented with a toast notification)
    }
  };

  // Group schedule by year for display
  const scheduleByYear = schedule && schedule.length > 0 ? schedule.reduce((acc, payment) => {
    const year = Math.ceil(payment.month / 12);
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(payment);
    return acc;
  }, {}) : {};

  return (
    <div className="amortization-schedule">
      {/* Debug panel removed */}

      <GlassCard
        className="mb-4"
        variant="primary"
        effect="glow"
        animate={true}
      >
        <div className="p-4">
          {!hasCalculated ? (
            <div className="text-center py-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </motion.div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                No Amortization Schedule Generated Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Fill in your loan details and click the "Generate Schedule & View Chart" button to see your personalized amortization schedule.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 md:mb-0">
                  Payment Schedule Breakdown
                </h2>

                <div className="flex space-x-2">
                  {/* Export and Print buttons */}
                  <GlowButton
                    variant="info"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={loading || !schedule || schedule.length === 0}
                    icon={<FaFileDownload className="h-4 w-4" />}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Export CSV
                  </GlowButton>

                  <GlowButton
                    variant="info"
                    size="sm"
                    onClick={handlePrint}
                    disabled={loading || !schedule || schedule.length === 0}
                    icon={<FaPrint className="h-4 w-4" />}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Print PDF
                  </GlowButton>
                </div>
              </div>

              {/* Loan Summary - Enhanced with animations and better visuals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <motion.div
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 p-4 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800/40 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Payment</p>
                  </div>
                  <AnimatedNumberDisplay
                    value={loanDetails.monthlyPayment}
                    prefix={currentLocale.currency}
                    decimals={2}
                    size="lg"
                    color="text-blue-600 dark:text-blue-400 font-bold"
                    effect="gradient"
                    animate={true}
                    highlightChange={true}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Your regular monthly payment amount</p>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 p-4 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-800/40 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Interest</p>
                  </div>
                  <AnimatedNumberDisplay
                    value={loanDetails.totalInterest}
                    prefix={currentLocale.currency}
                    decimals={0}
                    size="lg"
                    color="text-indigo-600 dark:text-indigo-400 font-bold"
                    effect="gradient"
                    animate={true}
                    highlightChange={true}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total interest paid over the loan term</p>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 p-4 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-800/40 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Repayment</p>
                  </div>
                  <AnimatedNumberDisplay
                    value={loanDetails.totalRepayment}
                    prefix={currentLocale.currency}
                    decimals={0}
                    size="lg"
                    color="text-green-600 dark:text-green-400 font-bold"
                    effect="gradient"
                    animate={true}
                    highlightChange={true}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Principal + Interest + Fees</p>
                </motion.div>

                {/* Student Loan Grace Period Info */}
                {loanTypeId === 'student' && loanDetails.gracePeriodMonths > 0 && (
                  <div className="col-span-1 md:col-span-3 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                          Grace Period: {loanDetails.gracePeriodMonths} months
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          During the grace period, no payments are required but interest accrues on the loan.
                        </p>
                      </div>

                      {loanDetails.gracePeriodInterest && (
                        <div className="mt-2 md:mt-0">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Grace Period Interest</p>
                          <AnimatedNumberDisplay
                            value={loanDetails.gracePeriodInterest}
                            prefix={currentLocale.currency}
                            decimals={2}
                            size="md"
                            color="text-yellow-600 dark:text-yellow-400"
                            effect="gradient"
                            animate={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment breakdown section header with ref */}
              <div className="mb-6" ref={resultSectionRef}>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                  View Your Loan Details
                </h3>

                {/* Main navigation tabs - Styled as larger, more prominent buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    className={`py-3 px-4 rounded-lg font-medium text-sm focus:outline-none transition-all duration-300 ${
                      activeTab === 'chart'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg border-2 border-blue-500/20'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm'
                    }`}
                    onClick={() => {
                      setActiveTab('chart');
                      scrollToTabContent('chart');
                    }}
                    whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)' }}
                    whileTap={{ y: 0, boxShadow: '0 0px 0px 0px rgba(59, 130, 246, 0.3)' }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className={`p-2 rounded-full ${activeTab === 'chart' ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30'} mb-1`}>
                        <FaChartLine className={`h-5 w-5 ${activeTab === 'chart' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                      </div>
                      <span>Payment Breakdown</span>
                    </div>
                  </motion.button>

                  <motion.button
                    className={`py-3 px-4 rounded-lg font-medium text-sm focus:outline-none transition-all duration-300 ${
                      activeTab === 'table'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg border-2 border-blue-500/20'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm'
                    }`}
                    onClick={() => {
                      setActiveTab('table');
                      scrollToTabContent('table');
                    }}
                    whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)' }}
                    whileTap={{ y: 0, boxShadow: '0 0px 0px 0px rgba(59, 130, 246, 0.3)' }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className={`p-2 rounded-full ${activeTab === 'table' ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/30'} mb-1`}>
                        <FaTable className={`h-5 w-5 ${activeTab === 'table' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                      </div>
                      <span>Complete Payment Schedule</span>
                    </div>
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </GlassCard>

      {hasCalculated && (
        <GlassCard
          className="mb-4"
          variant="primary"
          effect="glow"
          animate={true}
        >
          <div className="p-4">
          {/* Chart content */}
          <div className="mb-6">
            {activeTab === 'chart' ? (
              <div ref={chartRef}>
                <EnhancedAmortizationChart schedule={schedule} />
              </div>
            ) : (
              <div className={`${localIsDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`} ref={tableRef}>
                <div className="mb-4">
                  <h3 className={`text-lg font-medium ${localIsDarkMode ? 'text-white' : 'text-gray-800'}`}>Complete Payment Schedule</h3>
                  <p className={`text-sm ${localIsDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Click on a year to expand and see monthly payment details. Each payment is broken down into principal and interest portions.
                  </p>
                </div>

                {schedule && schedule.length > 0 ? (
                  <ResponsiveContainer enableScroll={true} className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden">
                      <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                        <tr>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Year/Month</th>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Payment</th>
                          <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Principal</th>
                          <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Interest</th>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Balance</th>
                        </tr>
                      </thead>
                      <tbody className={`${localIsDarkMode ? 'bg-gray-900' : 'bg-white'} divide-y ${localIsDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                        {Object.entries(scheduleByYear).map(([year, payments]) => (
                          <React.Fragment key={`year-${year}`}>
                            <motion.tr
                              className={`cursor-pointer transition-colors duration-150 bg-gradient-to-r ${
                                localIsDarkMode
                                  ? 'from-gray-800 to-gray-750 hover:from-gray-700 hover:to-gray-650'
                                  : 'from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200'
                              }`}
                              onClick={() => toggleYear(year)}
                              whileHover={{ scale: 1.005 }}
                              whileTap={{ scale: 0.995 }}
                            >
                              <td colSpan="5" className={`px-3 sm:px-6 py-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                <div className="flex items-center">
                                  <motion.div
                                    animate={{ rotate: expandedYears[year] ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`mr-2 p-1 rounded-full ${isDarkMode ? 'bg-blue-800/40' : 'bg-blue-100'}`}
                                  >
                                    <FaChevronDown className={`h-3 w-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                  </motion.div>
                                  <span className="font-semibold">Year {year}</span>
                                  <div className="ml-auto flex items-center space-x-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      isDarkMode
                                        ? 'bg-blue-800/40 text-blue-400'
                                        : 'bg-blue-100 text-blue-600'
                                    }`}>
                                      <span className="hidden xs:inline">{payments.length} payments</span>
                                      <span className="xs:hidden">{payments.length}</span>
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>

                            <AnimatePresence>
                              {expandedYears[year] && (
                                <motion.tr
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <td colSpan="5" className="p-0">
                                    <div className="border-l-2 border-blue-500 dark:border-blue-600 ml-3 pl-3">
                                      <table className="min-w-full">
                                        <tbody>
                                          {payments.map((payment) => (
                                            <motion.tr
                                              key={`payment-${payment.month}`}
                                              className={`border-b border-gray-100 dark:border-gray-800 ${
                                                payment.isGracePeriod ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                                              }`}
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ duration: 0.2, delay: (payment.month % 12) * 0.02 }}
                                            >
                                              <td className="px-3 sm:px-6 py-2 text-sm text-gray-500 dark:text-gray-400 w-1/5">
                                                <div className="flex items-center">
                                                  <span className="font-medium">Month {payment.month}</span>
                                                  {payment.isGracePeriod && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                      Grace
                                                    </span>
                                                  )}
                                                </div>
                                              </td>
                                              <td className="px-3 sm:px-6 py-2 text-sm w-1/5">
                                                {payment.isGracePeriod ? (
                                                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">No Payment</span>
                                                ) : (
                                                  <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.1 }}
                                                  >
                                                    <AnimatedNumber
                                                      value={payment.payment}
                                                      prefix={currentLocale.currency}
                                                      decimals={2}
                                                      size="sm"
                                                      color="text-gray-900 dark:text-white font-medium"
                                                    />
                                                  </motion.div>
                                                )}
                                              </td>
                                              <td className="hidden sm:table-cell px-3 sm:px-6 py-2 text-sm w-1/5">
                                                {payment.isGracePeriod ? (
                                                  <span className="text-gray-400 dark:text-gray-500">-</span>
                                                ) : (
                                                  <div className="flex items-center">
                                                    <motion.div
                                                      className="h-6 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"
                                                      style={{
                                                        opacity: payment.principalPayment / payment.payment,
                                                      }}
                                                      initial={{ width: 0 }}
                                                      animate={{ width: `${(payment.principalPayment / payment.payment) * 20}px` }}
                                                      transition={{ duration: 0.5, delay: 0.2 }}
                                                    ></motion.div>
                                                    <motion.div
                                                      initial={{ opacity: 0, x: -5 }}
                                                      animate={{ opacity: 1, x: 0 }}
                                                      transition={{ duration: 0.3, delay: 0.2 }}
                                                    >
                                                      <AnimatedNumber
                                                        value={payment.principalPayment}
                                                        prefix={currentLocale.currency}
                                                        decimals={2}
                                                        size="sm"
                                                        color="text-blue-600 dark:text-blue-400 font-medium"
                                                      />
                                                    </motion.div>
                                                  </div>
                                                )}
                                              </td>
                                              <td className="hidden sm:table-cell px-3 sm:px-6 py-2 text-sm w-1/5">
                                                <div className="flex items-center">
                                                  <motion.div
                                                    className="h-6 bg-indigo-500 dark:bg-indigo-400 rounded-full mr-2"
                                                    style={{
                                                      opacity: payment.isGracePeriod ? 1 : payment.interestPayment / payment.payment,
                                                    }}
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                      width: payment.isGracePeriod
                                                        ? '20px'
                                                        : `${(payment.interestPayment / payment.payment) * 20}px`
                                                    }}
                                                    transition={{ duration: 0.5, delay: 0.3 }}
                                                  ></motion.div>
                                                  <motion.div
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.3 }}
                                                  >
                                                    <AnimatedNumber
                                                      value={payment.interestPayment}
                                                      prefix={currentLocale.currency}
                                                      decimals={2}
                                                      size="sm"
                                                      color="text-indigo-600 dark:text-indigo-400 font-medium"
                                                    />
                                                    {payment.isGracePeriod && (
                                                      <motion.span
                                                        className="ml-1 text-xs text-yellow-600 dark:text-yellow-400"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.5, delay: 0.4 }}
                                                      >
                                                        (accruing)
                                                      </motion.span>
                                                    )}
                                                  </motion.div>
                                                </div>
                                              </td>
                                              <td className="px-3 sm:px-6 py-2 text-sm text-gray-900 dark:text-white w-1/5">
                                                <motion.div
                                                  initial={{ opacity: 0, y: 5 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{ duration: 0.3, delay: 0.4 }}
                                                >
                                                  <AnimatedNumber
                                                    value={payment.balance}
                                                    prefix={currentLocale.currency}
                                                    decimals={2}
                                                    size="sm"
                                                    color="text-gray-900 dark:text-white font-medium"
                                                  />
                                                </motion.div>
                                              </td>
                                            </motion.tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </motion.tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">Loading payment schedule...</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">Principal</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mr-1.5"></div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">Interest</span>
                  </div>
                  {loanTypeId === 'student' && (
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">Grace Period</span>
                    </div>
                  )}
                </div>

                {/* Regulatory Disclaimer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6"
                >
                  <RegulatoryDisclaimer
                    variant="subtle"
                    showIcon={true}
                  />
                </motion.div>
              </div>
            )}
          </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default AmortizationSchedule;
