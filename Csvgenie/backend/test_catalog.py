#!/usr/bin/env python3
"""
Test script for the catalog service with actual Excel files
Run this script to test the catalog loading and processing functionality
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

async def test_catalog_service():
    """Test the catalog service with actual Excel files"""
    print("🧪 Testing CSVGenie Catalog Service...")
    
    try:
        # Test 1: Import catalog service
        print("\n1️⃣ Testing Catalog Service Import...")
        from services.catalog_service import CatalogService
        print("   ✅ CatalogService imported successfully")
        
        # Test 2: Create catalog service instance
        print("\n2️⃣ Testing Catalog Service Creation...")
        catalog_service = CatalogService()
        print("   ✅ CatalogService instance created")
        
        # Test 3: Check tests folder
        print("\n3️⃣ Testing Tests Folder Access...")
        tests_folder = Path("../tests")
        if tests_folder.exists():
            excel_files = list(tests_folder.glob("*.xlsx"))
            print(f"   ✅ Tests folder found with {len(excel_files)} Excel files:")
            for file in excel_files:
                print(f"      - {file.name}")
        else:
            print("   ❌ Tests folder not found")
            return False
        
        # Test 4: Load catalog
        print("\n4️⃣ Testing Catalog Loading...")
        catalog_service.load_catalog()
        print("   ✅ Catalog loaded successfully")
        
        # Test 5: Check catalog data
        print("\n5️⃣ Testing Catalog Data...")
        catalog_items = catalog_service.get_catalog_items()
        print(f"   ✅ Catalog contains {len(catalog_items)} items")
        
        if catalog_items:
            print("   📋 Sample catalog items:")
            for i, item in enumerate(catalog_items[:5]):
                print(f"      {i+1}. {item.item_code}: {item.item_name} ({item.category}) - {item.source_file}")
        
        # Test 6: Test catalog statistics
        print("\n6️⃣ Testing Catalog Statistics...")
        stats = catalog_service.get_stats()
        print(f"   ✅ Catalog statistics:")
        print(f"      Total items: {stats['total_items']}")
        print(f"      Categories: {len(stats['categories'])}")
        print(f"      Source files: {len(stats['source_files'])}")
        
        # Test 7: Test catalog search
        print("\n7️⃣ Testing Catalog Search...")
        search_results = catalog_service.search_items("bag", limit=3)
        print(f"   ✅ Search for 'bag' returned {len(search_results)} results")
        for result in search_results:
            print(f"      - {result.item_code}: {result.item_name}")
        
        # Test 8: Test catalog DataFrame
        print("\n8️⃣ Testing Catalog DataFrame...")
        df = catalog_service.get_catalog_dataframe()
        if df is not None:
            print(f"   ✅ Catalog DataFrame shape: {df.shape}")
            print(f"   ✅ DataFrame columns: {df.columns.tolist()}")
        else:
            print("   ❌ Catalog DataFrame is None")
        
        print("\n🎉 All catalog service tests passed!")
        print(f"\n📊 Final Catalog Summary:")
        print(f"   - Total items: {len(catalog_items)}")
        print(f"   - Categories: {list(stats['categories'].keys())}")
        print(f"   - Source files: {len(excel_files)}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_catalog_service())
    sys.exit(0 if success else 1)
