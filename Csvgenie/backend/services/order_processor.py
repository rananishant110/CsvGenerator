import re
import time
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import logging
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import tempfile
import os

from models.schemas import MappedItem, ProcessedOrder, MatchConfidence, CatalogItem
from services.catalog_service import CatalogService
from config import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OrderProcessor:
    """Service for processing order text and mapping items to catalog"""
    
    def __init__(self, catalog_service: CatalogService):
        self.catalog_service = catalog_service
        self.model = None
        self.catalog_embeddings = None
        self.catalog_texts = []
        self.confidence_thresholds = {
            'high': config.CONFIDENCE_THRESHOLD_HIGH,
            'medium': config.CONFIDENCE_THRESHOLD_MEDIUM,
            'low': config.CONFIDENCE_THRESHOLD_LOW
        }
        
        # Initialize the ML model
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the Hugging Face sentence transformer model"""
        try:
            logger.info("Loading sentence transformer model...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("✅ Sentence transformer model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Error loading model: {e}")
            raise
    
    def _prepare_catalog_embeddings(self):
        """Prepare embeddings for all catalog items"""
        if not self.catalog_service.is_loaded():
            raise ValueError("Catalog not loaded")
        
        logger.info("Preparing catalog embeddings...")
        
        # Get catalog items
        catalog_items = self.catalog_service.get_catalog_items()
        
        # Prepare text representations for each catalog item
        self.catalog_texts = []
        for item in catalog_items:
            # Enhanced text representation with better preprocessing
            text = self._preprocess_catalog_text(item)
            self.catalog_texts.append(text)
        
        # Generate embeddings for all catalog texts
        if self.model:
            self.catalog_embeddings = self.model.encode(self.catalog_texts)
            logger.info(f"✅ Generated embeddings for {len(self.catalog_texts)} catalog items")
        else:
            raise ValueError("ML model not initialized")
    
    def _preprocess_catalog_text(self, item) -> str:
        """Preprocess catalog item text for better matching"""
        
        # Combine multiple text fields
        text_parts = [
            item.item_name,
            item.category,
            item.source_file.replace('.xlsx', '').replace('_', ' '),
            item.sheet_name if hasattr(item, 'sheet_name') else ''
        ]
        
        # Clean and normalize text
        text = ' '.join(text_parts).lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Add common variations and synonyms
        variations = []
        
        # Handle common abbreviations
        if 'lb' in text or 'pound' in text:
            variations.extend(['lb', 'pound', 'lbs', 'pounds'])
        if 'oz' in text or 'ounce' in text:
            variations.extend(['oz', 'ounce', 'ounces'])
        if 'g' in text or 'gram' in text:
            variations.extend(['g', 'gram', 'grams'])
        if 'ml' in text or 'milliliter' in text:
            variations.extend(['ml', 'milliliter', 'milliliters'])
        
        # Handle common food terms
        if 'organic' in text:
            variations.append('organic')
        if 'fresh' in text:
            variations.append('fresh')
        if 'frozen' in text:
            variations.append('frozen')
        
        # Add variations to text
        if variations:
            text += ' ' + ' '.join(variations)
        
        return text
    
    def _preprocess_order_text(self, text: str) -> str:
        """Preprocess order text for better matching"""
        import re
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove common headers and non-item text
        headers_to_remove = [
            'grocery list', 'shopping list', 'order', 'items', 'need to buy',
            'please make sure', 'everything is fresh', 'organic when possible'
        ]
        
        for header in headers_to_remove:
            text = text.replace(header, '')
        
        # Normalize common food terms
        text = re.sub(r'\bapples?\b', 'apple', text)
        text = re.sub(r'\bbananas?\b', 'banana', text)
        text = re.sub(r'\boranges?\b', 'orange', text)
        text = re.sub(r'\btomatoes?\b', 'tomato', text)
        text = re.sub(r'\bonions?\b', 'onion', text)
        text = re.sub(r'\bpotatoes?\b', 'potato', text)
        
        # Normalize common measurements
        text = re.sub(r'\b(lbs?|pounds?)\b', 'lb', text)
        text = re.sub(r'\b(oz|ounces?)\b', 'oz', text)
        text = re.sub(r'\b(grams?|g)\b', 'g', text)
        text = re.sub(r'\b(ml|milliliters?)\b', 'ml', text)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def process_order_text(self, text_content: str) -> ProcessedOrder:
        """Process order text and return mapped results"""
        start_time = time.time()
        
        try:
            # Ensure catalog embeddings are ready
            if self.catalog_embeddings is None:
                self._prepare_catalog_embeddings()
            
            # Parse the order text
            parsed_items = self._parse_order_text(text_content)
            logger.info(f"Parsed {len(parsed_items)} items from order text")
            
            # Map items to catalog
            mapped_items = []
            unmapped_items = []
            
            for item_text, quantity in parsed_items:
                mapped_item = self._map_item_to_catalog(item_text, quantity)
                
                if mapped_item and mapped_item.confidence != MatchConfidence.UNMATCHED:
                    mapped_items.append(mapped_item)
                else:
                    unmapped_items.append(item_text)
            
            # Generate CSV file
            csv_filename = self._generate_csv(mapped_items)
            
            processing_time = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            result = ProcessedOrder(
                mapped_items=mapped_items,
                unmapped_items=unmapped_items,
                total_items=len(parsed_items),
                mapped_count=len(mapped_items),
                unmapped_count=len(unmapped_items),
                csv_filename=csv_filename,
                processing_time_ms=processing_time
            )
            
            logger.info(f"✅ Order processed successfully: {len(mapped_items)} mapped, {len(unmapped_items)} unmapped")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error processing order: {e}")
            raise
    
    def _parse_order_text(self, text_content: str) -> List[Tuple[str, float]]:
        """Parse order text to extract items and quantities"""
        # Split text into lines and clean
        lines = [line.strip() for line in text_content.split('\n') if line.strip()]
        
        parsed_items = []
        
        for line in lines:
            # Skip empty lines and common headers
            if not line or line.lower() in ['grocery list', 'shopping list', 'order', 'items']:
                continue
            
            # Extract quantity and item description
            quantity, item_text = self._extract_quantity_and_item(line)
            
            if item_text and quantity > 0:
                parsed_items.append((item_text, quantity))
        
        return parsed_items
    
    def _extract_quantity_and_item(self, text: str) -> Tuple[float, str]:
        """Extract quantity and item description from text"""
        # Clean the text first
        text = text.strip()
        
        # Common quantity patterns for grocery items
        quantity_patterns = [
            # Pattern: "Item - Quantity" (most common in your file)
            r'^(.+?)\s*-\s*(\d+(?:\.\d+)?)\s*(lbs?|kg|g|oz|ml|l|qt|gal|pcs?|pieces?|units?|bags?|bottles?|cans?|packets?|boxes?|case|box)',
            
            # Pattern: "Item Quantity units"
            r'^(.+?)\s+(\d+(?:\.\d+)?)\s*(lbs?|kg|g|oz|ml|l|qt|gal|pcs?|pieces?|units?|bags?|bottles?|cans?|packets?|boxes?|case|box)',
            
            # Pattern: "Quantity Item"
            r'^(\d+(?:\.\d+)?)\s*(lbs?|kg|g|oz|ml|l|qt|gal|pcs?|pieces?|units?|bags?|bottles?|cans?|packets?|boxes?|case|box)\s+(.+)',
            
            # Pattern: "Item Quantity" (fallback)
            r'^(.+?)\s+(\d+(?:\.\d+)?)',
            
            # Pattern: "Quantity Item" (fallback)
            r'^(\d+(?:\.\d+)?)\s+(.+)',
        ]
        
        for pattern in quantity_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    if len(match.groups()) == 2:
                        # Check if first group is quantity or item
                        first_group = match.group(1).strip()
                        second_group = match.group(2).strip()
                        
                        # Try to parse first group as quantity
                        try:
                            quantity = float(first_group)
                            item_text = second_group
                        except ValueError:
                            # First group is not a number, try second group
                            try:
                                quantity = float(second_group)
                                item_text = first_group
                            except ValueError:
                                # Neither is a number, skip this pattern
                                continue
                    else:
                        # Handle 3+ groups if needed
                        quantity = float(match.group(1))
                        item_text = match.group(2).strip()
                    
                    # Clean up item text
                    item_text = re.sub(r'^\s*[-–—]\s*', '', item_text)  # Remove leading dashes
                    item_text = item_text.strip()
                    
                    # Validate we have both quantity and item
                    if quantity > 0 and item_text and len(item_text) > 1:
                        logger.debug(f"Parsed: '{item_text}' (Qty: {quantity}) from '{text}'")
                        return quantity, item_text
                        
                except (ValueError, IndexError) as e:
                    logger.debug(f"Pattern failed for '{text}': {e}")
                    continue
        
        # If no pattern matches, try to extract any number and use the rest as item
        logger.warning(f"No pattern matched for text: '{text}'")
        
        # Look for any number in the text
        number_match = re.search(r'(\d+(?:\.\d+)?)', text)
        if number_match:
            try:
                quantity = float(number_match.group(1))
                # Remove the number and clean up
                item_text = re.sub(r'\d+(?:\.\d+)?', '', text).strip()
                item_text = re.sub(r'^\s*[-–—]\s*', '', item_text)  # Remove leading dashes
                
                if item_text and len(item_text) > 1:
                    logger.debug(f"Fallback parsed: '{item_text}' (Qty: {quantity}) from '{text}'")
                    return quantity, item_text
            except ValueError:
                pass
        
        # Last resort: assume quantity 1 and use the whole text
        logger.warning(f"Using fallback for text: '{text}'")
        return 1.0, text.strip()
    
    def _map_item_to_catalog(self, item_text: str, quantity: float) -> Optional[MappedItem]:
        """Map an item to the catalog using semantic similarity"""
        if self.catalog_embeddings is None:
            logger.warning("Catalog embeddings not available, using fallback matching")
            return self._fallback_matching(item_text, quantity)
        
        try:
            # Preprocess the input text
            processed_text = self._preprocess_order_text(item_text)
            
            # Generate embedding for the processed text
            item_embedding = self.model.encode([processed_text])
            
            # Calculate cosine similarity with all catalog items
            similarities = cosine_similarity(item_embedding, self.catalog_embeddings)[0]
            
            # Get top candidates
            top_indices = np.argsort(similarities)[::-1][:config.MAX_CANDIDATES_PER_ITEM]
            top_similarities = similarities[top_indices]
            
            # Get the corresponding catalog items
            catalog_items = self.catalog_service.get_catalog_items()
            top_candidates = [catalog_items[i] for i in top_indices]
            
            # Find the best match above minimum threshold
            best_match_idx = None
            best_similarity = 0.0
            
            for i, similarity in enumerate(top_similarities):
                if similarity >= config.MIN_SIMILARITY_THRESHOLD:
                    best_match_idx = i
                    best_similarity = similarity
                    break
            
            if best_match_idx is None:
                logger.warning(f"No good match found for '{item_text}' (best similarity: {top_similarities[0]:.3f})")
                return None
            
            best_match_item = top_candidates[best_match_idx]
            
            # Enhanced confidence calculation
            confidence = self._determine_enhanced_confidence(best_similarity, top_similarities, item_text, best_match_item)
            
            # Create mapped item
            mapped_item = MappedItem(
                original_text=item_text,
                item_code=best_match_item.item_code,
                item_name=best_match_item.item_name,
                category=best_match_item.category,
                quantity=quantity,
                confidence=confidence,
                similarity_score=float(best_similarity)
            )
            
            logger.info(f"Mapped '{item_text}' to '{best_match_item.item_name}' (confidence: {confidence}, similarity: {best_similarity:.3f})")
            
            # Log alternative candidates for debugging
            if len(top_candidates) > 1:
                logger.debug(f"Alternative candidates for '{item_text}':")
                for i, (candidate, sim) in enumerate(zip(top_candidates[1:4], top_similarities[1:4])):
                    logger.debug(f"  {i+2}. {candidate.item_name} (similarity: {sim:.3f})")
            
            return mapped_item
            
        except Exception as e:
            logger.error(f"Error mapping item '{item_text}': {e}")
            return None
    
    def _fallback_matching(self, item_text: str, quantity: float) -> MappedItem:
        """Fallback matching when ML model is not available"""
        logger.warning(f"Using fallback matching for: {item_text}")
        
        return MappedItem(
            original_text=item_text,
            item_code=None,
            item_name=None,
            category=None,
            quantity=quantity,
            confidence=MatchConfidence.UNMATCHED,
            similarity_score=None
        )
    
    def _determine_confidence(self, similarity_score: float) -> MatchConfidence:
        """Determine confidence level based on similarity score"""
        if similarity_score >= self.confidence_thresholds['high']:
            return MatchConfidence.HIGH
        elif similarity_score >= self.confidence_thresholds['medium']:
            return MatchConfidence.MEDIUM
        elif similarity_score >= self.confidence_thresholds['low']:
            return MatchConfidence.LOW
        else:
            return MatchConfidence.UNMATCHED
    
    def _determine_enhanced_confidence(self, best_similarity: float, top_similarities: List[float], 
                                     item_text: str, best_match_item) -> MatchConfidence:
        """Enhanced confidence calculation considering multiple factors"""
        
        # Base confidence from similarity score
        base_confidence = best_similarity
        
        # Bonus for having a clear winner (gap between 1st and 2nd)
        if len(top_similarities) > 1:
            gap_bonus = (best_similarity - top_similarities[1]) * 0.3
            base_confidence += gap_bonus
        
        # Bonus for exact text matches
        if item_text.lower() in best_match_item.item_name.lower():
            base_confidence += 0.1
        
        # Bonus for category relevance
        if hasattr(best_match_item, 'category') and best_match_item.category:
            if any(word in best_match_item.category.lower() for word in ['food', 'grocery', 'fresh']):
                base_confidence += 0.05
        
        # Apply thresholds
        if base_confidence >= config.CONFIDENCE_THRESHOLD_HIGH:
            return MatchConfidence.HIGH
        elif base_confidence >= config.CONFIDENCE_THRESHOLD_MEDIUM:
            return MatchConfidence.MEDIUM
        elif base_confidence >= config.CONFIDENCE_THRESHOLD_LOW:
            return MatchConfidence.LOW
        else:
            return MatchConfidence.UNMATCHED
    
    def _generate_csv(self, mapped_items: List[MappedItem]) -> Optional[str]:
        """Generate CSV file from mapped items"""
        try:
            if not mapped_items:
                return None
            
            # Create temp directory if it doesn't exist
            temp_dir = Path("temp")
            temp_dir.mkdir(exist_ok=True)
            
            # Prepare data for CSV
            csv_data = []
            for item in mapped_items:
                csv_data.append({
                    'Item Code': item.item_code or '',
                    'Item Name': item.item_name or '',
                    'Category': item.category or '',
                    'Quantity': item.quantity,
                    'Confidence': item.confidence.value,
                    'Similarity Score': f"{item.similarity_score:.3f}" if item.similarity_score else '',
                    'Original Text': item.original_text
                })
            
            # Create DataFrame and save to CSV
            df = pd.DataFrame(csv_data)
            filename = f"processed_order_{int(time.time())}.csv"
            filepath = temp_dir / filename
            
            df.to_csv(filepath, index=False)
            logger.info(f"✅ CSV generated: {filepath}")
            
            return filename
            
        except Exception as e:
            logger.error(f"❌ Error generating CSV: {e}")
            return None
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        return {
            "model_loaded": self.model is not None,
            "catalog_embeddings_ready": self.catalog_embeddings is not None,
            "catalog_items_count": len(self.catalog_texts) if self.catalog_texts else 0,
            "confidence_thresholds": self.confidence_thresholds
        }
