#!/usr/bin/env python3
"""
Database search script to find Wilson Home Service entries
"""

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import asyncio

load_dotenv()

async def search_wilson_entries():
    """Search for Wilson Home Service entries in all collections"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    collections_to_search = [
        'users',
        'orders', 
        'message_threads',
        'messages',
        'appointments',
        'quotation_requests'
    ]
    
    print("🔍 Searching for Wilson Home Service entries...")
    
    for collection_name in collections_to_search:
        collection = db[collection_name]
        
        # Search for Wilson in various fields
        search_queries = [
            {"name": {"$regex": "Wilson", "$options": "i"}},
            {"business_name": {"$regex": "Wilson", "$options": "i"}},
            {"provider_name": {"$regex": "Wilson", "$options": "i"}},
            {"homeowner_name": {"$regex": "Wilson", "$options": "i"}},
        ]
        
        for query in search_queries:
            try:
                documents = await collection.find(query).to_list(length=10)
                if documents:
                    print(f"📍 Found Wilson entries in {collection_name}:")
                    for doc in documents:
                        print(f"   - {doc}")
                    print()
            except Exception as e:
                # Skip if field doesn't exist in collection
                pass
    
    # Also check for general content
    for collection_name in collections_to_search:
        collection = db[collection_name]
        try:
            all_docs = await collection.find({}).to_list(length=100)
            if all_docs:
                print(f"📋 All documents in {collection_name}:")
                for doc in all_docs:
                    print(f"   - {doc}")
                print()
        except Exception as e:
            print(f"Error checking {collection_name}: {e}")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(search_wilson_entries())