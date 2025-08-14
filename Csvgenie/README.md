# CSVGenie - Grocery Order Processing Application

A full-stack application that processes free-form grocery order text files and maps them to a standardized product catalog using semantic similarity.

## Features

- **File Upload**: Accept text files containing grocery orders in free-form format
- **Product Catalog**: Load and merge Excel files to create a canonical product database
- **Semantic Mapping**: Use Hugging Face models for intelligent item matching
- **CSV Export**: Generate downloadable CSV files with mapped items
- **Real-time Processing**: Fast processing with local ML models

## Tech Stack

- **Frontend**: React + TailwindCSS
- **Backend**: FastAPI (Python)
- **ML Model**: sentence-transformers/all-MiniLM-L6-v2
- **Data Processing**: pandas, openpyxl
- **Similarity**: scikit-learn, numpy

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Usage
1. Place your Excel product catalog files in the `tests/` folder
2. Upload a text file containing grocery orders
3. The app will automatically map items and generate a CSV
4. Download the processed results

## API Endpoints

- `POST /upload-order-file` - Upload and process order files
- `GET /catalog` - Retrieve product catalog data
- `GET /health` - Health check endpoint

## Project Structure

```
Csvgenie/
├── backend/           # FastAPI backend
├── frontend/          # React frontend
├── tests/             # Excel catalog files
├── docs/              # Documentation
└── README.md
```

## License

MIT License - Fully open source
