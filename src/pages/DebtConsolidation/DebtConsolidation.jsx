import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import DebtConsolidationTool from '../../components/services/DebtConsolidationTool';

const DebtConsolidation = ({ loanType = 'debt' }) => {
  const params = useParams();
  const currentLoanType = params.loanType || loanType;

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-4">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Debt Consolidation Tool
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Compare different debt payoff strategies to find the best approach for your situation. This tool helps you analyze the Avalanche Method (highest interest first), Snowball Method (lowest balance first), and Consolidation options to see which saves you the most money and time.
            </p>
          </div>
        </Card>

        <DebtConsolidationTool />
      </motion.div>
    </div>
  );
};

export default DebtConsolidation;
