import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import loanConfig from '../../config/loanConfig';
import { loanParams } from '../../config/loanConfig';

// Lazy load components to prevent circular dependencies
const BasicCalculatorNew = lazy(() => import('../BasicCalculator/BasicCalculatorNew'));
const AmortizationNew = lazy(() => import('../Amortization/AmortizationNew'));
const ComparisonNew = lazy(() => import('../Comparison/ComparisonNew'));
const AffordabilityNew = lazy(() => import('../Affordability/AffordabilityNew'));
const EarlyRepayment = lazy(() => import('../EarlyRepayment/EarlyRepayment'));
const Scenarios = lazy(() => import('../Scenarios/Scenarios'));
const StampDuty = lazy(() => import('../StampDuty/StampDuty'));
const ScenarioSelector = lazy(() => import('../../components/services/ScenarioSelector'));

// Map feature IDs to their respective components
const featureComponents = {
  calculator: BasicCalculatorNew,
  amortization: AmortizationNew,
  comparison: ComparisonNew,
  affordability: AffordabilityNew,
  earlyRepayment: EarlyRepayment,
  scenarios: Scenarios,
  stampDuty: StampDuty
};

const LoanFeature = () => {
  const { loanType, featureId } = useParams();
  const navigate = useNavigate();
  const [loanData, setLoanData] = useState(null);
  const [featureData, setFeatureData] = useState(null);

  // Find the loan and feature configuration based on URL parameters
  useEffect(() => {
    // Ensure we have valid parameters before proceeding
    if (!loanType || !featureId) return;

    // Reset state when parameters change
    setLoanData(null);
    setFeatureData(null);

    // Use setTimeout to ensure this runs after the current render cycle
    // This helps prevent the blank page issue when navigating from Dashboard
    setTimeout(() => {
      const loan = loanConfig.find(loan => loan.id === loanType);

      if (loan) {
        setLoanData(loan);

        const feature = loan.features.find(feature => feature.id === featureId);
        if (feature) {
          setFeatureData(feature);
        } else {
          // Redirect to loan landing page if feature not found
          navigate(`/loan/${loanType}`);
        }
      } else {
        // Redirect to dashboard if loan type not found
        navigate('/');
      }
    }, 0);
  }, [loanType, featureId, navigate]);

  if (!loanData || !featureData) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading {loanType && featureId ? `${loanType} ${featureId}` : 'calculator'}...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            If content doesn't appear, try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  // Get the component for this feature
  let FeatureComponent = featureComponents[featureId];

  // Special case for student loans: use ScenarioSelector instead of Affordability
  if (loanType === 'student' && featureId === 'affordability') {
    FeatureComponent = ScenarioSelector;
  }

  if (!FeatureComponent) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-md">
          <p className="font-bold">Feature Not Implemented</p>
          <p>This feature is currently under development.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-2 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg border-b border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${loanData.color} text-white mr-3`}>
            <loanData.icon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {loanData.name} • {featureData.name}
          </h2>
        </div>
      </div>

      <div className="h-full">
        {/* Use Suspense for lazy-loaded components */}
        <Suspense fallback={
          <div className="flex justify-center items-center h-full py-20">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading component...
              </p>
            </div>
          </div>
        }>
          <FeatureComponent key={`${loanType}-${featureId}`} loanType={loanType} />
        </Suspense>
      </div>
    </motion.div>
  );
};

export default LoanFeature;
