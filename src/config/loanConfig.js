import {
  FaHome,
  FaHandHoldingUsd,
  FaCarSide,
  FaGraduationCap,
  FaChartPie,
  FaCreditCard,
  FaCalculator,
  FaChartLine,
  FaBalanceScale,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaLayerGroup,
  FaStamp
} from 'react-icons/fa';

// Feature definitions with icons and descriptions
export const featureDefinitions = {
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    icon: FaCalculator,
    description: 'Calculate payments, interest, and total costs'
  },
  amortization: {
    id: 'amortization',
    name: 'Amortization',
    icon: FaChartLine,
    description: 'View detailed payment schedule over time'
  },
  comparison: {
    id: 'comparison',
    name: 'Comparison',
    icon: FaBalanceScale,
    description: 'Compare different loan options side by side'
  },
  affordability: {
    id: 'affordability',
    name: 'Affordability',
    icon: FaMoneyBillWave,
    description: 'Determine what you can afford based on income'
  },
  earlyRepayment: {
    id: 'earlyRepayment',
    name: 'Early Repayment',
    icon: FaCalendarAlt,
    description: 'Calculate savings from early or extra payments'
  },
  scenarios: {
    id: 'scenarios',
    name: 'Scenarios',
    icon: FaLayerGroup,
    description: 'Create and compare different loan scenarios'
  },
  stampDuty: {
    id: 'stampDuty',
    name: 'Stamp Duty',
    icon: FaStamp,
    description: 'Calculate stamp duty and other taxes'
  }
};

// Loan type to feature mapping
export const loanFeatures = {
  mortgage: ['calculator', 'amortization', 'comparison', 'affordability', 'earlyRepayment', 'scenarios', 'stampDuty'],
  personal: ['calculator', 'amortization', 'comparison', 'affordability', 'earlyRepayment', 'scenarios'],
  auto: ['calculator', 'amortization', 'comparison', 'affordability', 'earlyRepayment', 'scenarios'],
  student: ['calculator', 'amortization', 'scenarios'],
  investment: ['calculator', 'comparison', 'affordability', 'scenarios', 'stampDuty'],
  debt: ['calculator', 'comparison', 'earlyRepayment', 'scenarios']
};

// Loan type specific parameters
export const loanParams = {
  mortgage: {
    // No special flags
  },
  personal: {
    // No special flags
  },
  auto: {
    hasDownPayment: true,
    hasTradeIn: true
  },
  student: {
    hasGracePeriod: true
  },
  investment: {
    // No special flags
  },
  debt: {
    // No special flags
  }
};

// Complete loan type configurations
const loanConfig = [
  {
    id: 'mortgage',
    name: 'Mortgage',
    icon: FaHome,
    description: 'Home and property mortgage calculators',
    color: 'from-blue-500 to-indigo-600',
    features: loanFeatures.mortgage.map(featureId => featureDefinitions[featureId]),
    params: loanParams.mortgage
  },
  {
    id: 'personal',
    name: 'Personal Loan',
    icon: FaHandHoldingUsd,
    description: 'Personal and unsecured loan calculators',
    color: 'from-indigo-500 to-purple-600',
    features: loanFeatures.personal.map(featureId => featureDefinitions[featureId]),
    params: loanParams.personal
  },
  {
    id: 'auto',
    name: 'Auto Loan',
    icon: FaCarSide,
    description: 'Vehicle financing and leasing calculators',
    color: 'from-purple-500 to-pink-600',
    features: loanFeatures.auto.map(featureId => featureDefinitions[featureId]),
    params: loanParams.auto
  },
  {
    id: 'student',
    name: 'Student Loan',
    icon: FaGraduationCap,
    description: 'Education financing and repayment calculators',
    color: 'from-pink-500 to-rose-600',
    features: loanFeatures.student.map(featureId => featureDefinitions[featureId]),
    params: loanParams.student
  },
  {
    id: 'investment',
    name: 'Investment',
    icon: FaChartPie,
    description: 'Investment and savings calculators',
    color: 'from-rose-500 to-red-600',
    features: loanFeatures.investment.map(featureId => featureDefinitions[featureId]),
    params: loanParams.investment
  },
  {
    id: 'debt',
    name: 'Debt Consolidation',
    icon: FaCreditCard,
    description: 'Debt management and consolidation calculators',
    color: 'from-red-500 to-orange-600',
    features: loanFeatures.debt.map(featureId => featureDefinitions[featureId]),
    params: loanParams.debt
  }
];

export default loanConfig;
