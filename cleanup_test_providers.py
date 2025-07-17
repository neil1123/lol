#!/usr/bin/env python3
"""
Remove test providers from database
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

async def cleanup_test_providers():
    """Remove test providers from the database"""
    
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(
        mongo_url,
        connect=False,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=30000,
        maxPoolSize=200,
        minPoolSize=20,
        maxIdleTimeMS=45000,
        heartbeatFrequencyMS=10000,
        retryWrites=True,
        retryReads=True
    )
    db = client[os.environ['DB_NAME']]
    
    try:
        # Remove test providers
        result = await db.users.delete_many({
            "user_type": "provider",
            "email": {"$in": ["test-electrician@example.com", "test-plumber@example.com", "test-cleaning@example.com"]}
        })
        print(f"Removed {result.deleted_count} test providers from database")
        
        # Check remaining providers
        remaining = await db.users.count_documents({"user_type": "provider"})
        print(f"Remaining providers: {remaining}")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_test_providers())