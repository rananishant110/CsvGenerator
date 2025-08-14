# CSVGenie Frontend

A modern React frontend for the CSVGenie application, built with TailwindCSS for beautiful, responsive UI.

## 🚀 Features

- **Modern React 18** with functional components and hooks
- **TailwindCSS** for utility-first styling
- **Drag & Drop** file upload with visual feedback
- **Real-time Progress** tracking during file processing
- **Responsive Design** that works on all devices
- **Beautiful UI** with consistent design system
- **Error Handling** with user-friendly error messages
- **CSV Download** functionality for processed results

## 🛠️ Tech Stack

- **React 18.2.0** - Modern React with hooks
- **TailwindCSS 3.3.0** - Utility-first CSS framework
- **Axios** - HTTP client for API communication
- **React Context** - State management
- **Vite** - Fast build tool (recommended)

## 📋 Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 8.0.0 or higher
- **FastAPI Backend** running on `http://localhost:8000`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 2. Start Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── components/         # React components
│   │   ├── Header.js      # Application header
│   │   ├── FileUpload.js  # File upload component
│   │   └── ResultsTable.js # Results display
│   ├── context/           # React context
│   │   └── OrderContext.js # Order state management
│   ├── utils/             # Utility functions
│   │   ├── api.js         # API communication
│   │   └── csvUtils.js    # CSV generation
│   ├── App.js             # Main app component
│   ├── index.js           # App entry point
│   └── index.css          # Global styles + TailwindCSS
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # TailwindCSS configuration
├── postcss.config.js      # PostCSS configuration
└── README.md              # This file
```

## 🎨 Components

### Header
- Application branding and navigation
- Responsive design with mobile menu

### FileUpload
- Drag & drop file upload area
- File validation (.txt files only)
- Progress tracking during upload
- Clear instructions for users

### ResultsTable
- Processing results summary
- Mapped items table with confidence levels
- Unmapped items display
- CSV download functionality

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

### TailwindCSS

The TailwindCSS configuration includes:
- Custom color palette for primary, success, warning, and error states
- Responsive breakpoints
- Custom component classes

## 📱 Responsive Design

The frontend is fully responsive with:
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly interactions
- Optimized layouts for all screen sizes

## 🚨 Error Handling

Comprehensive error handling includes:
- File validation errors
- API communication errors
- Processing errors
- User-friendly error messages
- Retry mechanisms

## 🔄 State Management

Uses React Context for:
- File upload state
- Processing progress
- Results data
- Error states
- Catalog information

## 📊 API Integration

The frontend communicates with the FastAPI backend through:
- `/upload-order-file` - File upload and processing
- `/catalog/summary` - Catalog statistics
- `/catalog/reload` - Reload catalog data
- `/health` - Backend health check

## 🎯 Usage Workflow

1. **Upload File**: Drag & drop or click to select a .txt file
2. **Process Order**: Click "Process Order" to analyze the file
3. **Review Results**: View mapped and unmapped items
4. **Download CSV**: Get results in CSV format
5. **Reset**: Start over with a new file

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Serve Production Build

```bash
# Install serve globally
npm install -g serve

# Serve the build folder
serve -s build -l 3000
```

## 🤝 Contributing

1. Follow the existing code style
2. Use meaningful component and variable names
3. Add proper error handling
4. Test on multiple devices and browsers
5. Update documentation as needed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues and questions:
1. Check the backend logs
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Ensure file format is correct (.txt)

## 🔗 Related

- [Backend Documentation](../backend/README.md)
- [API Documentation](../docs/API.md)
- [Project Overview](../README.md)
