from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class MatchConfidence(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    UNMATCHED = "unmatched"

class MappedItem(BaseModel):
    """Represents a mapped item from the order"""
    original_text: str = Field(..., min_length=1, max_length=500, description="Original text from the order")
    item_code: Optional[str] = Field(None, max_length=100, description="Matched item code from catalog")
    item_name: Optional[str] = Field(None, max_length=200, description="Standardized item name")
    category: Optional[str] = Field(None, max_length=100, description="Product category")
    quantity: float = Field(..., gt=0, le=10000, description="Extracted quantity")
    confidence: MatchConfidence = Field(..., description="Confidence level of the match")
    similarity_score: Optional[float] = Field(None, ge=0, le=1, description="Semantic similarity score")
    
    class Config:
        schema_extra = {
            "example": {
                "original_text": "2x organic apples",
                "item_code": "APP001",
                "item_name": "Organic Apples",
                "category": "Fruits",
                "quantity": 2.0,
                "confidence": "high",
                "similarity_score": 0.85
            }
        }

class CatalogItem(BaseModel):
    """Represents an item in the product catalog"""
    item_code: str = Field(..., min_length=1, max_length=100, description="Unique item identifier")
    item_name: str = Field(..., min_length=1, max_length=200, description="Product name/description")
    category: str = Field(..., max_length=100, description="Product category/sheet name")
    source_file: str = Field(..., max_length=100, description="Source Excel file name")
    sheet_name: str = Field(..., max_length=100, description="Excel sheet name")
    
    class Config:
        schema_extra = {
            "example": {
                "item_code": "10000000000001",
                "item_name": "BULK ITEM 1",
                "category": "Bulk",
                "source_file": "bulk.xlsx",
                "sheet_name": "Sheet1"
            }
        }

class ProcessedOrder(BaseModel):
    """Represents the processed order results"""
    mapped_items: List[MappedItem] = Field(..., description="Successfully mapped items")
    unmapped_items: List[str] = Field(..., description="Items that couldn't be mapped")
    total_items: int = Field(..., ge=0, description="Total number of items processed")
    mapped_count: int = Field(..., ge=0, description="Number of successfully mapped items")
    unmapped_count: int = Field(..., ge=0, description="Number of unmapped items")
    csv_filename: Optional[str] = Field(None, max_length=200, description="Generated CSV filename for download")
    processing_time_ms: float = Field(..., ge=0, description="Processing time in milliseconds")
    
    class Config:
        schema_extra = {
            "example": {
                "mapped_items": [],
                "unmapped_items": [],
                "total_items": 0,
                "mapped_count": 0,
                "unmapped_count": 0,
                "csv_filename": "processed_order_1234567890.csv",
                "processing_time_ms": 1500.5
            }
        }

class OrderProcessingRequest(BaseModel):
    """Request model for order processing"""
    text_content: str = Field(..., description="Text content to process")
    confidence_threshold: float = Field(default=0.6, description="Minimum confidence for matching")

class CatalogStats(BaseModel):
    """Catalog statistics"""
    total_items: int
    categories: Dict[str, int]
    brands: Dict[str, int]
    loaded_at: str
