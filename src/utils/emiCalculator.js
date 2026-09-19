/**
 * Real Estate Mortgage & EMI Calculation Utilities
 * Standard Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * Where:
 * E = Monthly EMI
 * P = Principal Loan Amount
 * r = Monthly Interest Rate (Annual Rate / 12 / 100)
 * n = Number of Monthly Installments (Tenure in Years * 12)
 */

export function calculateEMI(principalAmount, annualInterestRate = 8.5, tenureYears = 20) {
  const P = Number(principalAmount) || 0;
  if (P <= 0) {
    return {
      monthlyEMI: 0,
      totalInterest: 0,
      totalAmount: 0,
      principal: 0,
      minIncomeRequired: 0,
      tenureMonths: 0
    };
  }

  const r = (annualInterestRate / 12) / 100;
  const n = tenureYears * 12;

  let emi = 0;
  if (r === 0) {
    emi = P / n;
  } else {
    emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const monthlyEMI = Math.round(emi);
  const totalAmount = Math.round(monthlyEMI * n);
  const totalInterest = Math.max(0, totalAmount - P);

  // 50% FOIR rule (Fixed Obligation to Income Ratio) standard across SBI/HDFC/ICICI
  // Monthly income must be at least 2x of EMI
  const minIncomeRequired = Math.round(monthlyEMI * 2);

  return {
    monthlyEMI,
    totalInterest,
    totalAmount,
    principal: P,
    minIncomeRequired,
    tenureMonths: n
  };
}

/**
 * Generates ready-to-send WhatsApp Pitch with EMI & Down payment breakdown
 */
export function formatEmiWhatsAppText({ clientName, propertyName, priceLakhs, downPaymentLakhs, loanAmountLakhs, rate, tenureYears, emi }) {
  const greeting = clientName ? `Hi ${clientName},` : 'Hello,';
  const propText = propertyName ? `for *${propertyName}*` : 'for your property purchase';

  return `${greeting} here is the quick home loan & EMI estimate ${propText}:\n\n` +
    `💰 *Total Property Value:* ₹${priceLakhs} Lakhs\n` +
    `💵 *Down Payment:* ₹${downPaymentLakhs} Lakhs (${Math.round((downPaymentLakhs / priceLakhs) * 100)}%)\n` +
    `🏦 *Loan Amount:* ₹${loanAmountLakhs} Lakhs\n` +
    `📈 *Interest Rate:* ${rate}% p.a. (${tenureYears} Years Tenure)\n\n` +
    `👉 *Estimated Monthly EMI:* ~₹${emi.toLocaleString('en-IN')}/mo\n` +
    `💼 *Min. Required Household Income:* ~₹${(emi * 2).toLocaleString('en-IN')}/mo\n\n` +
    `Would you like me to connect you with our bank loan advisor for instant pre-approval?`;
}
