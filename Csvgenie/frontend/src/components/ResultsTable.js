import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { downloadCSV } from '../utils/csvUtils';
import { getFullCatalog, getCatalogInfo } from '../utils/api';

const ResultsTable = () => {
  const { results, error, catalogStats } = useOrder();
  const [editableResults, setEditableResults] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState({});
  // const dropdownRef = useRef(null); // Unused for now

  // Load catalog items for search functionality
  useEffect(() => {
    console.log('🚀 Component mounted, starting catalog load...');
    const loadCatalog = async () => {
      try {
        console.log('🔄 Loading catalog summary...');
        const summary = await getCatalogInfo();
        console.log('📊 Catalog summary loaded:', summary);
        
        if (summary && summary.summary && summary.summary.total_items > 0) {
          console.log('✅ Catalog summary loaded successfully:', summary.summary.total_items, 'items');
          
          // Create catalog items from the summary data
          const items = [];
          if (summary.summary.item_codes && summary.summary.item_names) {
            for (let i = 0; i < summary.summary.item_codes.length; i++) {
              items.push({
                item_code: summary.summary.item_codes[i],
                item_name: summary.summary.item_names[i],
                category: 'General' // Default category since summary doesn't have individual categories
              });
            }
          }
          
          console.log('📝 Created catalog items:', items.length);
          console.log('📝 First item sample:', items[0]);
          setCatalogItems(items);
          
        } else {
          console.warn('⚠️ Catalog summary empty, trying full catalog...');
          // Fallback to full catalog
          try {
            const catalog = await getFullCatalog();
            console.log('📦 Full catalog response:', catalog);
            if (catalog && catalog.items && catalog.items.length > 0) {
              console.log('✅ Full catalog loaded successfully:', catalog.items.length, 'items');
              setCatalogItems(catalog.items);
            }
          } catch (fullCatalogError) {
            console.error('❌ Full catalog also failed:', fullCatalogError);
          }
        }
      } catch (error) {
        console.error('❌ Error loading catalog summary:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Try full catalog as last resort
        try {
          const catalog = await getFullCatalog();
          if (catalog && catalog.items && catalog.items.length > 0) {
            setCatalogItems(catalog.items);
          }
        } catch (fullCatalogError) {
          console.error('❌ All catalog loading methods failed:', fullCatalogError);
        }
      }
    };
    
    loadCatalog();
  }, []);

  // Click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside of any dropdown
      const isClickingDropdown = event.target.closest('.search-dropdown');
      if (!isClickingDropdown) {
        setShowSearchDropdown({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize editable results when results change
  useEffect(() => {
    if (results && results.mapped_items) {
      console.log('Setting editable results:', results.mapped_items.length);
      setEditableResults(results.mapped_items.map(item => ({
        ...item,
        isEditing: false,
        editedQuantity: item.quantity,
        editedItemName: item.item_name,
        editedItemCode: item.item_code
      })));
    }
  }, [results]);

  // Filter catalog items for search
  const filteredCatalogItems = catalogItems.filter(item => {
    if (!item || !item.item_name) {
      console.log('❌ Invalid item:', item);
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return false;
    
    const nameLower = item.item_name.toLowerCase();
    const codeLower = (item.item_code || '').toLowerCase();
    
    const nameMatch = nameLower.includes(searchLower);
    const codeMatch = codeLower.includes(searchLower);
    
    if (nameMatch || codeMatch) {
      console.log('✅ Match found:', item.item_name, 'for search:', searchTerm);
    }
    
    return nameMatch || codeMatch;
  }).slice(0, 10); // Limit to 10 results



  // Handle quantity editing
  const handleQuantityChange = (index, newQuantity) => {
    const updatedResults = [...editableResults];
    updatedResults[index].editedQuantity = parseFloat(newQuantity) || 0;
    setEditableResults(updatedResults);
  };

  // Handle item name search and selection
  const handleItemNameSearch = (index, searchValue) => {
    const updatedResults = [...editableResults];
    updatedResults[index].editedItemName = searchValue;
    updatedResults[index].isEditing = true;
    setEditableResults(updatedResults);
    setSearchTerm(searchValue);
    
    // Show dropdown if there's search text
    if (searchValue.trim()) {
      setShowSearchDropdown({ ...showSearchDropdown, [index]: true });
    } else {
      setShowSearchDropdown({ ...showSearchDropdown, [index]: false });
    }
  };

  // Handle item selection from dropdown
  const handleItemSelection = (index, selectedItem) => {
    const updatedResults = [...editableResults];
    updatedResults[index].editedItemName = selectedItem.item_name;
    updatedResults[index].editedItemCode = selectedItem.item_code;
    updatedResults[index].isEditing = false;
    setEditableResults(updatedResults);
    setShowSearchDropdown({ ...showSearchDropdown, [index]: false });
    setSearchTerm('');
  };

  // Handle CSV download with edited values
  const handleDownloadCSV = () => {
    const exportData = editableResults.map(item => ({
      item_code: item.editedItemCode,
      item_name: item.editedItemName,
      quantity: item.editedQuantity
    }));
    
    downloadCSV({
      mapped_items: exportData,
      unmapped_items: results?.unmapped_items || [],
      total_items: exportData.length,
      processing_time: results?.processing_time || 0
    });
  };

  // Add new row
  const handleAddRow = () => {
    const newRow = {
      editedItemCode: '',
      editedItemName: '',
      editedQuantity: 1,
      isEditing: true
    };
    setEditableResults([...editableResults, newRow]);
  };

  // Remove row
  const handleRemoveRow = (index) => {
    const updatedResults = editableResults.filter((_, i) => i !== index);
    setEditableResults(updatedResults);
  };

  if (error) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-error-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Error</h3>
          <p className="text-error-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="card">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
          <p>Upload and process a text file to see results here</p>
        </div>
      </div>
    );
  }

  const { mapped_items, unmapped_items, total_items, processing_time } = results;

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Processing Results</h2>
          <button
            onClick={handleDownloadCSV}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{total_items}</div>
            <div className="text-sm text-blue-800">Total Items</div>
          </div>
          <div className="bg-success-50 border border-success-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success-600">{mapped_items.length}</div>
            <div className="text-sm text-success-800">Mapped Items</div>
          </div>
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning-600">{unmapped_items.length}</div>
            <div className="text-sm text-warning-800">Unmapped Items</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{processing_time}s</div>
            <div className="text-sm text-gray-800">Processing Time</div>
          </div>
        </div>

        {catalogStats && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Catalog Information</h3>
            <div className="text-sm text-gray-600">
              <p>Total Products: {catalogStats.total_items}</p>
              <p>Source Files: {catalogStats.source_files}</p>
              <p>Categories: {catalogStats.categories}</p>
            </div>
            <div className="mt-3">
              <button
                onClick={async () => {
                  console.log('🧪 Manual catalog test...');
                  try {
                    const catalog = await getFullCatalog();
                    console.log('📦 Manual catalog test result:', catalog);
                  } catch (error) {
                    console.error('❌ Manual catalog test failed:', error);
                  }
                }}
                className="btn-secondary text-sm"
              >
                Test Catalog Loading
              </button>
              <button
                onClick={() => {
                  console.log('🔍 Manual search test...');
                  console.log('Current catalog items:', catalogItems.length);
                  console.log('Current search term:', searchTerm);
                  
                  // Test a simple search
                  const testSearch = 'apple';
                  const testResults = catalogItems.filter(item => 
                    item.item_name.toLowerCase().includes(testSearch.toLowerCase())
                  );
                  console.log(`Test search for "${testSearch}":`, testResults.length, 'results');
                  if (testResults.length > 0) {
                    console.log('Sample test results:', testResults.slice(0, 3));
                  }
                }}
                className="btn-secondary text-sm ml-2"
              >
                Test Search Logic
              </button>
              <button
                onClick={() => {
                  console.log('📋 Current state check...');
                  console.log('catalogItems state:', catalogItems);
                  console.log('catalogItems.length:', catalogItems.length);
                  console.log('catalogItems type:', typeof catalogItems);
                  console.log('Is catalogItems array?', Array.isArray(catalogItems));
                  if (Array.isArray(catalogItems) && catalogItems.length > 0) {
                    console.log('First item structure:', catalogItems[0]);
                    console.log('First item keys:', Object.keys(catalogItems[0]));
                  }
                }}
                className="btn-secondary text-sm ml-2"
              >
                Check Catalog State
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editable Results Table */}
      {editableResults.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Mapped Items (Editable)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {editableResults.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.editedItemCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 relative">
                      <input
                        type="text"
                        value={item.editedItemName}
                        onChange={(e) => handleItemNameSearch(index, e.target.value)}
                        onFocus={() => {
                          if (item.editedItemName.trim()) {
                            setShowSearchDropdown({ ...showSearchDropdown, [index]: true });
                          }
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Search item name..."
                      />
                      
                      {/* Search Dropdown */}
                      {showSearchDropdown[index] && filteredCatalogItems.length > 0 && (
                        <div className="search-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredCatalogItems.map((catalogItem, catIndex) => (
                            <div
                              key={catIndex}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                              onClick={() => handleItemSelection(index, catalogItem)}
                            >
                              <div className="font-medium text-gray-900">{catalogItem.item_name}</div>
                              <div className="text-gray-500 text-xs">
                                Code: {catalogItem.item_code} | Category: {catalogItem.category}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* No results message */}
                      {showSearchDropdown[index] && searchTerm.trim() && filteredCatalogItems.length === 0 && (
                        <div className="search-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
                          <div className="text-gray-500 text-sm">No items found for "{searchTerm}"</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="number"
                        value={item.editedQuantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          const updatedResults = [...editableResults];
                          updatedResults[index].isEditing = !updatedResults[index].isEditing;
                          setEditableResults(updatedResults);
                        }}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        {item.isEditing ? 'Save' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleRemoveRow(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ✗
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={handleAddRow}
              className="mt-4 btn-primary"
            >
              Add New Row
            </button>
          </div>
        </div>
      )}

      {/* Unmapped Items */}
      {unmapped_items.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Unmapped Items</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800">Items that couldn't be mapped:</h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  {unmapped_items.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span>•</span>
                      <span>{item.original_text}</span>
                      {item.quantity && (
                        <span className="text-yellow-600">(Qty: {item.quantity})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;
