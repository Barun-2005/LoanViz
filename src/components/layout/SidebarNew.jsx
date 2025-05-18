import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaChartBar } from 'react-icons/fa';
import LoanVizBrand from '../ui/LoanVizBrand';
import loanConfig from '../../config/loanConfig';

const SidebarNew = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [expandedLoanTypes, setExpandedLoanTypes] = useState({});

  // Toggle loan type expansion
  const toggleLoanType = (loanId) => {
    setExpandedLoanTypes(prev => ({
      ...prev,
      [loanId]: !prev[loanId]
    }));
  };

  // Check if a loan type should be expanded based on current route
  const isLoanTypeActive = (loanId) => {
    return location.pathname.includes(`/loan/${loanId}`);
  };

  // Initialize expanded state based on active route
  useEffect(() => {
    const activeLoanType = loanConfig.find(loan =>
      location.pathname.includes(`/loan/${loan.id}`)
    );

    if (activeLoanType) {
      setExpandedLoanTypes(prev => ({
        ...prev,
        [activeLoanType.id]: true
      }));
    }
  }, [location.pathname]);

  // Animation variants
  const sidebarVariants = {
    open: {
      width: '16rem',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    closed: {
      width: '5rem', // Increased from 4.5rem for better visibility
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const labelVariants = {
    open: {
      opacity: 1,
      x: 0,
      display: 'block',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      opacity: 0,
      x: -10,
      transitionEnd: {
        display: 'none'
      },
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-md z-20"
      variants={sidebarVariants}
      initial={isOpen ? 'open' : 'closed'}
      animate={isOpen ? 'open' : 'closed'}
    >
      <div className="flex flex-col h-full">
        {/* Logo and brand */}
        <div className="p-4 flex items-center justify-between">
          <div
            onClick={toggleSidebar}
            className="cursor-pointer w-full flex justify-center"
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            <LoanVizBrand
              size={isOpen ? 'md' : 'xs'}
              className={isOpen ? '' : 'justify-center'}
              collapsed={!isOpen}
            />
          </div>

          {isOpen && (
            <motion.button
              onClick={toggleSidebar}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              variants={itemVariants}
              aria-label="Close sidebar"
            >
              <FaTimes className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {/* Dashboard link */}
            <NavLink
              to="/"
              className={({ isActive }) => `
                nav-item group flex items-center ${isOpen ? 'px-4' : 'px-2 justify-center'} py-2 my-1 rounded-lg transition-all duration-200
                ${isActive
                  ? 'nav-item-active bg-blue-50 dark:bg-indigo-900/30 text-blue-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50/50 dark:hover:bg-indigo-900/20 hover:text-blue-600 dark:hover:text-indigo-400'}
              `}
              end
            >
              <motion.div
                className="flex items-center"
                variants={itemVariants}
              >
                <motion.div
                  className={!isOpen ? "mx-auto" : ""}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{ opacity: 1 }} // Ensure icon is always visible
                >
                  <FaChartBar className="w-5 h-5" />
                </motion.div>

                <motion.span
                  className="ml-3 text-sm font-medium"
                  variants={labelVariants}
                >
                  Dashboard
                </motion.span>
              </motion.div>
            </NavLink>

            {/* Loan type sections */}
            {loanConfig.map((loan) => (
              <div key={loan.id} className="mb-1">
                {/* Loan type header */}
                <button
                  onClick={() => toggleLoanType(loan.id)}
                  className={`
                    w-full flex items-center justify-between ${isOpen ? 'px-4' : 'px-2'} py-2 text-left rounded-lg transition-all duration-200
                    ${isLoanTypeActive(loan.id)
                      ? 'bg-blue-50 dark:bg-indigo-900/30 text-blue-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50/50 dark:hover:bg-indigo-900/20 hover:text-blue-600 dark:hover:text-indigo-400'}
                    ${!isOpen && expandedLoanTypes[loan.id] ? 'border-l-2 border-blue-400 dark:border-indigo-500' : ''}
                  `}
                  aria-expanded={expandedLoanTypes[loan.id]}
                  aria-controls={`${loan.id}-features`}
                >
                  <motion.div
                    className="flex items-center"
                    variants={itemVariants}
                  >
                    <motion.div
                      className={!isOpen ? "mx-auto" : ""}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{ opacity: 1 }} // Ensure icon is always visible
                    >
                      <loan.icon className="w-5 h-5" />
                    </motion.div>

                    <motion.span
                      className="ml-3 text-sm font-medium"
                      variants={labelVariants}
                    >
                      {loan.name}
                    </motion.span>
                  </motion.div>

                  {isOpen && (
                    <motion.div
                      className="transform transition-transform duration-200"
                      animate={{ rotate: expandedLoanTypes[loan.id] ? 90 : 0 }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  )}
                </button>

                {/* Features submenu */}
                {isOpen ? (
                  <motion.div
                    id={`${loan.id}-features`}
                    className="ml-4 mt-1 space-y-1"
                    initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                    animate={{
                      height: expandedLoanTypes[loan.id] ? 'auto' : 0,
                      opacity: expandedLoanTypes[loan.id] ? 1 : 0,
                      overflow: expandedLoanTypes[loan.id] ? 'visible' : 'hidden'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {loan.features.map((feature) => (
                      <NavLink
                        key={feature.id}
                        to={`/loan/${loan.id}/${feature.id}`}
                        className={({ isActive }) => `
                          flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200
                          ${isActive
                            ? 'bg-blue-50 dark:bg-indigo-900/30 text-blue-600 dark:text-indigo-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50/50 dark:hover:bg-indigo-900/20 hover:text-blue-600 dark:hover:text-indigo-400'}
                        `}
                      >
                        <feature.icon className="w-4 h-4 mr-2" />
                        <span>{feature.name}</span>
                      </NavLink>
                    ))}
                  </motion.div>
                ) : (
                  // Collapsed mode features
                  expandedLoanTypes[loan.id] && (
                    <div className="space-y-1 mt-1">
                      {loan.features.map((feature) => (
                        <NavLink
                          key={feature.id}
                          to={`/loan/${loan.id}/${feature.id}`}
                          className={({ isActive }) => `
                            flex items-center justify-center px-2 py-2 text-sm rounded-md transition-all duration-200
                            ${isActive
                              ? 'bg-blue-50 dark:bg-indigo-900/30 text-blue-600 dark:text-indigo-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50/50 dark:hover:bg-indigo-900/20 hover:text-blue-600 dark:hover:text-indigo-400'}
                            border-l-2 border-blue-100 dark:border-indigo-900/50
                          `}
                        >
                          <feature.icon className="w-4 h-4" style={{ opacity: 1 }} />
                        </NavLink>
                      ))}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SidebarNew;
