import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChartBar } from 'react-icons/fa';
import LoanVizBrand from '../ui/LoanVizBrand';
import loanConfig from '../../config/loanConfig';

/**
 * MobileSidebar component for mobile devices
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the sidebar is open
 * @param {Function} props.toggleSidebar - Function to toggle sidebar
 * @returns {JSX.Element} Mobile sidebar component
 */
const MobileSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState({});

  // Initialize expanded state based on current route
  useEffect(() => {
    if (location.pathname !== '/') {
      // Extract loan type from URL
      const match = location.pathname.match(/\/loan\/([^\/]+)/);
      if (match && match[1]) {
        const loanType = match[1];
        setExpandedCategories(prev => ({
          ...prev,
          [loanType]: true
        }));
      }
    }
  }, [location.pathname]);

  // Toggle category expansion
  const toggleCategory = (categoryId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Group navigation items by category
  const categories = {
    dashboard: {
      label: 'Dashboard',
      icon: <FaChartBar className="h-4 w-4" />,
      items: [
        {
          path: '/',
          label: 'Dashboard',
          exact: true,
          icon: <FaChartBar className="h-5 w-5" />,
          category: 'dashboard'
        }
      ]
    }
  };

  // Add loan types from config
  loanConfig.forEach(loan => {
    // Main loan category item
    const mainItem = {
      path: `/loan/${loan.id}`,
      label: loan.name,
      icon: <loan.icon className="h-5 w-5" />,
      category: loan.id,
      isCategory: true
    };

    // Feature items (sub-items)
    const featureItems = loan.features.map(feature => ({
      path: `/loan/${loan.id}/${feature.id}`,
      label: feature.name,
      icon: <feature.icon className="h-5 w-5" />,
      category: loan.id,
      parentId: loan.id
    }));

    categories[loan.id] = {
      label: loan.name,
      icon: <loan.icon className="h-4 w-4" />,
      items: [mainItem, ...featureItems],
      isExpandable: true
    };
  });

  // Drawer animation variants
  const drawerVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  // Item animation variants
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
      x: -20,
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Label animation variants
  const labelVariants = {
    open: {
      opacity: 1,
      transition: {
        duration: 0.2
      }
    },
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-50 md:hidden overflow-hidden"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="flex flex-col h-full">
              {/* Header with logo and close button */}
              <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                <LoanVizBrand size="md" />
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close sidebar"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto py-4 px-4">
                {Object.entries(categories).map(([key, category]) => (
                  <div key={key} className="mb-6">
                    <motion.h3
                      className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                      variants={labelVariants}
                    >
                      {category.label}
                    </motion.h3>

                    {category.items.map((item) => {
                      // Skip sub-items if category is not expanded
                      if (item.parentId && !expandedCategories[item.category]) {
                        return null;
                      }

                      return (
                        <NavLink
                          key={item.path}
                          to={item.disabled ? '#' : item.path}
                          className={({ isActive }) => `
                            nav-item group flex items-center justify-between px-4 py-2 my-1 rounded-lg transition-all duration-200
                            ${isActive
                              ? 'nav-item-active bg-blue-50 dark:bg-indigo-900/30 text-blue-600 dark:text-indigo-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50/50 dark:hover:bg-indigo-900/20 hover:text-blue-600 dark:hover:text-indigo-400'}
                            ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            ${item.parentId ? 'pl-8' : ''}
                          `}
                          onClick={e => {
                            if (item.disabled) {
                              e.preventDefault();
                            } else if (item.isCategory && category.isExpandable) {
                              // If it's a category item, toggle expansion
                              toggleCategory(item.category, e);
                            } else {
                              toggleSidebar(); // Close sidebar on navigation
                            }
                          }}
                          end={item.exact}
                        >
                          <motion.div
                            className="flex items-center"
                            variants={itemVariants}
                          >
                            {/* Icon with animation */}
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.icon}
                            </motion.div>

                            {/* Label with animation */}
                            <motion.span
                              className="ml-3 text-sm font-medium"
                              variants={labelVariants}
                            >
                              {item.label}
                            </motion.span>
                          </motion.div>

                          {/* Expansion indicator for category items */}
                          {item.isCategory && category.isExpandable && (
                            <motion.div
                              className="text-gray-500 dark:text-gray-400"
                              animate={{ rotate: expandedCategories[item.category] ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </motion.div>
                          )}

                          {/* Coming soon badge for disabled items */}
                          {item.disabled && (
                            <motion.span
                              className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full"
                              variants={labelVariants}
                            >
                              Soon
                            </motion.span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
