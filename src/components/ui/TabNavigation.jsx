import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const TabNavigation = ({ tabs, basePath = '', className = '' }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  // Update active tab based on URL
  useEffect(() => {
    const currentPath = location.pathname;
    const tabIndex = tabs.findIndex(tab => 
      (basePath + tab.path) === currentPath || 
      (tab.path === '' && basePath === currentPath)
    );
    
    if (tabIndex !== -1) {
      setActiveTab(tabIndex);
    }
  }, [location.pathname, tabs, basePath]);

  // Animation variants
  const tabsContainerVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const tabVariants = {
    initial: { opacity: 0, y: -5 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  const indicatorVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      <motion.div 
        className="tabs tabs-boxed bg-gray-100 dark:bg-gray-800 p-1 rounded-xl"
        variants={tabsContainerVariants}
        initial="initial"
        animate="animate"
      >
        {tabs.map((tab, index) => (
          <motion.div
            key={tab.label}
            variants={tabVariants}
            className="relative"
          >
            <NavLink
              to={basePath + tab.path}
              className={({ isActive }) => `
                tab px-4 py-2 text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'text-loanviz-primary dark:text-loanviz-secondary' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-loanviz-primary dark:hover:text-loanviz-secondary'}
              `}
              end={tab.exact}
            >
              <div className="flex items-center space-x-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </div>

              {/* Active indicator */}
              <AnimatePresence>
                {index === activeTab && (
                  <motion.div
                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg -z-10"
                    layoutId="activeTabIndicator"
                    variants={indicatorVariants}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0, scale: 0.8 }}
                  />
                )}
              </AnimatePresence>
            </NavLink>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TabNavigation;
