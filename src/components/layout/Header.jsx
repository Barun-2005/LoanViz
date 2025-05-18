import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../ui/ThemeToggle';
import LocaleSelector from '../ui/LocaleSelector';
import { FaBars } from 'react-icons/fa';

// Import loan config
import loanConfig, { featureDefinitions } from '../../config/loanConfig';

// Map of route paths to page titles
const routeTitles = {
  '/': 'LoanViz Dashboard',
  '/calculator': 'Mortgage Calculator',
  '/amortization': 'Amortization Schedule',
  '/comparison': 'Mortgage Comparison',
  '/affordability': 'Affordability Calculator',
  '/early-repayment': 'Early Repayment Calculator',
  '/scenarios': 'Mortgage Scenarios',
  '/stamp-duty': 'Stamp Duty Calculator',
};



const Header = ({ toggleSidebar, isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const { t } = useTranslation();

  // Get title based on route pattern
  const getPageTitle = () => {
    const path = location.pathname;

    // Check if it's a loan type landing page
    if (path.match(/^\/loan\/[^\/]+$/)) {
      const loanType = path.split('/')[2];
      const loan = loanConfig.find(l => l.id === loanType);
      return loan ? `${loan.name} Calculators` : 'LoanViz';
    }

    // Check if it's a loan feature page
    if (path.match(/^\/loan\/[^\/]+\/[^\/]+$/)) {
      const [_, __, loanType, featureId] = path.split('/');
      const loan = loanConfig.find(l => l.id === loanType);
      const feature = featureDefinitions[featureId];

      if (loan && feature) {
        return `${loan.name} ${feature.name}`;
      }
    }

    // Default to predefined routes or dashboard
    return routeTitles[path] || 'LoanViz';
  };

  const currentTitle = getPageTitle();

  // Get icon based on route pattern
  const getPageIcon = () => {
    const path = location.pathname;

    // Check if it's a loan type landing page
    if (path.match(/^\/loan\/[^\/]+$/)) {
      const loanType = path.split('/')[2];
      const loan = loanConfig.find(l => l.id === loanType);
      if (loan) {
        return <loan.icon className="h-6 w-6" />;
      }
    }

    // Check if it's a loan feature page
    if (path.match(/^\/loan\/[^\/]+\/[^\/]+$/)) {
      const [_, __, _loanType, featureId] = path.split('/');
      const feature = featureDefinitions[featureId];

      if (feature) {
        return <feature.icon className="h-6 w-6" />;
      }
    }

    // Default to null for other routes
    return null;
  };

  const currentIcon = getPageIcon();

  // Header animation variants
  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  // Title animation variants
  const titleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        delay: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  // Icon animation variants
  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: 0.2
      }
    },
    hover: {
      rotate: [0, -10, 10, -5, 5, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  // Add scroll effect
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`sticky top-0 z-30 backdrop-blur-lg border-b transition-all duration-300
                 ${scrolled
                   ? 'border-gray-200/70 dark:border-gray-700/70 shadow-lg'
                   : 'border-gray-200/30 dark:border-gray-700/30 shadow-md'
                 }
                 ${scrolled
                   ? 'bg-white/90 dark:bg-gray-900/90'
                   : 'bg-white/70 dark:bg-gray-900/70'
                 }`}
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3 max-w-[1600px] mx-auto">
        <div className="flex items-center">
          <motion.button
            className="p-1.5 md:p-2 mr-2 md:mr-3 rounded-full text-loanviz-primary dark:text-loanviz-secondary hover:bg-loanviz-primary/10 dark:hover:bg-loanviz-secondary/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: 5 }}
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <FaBars className="h-4 w-4 md:h-5 md:w-5" />
          </motion.button>

          <div className="flex items-center">
            {currentIcon && (
              <motion.div
                className="mr-2 md:mr-3 text-loanviz-primary dark:text-loanviz-secondary hidden md:flex items-center justify-center w-7 h-7 md:w-9 md:h-9 bg-loanviz-primary/10 dark:bg-loanviz-secondary/20 rounded-full"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                {currentIcon}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.h1
                key={location.pathname}
                className="text-base md:text-xl font-bold bg-gradient-to-r from-loanviz-primary to-loanviz-secondary dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent truncate max-w-[180px] sm:max-w-[300px] md:max-w-none"
                variants={titleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {currentTitle}
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-3">
          <LocaleSelector />
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
