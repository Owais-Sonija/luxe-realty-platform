import { MortgageCalculator } from '../components/MortgageCalculator'
import { FileText, Percent, HelpCircle, CheckCircle } from 'lucide-react'
import { Footer } from '../components/Footer'

export const MortgagePage = () => {
  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Mortgage Calculator</h1>
          <p className="text-slate-600 text-lg">
            Plan your home purchase with our comprehensive mortgage calculator.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          <div className="lg:col-span-3">
            <MortgageCalculator />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-700" />
                Why Use Our Calculator?
              </h3>
              <ul className="space-y-3">
                {[
                  'Get accurate monthly payment estimates',
                  'Factor in property taxes and insurance',
                  'Compare 15-year vs 30-year loan terms',
                  'See how down payments affect your rate'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-700 text-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-blue-200" />
                Current Market Rates (approximate)
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-blue-600">
                  <span className="text-blue-100">30-Year Fixed</span>
                  <span className="font-bold text-xl">6.50%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-blue-600">
                  <span className="text-blue-100">15-Year Fixed</span>
                  <span className="font-bold text-xl">5.75%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">5/1 ARM</span>
                  <span className="font-bold text-xl">6.00%</span>
                </div>
              </div>
              <p className="text-xs text-blue-200 mt-4 text-center leading-relaxed">
                *Rates shown are approximate national averages.<br/>
                Contact a lender for your personalized rate.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Ready to apply?</h3>
              <p className="text-sm text-slate-600 mb-6">
                Get pre-approved today and stand out to sellers.
              </p>
              <a 
                href="mailto:info@luxerealty.com?subject=Pre-Approval Request"
                className="btn-primary block text-center py-3"
              >
                Get Pre-Approved →
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
