import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import loanConfig from '../../config/loanConfig';

const LoanLanding = () => {
  const { loanType } = useParams();
  const navigate = useNavigate();
  const [loanData, setLoanData] = useState(null);
  
  // Find the loan configuration based on the URL parameter
  useEffect(() => {
    const loan = loanConfig.find(loan => loan.id === loanType);
    
    if (loan) {
      setLoanData(loan);
    } else {
      // Redirect to dashboard if loan type not found
      navigate('/');
    }
  }, [loanType, navigate]);
  
  if (!loanData) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
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
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${loanData.color} text-white mr-4`}>
            <loanData.icon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-loanviz-primary to-loanviz-secondary dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {loanData.name} Calculators
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
          {loanData.description}. Choose a calculator below to get started.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {loanData.features.map((feature) => (
          <motion.div key={feature.id} variants={itemVariants}>
            <Link to={`/loan/${loanType}/${feature.id}`} className="block h-full">
              <Card
                className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                variant="glass"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${loanData.color} text-white mr-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-semibold">{feature.name}</h2>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                    {feature.description}
                  </p>
                  
                  <Button
                    variant="primary"
                    className="w-full mt-auto"
                    icon={<feature.icon className="w-5 h-5" />}
                  >
                    Open {feature.name}
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

export default LoanLanding;
