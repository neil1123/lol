#!/usr/bin/env python3
"""
Database cleanup script to reset the database to a fresh state
"""

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import asyncio

load_dotenv()

async def cleanup_database():
    """Clean up all collections in the database"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    collections_to_clear = [
        'users',
        'orders', 
        'message_threads',
        'messages',
        'appointments',
        'quotation_requests'
    ]
    
    print("🧹 Cleaning up database...")
    
    for collection_name in collections_to_clear:
        collection = db[collection_name]
        result = await collection.delete_many({})
        print(f"✅ Cleared {collection_name}: {result.deleted_count} documents deleted")
    
    print("\n🎉 Database cleanup complete! Your platform is now fresh and ready for new users.")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_database())