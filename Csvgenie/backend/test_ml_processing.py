#!/usr/bin/env python3
"""
Test script for ML-powered order processing
Tests the sentence transformer model integration and order processing pipeline
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.catalog_service import CatalogService
from services.order_processor import OrderProcessor

def test_ml_processing():
    """Test the ML-powered order processing pipeline"""
    print("🧪 Testing ML-Powered Order Processing...")
    
    try:
        # 1. Test catalog service
        print("\n1️⃣ Testing Catalog Service...")
        catalog_service = CatalogService()
        catalog_service.load_catalog()
        print(f"   ✅ Catalog loaded with {len(catalog_service.get_catalog_items())} items")
        
        # 2. Test order processor initialization
        print("\n2️⃣ Testing Order Processor Initialization...")
        order_processor = OrderProcessor(catalog_service)
        print(f"   ✅ Order processor created")
        
        # 3. Test ML model loading
        print("\n3️⃣ Testing ML Model Loading...")
        stats = order_processor.get_processing_stats()
        print(f"   ✅ Processing stats: {stats}")
        
        # 4. Test catalog embeddings preparation
        print("\n4️⃣ Testing Catalog Embeddings...")
        order_processor._prepare_catalog_embeddings()
        print(f"   ✅ Catalog embeddings prepared")
        
        # 5. Test order processing with sample text
        print("\n5️⃣ Testing Order Processing...")
        sample_order = """
        I need:
        2x organic apples
        1kg rice
        3 bottles of water
        5 tea bags
        """
        
        result = order_processor.process_order_text(sample_order)
        print(f"   ✅ Order processed successfully")
        print(f"   📊 Results:")
        print(f"      - Total items: {result.total_items}")
        print(f"      - Mapped items: {result.mapped_count}")
        print(f"      - Unmapped items: {result.unmapped_count}")
        print(f"      - Processing time: {result.processing_time_ms:.2f}ms")
        
        if result.mapped_items:
            print(f"   📋 Sample mapped items:")
            for i, item in enumerate(result.mapped_items[:3]):
                print(f"      {i+1}. {item.original_text} → {item.item_name} (confidence: {item.confidence.value}, similarity: {item.similarity_score:.3f})")
        
        if result.csv_filename:
            print(f"   📁 CSV generated: {result.csv_filename}")
        
        print("\n🎉 All ML processing tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_ml_processing()
    sys.exit(0 if success else 1)
