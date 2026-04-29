import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { formatPrice } from '../utils/format'

interface MortgageCalculatorProps {
  initialPrice?: number;
}

export const MortgageCalculator = ({ initialPrice = 500000 }: MortgageCalculatorProps) => {
  const [homePrice, setHomePrice] = useState(initialPrice)
  const [downPayment, setDownPayment] = useState(initialPrice * 0.2)
  const [isPercent, setIsPercent] = useState(false)
  const [loanTerm, setLoanTerm] = useState(30)
  const FIXED_INTEREST_RATE = 6.5
  const [propertyTax, setPropertyTax] = useState(initialPrice * 0.012)
  const [insurance, setInsurance] = useState(1200)
  const [hoa, setHoa] = useState(0)

  const actualDownPayment = isPercent ? (homePrice * downPayment) / 100 : downPayment
  const principal = Math.max(0, homePrice - actualDownPayment)
  const monthlyRate = FIXED_INTEREST_RATE / 100 / 12
  const numPayments = loanTerm * 12

  let monthlyMortgage = 0
  if (monthlyRate > 0) {
    monthlyMortgage = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
  } else {
    monthlyMortgage = principal / numPayments
  }

  const taxMonthly = propertyTax / 12
  const insuranceMonthly = insurance / 12
  const totalMonthly = monthlyMortgage + taxMonthly + insuranceMonthly + hoa

  let validationError = ''
  if (homePrice <= 0) validationError = 'Please enter a valid home price'
  else if (actualDownPayment >= homePrice) validationError = 'Down payment cannot exceed home price'

  const displayMonthlyMortgage = validationError ? 0 : monthlyMortgage
  const displayTaxMonthly = validationError ? 0 : taxMonthly
  const displayInsuranceMonthly = validationError ? 0 : insuranceMonthly
  const displayHoa = validationError ? 0 : hoa
  const displayTotalMonthly = validationError ? 0 : totalMonthly

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
          <Calculator className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Mortgage Calculator</h3>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Home Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input type="number" min="10000" value={homePrice} onChange={e => setHomePrice(Number(e.target.value))} className="input-field pl-8" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Down Payment</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              {!isPercent && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>}
              <input type="number" value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} className={`input-field ${!isPercent ? 'pl-8' : ''}`} />
              {isPercent && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>}
            </div>
            <button onClick={() => setIsPercent(false)} className={`px-4 rounded-xl font-medium border ${!isPercent ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>$</button>
            <button onClick={() => setIsPercent(true)} className={`px-4 rounded-xl font-medium border ${isPercent ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>%</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loan Term</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setLoanTerm(15)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${loanTerm === 15 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>15 yr</button>
              <button onClick={() => setLoanTerm(30)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${loanTerm === 30 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>30 yr</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Property Tax/yr</label>
            <input type="number" value={propertyTax} onChange={e => setPropertyTax(Number(e.target.value))} className="input-field px-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Insurance/yr</label>
            <input type="number" value={insurance} onChange={e => setInsurance(Number(e.target.value))} className="input-field px-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">HOA/mo</label>
            <input type="number" value={hoa} onChange={e => setHoa(Number(e.target.value))} className="input-field px-2 text-sm" />
          </div>
        </div>
        
        {validationError && (
          <div className="text-red-500 text-sm mt-4 font-medium px-1">
            {validationError}
          </div>
        )}
      </div>

      <div className="bg-blue-700 text-white rounded-2xl p-5">
        <div className="text-center mb-4">
          <span className="block text-blue-200 text-sm font-medium mb-1">Est. Monthly Payment</span>
          <span className="text-4xl font-bold">{formatPrice(displayTotalMonthly)}<span className="text-xl text-blue-200 font-normal">/mo</span></span>
          <div className="text-xs text-blue-300 mt-1">Based on 6.5% interest rate (30-yr avg)</div>
        </div>
        
        <div className="space-y-2 text-sm border-t border-blue-600 pt-4">
          <div className="flex justify-between">
            <span className="text-blue-200">Principal & Interest</span>
            <span className="font-semibold">{formatPrice(displayMonthlyMortgage)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Property Tax</span>
            <span className="font-semibold">{formatPrice(displayTaxMonthly)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Home Insurance</span>
            <span className="font-semibold">{formatPrice(displayInsuranceMonthly)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">HOA</span>
            <span className="font-semibold">{formatPrice(displayHoa)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center text-xs text-slate-500">
        Total loan amount: {formatPrice(principal)} with {isPercent ? downPayment : ((downPayment/homePrice)*100).toFixed(1)}% down
      </div>
    </div>
  )
}
