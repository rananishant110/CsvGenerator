from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
import os
import tempfile
import re
from typing import List, Dict, Any
from pathlib import Path
import json
from config import config
from services.catalog_service import CatalogService
from services.order_processor import OrderProcessor
from models.schemas import ProcessedOrder, CatalogItem
from utils.logger import setup_logger, get_logger
from utils.exceptions import CSVGenieException, CatalogError, FileProcessingError

# Set up logging
logger = setup_logger("csvgenie.main", "DEBUG" if config.DEBUG else "INFO")

app = FastAPI(
    title="CSVGenie API", 
    version="1.0.0",
    description="AI-powered grocery order processing API",
    docs_url="/docs" if config.DEBUG else None,
    redoc_url="/redoc" if config.DEBUG else None
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
catalog_service = CatalogService()
order_processor = OrderProcessor(catalog_service)

# Global exception handler
@app.exception_handler(CSVGenieException)
async def csvgenie_exception_handler(request, exc: CSVGenieException):
    """Handle custom CSVGenie exceptions"""
    logger.error(f"CSVGenie exception: {exc.message}", extra={
        "error_code": exc.error_code,
        "details": exc.details,
        "status_code": exc.status_code
    })
    
    return {
        "error": True,
        "error_code": exc.error_code,
        "message": exc.message,
        "details": exc.details,
        "timestamp": pd.Timestamp.now().isoformat()
    }, exc.status_code

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    
    return {
        "error": True,
        "error_code": "INTERNAL_ERROR",
        "message": "An unexpected error occurred",
        "details": {"type": type(exc).__name__} if config.DEBUG else {},
        "timestamp": pd.Timestamp.now().isoformat()
    }, 500

@app.on_event("startup")
async def startup_event():
    """Initialize catalog on startup"""
    try:
        # Create necessary directories
        config.create_directories()
        logger.info("✅ Directories created successfully")
        
        # Initialize services
        catalog_service.load_catalog()
        logger.info("✅ Catalog loaded successfully")
        
    except Exception as e:
        logger.error(f"❌ Error during startup: {e}")
        # Don't fail startup for catalog issues - they can be handled later

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to CSVGenie API",
        "version": "1.0.0",
        "description": "AI-powered grocery order processing API",
        "docs": "/docs" if config.DEBUG else "Documentation disabled in production",
        "endpoints": {
            "health": "/health",
            "catalog": "/catalog",
            "upload": "/upload-order-file"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "catalog_loaded": catalog_service.is_loaded(),
        "timestamp": pd.Timestamp.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/catalog")
async def get_catalog() -> List[CatalogItem]:
    """Get the loaded product catalog for debugging"""
    if not catalog_service.is_loaded():
        raise HTTPException(status_code=503, detail="Catalog not loaded")
    
    return catalog_service.get_catalog_items()

@app.get("/catalog/stats")
async def get_catalog_stats():
    """Get catalog statistics and metadata"""
    if not catalog_service.is_loaded():
        raise HTTPException(status_code=503, detail="Catalog not loaded")
    
    stats = catalog_service.get_stats()
    return {
        "catalog_loaded": True,
        "stats": stats,
        "timestamp": pd.Timestamp.now().isoformat()
    }

@app.get("/catalog/summary")
async def get_catalog_summary():
    """Get comprehensive catalog summary"""
    if not catalog_service.is_loaded():
        raise HTTPException(status_code=503, detail="Catalog not loaded")
    
    summary = catalog_service.get_catalog_summary()
    return {
        "catalog_loaded": True,
        "summary": summary,
        "timestamp": pd.Timestamp.now().isoformat()
    }

@app.post("/catalog/reload")
async def reload_catalog():
    """Force reload catalog from Excel files"""
    try:
        logger.info("🔄 Force reloading catalog from Excel files...")
        catalog_service.load_catalog()
        return {
            "message": "Catalog reloaded successfully",
            "total_items": len(catalog_service.get_catalog_items()),
            "timestamp": pd.Timestamp.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error reloading catalog: {e}")
        raise HTTPException(status_code=500, detail=f"Error reloading catalog: {str(e)}")

@app.get("/catalog/search")
async def search_catalog(query: str, limit: int = 10):
    """Search catalog items by name or synonyms"""
    if not catalog_service.is_loaded():
        raise HTTPException(status_code=503, detail="Catalog not loaded")
    
    if not query or len(query.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query must be at least 2 characters")
    
    results = catalog_service.search_items(query.strip(), limit)
    return {
        "query": query,
        "results": results,
        "total_found": len(results),
        "limit": limit
    }

@app.post("/upload-order-file")
async def upload_order_file(file: UploadFile = File(...)) -> ProcessedOrder:
    """Process uploaded order file and return mapped results"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only .txt files are supported")
    
    try:
        # Read file content
        content = await file.read()
        text_content = content.decode('utf-8')
        
        # Process the order
        result = order_processor.process_order_text(text_content)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/download-csv/{filename}")
async def download_csv(filename: str):
    """Download processed CSV file"""
    csv_path = Path("temp") / filename
    
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="CSV file not found")
    
    return FileResponse(
        path=csv_path,
        filename=filename,
        media_type="text/csv"
    )

if __name__ == "__main__":
    import uvicorn
    logger.info(f"🚀 Starting CSVGenie API server on {config.HOST}:{config.PORT}")
    uvicorn.run(
        app, 
        host=config.HOST, 
        port=config.PORT,
        log_level="info" if not config.DEBUG else "debug"
    )
