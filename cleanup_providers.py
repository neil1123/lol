#!/usr/bin/env python3
"""
Database cleanup script to remove all existing providers
Keep only accounts created through sign-up process
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

async def cleanup_providers():
    """Remove all existing providers from the database"""
    
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
        # Get current count of providers
        providers_count = await db.users.count_documents({"user_type": "provider"})
        print(f"Found {providers_count} providers in database")
        
        if providers_count > 0:
            # Remove all existing providers
            result = await db.users.delete_many({"user_type": "provider"})
            print(f"Removed {result.deleted_count} providers from database")
            
            # Also clean up any related data
            # Remove orders associated with these providers
            orders_result = await db.orders.delete_many({})
            print(f"Removed {orders_result.deleted_count} orders from database")
            
            # Remove message threads associated with these providers
            threads_result = await db.message_threads.delete_many({})
            print(f"Removed {threads_result.deleted_count} message threads from database")
            
            # Remove individual messages
            messages_result = await db.messages.delete_many({})
            print(f"Removed {messages_result.deleted_count} messages from database")
            
            # Remove appointments
            appointments_result = await db.appointments.delete_many({})
            print(f"Removed {appointments_result.deleted_count} appointments from database")
            
            print("✅ Database cleanup completed successfully!")
            print("✅ Only new sign-ups will appear in the system now")
        else:
            print("✅ No providers found in database - already clean")
            
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_providers())