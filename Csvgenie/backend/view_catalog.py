#!/usr/bin/env python3
"""
View the generated catalog files
Run this script to see what catalog data has been generated
"""

import json
from pathlib import Path

def view_catalog_files():
    """View all generated catalog files"""
    print("📋 CSVGenie Catalog Files Viewer")
    print("=" * 50)
    
    temp_dir = Path("temp")
    
    if not temp_dir.exists():
        print("❌ Temp directory not found. Run the catalog service first.")
        return
    
    # Check main catalog file
    catalog_file = temp_dir / "catalog.json"
    if catalog_file.exists():
        print(f"\n📁 Main Catalog File: {catalog_file}")
        print("-" * 30)
        
        with open(catalog_file, 'r', encoding='utf-8') as f:
            catalog_data = json.load(f)
        
        metadata = catalog_data.get('metadata', {})
        print(f"Total Items: {metadata.get('total_items', 0)}")
        print(f"Categories: {', '.join(metadata.get('categories', []))}")
        print(f"Brands: {', '.join(metadata.get('brands', []))}")
        print(f"Generated: {metadata.get('generated_at', 'Unknown')}")
        print(f"Version: {metadata.get('version', 'Unknown')}")
        
        # Show first few items
        items = catalog_data.get('items', [])
        if items:
            print(f"\n📦 Sample Items (showing first 5):")
            for i, item in enumerate(items[:5]):
                print(f"  {i+1}. {item['item_code']}: {item['item_name']} ({item['category']})")
                if item.get('synonyms'):
                    print(f"     Synonyms: {', '.join(item['synonyms'][:3])}")
    else:
        print("❌ Main catalog file not found")
    
    # Check lookup files
    lookup_files = [
        ("code_to_name.json", "Item Code → Name Lookup"),
        ("name_to_code.json", "Item Name → Code Lookup"),
        ("category_lookup.json", "Category-based Lookup")
    ]
    
    print(f"\n🔍 Lookup Files:")
    print("-" * 30)
    
    for filename, description in lookup_files:
        filepath = temp_dir / filename
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if filename == "category_lookup.json":
                print(f"  ✅ {description}: {len(data)} categories")
                for category, items in list(data.items())[:3]:  # Show first 3 categories
                    print(f"     - {category}: {len(items)} items")
            else:
                print(f"  ✅ {description}: {len(data)} entries")
        else:
            print(f"  ❌ {description}: File not found")
    
    # Show file sizes
    print(f"\n💾 File Sizes:")
    print("-" * 30)
    
    for filepath in temp_dir.glob("*.json"):
        size_kb = filepath.stat().st_size / 1024
        print(f"  {filepath.name}: {size_kb:.1f} KB")

if __name__ == "__main__":
    view_catalog_files()



