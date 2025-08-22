import React from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import { OrderProvider } from './context/OrderContext';
import './index.css';

function App() {
  return (
    <OrderProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Main Application */}
            <div className="space-y-8">
              <FileUpload />
              <ResultsTable />
            </div>

            {/* Features Section */}
            <section id="features" className="scroll-mt-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Transform your grocery orders into structured data with our AI-powered processing system
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Multiple Input Methods</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Upload text files, paste content directly, or build orders manually with our intuitive interface. Choose the method that works best for your workflow.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Catalog Search</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Advanced search with word order independence, acronym matching, and fuzzy search. Find items quickly with our intelligent catalog integration.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Processing</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Machine learning algorithms automatically map items to your catalog, extract quantities, and handle complex order formats with high accuracy.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Export & Integration</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Generate clean CSV files for easy integration with inventory systems, accounting software, and other business tools.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Processing</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Process orders in real-time with progress tracking, instant results, and the ability to edit and refine data before export.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Assurance</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Built-in validation, error handling, and the ability to manually review and edit results for perfect data quality.
                  </p>
                </div>
              </div>
            </section>

            {/* About Section */}
            <section id="about" className="scroll-mt-20">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">About CSVGenie</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Revolutionizing how businesses process and manage grocery orders with cutting-edge AI technology
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      CSVGenie was created to solve the common challenge of converting unstructured grocery orders into structured, actionable data. 
                      We understand that businesses need efficient, accurate, and user-friendly tools to manage their inventory and orders.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      Our AI-powered system combines the latest machine learning techniques with intuitive design to deliver a solution that 
                      saves time, reduces errors, and improves operational efficiency.
                    </p>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Benefits</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Reduce manual data entry by up to 90%
                        </li>
                        <li className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Improve data accuracy and consistency
                        </li>
                        <li className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Streamline inventory management workflows
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Technology Stack</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          FastAPI Backend
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          React Frontend
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                          AI/ML Processing
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                          Cloud Deployment
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Use Cases</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Grocery stores and supermarkets
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Food service and catering
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Inventory management systems
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Supply chain operations
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Help Section */}
            <section id="help" className="scroll-mt-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Get started quickly and learn how to make the most of CSVGenie's powerful features
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Getting Started */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full mr-3 mt-1">1</span>
                      <p className="text-gray-600">Choose your input method: file upload, direct text, or manual building</p>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full mr-3 mt-1">2</span>
                      <p className="text-gray-600">Process your order with our AI-powered system</p>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full mr-3 mt-1">3</span>
                      <p className="text-gray-600">Review and edit results as needed</p>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full mr-3 mt-1">4</span>
                      <p className="text-gray-600">Export to CSV for use in other systems</p>
                    </div>
                  </div>
                </div>

                {/* Tips & Tricks */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Tips & Tricks</h3>
                  <div className="space-y-3 text-left text-gray-600">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p>Use the catalog search to find existing items quickly</p>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p>Manual mode is perfect for building orders from scratch</p>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p>Edit quantities and item codes before export</p>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p>Use the advanced search for complex item names</p>
                    </div>
                  </div>
                </div>

                {/* Contact & Support */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Contact & Support</h3>
                  <div className="space-y-4 text-left">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Developer</h4>
                      <p className="text-gray-600">Nishant Rana</p>
                      <p className="text-gray-600">rananishant110@gmail.com</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
                      <p className="text-gray-600">For technical support, feature requests, or bug reports, please contact the developer directly.</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Quick Help</h4>
                      <p className="text-sm text-gray-600">
                        Check the features section above for detailed information about each capability. 
                        The app is designed to be intuitive, but don't hesitate to reach out if you need assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="mt-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What file formats are supported?</h4>
                    <p className="text-gray-600">Currently, we support .txt files with free-form text content. The system automatically processes and structures the data.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">How accurate is the AI processing?</h4>
                    <p className="text-gray-600">Our AI system achieves high accuracy through machine learning algorithms trained on diverse grocery order patterns.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Can I edit results before export?</h4>
                    <p className="text-gray-600">Yes! You can edit item names, codes, and quantities in the results table before generating the final CSV.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Is my data secure?</h4>
                    <p className="text-gray-600">All processing is done securely, and no data is stored permanently. Your orders are processed in real-time and can be exported immediately.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </OrderProvider>
  );
}

export default App;
