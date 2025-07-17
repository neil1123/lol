#!/usr/bin/env python3
"""
Cleanup script to remove test providers created during debugging
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Test provider emails to remove
TEST_PROVIDER_EMAILS = [
    "test@provider.com",
    "electrician@test.com", 
    "plumber@test.com"
]

async def cleanup_test_providers():
    """Remove test providers and their associated data"""
    
    print("🧹 Starting cleanup of test providers...")
    
    # Find test providers
    test_providers = []
    async for provider in db.users.find({"email": {"$in": TEST_PROVIDER_EMAILS}}):
        test_providers.append(provider)
        print(f"Found test provider: {provider['email']} ({provider['business_name']})")
    
    if not test_providers:
        print("✅ No test providers found to remove")
        return
    
    # Get provider IDs
    provider_ids = [provider['id'] for provider in test_providers]
    
    print(f"\n🗑️  Removing {len(test_providers)} test providers and associated data...")
    
    # Remove providers
    users_result = await db.users.delete_many({"id": {"$in": provider_ids}})
    print(f"   Deleted {users_result.deleted_count} providers")
    
    # Remove orders involving these providers
    orders_result = await db.orders.delete_many({"provider_id": {"$in": provider_ids}})
    print(f"   Deleted {orders_result.deleted_count} orders")
    
    # Remove message threads involving these providers
    threads_result = await db.message_threads.delete_many({"provider_id": {"$in": provider_ids}})
    print(f"   Deleted {threads_result.deleted_count} message threads")
    
    # Remove messages from threads involving these providers
    # First find thread IDs that involved these providers
    thread_ids = []
    async for thread in db.message_threads.find({"provider_id": {"$in": provider_ids}}):
        thread_ids.append(thread['id'])
    
    if thread_ids:
        messages_result = await db.messages.delete_many({"thread_id": {"$in": thread_ids}})
        print(f"   Deleted {messages_result.deleted_count} messages")
    
    # Remove appointments involving these providers
    appointments_result = await db.appointments.delete_many({"provider_id": {"$in": provider_ids}})
    print(f"   Deleted {appointments_result.deleted_count} appointments")
    
    print("\n✅ Cleanup completed successfully!")
    print("Only user-created providers remain in the database")

async def verify_remaining_providers():
    """Verify what providers remain after cleanup"""
    print("\n📋 Remaining providers in database:")
    
    remaining_count = 0
    async for provider in db.users.find({"user_type": "provider"}):
        remaining_count += 1
        print(f"   - {provider['email']} ({provider.get('business_name', 'N/A')})")
    
    if remaining_count == 0:
        print("   No providers found - database is clean")
    else:
        print(f"   Total: {remaining_count} user-created providers")

async def main():
    try:
        await cleanup_test_providers()
        await verify_remaining_providers()
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())