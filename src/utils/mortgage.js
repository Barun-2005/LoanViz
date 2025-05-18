// Monthly payment calculator using standard mortgage formulas
export const calculateMonthlyPayment = (principal, annualRate, termYears, type = 'repayment') => {
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = termYears * 12;

  // Interest-only calculation
  if (type === 'interest-only') {
    return principal * monthlyRate;
  }

  // 0% interest edge case
  if (monthlyRate === 0) {
    return principal / totalPayments;
  }

  const x = Math.pow(1 + monthlyRate, totalPayments);
  return (principal * x * monthlyRate) / (x - 1);
};

// Comprehensive loan calculator with support for various loan types and features
export const calculateMortgage = ({
  principal,
  rate,
  termYears,
  type = 'repayment',
  downPayment = 0,
  tradeInValue = 0,
  gracePeriodMonths = 0,
  fees = {}
}) => {
  // Apply down payment and trade-in
  let adjustedPrincipal = principal;
  if (downPayment > 0 || tradeInValue > 0) {
    adjustedPrincipal = Math.max(principal - downPayment - tradeInValue, 0);
  }

  // Format rate to avoid floating point issues
  const formattedRate = parseFloat(rate.toFixed(2));
  const monthlyRate = formattedRate / 100 / 12;
  const totalPayments = termYears * 12;

  // Get monthly payment
  const monthlyPayment = calculateMonthlyPayment(adjustedPrincipal, formattedRate, termYears, type);

  // Handle student loan grace period
  let gracePeriodInterest = 0;
  if (gracePeriodMonths > 0) {
    gracePeriodInterest = adjustedPrincipal * monthlyRate * gracePeriodMonths;
  }

  // Interest-only loan calculation
  if (type === 'interest-only') {
    const monthlyInterest = adjustedPrincipal * monthlyRate;
    let totalInterest = monthlyInterest * totalPayments;

    if (gracePeriodMonths > 0) {
      totalInterest += gracePeriodInterest;
    }

    const totalFees = Object.values(fees).reduce((sum, fee) => sum + (parseFloat(fee) || 0), 0);

    const result = {
      principal: adjustedPrincipal,
      originalPrincipal: principal,
      rate: formattedRate,
      termYears,
      type,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalInterest: Math.round(totalInterest),
      totalRepayment: Math.round(adjustedPrincipal + totalInterest + totalFees),
      fees: totalFees
    };

    // Auto loan fields
    if (downPayment > 0 || tradeInValue > 0) {
      result.downPayment = downPayment;
      result.tradeInValue = tradeInValue;
      result.loanToValueRatio = ((principal - downPayment - tradeInValue) / principal) * 100;
    }

    // Student loan fields
    if (gracePeriodMonths > 0) {
      result.gracePeriodMonths = gracePeriodMonths;
      result.gracePeriodInterest = gracePeriodInterest;
    }

    return result;
  }

  // Standard repayment calculation
  const totalRepayment = monthlyPayment * totalPayments;
  let totalInterest = totalRepayment - adjustedPrincipal;

  // Add grace period interest if applicable
  if (gracePeriodMonths > 0 && type === 'repayment') {
    totalInterest += gracePeriodInterest;
  }

  const totalFees = Object.values(fees).reduce((sum, fee) => sum + (parseFloat(fee) || 0), 0);

  const result = {
    principal: adjustedPrincipal,
    originalPrincipal: principal,
    rate: formattedRate,
    termYears,
    type,
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    totalInterest: Math.round(totalInterest),
    totalRepayment: Math.round(totalRepayment + (gracePeriodMonths > 0 ? gracePeriodInterest : 0) + totalFees),
    fees: totalFees
  };

  // Auto loan fields
  if (downPayment > 0 || tradeInValue > 0) {
    result.downPayment = downPayment;
    result.tradeInValue = tradeInValue;
    result.loanToValueRatio = ((principal - downPayment - tradeInValue) / principal) * 100;
  }

  // Student loan fields
  if (gracePeriodMonths > 0) {
    result.gracePeriodMonths = gracePeriodMonths;
    result.gracePeriodInterest = gracePeriodInterest;
  }

  return result;
};

// Create detailed month-by-month amortization schedule
export const generateAmortizationSchedule = (principal, annualRate, termYears, gracePeriodMonths = 0) => {
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = termYears * 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);

  let balance = principal;
  const schedule = [];
  let totalInterestPaid = 0;

  // Grace period (student loans)
  if (gracePeriodMonths > 0) {
    for (let month = 1; month <= gracePeriodMonths; month++) {
      const interestPayment = balance * monthlyRate;

      schedule.push({
        month,
        payment: 0,
        principalPayment: 0,
        interestPayment,
        balance,
        totalInterestPaid: totalInterestPaid,
        isGracePeriod: true
      });

      // Track interest but don't add to displayed balance
      totalInterestPaid += interestPayment;
    }
  }

  // Regular repayment period
  for (let month = gracePeriodMonths + 1; month <= totalPayments + gracePeriodMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;

    balance -= principalPayment;

    // Fix final payment rounding
    if (month === totalPayments + gracePeriodMonths) {
      balance = 0;
    }

    totalInterestPaid += interestPayment;

    schedule.push({
      month,
      payment: monthlyPayment,
      principalPayment,
      interestPayment,
      balance,
      totalInterestPaid,
      isGracePeriod: false
    });
  }

  return schedule;
};

// Calculate maximum affordable property price based on income and debt profile
export const calculateAffordability = (
  monthlyIncome,
  monthlyDebts,
  downPayment,
  annualRate,
  termYears,
  debtToIncomeRatio = 0.36 // This is the standard maximum DTI used by lenders
) => {
  // Sanitize inputs
  monthlyIncome = Math.max(0, parseFloat(monthlyIncome) || 0);
  monthlyDebts = Math.max(0, parseFloat(monthlyDebts) || 0);
  downPayment = Math.max(0, parseFloat(downPayment) || 0);
  annualRate = Math.min(30, Math.max(0.1, parseFloat(annualRate) || 3.5));
  termYears = Math.min(50, Math.max(1, parseFloat(termYears) || 30));
  debtToIncomeRatio = Math.min(0.5, Math.max(0.1, parseFloat(debtToIncomeRatio) || 0.36));

  // No income = only down payment is affordable
  if (monthlyIncome <= 0) {
    console.warn('Affordability calculation: Monthly income must be greater than zero');
    return downPayment;
  }

  // Too much existing debt
  const maxAllowableDebt = monthlyIncome * debtToIncomeRatio;
  if (monthlyDebts > maxAllowableDebt) {
    console.warn('Affordability calculation: Current debts exceed maximum debt-to-income ratio limit');
    return downPayment;
  }

  // Calculate available payment amount
  const maxMonthlyPayment = maxAllowableDebt - monthlyDebts;

  if (maxMonthlyPayment <= 0) {
    console.warn('Affordability calculation: Max monthly payment is zero or negative');
    return downPayment;
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = termYears * 12;

  // Handle near-zero interest rate
  if (monthlyRate < 0.0001) {
    const maxLoanAmount = maxMonthlyPayment * totalPayments;
    return maxLoanAmount + downPayment;
  }

  try {
    // Standard mortgage formula for max loan amount
    const x = Math.pow(1 + monthlyRate, totalPayments);
    const maxLoanAmount = maxMonthlyPayment * (x - 1) / (x * monthlyRate);
    const totalAffordablePrice = maxLoanAmount + downPayment;

    // Cap at 10x annual income for reasonability
    const annualIncome = monthlyIncome * 12;
    const maxReasonablePrice = annualIncome * 10 + downPayment;
    const finalResult = isNaN(totalAffordablePrice) || !isFinite(totalAffordablePrice)
      ? downPayment
      : Math.min(totalAffordablePrice, maxReasonablePrice);

    return finalResult;
  } catch (error) {
    console.error('Error in affordability calculation:', error);
    // Simple fallback: 4x annual income + down payment
    const annualIncome = monthlyIncome * 12;
    const fallbackPrice = (annualIncome * 4) + downPayment;
    return fallbackPrice;
  }
};

// Generate CSV export of amortization schedule with loan details
export const exportToCSV = (schedule, loanDetails = null, currencySymbol = '£') => {
  // Metadata section
  const metadataRows = [];
  if (loanDetails) {
    metadataRows.push(['Loan Amortization Schedule']);
    metadataRows.push(['Generated on', new Date().toISOString().split('T')[0]]);
    metadataRows.push(['']);
    metadataRows.push(['Loan Summary']);
    metadataRows.push(['Loan Amount', `${currencySymbol}${loanDetails.principal.toLocaleString()}`]);
    metadataRows.push(['Interest Rate', `${loanDetails.rate}%`]);
    metadataRows.push(['Term', `${loanDetails.termYears} years`]);
    metadataRows.push(['Monthly Payment', `${currencySymbol}${loanDetails.monthlyPayment.toFixed(2)}`]);
    metadataRows.push(['Total Interest', `${currencySymbol}${loanDetails.totalInterest.toLocaleString()}`]);
    metadataRows.push(['Total Repayment', `${currencySymbol}${loanDetails.totalRepayment.toLocaleString()}`]);
    metadataRows.push(['']);
  }

  // Column headers
  const headers = [
    'Month',
    `Payment (${currencySymbol})`,
    `Principal (${currencySymbol})`,
    `Interest (${currencySymbol})`,
    `Balance (${currencySymbol})`,
    `Total Interest Paid (${currencySymbol})`
  ];

  // Payment data rows
  const rows = schedule.map(payment => [
    payment.month,
    payment.payment.toFixed(2),
    payment.principalPayment.toFixed(2),
    payment.interestPayment.toFixed(2),
    payment.balance.toFixed(2),
    payment.totalInterestPaid.toFixed(2)
  ]);

  // Combine all sections
  const allRows = [...metadataRows, headers, ...rows];

  // CSV value escaping function
  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Generate CSV string
  return allRows.map(row => row.map(escapeCsvValue).join(',')).join('\n');
};
