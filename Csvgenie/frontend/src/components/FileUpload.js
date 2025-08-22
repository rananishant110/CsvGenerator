import React, { useState, useRef, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { processOrderFile, getFullCatalog } from '../utils/api';

const FileUpload = () => {
  const { dispatch, isProcessing, uploadProgress } = useOrder();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputMode, setInputMode] = useState('file'); // 'file', 'text', 'manual'
  const [textContent, setTextContent] = useState('');
  const [manualItems, setManualItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, code: '' });
  const [showCatalogSearch, setShowCatalogSearch] = useState(false);
  const [catalogItems, setCatalogItems] = useState([]);
  const [filteredCatalogItems, setFilteredCatalogItems] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      setSelectedFile(file);
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Please select a valid text file (.txt)' });
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select a file first' });
      return;
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const results = await processOrderFile(formData, (progress) => {
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress });
      });

      // Debug logging for results
      console.log('📁 FileUpload Debug - Results received:', results);
      console.log('📁 FileUpload Debug - Unmapped items:', results.unmapped_items);
      
      dispatch({ type: 'SET_RESULTS', payload: results });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.detail || error.message || 'An error occurred while processing the file' 
      });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTextContent('');
    setManualItems([]);
    setNewItem({ name: '', quantity: 1, code: '' });
    setInputMode('file');
    dispatch({ type: 'RESET' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle direct text processing
  const handleTextSubmit = async () => {
    if (!textContent.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter some text content' });
      return;
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Create a text file from the content
      const blob = new Blob([textContent], { type: 'text/plain' });
      const file = new File([blob], 'direct_input.txt', { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('file', file);

      const results = await processOrderFile(formData, (progress) => {
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress });
      });

      console.log('📝 TextUpload Debug - Results received:', results);
      dispatch({ type: 'SET_RESULTS', payload: results });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.detail || error.message || 'An error occurred while processing the text' 
      });
    }
  };

  // Handle manual order creation
  const handleManualSubmit = () => {
    if (manualItems.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'Please add at least one item to the order' });
      return;
    }

    // Create results structure for manual items
    const results = {
      mapped_items: manualItems.map((item, index) => ({
        original_text: item.name,
        item_code: item.code || `MANUAL_${index + 1}`,
        item_name: item.name,
        category: 'Manual Entry',
        quantity: item.quantity,
        confidence: 'manual',
        similarity_score: 1.0
      })),
      unmapped_items: [],
      total_items: manualItems.length,
      mapped_count: manualItems.length,
      unmapped_count: 0,
      csv_filename: null,
      processing_time_ms: 0
    };

    dispatch({ type: 'SET_RESULTS', payload: results });
    console.log('📋 Manual order created:', results);
  };

  // Add manual item
  const handleAddManualItem = () => {
    if (!newItem.name.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter an item name' });
      return;
    }

    setManualItems([...manualItems, { ...newItem }]);
    setNewItem({ name: '', quantity: 1, code: '' });
  };

  // Remove manual item
  const handleRemoveManualItem = (index) => {
    setManualItems(manualItems.filter((_, i) => i !== index));
  };

  // Load catalog items when manual mode is selected
  useEffect(() => {
    if (inputMode === 'manual' && catalogItems.length === 0) {
      loadCatalogItems();
    }
  }, [inputMode]);

  // Load catalog items from the backend
  const loadCatalogItems = async () => {
    try {
      const catalog = await getFullCatalog();
      setCatalogItems(catalog);
      console.log('📚 Loaded catalog items for manual mode:', catalog.length);
    } catch (error) {
      console.error('Error loading catalog:', error);
      // Set empty array to prevent errors
      setCatalogItems([]);
    }
  };

  // Filter catalog items for search
  const filterCatalogItems = (searchTerm) => {
    if (!searchTerm.trim()) return [];
    
    const searchLower = searchTerm.toLowerCase();
    return catalogItems.filter(item => 
      item.item_name.toLowerCase().includes(searchLower) ||
      (item.item_code && item.item_code.toLowerCase().includes(searchLower)) ||
      (item.category && item.category.toLowerCase().includes(searchLower))
    ).slice(0, 10);
  };

  // Handle catalog item selection
  const handleCatalogItemSelect = (catalogItem) => {
    setNewItem({
      name: catalogItem.item_name,
      quantity: 1,
      code: catalogItem.item_code
    });
    setShowCatalogSearch(false);
    console.log('✅ Selected catalog item:', catalogItem);
  };

  // Update filtered catalog items when search term changes
  useEffect(() => {
    if (newItem.name.trim()) {
      const filtered = filterCatalogItems(newItem.name);
      setFilteredCatalogItems(filtered);
    } else {
      setFilteredCatalogItems([]);
    }
  }, [newItem.name, catalogItems]);

  // Close catalog search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCatalogSearch && !event.target.closest('.catalog-search-container')) {
        setShowCatalogSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCatalogSearch]);

  return (
    <div className="card">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Order</h2>
        <p className="text-gray-600">
          Choose how you want to create your order: upload a file, paste text directly, or build manually
        </p>
      </div>

      {/* Input Mode Selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setInputMode('file')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'file'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📁 Upload File
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'text'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Paste Text
          </button>
          <button
            onClick={() => setInputMode('manual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'manual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✏️ Build Manually
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* File Upload Mode */}
        {inputMode === 'file' && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary-500 bg-primary-50' 
                : selectedFile 
                  ? 'border-success-500 bg-success-50' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-success-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drop your text file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports .txt files with free-form grocery orders
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Direct Text Input Mode */}
        {inputMode === 'text' && (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-blue-900">Paste Your Order Text</h3>
              <p className="text-sm text-blue-700">Type or paste your grocery order directly here</p>
            </div>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter your grocery order here...&#10;Example:&#10;2 apples&#10;1 loaf of bread&#10;3 cans of soup"
              className="w-full h-32 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Manual Order Building Mode */}
        {inputMode === 'manual' && (
          <div className="border-2 border-dashed border-green-300 rounded-lg p-6 bg-green-50">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-green-900">Build Your Order Manually</h3>
              <p className="text-sm text-green-700">Search catalog or add items manually to create your order</p>
            </div>
            
            {/* Enhanced Add New Item Form with Catalog Search */}
            <div className="space-y-4">
              {/* Item Name with Catalog Search */}
              <div className="relative catalog-search-container">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => {
                    setNewItem({ ...newItem, name: e.target.value });
                    // Trigger catalog search
                    if (e.target.value.trim()) {
                      setShowCatalogSearch(true);
                    } else {
                      setShowCatalogSearch(false);
                    }
                  }}
                  onFocus={() => {
                    if (newItem.name.trim()) {
                      setShowCatalogSearch(true);
                    }
                  }}
                  placeholder="Search catalog or type item name"
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                
                {/* Catalog Search Dropdown */}
                {showCatalogSearch && newItem.name.trim() && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-green-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredCatalogItems.length > 0 ? (
                      filteredCatalogItems.map((catalogItem, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-green-100 cursor-pointer text-sm border-b border-green-100 last:border-b-0"
                          onClick={() => handleCatalogItemSelect(catalogItem)}
                        >
                          <div className="font-medium text-gray-900">{catalogItem.item_name}</div>
                          <div className="text-gray-500 text-xs">
                            Code: {catalogItem.item_code} | Category: {catalogItem.category}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No catalog matches found. You can add this item manually.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity and Code Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 1 })}
                  min="0.01"
                  step="0.01"
                  placeholder="Quantity"
                  className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={newItem.code}
                  onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                  placeholder="Item code"
                  className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleAddManualItem}
                  disabled={!newItem.name.trim()}
                  className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Item
                </button>
              </div>
            </div>

            {/* Manual Items List */}
            {manualItems.length > 0 && (
              <div className="bg-white rounded-lg border border-green-200">
                <div className="px-4 py-2 bg-green-100 border-b border-green-200">
                  <h4 className="font-medium text-green-900">Order Items ({manualItems.length})</h4>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {manualItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between px-4 py-2 border-b border-green-100 last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity} {item.code && `| Code: ${item.code}`}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveManualItem(index)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        ✗
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden File Input - Only for file mode */}
        {inputMode === 'file' && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileInput}
            className="hidden"
          />
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {inputMode === 'file' && (
            !selectedFile ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                Choose File
              </button>
            ) : (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Process Order'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </>
            )
          )}

          {inputMode === 'text' && (
            <>
              <button
                onClick={handleTextSubmit}
                disabled={isProcessing || !textContent.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Process Text'}
              </button>
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </>
          )}

          {inputMode === 'manual' && (
            <>
              <button
                onClick={handleManualSubmit}
                disabled={manualItems.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Order ({manualItems.length} items)
              </button>
              <button
                onClick={handleReset}
                className="btn-secondary"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
          
          {inputMode === 'file' && (
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Create a text file with your grocery order in free-form text</li>
              <li>Upload the file using the upload area above</li>
              <li>Click "Process Order" to analyze and map items</li>
              <li>Review results and download the CSV file</li>
            </ol>
          )}

          {inputMode === 'text' && (
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Type or paste your grocery order directly in the text area</li>
              <li>Use free-form text format (e.g., "2 apples", "1 loaf of bread")</li>
              <li>Click "Process Text" to analyze and map items</li>
              <li>Review results and download the CSV file</li>
            </ol>
          )}

          {inputMode === 'manual' && (
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Add items one by one using the form above</li>
              <li>Enter item name, quantity, and optional item code</li>
              <li>Click "Add Item" to add to your order</li>
              <li>Click "Create Order" when finished to generate results</li>
              <li>Review results and download the CSV file</li>
            </ol>
          )}

          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> You can switch between modes at any time. Each mode creates the same final result format.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
