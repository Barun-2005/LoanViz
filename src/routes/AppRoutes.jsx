
import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy } from 'react';
import { AnimatePresence } from 'framer-motion';

// Lazy load all components for better performance
const DashboardNew = lazy(() => import('../components/dashboard/DashboardNew'));
const LoanLanding = lazy(() => import('../pages/LoanLanding/LoanLanding'));
const LoanFeature = lazy(() => import('../pages/LoanFeature/LoanFeature'));

// Feature pages - lazy loaded
const Amortization = lazy(() => import('../pages/Amortization/AmortizationNew'));
const Comparison = lazy(() => import('../pages/Comparison/ComparisonNew'));
const Affordability = lazy(() => import('../pages/Affordability/AffordabilityNew'));
const EarlyRepayment = lazy(() => import('../pages/EarlyRepayment/EarlyRepayment'));
const Scenarios = lazy(() => import('../pages/Scenarios/Scenarios'));

// Import StampDuty directly instead of lazy loading to avoid 500 errors
import StampDuty from '../pages/StampDuty/StampDuty';

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Main routes */}
        <Route path="/" element={<DashboardNew />} />
        <Route path="/loan/:loanType" element={<LoanLanding />} />
        <Route path="/loan/:loanType/:featureId" element={<LoanFeature />} />

        {/* Redirect routes for backward compatibility */}
        <Route path="/calculator" element={<LoanFeature />} />
        <Route path="/amortization" element={<Amortization />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/affordability" element={<Affordability />} />
        <Route path="/early-repayment" element={<EarlyRepayment />} />
        <Route path="/scenarios" element={<Scenarios />} />
        <Route path="/stamp-duty" element={<StampDuty />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
