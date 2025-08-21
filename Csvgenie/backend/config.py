import os
from pathlib import Path
from typing import List

class Config:
    """Application configuration"""
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    
    # ML Model Configuration - Using lightweight model for Render free tier
    MODEL_NAME: str = os.getenv("MODEL_NAME", "sentence-transformers/paraphrase-MiniLM-L3-v2")
    
    # Alternative models (uncomment for better accuracy if you upgrade Render):
    # MODEL_NAME: str = os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")  # Better accuracy, more memory
    # MODEL_NAME: str = os.getenv("MODEL_NAME", "sentence-transformers/all-mpnet-base-v2")  # Best accuracy, most memory
    
    # Improved confidence thresholds
    CONFIDENCE_THRESHOLD_HIGH: float = float(os.getenv("CONFIDENCE_THRESHOLD_HIGH", "0.75"))
    CONFIDENCE_THRESHOLD_MEDIUM: float = float(os.getenv("CONFIDENCE_THRESHOLD_MEDIUM", "0.55"))
    CONFIDENCE_THRESHOLD_LOW: float = float(os.getenv("CONFIDENCE_THRESHOLD_LOW", "0.35"))
    
    # Enhanced matching settings - Optimized for Render free tier
    MIN_SIMILARITY_THRESHOLD: float = float(os.getenv("MIN_SIMILARITY_THRESHOLD", "0.30"))
    MAX_CANDIDATES_PER_ITEM: int = int(os.getenv("MAX_CANDIDATES_PER_ITEM", "3"))
    USE_FUZZY_MATCHING: bool = os.getenv("USE_FUZZY_MATCHING", "true").lower() == "true"
    
    # Memory optimization for Render free tier
    BATCH_SIZE: int = int(os.getenv("BATCH_SIZE", "50"))  # Process items in smaller batches
    ENABLE_EMBEDDINGS_CACHE: bool = os.getenv("ENABLE_EMBEDDINGS_CACHE", "true").lower() == "true"
    
    # File Processing
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    SUPPORTED_EXTENSIONS: List[str] = [".txt"]
    
    # Paths
    BASE_DIR: Path = Path(__file__).parent
    CATALOG_DIR: Path = BASE_DIR / "catalog"
    TESTS_FOLDER: Path = BASE_DIR.parent / "tests"
    TEMP_DIR: Path = BASE_DIR / "temp"
    
    @classmethod
    def create_directories(cls):
        """Create necessary directories"""
        cls.TEMP_DIR.mkdir(exist_ok=True)
        cls.TESTS_FOLDER.mkdir(exist_ok=True)

# Global config instance
config = Config()
