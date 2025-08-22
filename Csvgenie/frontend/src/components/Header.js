import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CSVGenie</h1>
              <p className="text-sm text-gray-600">AI-Powered Order Processing</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="#features" 
              className="text-gray-600 hover:text-primary-600 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Features
            </a>
            <a 
              href="#about" 
              className="text-gray-600 hover:text-primary-600 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              About
            </a>
            <a 
              href="#help" 
              className="text-gray-600 hover:text-primary-600 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('help').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Help
            </a>
          </nav>
          
          <div className="flex items-center space-x-3">
            <button className="text-gray-600 hover:text-primary-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
