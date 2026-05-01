import { Link } from 'react-router-dom'

export const Footer = () => (
  <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-xl font-bold text-white">LuxeRealty</span>
        </div>
        <p className="text-sm">Premium real estate platform for finding your dream home.</p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/properties" className="hover:text-white transition-colors">Properties</Link></li>
          <li><Link to="/agents" className="hover:text-white transition-colors">Agents</Link></li>
          <li><Link to="/mortgage" className="hover:text-white transition-colors">Mortgage Calculator</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Property Types</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/properties" className="hover:text-white transition-colors">Houses</Link></li>
          <li><Link to="/properties" className="hover:text-white transition-colors">Apartments</Link></li>
          <li><Link to="/properties" className="hover:text-white transition-colors">Villas</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Contact</h4>
        <ul className="space-y-2 text-sm">
          <li>123 Realty Street</li>
          <li>Beverly Hills, CA 90210</li>
          <li>contact@luxerealty.com</li>
          <li>(555) 123-4567</li>
        </ul>
      </div>
    </div>
    
    <div className="border-t border-slate-800 py-4">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-slate-500 text-sm">
          © 2026 LuxeRealty. All rights reserved.
        </p>
        
        <div className="flex items-center gap-2 text-slate-500 text-sm flex-wrap justify-center">
          <span>Built by</span>
          
          <a
            href="https://github.com/Owais-Sonija"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Owais Sonija
          </a>
          
          <span className="text-slate-600">·</span>
          
          <a
            href="https://dr-owais-sonija-developer-portfolio-website.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white transition-colors font-medium"
          >
            Portfolio
          </a>
          
          <span className="text-slate-600">·</span>
          
          <a
            href="http://martz.live/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white transition-colors font-medium"
          >
            martz.live
          </a>
        </div>
      </div>
    </div>
  </footer>
)
