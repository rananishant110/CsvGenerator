/**
 * Download processed order results as a CSV file
 * @param {Object} results - The processing results from the backend
 */
export const downloadCSV = (results) => {
  if (!results || !results.mapped_items) {
    console.error('No results to download');
    return;
  }

  try {
    // Create CSV content
    const csvContent = generateCSVContent(results);
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      // Create download link
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `order_results_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Fallback for older browsers
      const csvContentWithBOM = '\uFEFF' + csvContent;
      const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContentWithBOM);
      window.open(dataStr);
    }
  } catch (error) {
    console.error('Error downloading CSV:', error);
    alert('Error downloading CSV file. Please try again.');
  }
};

/**
 * Generate CSV content from processing results
 * @param {Object} results - The processing results
 * @returns {string} CSV content as a string
 */
const generateCSVContent = (results) => {
  const { mapped_items, unmapped_items } = results;

  // CSV headers - Only the 3 essential fields
  const headers = [
    'Item Code',
    'Item Name',
    'Quantity'
  ];

  // CSV rows for mapped items - Only the 3 essential fields
  const mappedRows = mapped_items.map(item => [
    item.item_code || '',
    item.item_name || '',
    item.quantity || ''
  ]);

  // CSV rows for unmapped items - Only the 3 essential fields
  const unmappedRows = unmapped_items.map(item => [
    '', // No item code
    item.original_text || '',
    item.quantity || ''
  ]);

  // Combine all rows
  const allRows = [headers, ...mappedRows, ...unmappedRows];

  // Convert to CSV format
  const csvContent = allRows
    .map(row =>
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escapedCell = String(cell).replace(/"/g, '""');
        if (escapedCell.includes(',') || escapedCell.includes('"') || escapedCell.includes('\n')) {
          return `"${escapedCell}"`;
        }
        return escapedCell;
      }).join(',')
    )
    .join('\n');

  return csvContent;
};

/**
 * Preview CSV content in console (for debugging)
 * @param {Object} results - The processing results
 */
export const previewCSV = (results) => {
  if (!results || !results.mapped_items) {
    console.log('No results to preview');
    return;
  }
  
  const csvContent = generateCSVContent(results);
  console.log('CSV Preview:');
  console.log(csvContent);
};

/**
 * Get CSV file size estimate
 * @param {Object} results - The processing results
 * @returns {string} Estimated file size
 */
export const getCSVSizeEstimate = (results) => {
  if (!results || !results.mapped_items) {
    return '0 KB';
  }
  
  const csvContent = generateCSVContent(results);
  const sizeInBytes = new Blob([csvContent]).size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(1);
  
  if (sizeInKB < 1024) {
    return `${sizeInKB} KB`;
  } else {
    const sizeInMB = (sizeInKB / 1024).toFixed(2);
    return `${sizeInMB} MB`;
  }
};
