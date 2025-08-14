# Product Requirements Document: CSVGenie Full-Stack Application

## Overview
CSVGenie is a full-stack web application that processes free-form grocery order text files and intelligently maps them to a standardized product catalog using semantic similarity and machine learning. The application provides a modern React frontend with TailwindCSS styling and a FastAPI backend powered by Hugging Face models.

## Problem Statement
Grocery stores and businesses often receive orders in various free-form text formats (emails, notes, handwritten lists, etc.) that need to be converted into structured, standardized formats for inventory management and order processing. Manual conversion is time-consuming and error-prone, while existing solutions lack the intelligence to handle variations in product descriptions and naming conventions.

## User Stories
- **As a grocery store manager**, I want to upload text files containing customer orders so that I can quickly process them without manual data entry.
- **As an inventory clerk**, I want the system to automatically match product descriptions to our standardized catalog so that I can ensure accurate order fulfillment.
- **As a business analyst**, I want to export processed orders to CSV format so that I can integrate them with existing business systems.
- **As a customer service representative**, I want to see confidence levels for item matches so that I can review and correct any uncertain mappings.

## Functional Requirements

### Core Features
1. **File Upload System**
   - Accept `.txt` files containing grocery orders
   - Support free-form text with various quantity formats (e.g., "2x apples", "3 kg rice", "5 bottles milk")
   - File size limit: 10MB
   - Encoding support: UTF-8

2. **Product Catalog Management**
   - Load and merge multiple Excel files from `tests/` folder
   - Create canonical product database with columns: item_code, item_name, synonyms, category, brand
   - Handle column name variations across different Excel formats
   - Remove duplicates and standardize data

3. **Intelligent Item Mapping**
   - Use local Hugging Face model (`sentence-transformers/all-MiniLM-L6-v2`) for semantic similarity
   - Extract quantities using regex patterns for common formats
   - Map items to catalog with confidence scoring (High/Medium/Low/Unmatched)
   - Handle synonyms and alternative product names

4. **Results Processing**
   - Generate downloadable CSV with columns: Item Code, Item Name, Quantity, Confidence, Original Text
   - Display mapping results in interactive table
   - Highlight unmapped items and low-confidence matches
   - Provide processing statistics and timing

### API Endpoints
- `POST /upload-order-file` - Process uploaded order files
- `GET /catalog` - Retrieve product catalog data
- `GET /health` - Health check endpoint
- `GET /download-csv/{filename}` - Download generated CSV files

## Non-Functional Requirements

### Performance
- **Processing Speed**: Process orders with 100+ items in under 30 seconds
- **Model Loading**: Hugging Face model should load in under 10 seconds
- **Response Time**: API endpoints should respond within 2 seconds
- **Concurrent Users**: Support up to 10 simultaneous users

### Scalability
- **Catalog Size**: Handle catalogs with up to 10,000 products
- **Order Size**: Process orders with up to 500 line items
- **File Storage**: Efficient memory usage for large Excel files

### Reliability
- **Error Handling**: Graceful handling of malformed files and invalid data
- **Data Validation**: Comprehensive input validation and sanitization
- **Logging**: Detailed logging for debugging and monitoring

## API Specifications

### Data Models
```typescript
interface MappedItem {
  original_text: string;
  item_code?: string;
  item_name?: string;
  quantity: number;
  confidence: 'high' | 'medium' | 'low' | 'unmatched';
  synonyms?: string[];
  raw_quantity_text: string;
}

interface ProcessedOrder {
  mapped_items: MappedItem[];
  unmapped_items: string[];
  total_items: number;
  mapped_count: number;
  unmapped_count: number;
  csv_filename?: string;
  processing_time_ms: number;
}

interface CatalogItem {
  item_code: string;
  item_name: string;
  synonyms: string[];
  category?: string;
  brand?: string;
}
```

### Response Formats
- **Success Responses**: JSON with structured data and metadata
- **Error Responses**: JSON with error codes, messages, and details
- **File Downloads**: CSV files with proper headers and encoding

## UI/UX Requirements

### Frontend Components
1. **File Upload Component**
   - Drag-and-drop interface
   - File type validation (.txt only)
   - Progress indicator during upload
   - Clear error messages for invalid files

2. **Results Table**
   - Sortable columns for all data fields
   - Color-coded confidence levels
   - Search and filter functionality
   - Pagination for large datasets

3. **Download Section**
   - Prominent CSV download button
   - File naming with timestamps
   - Download progress indicator

4. **Status Dashboard**
   - Processing statistics
   - Catalog loading status
   - System health indicators

### Design Principles
- **Modern Interface**: Clean, professional design using TailwindCSS
- **Responsive Design**: Mobile-friendly layout
- **Accessibility**: WCAG 2.1 AA compliance
- **User Feedback**: Clear success/error states and loading indicators

## Success Criteria
1. **Functional Completeness**: All specified features implemented and working
2. **Performance Targets**: Meets specified speed and scalability requirements
3. **User Experience**: Intuitive interface with clear feedback and error handling
4. **Data Accuracy**: High confidence mapping for 90%+ of common grocery items
5. **Integration Ready**: Clean API design for future system integrations

## Constraints & Assumptions

### Technical Constraints
- **Local Processing**: All ML processing must happen locally (no external API calls)
- **Open Source**: Use only open-source libraries and models
- **Browser Compatibility**: Support modern browsers (Chrome, Firefox, Safari, Edge)
- **Memory Usage**: Optimize for systems with 4GB+ RAM

### Business Constraints
- **Data Privacy**: No data sent to external services
- **Cost**: Minimize external dependencies and API costs
- **Maintenance**: Easy to update and maintain by development team

### Assumptions
- Excel files in `tests/` folder follow similar structure
- Product names are primarily in English
- Quantities use standard units and formats
- Users have basic familiarity with file upload processes

## Dependencies
- **External Libraries**: sentence-transformers, scikit-learn, pandas, openpyxl
- **Frontend Framework**: React 18+ with modern hooks
- **Styling**: TailwindCSS for consistent design
- **Backend Framework**: FastAPI with Python 3.8+
- **Development Tools**: Node.js, npm/yarn, Python virtual environments

## Security Considerations
- **File Upload Security**: Validate file types and content
- **Input Sanitization**: Prevent injection attacks in text processing
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Error Information**: Avoid exposing sensitive system details in error messages
- **Data Handling**: Secure processing of potentially sensitive order data
