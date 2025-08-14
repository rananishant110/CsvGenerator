#!/usr/bin/env python3
"""
Model Comparison Tool: Test different sentence transformer models
to find the best one for your use case
"""

import time
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Test queries (common grocery items)
TEST_QUERIES = [
    "organic apples",
    "whole milk",
    "black beans",
    "whole wheat bread",
    "ground beef",
    "frozen peas",
    "bananas",
    "peanut butter",
    "eggs",
    "lettuce"
]

# Models to test (from fastest to most accurate)
MODELS_TO_TEST = [
    {
        "name": "all-MiniLM-L6-v2",
        "description": "Fast, lightweight (80MB)",
        "expected_speed": "fast",
        "expected_accuracy": "medium"
    },
    {
        "name": "all-distilroberta-v1", 
        "description": "Good balance (290MB)",
        "expected_speed": "medium",
        "expected_accuracy": "good"
    },
    {
        "name": "all-mpnet-base-v2",
        "description": "High accuracy (420MB)",
        "expected_speed": "slower",
        "expected_accuracy": "excellent"
    },
    {
        "name": "paraphrase-multilingual-MiniLM-L12-v2",
        "description": "Multilingual support (470MB)",
        "expected_speed": "medium",
        "expected_accuracy": "good"
    }
]

def test_model_performance(model_name: str, test_queries: list, catalog_texts: list):
    """Test a specific model's performance"""
    print(f"\n🔍 Testing Model: {model_name}")
    print("-" * 50)
    
    try:
        # Load model and measure time
        start_time = time.time()
        model = SentenceTransformer(model_name)
        load_time = time.time() - start_time
        print(f"✅ Model loaded in {load_time:.2f}s")
        
        # Generate embeddings for catalog
        start_time = time.time()
        catalog_embeddings = model.encode(catalog_texts)
        catalog_time = time.time() - start_time
        print(f"✅ Catalog embeddings generated in {catalog_time:.2f}s")
        
        # Test queries
        total_similarity = 0
        query_times = []
        
        for query in test_queries:
            start_time = time.time()
            query_embedding = model.encode([query])
            similarities = cosine_similarity(query_embedding, catalog_embeddings)[0]
            best_similarity = np.max(similarities)
            query_time = time.time() - start_time
            
            total_similarity += best_similarity
            query_times.append(query_time)
            
            print(f"  '{query}' -> Best similarity: {best_similarity:.3f} (in {query_time:.3f}s)")
        
        avg_similarity = total_similarity / len(test_queries)
        avg_query_time = np.mean(query_times)
        
        print(f"\n📊 Results:")
        print(f"  Average similarity: {avg_similarity:.3f}")
        print(f"  Average query time: {avg_query_time:.3f}s")
        print(f"  Total time: {load_time + catalog_time + sum(query_times):.2f}s")
        
        return {
            "model_name": model_name,
            "avg_similarity": avg_similarity,
            "avg_query_time": avg_query_time,
            "total_time": load_time + catalog_time + sum(query_times)
        }
        
    except Exception as e:
        print(f"❌ Error testing {model_name}: {e}")
        return None

def main():
    """Run model comparison tests"""
    print("🚀 CSVGenie Model Comparison Tool")
    print("=" * 60)
    print("This tool will help you find the best ML model for your use case.")
    print("Models are ranked from fastest to most accurate.")
    
    # Sample catalog texts (you can replace with your actual catalog)
    sample_catalog = [
        "organic apples fresh produce",
        "whole milk dairy products", 
        "black beans canned goods",
        "whole wheat bread bakery",
        "ground beef meat products",
        "frozen peas frozen foods",
        "bananas fresh produce",
        "peanut butter spreads",
        "eggs dairy products",
        "lettuce fresh produce"
    ]
    
    print(f"\n📋 Testing with {len(TEST_QUERIES)} sample queries:")
    for i, query in enumerate(TEST_QUERIES, 1):
        print(f"  {i}. {query}")
    
    print(f"\n📚 Using {len(sample_catalog)} sample catalog items")
    
    # Test each model
    results = []
    for model_info in MODELS_TO_TEST:
        result = test_model_performance(
            model_info["name"], 
            TEST_QUERIES, 
            sample_catalog
        )
        if result:
            results.append(result)
    
    # Show summary
    if results:
        print("\n" + "=" * 60)
        print("🏆 MODEL COMPARISON SUMMARY")
        print("=" * 60)
        
        # Sort by average similarity (accuracy)
        results.sort(key=lambda x: x["avg_similarity"], reverse=True)
        
        print(f"{'Rank':<5} {'Model':<35} {'Accuracy':<10} {'Speed':<10}")
        print("-" * 60)
        
        for i, result in enumerate(results, 1):
            accuracy = f"{result['avg_similarity']:.3f}"
            speed = f"{result['avg_query_time']:.3f}s"
            print(f"{i:<5} {result['model_name']:<35} {accuracy:<10} {speed:<10}")
        
        print(f"\n🎯 RECOMMENDATIONS:")
        print(f"  🥇 Best Accuracy: {results[0]['model_name']}")
        print(f"  ⚡ Fastest: {min(results, key=lambda x: x['avg_query_time'])['model_name']}")
        print(f"  ⚖️  Best Balance: {results[len(results)//2]['model_name']}")
        
        print(f"\n💡 To use a different model, update your .env file:")
        print(f"   MODEL_NAME={results[0]['model_name']}")
        
        print(f"\n📝 Note: Better accuracy usually means slower processing.")
        print(f"   Choose based on your needs: speed vs. accuracy")

if __name__ == "__main__":
    main()
