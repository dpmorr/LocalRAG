"""
Create admin user
Run this script to create an admin account
"""
import asyncio
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from database import AsyncSessionLocal
from models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    """Create admin user"""
    # Admin credentials
    admin_email = "admin@careermentor.com"
    admin_password = "admin123"  # Change this after first login!
    admin_name = "Admin User"

    async with AsyncSessionLocal() as db:
        # Check if admin already exists
        result = await db.execute(
            select(User).where(User.email == admin_email)
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print(f"✓ Admin user already exists: {admin_email}")
            return

        # Create admin user
        admin_user = User(
            id=str(uuid.uuid4()),
            email=admin_email,
            hashed_password=pwd_context.hash(admin_password),
            full_name=admin_name,
            is_admin="true"
        )

        db.add(admin_user)
        await db.commit()

        print(f"""
✓ Admin user created successfully!

Login credentials:
  Email: {admin_email}
  Password: {admin_password}

IMPORTANT: Change the password after first login!
""")

if __name__ == "__main__":
    asyncio.run(create_admin())
