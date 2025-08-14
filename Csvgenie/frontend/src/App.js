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
          <div className="max-w-6xl mx-auto space-y-8">
            <FileUpload />
            <ResultsTable />
          </div>
        </main>
      </div>
    </OrderProvider>
  );
}

export default App;
