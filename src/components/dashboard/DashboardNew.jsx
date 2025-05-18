import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import loanConfig from '../../config/loanConfig';

const DashboardNew = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="p-4 md:p-6">
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-loanviz-primary to-loanviz-secondary dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
          Welcome to LoanViz
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Your comprehensive financial calculator suite for all types of loans and investments.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {loanConfig.map((loan) => (
          <motion.div key={loan.id} variants={itemVariants}>
            <Link to={`/loan/${loan.id}`} className="block h-full">
              <Card
                className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                variant="glass"
              >
                <div className="flex flex-col h-full p-3 sm:p-4 md:p-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${loan.color} text-white mr-3 sm:mr-4`}>
                      <loan.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold">{loan.name}</h2>
                  </div>

                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 flex-grow">
                    {loan.description}
                  </p>

                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {loan.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      >
                        <feature.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                        {feature.name}
                      </span>
                    ))}
                    {loan.features.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        +{loan.features.length - 3} more
                      </span>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    className="w-full mt-auto text-sm sm:text-base"
                    icon={<loan.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  >
                    Explore {loan.name} Tools
                  </Button>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DashboardNew;
