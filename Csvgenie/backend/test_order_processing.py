#!/usr/bin/env python3
"""
Test Order Processing: Debug why test.txt is mapping incorrectly
"""

import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

from services.order_processor import OrderProcessor
from services.catalog_service import CatalogService
from config import config

def test_order_processing():
    """Test order processing with the test.txt file"""
    print("🧪 Testing Order Processing with test.txt")
    print("=" * 50)
    
    try:
        # Initialize services
        print("📚 Initializing catalog service...")
        catalog_service = CatalogService()
        catalog_service.load_catalog()
        
        print("🤖 Initializing order processor...")
        order_processor = OrderProcessor(catalog_service)
        
        # Read the test file
        test_file_path = Path("../tests/samples/test.txt")
        print(f"📖 Reading test file: {test_file_path}")
        
        if not test_file_path.exists():
            print(f"❌ Test file not found: {test_file_path}")
            return
        
        with open(test_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"📄 File content length: {len(content)} characters")
        print(f"📄 First 200 characters: {content[:200]}...")
        
        # Process the order
        print("\n🔄 Processing order...")
        result = order_processor.process_order_text(content)
        
        print(f"\n📊 Processing Results:")
        print(f"  Total items: {result.total_items}")
        print(f"  Mapped items: {result.mapped_count}")
        print(f"  Unmapped items: {result.unmapped_count}")
        
        if result.mapped_items:
            print(f"\n✅ Mapped Items:")
            for i, item in enumerate(result.mapped_items[:5]):  # Show first 5
                print(f"  {i+1}. '{item.original_text}' → '{item.item_name}'")
                print(f"     Code: {item.item_code}, Qty: {item.quantity}")
                print(f"     Confidence: {item.confidence}, Similarity: {item.similarity_score:.3f}")
        
        if result.unmapped_items:
            print(f"\n❌ Unmapped Items:")
            for i, item in enumerate(result.unmapped_items[:5]):  # Show first 5
                print(f"  {i+1}. {item}")
        
        print(f"\n📁 CSV generated: {result.csv_filename}")
        print(f"⏱️  Processing time: {result.processing_time_ms:.2f}ms")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_order_processing()
