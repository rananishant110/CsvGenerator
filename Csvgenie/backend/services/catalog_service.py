import pandas as pd
import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging
from models.schemas import CatalogItem

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CatalogService:
    """Service for managing the product catalog from Excel files"""
    
    def __init__(self):
        self.catalog: List[CatalogItem] = []
        self.catalog_df: Optional[pd.DataFrame] = None
        self.is_loaded_flag = False
        self.tests_folder = Path("catalog")  # Use local catalog directory
        self.catalog_file = Path("temp/catalog.json")  # Persistent catalog storage
        
    def load_catalog(self) -> None:
        """Load and merge all Excel files from the tests folder"""
        # First try to load from existing JSON file
        if self.load_catalog_from_json():
            logger.info("✅ Catalog loaded from existing JSON file")
            return
        
        logger.info("🔄 No existing catalog found, loading from Excel files...")
        
        try:
            logger.info("Starting catalog loading process...")
            
            if not self.tests_folder.exists():
                logger.error(f"Tests folder not found: {self.tests_folder}")
                raise FileNotFoundError(f"Tests folder not found: {self.tests_folder}")
            
            excel_files = list(self.tests_folder.glob("*.xlsx"))
            logger.info(f"Found {len(excel_files)} Excel files: {[f.name for f in excel_files]}")
            
            if not excel_files:
                logger.warning("No Excel files found in tests folder")
                return
            
            # Load and merge all Excel files
            all_dataframes = []
            
            for excel_file in excel_files:
                try:
                    logger.info(f"Processing file: {excel_file.name}")
                    
                    # Read all sheets from Excel file
                    excel = pd.ExcelFile(excel_file)
                    sheet_names = excel.sheet_names
                    logger.info(f"  Found {len(sheet_names)} sheets: {sheet_names}")
                    
                    for sheet_name in sheet_names:
                        try:
                            # Read specific sheet
                            df = pd.read_excel(excel_file, sheet_name=sheet_name, header=0)
                            logger.info(f"  Sheet '{sheet_name}': {len(df)} rows")
                            
                            # Standardize column names
                            df = self._standardize_columns(df)
                            
                            # Add source file and sheet information
                            df['source_file'] = excel_file.name
                            df['sheet_name'] = sheet_name
                            
                            all_dataframes.append(df)
                            
                        except Exception as e:
                            logger.error(f"  ❌ Error processing sheet '{sheet_name}' in {excel_file.name}: {e}")
                            continue
                    
                except Exception as e:
                    logger.error(f"Error loading {excel_file.name}: {e}")
                    continue
            
            if not all_dataframes:
                raise ValueError("No valid Excel files could be loaded")
            
            # Merge all dataframes
            self.catalog_df = pd.concat(all_dataframes, ignore_index=True)
            logger.info(f"Total rows after merging: {len(self.catalog_df)}")
            
            # Clean and standardize the data
            self._clean_catalog_data()
            
            # Convert to CatalogItem objects
            self._convert_to_catalog_items()
            
            # Save catalog to JSON for persistence
            self._save_catalog_to_json()
            
            self.is_loaded_flag = True
            logger.info(f"Catalog loaded successfully with {len(self.catalog)} items")
            
        except Exception as e:
            logger.error(f"Error loading catalog: {e}")
            raise
    
    def _standardize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize column names across different Excel files"""
        logger.info(f"Standardizing columns for DataFrame with columns: {df.columns.tolist()}")
        
        # Create a mapping of common column variations based on actual Excel files
        column_mapping = {
            'item_code': ['item_code', 'code', 'product_code', 'sku', 'id', 'ITEM#', 'ITEM#.1', 'ITEM#.2'],
            'item_name': ['item_name', 'name', 'product_name', 'description', 'title', 'ITEM DESCRIPTION', 'ITEM DESCRIPTION.1', 'ITEM DESCRIPTION.2'],
            'order': ['order', 'quantity', 'qty', 'ORDER', 'ORDER.1', 'ORDER.2'],
            'category': ['category', 'type', 'group', 'department', 'CATEGORY'],
            'brand': ['brand', 'manufacturer', 'company', 'BRAND']
        }
        
        # Find and rename columns
        for standard_name, variations in column_mapping.items():
            for variation in variations:
                if variation in df.columns:
                    df = df.rename(columns={variation: standard_name})
                    logger.info(f"Renamed column '{variation}' to '{standard_name}'")
                    break
        
        # Handle multiple column sets (ITEM#.1, ITEM DESCRIPTION.1, etc.)
        # Find all item code and description columns
        item_code_cols = [col for col in df.columns if 'ITEM#' in col]
        item_desc_cols = [col for col in df.columns if 'ITEM DESCRIPTION' in col]
        
        if len(item_code_cols) > 1:
            logger.info(f"Found multiple column sets: {item_code_cols}")
            # Process each set and combine them
            combined_dfs = []
            
            for i in range(len(item_code_cols)):
                if i < len(item_desc_cols):
                    subset_df = df[['source_file']].copy()
                    subset_df['item_code'] = df[item_code_cols[i]]
                    subset_df['item_name'] = df[item_desc_cols[i]]
                    subset_df['order'] = df.get(f'ORDER.{i}' if i > 0 else 'ORDER', '')
                    combined_dfs.append(subset_df)
            
            if combined_dfs:
                df = pd.concat(combined_dfs, ignore_index=True)
                logger.info(f"Combined {len(combined_dfs)} column sets into {len(df)} rows")
        
        # Handle additional columns that might exist
        additional_columns = [col for col in df.columns if col not in ['item_code', 'item_name', 'order', 'category', 'brand', 'source_file']]
        if additional_columns:
            logger.info(f"Additional columns found: {additional_columns}")
            # Move additional columns to synonyms if they contain text data
            for col in additional_columns:
                if df[col].dtype == 'object' and col != 'source_file':
                    # Initialize synonyms column if it doesn't exist
                    if 'synonyms' not in df.columns:
                        df['synonyms'] = ''
                    # Convert to string before concatenation
                    df['synonyms'] = df['synonyms'].astype(str).fillna('') + ' | ' + df[col].astype(str).fillna('')
        
        # Ensure required columns exist
        if 'item_code' not in df.columns:
            logger.warning("No item_code column found, creating from index")
            df['item_code'] = df.index.astype(str)
        
        if 'item_name' not in df.columns:
            logger.warning("No item_name column found, using first text column")
            text_columns = [col for col in df.columns if df[col].dtype == 'object' and col not in ['source_file', 'synonyms']]
            if text_columns:
                df['item_name'] = df[text_columns[0]]
            else:
                df['item_name'] = 'Unknown Item'
        
        # Initialize synonyms column if not present
        if 'synonyms' not in df.columns:
            df['synonyms'] = ''
        
        # Initialize category and brand columns if not present
        if 'category' not in df.columns:
            df['category'] = 'Unknown'
        if 'brand' not in df.columns:
            df['brand'] = 'Unknown'
        
        logger.info(f"Final columns after standardization: {df.columns.tolist()}")
        return df
    
    def _clean_catalog_data(self) -> None:
        """Clean and standardize the catalog data"""
        if self.catalog_df is None:
            return
        
        logger.info("Starting catalog data cleaning...")
        
        # Remove rows where item_name is empty or just whitespace
        initial_count = len(self.catalog_df)
        self.catalog_df = self.catalog_df[
            (self.catalog_df['item_name'].notna()) & 
            (self.catalog_df['item_name'].astype(str).str.strip().str.len() > 0)
        ]
        logger.info(f"Removed {initial_count - len(self.catalog_df)} rows with empty item names")
        
        # Remove rows where item_name is just the header or category labels
        header_patterns = ['ITEM#', 'ITEM DESCRIPTION', 'ORDER', 'CATEGORY', 'BRAND']
        category_patterns = ['PRODUCE BAGS', 'OTHER ESSENTIALS', 'COOKING OIL & GHEE', 'GRAIN MARKET']
        
        # Remove header rows and category labels
        self.catalog_df = self.catalog_df[
            ~(
                self.catalog_df['item_name'].astype(str).str.upper().isin(header_patterns) |
                self.catalog_df['item_name'].astype(str).str.upper().isin([p.upper() for p in category_patterns])
            )
        ]
        logger.info(f"Removed header rows and category labels, remaining: {len(self.catalog_df)} items")
        
        # Don't remove duplicates - each instance should be counted separately
        # This allows the same ITEM# to exist in multiple categories/sheets
        logger.info(f"Keeping all instances - same ITEM# can exist in multiple categories")
        
        # Fill missing values
        self.catalog_df['synonyms'] = self.catalog_df['synonyms'].fillna('')
        self.catalog_df['category'] = self.catalog_df['category'].fillna('Unknown')
        self.catalog_df['brand'] = self.catalog_df['brand'].fillna('Unknown')
        
        # Clean item names - remove extra whitespace and normalize
        self.catalog_df['item_name'] = self.catalog_df['item_name'].astype(str).str.strip()
        
        # Clean item codes - ensure they're strings and remove extra whitespace
        self.catalog_df['item_code'] = self.catalog_df['item_code'].astype(str).str.strip()
        
        # Convert synonyms to list format - split by | and clean
        self.catalog_df['synonyms'] = self.catalog_df['synonyms'].apply(
            lambda x: [s.strip() for s in str(x).split('|') if s.strip()] if isinstance(x, str) and x.strip() else []
        )
        
        # Extract category from source file name if category is Unknown
        self.catalog_df['category'] = self.catalog_df.apply(
            lambda row: row['source_file'].replace('.xlsx', '').title() 
            if row['category'] == 'Unknown' else row['category'], 
            axis=1
        )
        
        # Remove rows where item_code is empty or just whitespace
        self.catalog_df = self.catalog_df[
            (self.catalog_df['item_code'].notna()) & 
            (self.catalog_df['item_code'].astype(str).str.strip().str.len() > 0)
        ]
        
        logger.info(f"Catalog cleaned: {len(self.catalog_df)} items remaining")
        
        # Log some sample data for verification
        if len(self.catalog_df) > 0:
            sample_items = self.catalog_df.head(3)
            logger.info("Sample cleaned items:")
            for _, item in sample_items.iterrows():
                logger.info(f"  - {item['item_code']}: {item['item_name']} ({item['category']})")
    
    def _convert_to_catalog_items(self) -> None:
        """Convert DataFrame to CatalogItem objects"""
        self.catalog = []
        conversion_errors = 0
        
        logger.info("Converting DataFrame rows to CatalogItem objects...")
        
        for idx, row in self.catalog_df.iterrows():
            try:
                # Validate required fields
                if pd.isna(row['item_code']) or pd.isna(row['item_name']):
                    logger.warning(f"Skipping row {idx}: missing required fields")
                    continue
                
                # Clean and validate item_code
                item_code = str(row['item_code']).strip()
                if not item_code or item_code.lower() in ['nan', 'none', '']:
                    logger.warning(f"Skipping row {idx}: invalid item_code: {item_code}")
                    continue
                
                # Clean and validate item_name
                item_name = str(row['item_name']).strip()
                if not item_name or item_name.lower() in ['nan', 'none', '']:
                    logger.warning(f"Skipping row {idx}: invalid item_name: {item_name}")
                    continue
                
                # Get category from source file name (remove .xlsx extension)
                category = str(row.get('source_file', 'Unknown')).replace('.xlsx', '').title()
                
                # Get source file name
                source_file = str(row.get('source_file', 'Unknown'))
                
                # Get sheet name
                sheet_name = str(row.get('sheet_name', 'Unknown'))
                
                # Create catalog item
                catalog_item = CatalogItem(
                    item_code=item_code,
                    item_name=item_name,
                    category=category,
                    source_file=source_file,
                    sheet_name=sheet_name
                )
                
                self.catalog.append(catalog_item)
                
            except Exception as e:
                conversion_errors += 1
                logger.warning(f"Error converting row {idx} to CatalogItem: {e}")
                logger.debug(f"Problematic row data: {row.to_dict()}")
                continue
        
        logger.info(f"Successfully converted {len(self.catalog)} rows to CatalogItem objects")
        if conversion_errors > 0:
            logger.warning(f"Failed to convert {conversion_errors} rows")
        
        # Log some sample items for verification
        if self.catalog:
            logger.info("Sample catalog items:")
            for i, item in enumerate(self.catalog[:3]):
                logger.info(f"  {i+1}. {item.item_code}: {item.item_name} ({item.category}) - {item.source_file}")
    
    def get_catalog_items(self) -> List[CatalogItem]:
        """Get all catalog items"""
        return self.catalog
    
    def get_catalog_dataframe(self) -> Optional[pd.DataFrame]:
        """Get the catalog as a pandas DataFrame"""
        return self.catalog_df
    
    def search_items(self, query: str, limit: int = 10) -> List[CatalogItem]:
        """Search items by name"""
        if not self.is_loaded_flag:
            return []
        
        query_lower = query.lower()
        results = []
        
        for item in self.catalog:
            # Check item name
            if query_lower in item.item_name.lower():
                results.append(item)
                if len(results) >= limit:
                    break
        
        return results
    
    def get_item_by_code(self, item_code: str) -> Optional[CatalogItem]:
        """Get item by its code"""
        for item in self.catalog:
            if item.item_code == item_code:
                return item
        return None
    
    def is_loaded(self) -> bool:
        """Check if catalog is loaded"""
        return self.is_loaded_flag
    
    def get_stats(self) -> Dict[str, Any]:
        """Get catalog statistics"""
        if not self.is_loaded_flag:
            return {"error": "Catalog not loaded"}
        
        stats = {
            "total_items": len(self.catalog),
            "categories": {},
            "source_files": {}
        }
        
        for item in self.catalog:
            # Count categories
            category = item.category or "Unknown"
            stats["categories"][category] = stats["categories"].get(category, 0) + 1
            
            # Count source files
            source_file = item.source_file or "Unknown"
            stats["source_files"][source_file] = stats["source_files"].get(source_file, 0) + 1
        
        return stats
    
    def _save_catalog_to_json(self) -> None:
        """Save catalog to JSON file for persistence"""
        try:
            # Ensure temp directory exists
            self.catalog_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Convert catalog items to dictionary format
            catalog_data = []
            for item in self.catalog:
                catalog_data.append({
                    'item_code': item.item_code,
                    'item_name': item.item_name,
                    'category': item.category,
                    'source_file': item.source_file,
                    'sheet_name': item.sheet_name
                })
            
            # Create comprehensive catalog summary
            catalog_summary = {
                'metadata': {
                    'total_items': len(self.catalog),
                    'categories': list(set(item.category for item in self.catalog)),
                    'source_files': list(set(item.source_file for item in self.catalog)),
                    'sheets': list(set(f"{item.source_file}:{item.sheet_name}" for item in self.catalog)),
                    'generated_at': pd.Timestamp.now().isoformat(),
                    'version': '1.0'
                },
                'items': catalog_data
            }
            
            # Save to JSON file
            with open(self.catalog_file, 'w', encoding='utf-8') as f:
                json.dump(catalog_summary, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Catalog saved to {self.catalog_file}")
            
            # Also create a simple lookup file for quick access
            self._create_lookup_files()
            
        except Exception as e:
            logger.error(f"❌ Error saving catalog to JSON: {e}")
    
    def _create_lookup_files(self) -> None:
        """Create additional lookup files for easy access"""
        try:
            # Create item code to item name lookup
            code_to_name = {item.item_code: item.item_name for item in self.catalog}
            code_to_name_file = Path("temp/code_to_name.json")
            with open(code_to_name_file, 'w', encoding='utf-8') as f:
                json.dump(code_to_name, f, indent=2, ensure_ascii=False)
            
            # Create item name to item code lookup
            name_to_code = {item.item_name: item.item_code for item in self.catalog}
            name_to_code_file = Path("temp/name_to_code.json")
            with open(name_to_code_file, 'w', encoding='utf-8') as f:
                json.dump(name_to_code, f, indent=2, ensure_ascii=False)
            
            # Create category-based lookup
            category_lookup = {}
            for item in self.catalog:
                if item.category not in category_lookup:
                    category_lookup[item.category] = []
                category_lookup[item.category].append({
                    'item_code': item.item_code,
                    'item_name': item.item_name,
                    'source_file': item.source_file
                })
            
            category_file = Path("temp/category_lookup.json")
            with open(category_file, 'w', encoding='utf-8') as f:
                json.dump(category_lookup, f, indent=2, ensure_ascii=False)
            
            logger.info("✅ Created lookup files: code_to_name.json, name_to_code.json, category_lookup.json")
            
        except Exception as e:
            logger.error(f"❌ Error creating lookup files: {e}")
    
    def load_catalog_from_json(self) -> bool:
        """Load catalog from JSON file if available"""
        try:
            if not self.catalog_file.exists():
                logger.info("No existing catalog JSON file found")
                return False
            
            logger.info(f"Loading catalog from {self.catalog_file}")
            
            with open(self.catalog_file, 'r', encoding='utf-8') as f:
                catalog_data = json.load(f)
            
            # Convert back to CatalogItem objects
            self.catalog = []
            for item_data in catalog_data['items']:
                catalog_item = CatalogItem(
                    item_code=item_data['item_code'],
                    item_name=item_data['item_name'],
                    category=item_data.get('category', 'Unknown'),
                    source_file=item_data.get('source_file', 'Unknown'),
                    sheet_name=item_data.get('sheet_name', 'Unknown')
                )
                self.catalog.append(catalog_item)
            
            self.is_loaded_flag = True
            logger.info(f"✅ Catalog loaded from JSON: {len(self.catalog)} items")
            
            # Log metadata
            metadata = catalog_data.get('metadata', {})
            logger.info(f"📊 Catalog metadata: {metadata.get('total_items', 0)} items, "
                       f"{len(metadata.get('categories', []))} categories, "
                       f"generated at {metadata.get('generated_at', 'unknown')}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error loading catalog from JSON: {e}")
            return False
    
    def get_catalog_summary(self) -> Dict[str, Any]:
        """Get a comprehensive summary of the catalog"""
        if not self.is_loaded_flag:
            return {"error": "Catalog not loaded"}
        
        summary = {
            "total_items": len(self.catalog),
            "categories": {},
            "source_files": set(),
            "item_codes": [],
            "item_names": []
        }
        
        for item in self.catalog:
            # Count categories
            category = item.category or "Unknown"
            summary["categories"][category] = summary["categories"].get(category, 0) + 1
            
            # Collect source files
            if item.source_file:
                summary["source_files"].add(item.source_file)
            
            # Collect item codes and names
            summary["item_codes"].append(item.item_code)
            summary["item_names"].append(item.item_name)
        
        # Convert sets to lists for JSON serialization
        summary["source_files"] = list(summary["source_files"])
        
        return summary
