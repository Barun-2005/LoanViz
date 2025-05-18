import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaBuilding, FaCalculator } from 'react-icons/fa';
// Import GlassCard directly instead of using destructuring
import GlassCard from '../../components/ui/modern/GlassCard';
import { Suspense, lazy } from 'react';

// Import directly instead of lazy loading to diagnose issues
import StampDutyCalculator from '../../components/services/StampDutyCalculator';
import InvestmentStampDutyCalculator from '../../components/services/InvestmentStampDutyCalculator';

const StampDuty = ({ loanType = 'mortgage' }) => {
  const params = useParams();
  const currentLoanType = params.loanType || loanType;

  // Only mortgage and investment loan types have stamp duty
  const validLoanTypes = ['mortgage', 'investment'];
  const loanTypeId = validLoanTypes.includes(currentLoanType) ? currentLoanType : 'mortgage';

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard
          className="mb-4"
          title={currentLoanType === 'investment'
            ? 'Investment Property Transfer Tax Calculator'
            : `${currentLoanType.charAt(0).toUpperCase() + currentLoanType.slice(1)} Stamp Duty Calculator`}
          icon={currentLoanType === 'investment' ? <FaBuilding className="h-5 w-5" /> : <FaHome className="h-5 w-5" />}
          variant="primary"
          effect="glow"
          animate={true}
        >
          <div className="p-4">
            {currentLoanType === 'investment' ? (
              <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">
                Calculate transfer tax for investment properties and analyze its impact on your investment returns.
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">
                Calculate stamp duty for your property purchase across the UK.
              </p>
            )}
          </div>
        </GlassCard>

        <Suspense fallback={
          <div className="flex justify-center items-center h-40 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading calculator...</p>
            </div>
          </div>
        }>
          {loanTypeId === 'investment' ? (
            <InvestmentStampDutyCalculator />
          ) : (
            <StampDutyCalculator loanTypeId={loanTypeId} />
          )}
        </Suspense>
      </motion.div>
    </div>
  );
};

export default StampDuty;
