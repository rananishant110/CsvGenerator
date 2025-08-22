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
    const loadCatalog = async () => {
      try {
        const summary = await getCatalogInfo();
        
        if (summary && summary.summary && summary.summary.total_items > 0) {
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
          
          setCatalogItems(items);
          
        } else {
          // Fallback to full catalog
          try {
            const catalog = await getFullCatalog();
            if (catalog && catalog.items && catalog.items.length > 0) {
              setCatalogItems(catalog.items);
            }
          } catch (fullCatalogError) {
            console.error('Full catalog also failed:', fullCatalogError);
          }
        }
      } catch (error) {
        console.error('Error loading catalog summary:', error);
        
        // Try full catalog as last resort
        try {
          const catalog = await getFullCatalog();
          if (catalog && catalog.items && catalog.items.length > 0) {
            setCatalogItems(catalog.items);
          }
        } catch (fullCatalogError) {
          console.error('All catalog loading methods failed:', fullCatalogError);
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
      setEditableResults(results.mapped_items.map(item => ({
        ...item,
        isEditing: false,
        editedQuantity: item.quantity,
        editedItemName: item.item_name,
        editedItemCode: item.item_code
      })));
    }
  }, [results]);

  // Advanced search function with multiple strategies
  const advancedSearch = (searchTerm, catalogItems) => {
    if (!searchTerm.trim()) return [];
    
    const searchLower = searchTerm.toLowerCase().trim();
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
    
    return catalogItems
      .filter(item => {
        if (!item || !item.item_name) return false;
        
        const nameLower = item.item_name.toLowerCase();
        const codeLower = (item.item_code || '').toLowerCase();
        const categoryLower = (item.category || '').toLowerCase();
        
        // Strategy 1: Exact substring matches (highest priority)
        if (nameLower.includes(searchLower) || codeLower.includes(searchLower)) {
          return true;
        }
        
        // Strategy 2: All search words present (word order independent)
        if (searchWords.length > 1) {
          const allWordsPresent = searchWords.every(word => 
            nameLower.includes(word) || codeLower.includes(word) || categoryLower.includes(word)
          );
          if (allWordsPresent) return true;
        }
        
        // Strategy 3: Partial word matches (e.g., "ur" finds "URAD")
        const partialMatches = searchWords.some(word => {
          // Check if any word in the item name starts with the search word
          const itemWords = nameLower.split(/\s+/);
          return itemWords.some(itemWord => itemWord.startsWith(word));
        });
        if (partialMatches) return true;
        
        // Strategy 4: Acronym/abbreviation matching
        const acronymMatch = searchWords.some(word => {
          // Extract first letters of each word in item name
          const itemAcronym = nameLower.split(/\s+/).map(w => w.charAt(0)).join('');
          return itemAcronym.includes(word) || itemAcronym.startsWith(word);
        });
        if (acronymMatch) return true;
        
        // Strategy 5: Fuzzy matching for typos (using simple character similarity)
        const fuzzyMatch = searchWords.some(searchWord => {
          const itemWords = nameLower.split(/\s+/);
          return itemWords.some(itemWord => {
            // Calculate similarity score
            const similarity = calculateSimilarity(searchWord, itemWord);
            return similarity >= 0.7; // 70% similarity threshold
          });
        });
        if (fuzzyMatch) return true;
        
        return false;
      })
      .map(item => {
        // Calculate relevance score for ranking
        const relevanceScore = calculateRelevanceScore(searchLower, item, searchWords);
        return { ...item, relevanceScore };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
      .slice(0, 15); // Show more results for better discovery
  };

  // Calculate similarity between two strings (simple Levenshtein-based)
  const calculateSimilarity = (str1, str2) => {
    if (str1 === str2) return 1.0;
    if (str1.length === 0) return 0.0;
    if (str2.length === 0) return 0.0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Simple similarity calculation
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    
    return matches / longer.length;
  };

  // Calculate relevance score for ranking results
  const calculateRelevanceScore = (searchTerm, item, searchWords) => {
    let score = 0;
    const nameLower = item.item_name.toLowerCase();
    const codeLower = (item.item_code || '').toLowerCase();
    const categoryLower = (item.category || '').toLowerCase();
    
    // Exact matches get highest score
    if (nameLower.includes(searchTerm)) score += 100;
    if (codeLower.includes(searchTerm)) score += 90;
    
    // Word matches
    searchWords.forEach(word => {
      if (nameLower.includes(word)) score += 50;
      if (codeLower.includes(word)) score += 45;
      if (categoryLower.includes(word)) score += 30;
      
      // Bonus for word start matches
      const itemWords = nameLower.split(/\s+/);
      itemWords.forEach(itemWord => {
        if (itemWord.startsWith(word)) score += 20;
      });
    });
    
    // Acronym bonus
    const itemAcronym = nameLower.split(/\s+/).map(w => w.charAt(0)).join('');
    if (itemAcronym.includes(searchTerm) || itemAcronym.startsWith(searchTerm)) {
      score += 40;
    }
    
    // Length bonus (shorter names get slight preference)
    score += Math.max(0, 20 - nameLower.length / 10);
    
    return score;
  };

  // Use advanced search for filtered results
  const filteredCatalogItems = advancedSearch(searchTerm, catalogItems);

  // Helper function to show what matched in search results
  const getSearchHighlights = (item, searchTerm) => {
    const searchWords = searchTerm.toLowerCase().split(/\s+/);
    const nameLower = item.item_name.toLowerCase();
    const codeLower = (item.item_code || '').toLowerCase();
    const categoryLower = (item.category || '').toLowerCase();
    
    const highlights = [];
    
    searchWords.forEach(word => {
      if (nameLower.includes(word)) highlights.push(`"${word}" in name`);
      if (codeLower.includes(word)) highlights.push(`"${word}" in code`);
      if (categoryLower.includes(word)) highlights.push(`"${word}" in category`);
      
      // Check for acronym matches
      const itemAcronym = nameLower.split(/\s+/).map(w => w.charAt(0)).join('');
      if (itemAcronym.includes(word) || itemAcronym.startsWith(word)) {
        highlights.push(`"${word}" as acronym`);
      }
      
      // Check for partial word matches
      const itemWords = nameLower.split(/\s+/);
      itemWords.forEach(itemWord => {
        if (itemWord.startsWith(word)) {
          highlights.push(`"${word}" starts "${itemWord}"`);
        }
      });
    });
    
    return highlights.slice(0, 3).join(', '); // Limit to 3 highlights
  };



  // Handle quantity editing
  const handleQuantityChange = (index, newQuantity) => {
    const updatedResults = [...editableResults];
    updatedResults[index].editedQuantity = parseFloat(newQuantity) || 0;
    setEditableResults(updatedResults);
  };

  // Handle item code editing
  const handleItemCodeChange = (index, value) => {
    const updatedResults = [...editableResults];
    updatedResults[index].editedItemCode = value;
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
    
    // If this was originally an unmapped item, mark it as now mapped
    if (updatedResults[index].isFromUnmapped) {
      updatedResults[index].isFromUnmapped = false;
      updatedResults[index].source = 'Mapped from Catalog';
      console.log(`✅ Item "${selectedItem.item_name}" is now properly mapped from catalog`);
    }
    
    setEditableResults(updatedResults);
    setShowSearchDropdown({ ...showSearchDropdown, [index]: false });
    setSearchTerm('');
  };

  // Handle CSV download with edited values
  const handleDownloadCSV = () => {
    const exportData = editableResults.map(item => {
      // Determine the actual source based on current state
      const actualSource = item.isFromUnmapped ? 'Unmapped (Manual Entry)' : 'Mapped from Catalog';
      
      return {
        item_code: item.editedItemCode || (item.isFromUnmapped ? 'MANUAL_ENTRY_REQUIRED' : ''),
        item_name: item.editedItemName,
        quantity: item.editedQuantity,
        source: actualSource
      };
    });
    
    // Count items by source
    const mappedCount = editableResults.filter(item => !item.isFromUnmapped).length;
    const unmappedCount = editableResults.filter(item => item.isFromUnmapped).length;
    
    downloadCSV({
      mapped_items: exportData,
      unmapped_items: [], // Don't include original unmapped items since they're now in main results
      total_items: exportData.length,
      mapped_count: mappedCount,
      unmapped_count: unmappedCount,
      processing_time: results?.processing_time || 0
    });
    
    console.log(`📊 CSV Export Summary: ${mappedCount} mapped items, ${unmappedCount} unmapped items (manual entry)`);
    console.log(`📋 Export Data:`, exportData);
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

  const handleAddUnmappedItem = (unmappedItem, unmappedIndex) => {
    // Convert unmapped item to editable result format
    const newRow = {
      editedItemCode: '', // User can fill this manually
      editedItemName: typeof unmappedItem === 'string' ? unmappedItem : unmappedItem.original_text || 'Unknown item',
      editedQuantity: typeof unmappedItem === 'object' && unmappedItem.quantity && unmappedItem.quantity > 0 ? unmappedItem.quantity : 1,
      isEditing: true,
      isFromUnmapped: true, // Flag to identify this came from unmapped items
      originalUnmappedIndex: unmappedIndex
    };
    
    setEditableResults([...editableResults, newRow]);
    
    // Show success message
    console.log(`✅ Added unmapped item "${newRow.editedItemName}" to main results`);
  };

  const handleAddAllUnmapped = () => {
    if (!unmapped_items || unmapped_items.length === 0) return;
    
    const newRows = unmapped_items.map((unmappedItem, index) => ({
      editedItemCode: '', // User can fill this manually
      editedItemName: typeof unmappedItem === 'string' ? unmappedItem : unmappedItem.original_text || 'Unknown item',
      editedQuantity: typeof unmappedItem === 'object' && unmappedItem.quantity && unmappedItem.quantity > 0 ? unmappedItem.quantity : 1,
      isEditing: true,
      isFromUnmapped: true, // Flag to identify this came from unmapped items
      originalUnmappedIndex: index
    }));
    
    setEditableResults([...editableResults, ...newRows]);
    
    // Show success message
    console.log(`✅ Added ${newRows.length} unmapped items to main results`);
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
  
  // Debug logging for unmapped items
  console.log('🔍 ResultsTable Debug:', {
    mapped_items: mapped_items?.length || 0,
    unmapped_items: unmapped_items?.length || 0,
    total_items,
    processing_time,
    unmapped_items_data: unmapped_items
  });

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Item Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {editableResults.map((item, index) => (
                  <tr key={index} className={`hover:bg-gray-50 ${item.isFromUnmapped ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <input
                        type="text"
                        value={item.editedItemCode}
                        onChange={(e) => handleItemCodeChange(index, e.target.value)}
                        className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          item.isFromUnmapped ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'
                        }`}
                        placeholder={item.isFromUnmapped ? "Manual entry required" : "Enter item code..."}
                      />
                      {item.isFromUnmapped && (
                        <div className="text-xs text-yellow-600 mt-1">
                          ⚠️ Manual entry required
                        </div>
                      )}
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
                      
                      {/* Enhanced Search Dropdown */}
                      {showSearchDropdown[index] && filteredCatalogItems.length > 0 && (
                        <div className="search-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredCatalogItems.map((catalogItem, catIndex) => (
                            <div
                              key={catIndex}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                              onClick={() => handleItemSelection(index, catalogItem)}
                            >
                              <div className="font-medium text-gray-900 flex items-center justify-between">
                                <span>{catalogItem.item_name}</span>
                                {catalogItem.relevanceScore && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Score: {catalogItem.relevanceScore}
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-500 text-xs">
                                Code: {catalogItem.item_code} | Category: {catalogItem.category}
                              </div>
                              {/* Show search term highlights */}
                              {searchTerm.trim() && (
                                <div className="text-xs text-green-600 mt-1">
                                  Matches: {getSearchHighlights(catalogItem, searchTerm)}
                                </div>
                              )}
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
                      {item.isFromUnmapped ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unmapped
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Mapped from Catalog
                        </span>
                      )}
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

      {/* Unmapped Items Table */}
      {unmapped_items && unmapped_items.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Unmapped Items ({unmapped_items.length})
            </h3>
            <button
              onClick={handleAddAllUnmapped}
              className="btn-secondary text-sm"
              title="Add all unmapped items to main results for CSV export"
            >
              Add All to Results
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">
                    Original Text
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unmapped_items.map((item, index) => (
                  <tr key={`unmapped-${index}`} className="hover:bg-yellow-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {typeof item === 'string' ? item : item.original_text || 'Unknown item'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof item === 'object' && item.quantity && item.quantity > 0 ? (
                        <span className="text-yellow-600 font-medium">{item.quantity}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {typeof item === 'object' && item.original_line ? (
                        <span title={item.original_line}>{item.original_line}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {typeof item === 'object' && item.reason ? (
                        <span className="text-red-600">{item.reason}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleAddUnmappedItem(item, index)}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                        title="Add this item to main results"
                      >
                        Add to Results
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium">💡 Tip:</p>
                <p>Add unmapped items to the main results above to include them in your CSV export. You can manually edit the item codes and names as needed.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;
