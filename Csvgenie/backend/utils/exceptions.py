from typing import Any, Dict, Optional

class CSVGenieException(Exception):
    """Base exception for CSVGenie application"""
    
    def __init__(
        self, 
        message: str, 
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        self.status_code = status_code

class CatalogError(CSVGenieException):
    """Exception raised when catalog operations fail"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="CATALOG_ERROR",
            details=details,
            status_code=503
        )

class FileProcessingError(CSVGenieException):
    """Exception raised when file processing fails"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="FILE_PROCESSING_ERROR",
            details=details,
            status_code=400
        )

class MLModelError(CSVGenieException):
    """Exception raised when ML model operations fail"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="ML_MODEL_ERROR",
            details=details,
            status_code=503
        )

class ValidationError(CSVGenieException):
    """Exception raised when data validation fails"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            details=details,
            status_code=400
        )
