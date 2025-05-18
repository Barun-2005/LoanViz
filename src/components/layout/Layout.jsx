import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import SidebarNew from './SidebarNew';
import MobileSidebar from './MobileSidebar';
import Header from './Header';
import RegionDetectionBanner from '../ui/RegionDetectionBanner';
import { addSkipLink } from '../../utils/accessibilityUtils';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has already set a preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Otherwise check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply theme class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  // Add state to track if the component has mounted
  const [hasMounted, setHasMounted] = useState(false);

  // Set hasMounted to true after initial render
  useEffect(() => {
    setHasMounted(true);

    // Add skip link for accessibility
    addSkipLink('main-content');
  }, []);

  // Reset hasMounted when location changes to force re-render
  useEffect(() => {
    // This ensures components re-render when navigating between routes
    setHasMounted(false);
    const timer = setTimeout(() => {
      setHasMounted(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const childVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Background blob animation
  const blobVariants = {
    animate: {
      scale: [1, 1.1, 1.05, 1.1, 1],
      x: [0, 10, -10, 15, 0],
      y: [0, -10, 10, -5, 0],
      transition: {
        duration: 20,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-loanviz-bg-light to-white dark:from-loanviz-bg-dark dark:to-gray-900 transition-colors duration-500">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-loanviz-primary/5 dark:bg-loanviz-secondary/10 blur-3xl"
          variants={blobVariants}
          animate="animate"
          style={{ animationDelay: '0s' }}
        />
        <motion.div
          className="absolute top-[60%] -left-[10%] w-[50%] h-[50%] rounded-full bg-loanviz-secondary/5 dark:bg-loanviz-primary/10 blur-3xl"
          variants={blobVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
        />
        <motion.div
          className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-loanviz-accent/5 dark:bg-loanviz-accent/10 blur-3xl"
          variants={blobVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <SidebarNew isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Mobile Sidebar - only shown on mobile when open */}
      <MobileSidebar isOpen={isMobileSidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <Header
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        {/* Region Detection Banner */}
        <RegionDetectionBanner />

        <main id="main-content" className="p-1 md:p-2 lg:p-3 min-h-[calc(100vh-64px)] max-w-[1400px] mx-auto">
          {/* Skip animations on initial load, only animate after mounting */}
          {!hasMounted ? (
            <div className="h-full">
              {children}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
