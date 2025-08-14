#!/usr/bin/env python3
"""
Basic functionality test for CSVGenie backend
Run this script to test the basic setup before proceeding to Milestone 2
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

async def test_basic_functionality():
    """Test basic backend functionality"""
    print("🧪 Testing CSVGenie Backend Basic Functionality...")
    
    try:
        # Test 1: Configuration
        print("\n1️⃣ Testing Configuration...")
        from config import config
        print(f"   ✅ Config loaded: HOST={config.HOST}, PORT={config.PORT}")
        print(f"   ✅ Debug mode: {config.DEBUG}")
        print(f"   ✅ Tests folder: {config.TESTS_FOLDER}")
        print(f"   ✅ Temp folder: {config.TEMP_DIR}")
        
        # Test 2: Directory Creation
        print("\n2️⃣ Testing Directory Creation...")
        config.create_directories()
        print(f"   ✅ Directories created successfully")
        
        # Test 3: Data Models
        print("\n3️⃣ Testing Data Models...")
        from models.schemas import CatalogItem, MappedItem, ProcessedOrder, MatchConfidence
        print(f"   ✅ All schemas imported successfully")
        
        # Test 4: Create sample data
        print("\n4️⃣ Testing Data Creation...")
        sample_catalog = CatalogItem(
            item_code="TEST001",
            item_name="Test Item",
            synonyms=["test", "sample"],
            category="Test",
            brand="TestBrand"
        )
        print(f"   ✅ Sample catalog item created: {sample_catalog.item_name}")
        
        # Test 5: Services Import
        print("\n5️⃣ Testing Service Imports...")
        from services.catalog_service import CatalogService
        from services.order_processor import OrderProcessor
        print(f"   ✅ All services imported successfully")
        
        # Test 6: Logger
        print("\n6️⃣ Testing Logging...")
        from utils.logger import setup_logger
        test_logger = setup_logger("test", "INFO")
        test_logger.info("Test log message")
        print(f"   ✅ Logging system working")
        
        # Test 7: Exceptions
        print("\n7️⃣ Testing Exception Handling...")
        from utils.exceptions import CSVGenieException, CatalogError
        print(f"   ✅ Exception classes imported successfully")
        
        print("\n🎉 All basic functionality tests passed!")
        print("\n🚀 Ready to proceed to Milestone 2: Catalog Service Implementation")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_basic_functionality())
    sys.exit(0 if success else 1)
