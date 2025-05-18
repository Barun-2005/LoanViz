import { useState, useEffect, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartPie, FaDownload, FaPrint, FaShare, FaChartLine, FaMoneyBillWave, FaCheck, FaCopy, FaTimes } from 'react-icons/fa';
import AnimatedNumber from './AnimatedNumber';
import EnhancedDonutChart from './EnhancedDonutChart';
import GlassmorphicCard from './GlassmorphicCard';
import AnimatedBackground from './AnimatedBackground';
import ResponsiveGrid from './ResponsiveGrid';
import ResponsiveContainer from './ResponsiveContainer';
import { useLocale } from '../../contexts/LocaleContext';

/**
 * EnhancedResultsSection component for displaying loan calculation results with advanced animations
 * @param {Object} props - Component props
 * @param {Object} props.results - Calculation results object
 * @param {boolean} props.isVisible - Whether the results section is visible
 * @param {string} props.loanType - Type of loan ('mortgage', 'personal', 'auto', etc.)
 * @param {Function} props.onExport - Function to handle exporting results
 * @param {Function} props.onPrint - Function to handle printing results
 * @param {Function} props.onShare - Function to handle sharing results
 * @param {React.Ref} ref - Forwarded ref for scrolling to this component
 * @returns {JSX.Element} Enhanced results section component
 */
const EnhancedResultsSection = forwardRef(({
  results,
  isVisible = false,
  loanType = 'mortgage',
  onExport = null,
  onPrint = null,
  onShare = null,
}, ref) => {
  // Get locale information
  const { currentLocale } = useLocale();

  const [isFirstRender, setIsFirstRender] = useState(true);
  const [showFinancialAnimation, setShowFinancialAnimation] = useState(false);
  const [financialInsight, setFinancialInsight] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // Generate financial insights based on results and set up periodic animations
  useEffect(() => {
    if (results && isVisible) {
      // Generate financial insights
      const generateInsights = () => {
        const { principal, totalInterest, totalRepayment, monthlyPayment, rate, termYears } = results;

        // Calculate interest to principal ratio
        const interestRatio = totalInterest / principal;
        const monthlyIncomeRatio = monthlyPayment / 2000; // Assuming average income of £2000

        // Show different insights based on loan metrics
        if (interestRatio < 0.3) {
          setFinancialInsight({
            type: 'efficient-loan',
            title: 'Efficient Loan',
            description: 'This loan has a favorable interest-to-principal ratio',
            color: 'success',
            icon: <FaChartLine className="h-5 w-5" />
          });
        } else if (monthlyIncomeRatio < 0.3) {
          setFinancialInsight({
            type: 'affordable',
            title: 'Affordable',
            description: 'Monthly payments are within recommended budget guidelines',
            color: 'primary',
            icon: <FaMoneyBillWave className="h-5 w-5" />
          });
        } else if (termYears > 25) {
          setFinancialInsight({
            type: 'long-term',
            title: 'Long-Term Commitment',
            description: 'Consider the implications of this extended loan period',
            color: 'warning',
            icon: <FaChartLine className="h-5 w-5" />
          });
        }
      };

      // Generate insights
      generateInsights();

      // Create a ref to store the timer IDs
      const timers = {
        initialAnimation: null,
        periodicAnimation: null,
        hideAnimation: null
      };

      // Show initial animation with a slight delay
      timers.initialAnimation = setTimeout(() => {
        console.log("Showing initial financial animation");
        setShowFinancialAnimation(true);

        // Hide initial animation after a few seconds
        timers.hideAnimation = setTimeout(() => {
          setShowFinancialAnimation(false);
          console.log("Hiding initial financial animation");
        }, 4000);
      }, 500);

      // Function to schedule the next animation
      const scheduleNextAnimation = () => {
        // Random interval between 8-15 seconds (more frequent)
        const nextInterval = 8000 + Math.random() * 7000;
        console.log(`Scheduling next animation in ${Math.round(nextInterval/1000)} seconds`);

        return setTimeout(() => {
          console.log("Showing periodic financial animation");
          // Show animation
          setShowFinancialAnimation(true);

          // Hide animation after a few seconds
          timers.hideAnimation = setTimeout(() => {
            setShowFinancialAnimation(false);
            console.log("Hiding periodic financial animation");

            // Schedule the next animation
            timers.periodicAnimation = scheduleNextAnimation();
          }, 4000);
        }, nextInterval);
      };

      // Schedule the first periodic animation after a short delay
      timers.periodicAnimation = setTimeout(() => {
        scheduleNextAnimation();
      }, 6000);

      // Clean up timers on unmount
      return () => {
        clearTimeout(timers.initialAnimation);
        clearTimeout(timers.periodicAnimation);
        clearTimeout(timers.hideAnimation);
      };
    }
  }, [results, isVisible]);

  // Handle first render animation separately
  useEffect(() => {
    // Only set first render to false once
    if (isFirstRender && isVisible && results) {
      const timer = setTimeout(() => {
        setIsFirstRender(false);
        console.log("First render animation completed");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isFirstRender, isVisible, results]);

  // Early return if no results
  if (!results) return null;

  // Log the results for debugging
  console.log("EnhancedResultsSection rendering with results:", results);

  const {
    principal,
    totalInterest,
    totalRepayment,
    monthlyPayment,
    fees = 0,
    rate,
    termYears,
    type
  } = results;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  // Get loan type display name
  const getLoanTypeDisplay = () => {
    switch (loanType) {
      case 'mortgage': return 'Mortgage';
      case 'personal': return 'Personal Loan';
      case 'auto': return 'Auto Loan';
      case 'student': return 'Student Loan';
      case 'investment': return 'Investment';
      case 'debt': return 'Debt Consolidation';
      default: return 'Loan';
    }
  };

  // Handle exporting results to CSV
  const handleExport = () => {
    if (!results) return;

    const { principal, totalInterest, totalRepayment, monthlyPayment, rate, termYears, type, fees = 0 } = results;

    // Create CSV content
    const headers = ['Metric', 'Value'];
    const data = [
      ['Loan Type', getLoanTypeDisplay()],
      ['Principal', `${currentLocale.currency}${principal.toFixed(2)}`],
      ['Interest Rate', `${rate}%`],
      ['Term (Years)', termYears],
      ['Monthly Payment', `${currentLocale.currency}${monthlyPayment.toFixed(2)}`],
      ['Total Interest', `${currentLocale.currency}${totalInterest.toFixed(2)}`],
      ['Total Fees', `${currentLocale.currency}${fees.toFixed(2)}`],
      ['Total Repayment', `${currentLocale.currency}${totalRepayment.toFixed(2)}`],
      ['Repayment Type', type === 'interest-only' ? 'Interest Only' : 'Principal & Interest']
    ];

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Set filename with loan type and date
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    link.setAttribute('download', `${loanType}-summary-${date}.csv`);

    // Trigger download and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke the URL to free up memory
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // Handle printing the results
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Please allow pop-ups to print the summary.');
      return;
    }

    const { principal, totalInterest, totalRepayment, monthlyPayment, rate, termYears, type, fees = 0 } = results;

    // Create HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${getLoanTypeDisplay()} Summary</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #3B82F6;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 10px;
          }
          .summary-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            background-color: #f8fafc;
          }
          .summary-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .summary-label {
            font-weight: bold;
            color: #4b5563;
          }
          .summary-value {
            font-weight: 600;
          }
          .monthly-payment {
            font-size: 24px;
            color: #3B82F6;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <h1>${getLoanTypeDisplay()} Summary</h1>

        <div class="summary-card">
          <div class="summary-header">
            <div>Generated on: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="monthly-payment">
            Monthly Payment: ${currentLocale.currency}${monthlyPayment.toFixed(2)}
          </div>

          <div class="summary-row">
            <span class="summary-label">Loan Amount:</span>
            <span class="summary-value">${currentLocale.currency}${principal.toFixed(2)}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Interest Rate:</span>
            <span class="summary-value">${rate}%</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Term:</span>
            <span class="summary-value">${termYears} years</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Repayment Type:</span>
            <span class="summary-value">${type === 'interest-only' ? 'Interest Only' : 'Principal & Interest'}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Total Interest:</span>
            <span class="summary-value">${currentLocale.currency}${totalInterest.toFixed(2)}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Total Fees:</span>
            <span class="summary-value">${currentLocale.currency}${fees.toFixed(2)}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Total Repayment:</span>
            <span class="summary-value">${currentLocale.currency}${totalRepayment.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          LoanViz - ${window.location.origin}
        </div>

        <script>
          // Auto print when loaded
          window.onload = function() {
            window.print();
            // Don't close the window automatically to allow user to cancel or retry printing
          }
        </script>
      </body>
      </html>
    `;

    // Write to the new window and trigger print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Create a custom financial animation component
  const FinancialAnimation = ({ active }) => {
    const canvasRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(() =>
      document.documentElement.classList.contains('dark')
    );

    // Listen for theme changes
    useEffect(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true });

      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      if (!active) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      let animationFrameId;

      // Set canvas dimensions
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Create financial symbols - ensure current locale currency is first
      const symbols = [currentLocale.currency, ...['$', '€', '¥', '%', '+', '−', '×', '÷', '=', '💰', '📈', '💸', '💹'].filter(s => s !== currentLocale.currency)];

      // Define color schemes based on theme
      const lightColors = ['#3B82F6', '#4F46E5', '#6366F1', '#818CF8', '#A5B4FC'];
      const darkColors = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#8B5CF6'];
      const colorScheme = isDarkMode ? darkColors : lightColors;

      // Create particles with more variety
      const particles = [];
      const particleCount = 40; // Increased particle count

      for (let i = 0; i < particleCount; i++) {
        // Determine if this will be a symbol or a sparkle
        const isSymbol = Math.random() > 0.3; // 70% symbols, 30% sparkles

        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 50,
          size: Math.random() * 20 + 8,
          speed: Math.random() * 4 + 1,
          symbol: isSymbol ? symbols[Math.floor(Math.random() * symbols.length)] : null,
          opacity: Math.random() * 0.7 + 0.3,
          color: colorScheme[Math.floor(Math.random() * colorScheme.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 4,
          isSparkle: !isSymbol,
          sparkleSize: Math.random() * 6 + 2,
          blinkRate: Math.random() * 0.1 + 0.05,
          blinkPhase: Math.random() * Math.PI * 2,
          entryDelay: Math.random() * 1000, // Stagger entry for more natural effect
          active: false,
          timeCreated: Date.now()
        });
      }

      // Animation function
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const now = Date.now();

        particles.forEach((particle) => {
          // Check if particle should be active yet (staggered entry)
          if (!particle.active && now - particle.timeCreated > particle.entryDelay) {
            particle.active = true;
          }

          if (!particle.active) return;

          // Move particle upward
          particle.y -= particle.speed;

          // Update rotation
          particle.rotation += particle.rotationSpeed;

          // Calculate current opacity with blinking effect
          const blinkFactor = Math.sin(now * particle.blinkRate + particle.blinkPhase);
          const currentOpacity = particle.opacity * (0.7 + blinkFactor * 0.3);

          // Reset particle if it goes off screen
          if (particle.y < -particle.size) {
            particle.y = canvas.height + Math.random() * 20;
            particle.x = Math.random() * canvas.width;
            // Randomize properties for variety
            particle.speed = Math.random() * 4 + 1;
            particle.rotation = Math.random() * 360;
            particle.color = colorScheme[Math.floor(Math.random() * colorScheme.length)];
          }

          // Save context state
          ctx.save();

          // Set global alpha
          ctx.globalAlpha = currentOpacity;

          // Move to particle position
          ctx.translate(particle.x, particle.y);

          if (particle.isSparkle) {
            // Draw sparkle
            ctx.rotate(particle.rotation * Math.PI / 180);
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.sparkleSize);
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();

            // Draw star shape
            const spikes = 4;
            const outerRadius = particle.sparkleSize;
            const innerRadius = particle.sparkleSize / 2;

            for (let i = 0; i < spikes * 2; i++) {
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              const angle = (i * Math.PI) / spikes;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }

            ctx.closePath();
            ctx.fill();
          } else {
            // Draw the symbol with rotation
            ctx.rotate(particle.rotation * Math.PI / 180);
            ctx.font = `${particle.size}px Arial`;
            ctx.fillStyle = particle.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(particle.symbol, 0, 0);
          }

          // Restore context state
          ctx.restore();
        });

        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      // Handle window resize
      const handleResize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };

      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
      };
    }, [active, isDarkMode]);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-50"
        style={{ width: '100%', height: '100%' }}
      />
    );
  };

  // Handle sharing the results
  const handleShare = () => {
    setShowShareModal(true);
  };

  // Generate shareable URL with query parameters
  const getShareableLink = () => {
    if (!results) return '';

    const { principal, rate, termYears, type, fees = 0 } = results;

    // Create URL with query parameters
    const baseUrl = window.location.origin + window.location.pathname;
    const queryParams = new URLSearchParams({
      principal: principal.toString(),
      rate: rate.toString(),
      term: termYears.toString(),
      type: type || 'repayment',
      fees: fees.toString(),
      loanType: loanType
    });

    return `${baseUrl}?${queryParams.toString()}`;
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    const link = getShareableLink();

    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setCopyError(false);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopyError(true);
      setCopySuccess(false);

      // Reset error message after 3 seconds
      setTimeout(() => {
        setCopyError(false);
      }, 3000);
    }
  };

  // Close share modal
  const closeShareModal = () => {
    setShowShareModal(false);
    setCopySuccess(false);
    setCopyError(false);
  };

  return (
    <AnimatePresence mode="sync">
      {isVisible && (
        <motion.div
          ref={ref}
          key="results"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
          className="relative"
        >
          {/* Financial animation effect */}
          {showFinancialAnimation && <FinancialAnimation active={showFinancialAnimation} />}

          {/* Main Results Card */}
          <motion.div
            className="overflow-hidden mb-6 rounded-xl glassmorphic-card border-blue-300/60 dark:border-indigo-400/50"
            animate={{
              boxShadow: [
                "0 0 0px rgba(59, 130, 246, 0.0)",
                "0 0 15px rgba(59, 130, 246, 0.3)",
                "0 0 5px rgba(59, 130, 246, 0.2)",
                "0 0 10px rgba(59, 130, 246, 0.3)",
                "0 0 5px rgba(59, 130, 246, 0.1)"
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            {/* Header with animated background */}
            <div className="relative p-6 overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 dark:from-indigo-700 dark:via-indigo-800 dark:to-indigo-900 rounded-t-xl">
              {/* Animated background */}
              <AnimatedBackground type="waves" opacity={20} interactive={true} />

              <div className="relative z-10 flex justify-between items-center">
                <motion.div className="flex items-center" variants={headerVariants}>
                  <motion.div
                    className="mr-3 bg-white/20 dark:bg-white/10 p-2 rounded-lg backdrop-blur-md border border-white/10"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <FaChartPie className="h-6 w-6 text-white" />
                  </motion.div>
                  <motion.h3
                    className="text-xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {getLoanTypeDisplay()} Summary
                  </motion.h3>
                </motion.div>

                {/* Financial Insight Badge */}
                {financialInsight && (
                  <motion.div
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2
                      ${financialInsight.color === 'primary' ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30' :
                        financialInsight.color === 'success' ? 'bg-green-500/20 text-green-100 border border-green-500/30' :
                        'bg-amber-500/20 text-amber-100 border border-amber-500/30'}`}
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.5 }}
                    whileHover={{ scale: 1.05, x: 0 }}
                  >
                    <span className="text-white">{financialInsight.icon}</span>
                    <span>{financialInsight.title}</span>
                  </motion.div>
                )}
              </div>

              {/* Monthly Payment with animated highlight */}
              <div className="relative z-10 mt-4">
                <motion.p
                  className="text-blue-100 text-sm mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Monthly Payment
                </motion.p>
                <motion.div
                  className="flex items-baseline"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 15
                  }}
                >
                  <motion.div
                    className="flex items-baseline"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.span
                      className="text-white text-opacity-90 mr-1 text-2xl font-bold"
                      animate={{
                        y: [0, -2, 0],
                        opacity: [0.9, 1, 0.9],
                        textShadow: [
                          "0 0 8px rgba(255,255,255,0.5)",
                          "0 0 16px rgba(255,255,255,0.8)",
                          "0 0 8px rgba(255,255,255,0.5)"
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      {currentLocale.currency}
                    </motion.span>
                    <AnimatedNumber
                      value={monthlyPayment}
                      decimals={2}
                      size="xxl"
                      color="text-white text-shadow-indigo"
                      effect="glow"
                      separateDigits={isFirstRender}
                      easing="expo"
                      highlightChange={true}
                      className="text-4xl"
                    />
                  </motion.div>
                </motion.div>

                {/* Loan details */}
                <motion.div
                  className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-white/80 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center">
                    <span className="opacity-70 mr-1">Term:</span>
                    <span className="font-medium">{termYears} years</span>
                  </div>
                  <div className="flex items-center">
                    <span className="opacity-70 mr-1">Rate:</span>
                    <span className="font-medium">{rate}%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="opacity-70 mr-1">Type:</span>
                    <span className="font-medium capitalize">{type}</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="p-4 sm:p-6">
              <ResponsiveGrid cols={2} mobileCols={1} gap="6">
                {/* Left Column - Text Results with cards */}
                <motion.div className="space-y-5" variants={itemVariants}>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Loan Amount Card */}
                    <div className="p-4 glassmorphic-card border-blue-300/60 dark:border-blue-500/40 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-indigo-500/5 dark:to-indigo-700/5 rounded-xl"></div>
                      <motion.div
                        className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-indigo-300 dark:text-indigo-300 opacity-40"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.4 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{
                          scale: 1.2,
                          opacity: 0.6,
                          rotate: 10,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </motion.div>
                      <p className="text-sm font-medium text-blue-600 dark:text-indigo-300 mb-1 relative z-10">Loan Amount</p>
                      <AnimatedNumber
                        value={principal}
                        prefix={currentLocale.currency}
                        decimals={0}
                        size="md"
                        color="text-gray-900 dark:text-white"
                        effect="none"
                        separateDigits={isFirstRender}
                        easing="expo"
                        highlightChange={true}
                        className="font-bold relative z-10"
                      />
                    </div>

                    {/* Total Interest Card */}
                    <div className="p-4 glassmorphic-card border-indigo-300/60 dark:border-indigo-500/40 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/5 dark:to-purple-700/5 rounded-xl"></div>
                      <motion.div
                        className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-indigo-300 dark:text-indigo-300 opacity-40"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.4 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{
                          scale: 1.2,
                          opacity: 0.6,
                          rotate: 10,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </motion.div>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-1 relative z-10">Total Interest</p>
                      <AnimatedNumber
                        value={totalInterest}
                        prefix={currentLocale.currency}
                        decimals={0}
                        size="md"
                        color="text-gray-900 dark:text-white"
                        effect="none"
                        separateDigits={isFirstRender}
                        easing="expo"
                        highlightChange={true}
                        className="font-bold relative z-10"
                      />
                    </div>

                    {/* Fees Card */}
                    <div className="p-4 glassmorphic-card border-purple-300/60 dark:border-purple-500/40 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 dark:from-purple-500/5 dark:to-blue-700/5 rounded-xl"></div>
                      <motion.div
                        className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-purple-300 dark:text-purple-300 opacity-40"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.4 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{
                          scale: 1.2,
                          opacity: 0.6,
                          rotate: 10,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                        </svg>
                      </motion.div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-300 mb-1 relative z-10">Total Fees</p>
                      <AnimatedNumber
                        value={fees}
                        prefix={currentLocale.currency}
                        decimals={0}
                        size="md"
                        color="text-gray-900 dark:text-white"
                        effect="none"
                        separateDigits={isFirstRender}
                        easing="expo"
                        highlightChange={true}
                        className="font-bold relative z-10"
                      />
                    </div>

                    {/* Total Repayment Card */}
                    <div className="p-4 glassmorphic-card border-blue-300/60 dark:border-blue-500/40 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-indigo-500/5 dark:to-indigo-700/5 rounded-xl"></div>
                      <motion.div
                        className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-blue-300 dark:text-blue-300 opacity-40"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.4 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{
                          scale: 1.2,
                          opacity: 0.6,
                          rotate: 10,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </motion.div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-1 relative z-10">Total Repayment</p>
                      <AnimatedNumber
                        value={totalRepayment}
                        prefix={currentLocale.currency}
                        decimals={0}
                        size="md"
                        color="text-gray-900 dark:text-white"
                        effect="none"
                        separateDigits={isFirstRender}
                        easing="expo"
                        highlightChange={true}
                        className="font-bold relative z-10"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <motion.div
                    className="flex gap-3 mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 glassmorphic-btn border-blue-300/60 dark:border-blue-500/40 text-blue-600 dark:text-blue-300 rounded-lg hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] dark:hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(59, 130, 246, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExport}
                    >
                      <FaDownload className="h-4 w-4" />
                      <span>Export</span>
                    </motion.button>

                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 glassmorphic-btn border-indigo-300/60 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-300 rounded-lg hover:shadow-[0_0_10px_rgba(99,102,241,0.3)] dark:hover:shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrint}
                    >
                      <FaPrint className="h-4 w-4" />
                      <span>Print</span>
                    </motion.button>

                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 glassmorphic-btn border-purple-300/60 dark:border-purple-500/40 text-purple-600 dark:text-purple-300 rounded-lg hover:shadow-[0_0_10px_rgba(147,51,234,0.3)] dark:hover:shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(147, 51, 234, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                    >
                      <FaShare className="h-4 w-4" />
                      <span>Share</span>
                    </motion.button>
                  </motion.div>
                </motion.div>

                {/* Right Column - Enhanced Chart */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="w-full h-full p-6 flex flex-col items-center justify-center glassmorphic-chart border-indigo-300/60 dark:border-indigo-500/40 backdrop-blur-md">
                    <AnimatedBackground type="blobs" opacity={15} />

                    <motion.h3
                      className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-100 relative z-10 flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.span
                        className="inline-block mr-2"
                        animate={{
                          rotate: [0, 15, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                        </svg>
                      </motion.span>
                      Loan Breakdown
                    </motion.h3>

                    <EnhancedDonutChart
                      data={[principal, totalInterest, fees]}
                      size={240}
                      thickness={36}
                      colors={['#6366F1', '#818CF8', '#A5B4FC']}
                      labels={['Principal', 'Interest', 'Fees']}
                      animate={true}
                      labelFontSize={13}
                      valueFontSize={18}
                      valuePosition="inside"
                      monthlyPayment={monthlyPayment}
                      totalRepayment={totalRepayment}
                      effect="glow"
                      hoverEffect={true}
                      segmentSpacing={1}
                      className="w-full relative z-10"
                    />
                  </div>
                </motion.div>
              </ResponsiveGrid>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeShareModal}
          >
            <motion.div
              className="glassmorphic-card p-6 max-w-md w-full mx-4 shadow-2xl border-blue-300/60 dark:border-blue-500/40 backdrop-blur-lg"
              initial={{ scale: 0.9, y: 20 }}
              animate={{
                scale: 1,
                y: 0,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(59, 130, 246, 0.3)"
              }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Share {getLoanTypeDisplay()} Summary</h3>
                <motion.button
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={closeShareModal}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes className="h-5 w-5" />
                </motion.button>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Copy the link below to share your {getLoanTypeDisplay().toLowerCase()} calculation results with others.
              </p>

              <div className="flex items-center mb-4">
                <input
                  type="text"
                  value={getShareableLink()}
                  readOnly
                  className="flex-1 p-3 glassmorphic-input border-blue-200/50 dark:border-blue-700/50 rounded-l-lg text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-indigo-500/50"
                />
                <motion.button
                  className="glassmorphic-btn-primary px-4 py-3 rounded-r-lg flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)] dark:shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                  onClick={copyToClipboard}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  disabled={copySuccess}
                >
                  {copySuccess ? (
                    <FaCheck className="h-5 w-5" />
                  ) : (
                    <FaCopy className="h-5 w-5" />
                  )}
                </motion.button>
              </div>

              {copySuccess && (
                <motion.div
                  className="text-green-600 dark:text-green-400 text-sm flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FaCheck className="h-4 w-4 mr-2" />
                  Link copied to clipboard!
                </motion.div>
              )}

              {copyError && (
                <motion.div
                  className="text-red-600 dark:text-red-400 text-sm flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FaTimes className="h-4 w-4 mr-2" />
                  Failed to copy. Please try again or copy manually.
                </motion.div>
              )}

              <div className="mt-6 flex justify-end">
                <motion.button
                  className="px-4 py-2 glassmorphic-btn border-gray-200/50 dark:border-gray-700/50 text-gray-800 dark:text-white rounded-lg hover:shadow-[0_0_10px_rgba(107,114,128,0.3)] dark:hover:shadow-[0_0_10px_rgba(75,85,99,0.3)]"
                  onClick={closeShareModal}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 15px rgba(107, 114, 128, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
});

// Add display name for debugging
EnhancedResultsSection.displayName = 'EnhancedResultsSection';

export default EnhancedResultsSection;
