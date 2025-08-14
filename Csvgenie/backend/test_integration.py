#!/usr/bin/env python3
"""
Integration Test: CSVGenie Full-Stack Application
Tests the complete user workflow from order upload to CSV generation
"""

import requests
import json
import time
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def test_backend_health():
    """Test backend health endpoint"""
    print("🔍 Testing Backend Health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is healthy: {data['status']}")
            print(f"   Catalog loaded: {data['catalog_loaded']}")
            print(f"   Version: {data['version']}")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend health check error: {e}")
        return False

def test_catalog_endpoints():
    """Test catalog-related endpoints"""
    print("\n🔍 Testing Catalog Endpoints...")
    
    # Test catalog summary
    try:
        response = requests.get(f"{BACKEND_URL}/catalog/summary")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Catalog summary: {data['total_items']} items")
            print(f"   Categories: {len(data['categories'])}")
            print(f"   Source files: {len(data['source_files'])}")
        else:
            print(f"❌ Catalog summary failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Catalog summary error: {e}")
    
    # Test catalog search
    try:
        response = requests.get(f"{BACKEND_URL}/catalog/search?query=apple")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Catalog search: Found {data['total_found']} items for 'apple'")
        else:
            print(f"❌ Catalog search failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Catalog search error: {e}")

def test_order_processing():
    """Test order processing workflow"""
    print("\n🔍 Testing Order Processing...")
    
    # Create a test order file
    test_order = """Grocery Order
    
    Need to buy:
    - 2 bags of organic apples
    - 1 gallon whole milk
    - 3 cans of black beans
    - 1 loaf of whole wheat bread
    - 2 pounds of ground beef
    """
    
    test_file = Path("test_integration_order.txt")
    test_file.write_text(test_order)
    
    try:
        # Upload and process the order
        with open(test_file, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BACKEND_URL}/upload-order-file", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Order processing successful!")
            print(f"   Total items: {data['total_items']}")
            print(f"   Mapped items: {data['mapped_count']}")
            print(f"   Unmapped items: {data['unmapped_count']}")
            print(f"   Processing time: {data['processing_time_ms']:.2f}ms")
            print(f"   CSV filename: {data['csv_filename']}")
            
            # Show sample mapped items
            if data['mapped_items']:
                print("\n   Sample mapped items:")
                for item in data['mapped_items'][:3]:
                    print(f"     - {item['item_name']} (Qty: {item['quantity']}, Confidence: {item['confidence']})")
            
            # Show unmapped items
            if data['unmapped_items']:
                print("\n   Unmapped items:")
                for item in data['unmapped_items']:
                    print(f"     - {item['original_text']}")
            
            return True
        else:
            print(f"❌ Order processing failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Order processing error: {e}")
        return False
    finally:
        # Clean up test file
        if test_file.exists():
            test_file.unlink()

def test_frontend_connectivity():
    """Test if frontend is accessible"""
    print("\n🔍 Testing Frontend Connectivity...")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend connectivity error: {e}")
        return False

def main():
    """Run all integration tests"""
    print("🚀 CSVGenie Integration Testing")
    print("=" * 50)
    
    # Test backend health
    if not test_backend_health():
        print("\n❌ Backend health check failed. Please ensure backend is running.")
        return
    
    # Test catalog endpoints
    test_catalog_endpoints()
    
    # Test order processing
    if test_order_processing():
        print("\n✅ Order processing workflow is working!")
    else:
        print("\n❌ Order processing workflow failed.")
    
    # Test frontend connectivity
    test_frontend_connectivity()
    
    print("\n" + "=" * 50)
    print("🎯 Integration Testing Complete!")
    print("\nNext steps:")
    print("1. Open http://localhost:3000 in your browser")
    print("2. Upload a text file with grocery items")
    print("3. Test the complete workflow end-to-end")

if __name__ == "__main__":
    main()
