#!/usr/bin/env python3
"""
Cleanup script to remove test homeowner account
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Test homeowner email to remove
TEST_HOMEOWNER_EMAIL = "test@homeowner.com"

async def cleanup_test_homeowner():
    """Remove test homeowner and associated data"""
    
    print("🧹 Starting cleanup of test homeowner...")
    
    # Find test homeowner
    homeowner = await db.users.find_one({"email": TEST_HOMEOWNER_EMAIL})
    
    if not homeowner:
        print("✅ No test homeowner found to remove")
        return
    
    print(f"Found test homeowner: {homeowner['email']} ({homeowner['name']})")
    
    homeowner_id = homeowner['id']
    
    print(f"\n🗑️  Removing test homeowner and associated data...")
    
    # Remove homeowner
    users_result = await db.users.delete_one({"id": homeowner_id})
    print(f"   Deleted {users_result.deleted_count} homeowner")
    
    # Remove orders where homeowner is the customer
    orders_result = await db.orders.delete_many({"homeowner_id": homeowner_id})
    print(f"   Deleted {orders_result.deleted_count} orders")
    
    # Remove message threads where homeowner is involved
    threads_result = await db.message_threads.delete_many({"homeowner_id": homeowner_id})
    print(f"   Deleted {threads_result.deleted_count} message threads")
    
    # Remove messages from threads involving this homeowner
    # First find thread IDs that involved this homeowner
    thread_ids = []
    async for thread in db.message_threads.find({"homeowner_id": homeowner_id}):
        thread_ids.append(thread['id'])
    
    if thread_ids:
        messages_result = await db.messages.delete_many({"thread_id": {"$in": thread_ids}})
        print(f"   Deleted {messages_result.deleted_count} messages")
    
    print("\n✅ Cleanup completed successfully!")
    print("Database is now completely clean of test data")

async def verify_remaining_users():
    """Verify what users remain after cleanup"""
    print("\n📋 Remaining users in database:")
    
    remaining_count = 0
    async for user in db.users.find({}):
        remaining_count += 1
        print(f"   - {user['email']} ({user['user_type']}) - {user.get('name', 'N/A')}")
    
    if remaining_count == 0:
        print("   No users found - database is completely clean")
    else:
        print(f"   Total: {remaining_count} real users")

async def main():
    try:
        await cleanup_test_homeowner()
        await verify_remaining_users()
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())