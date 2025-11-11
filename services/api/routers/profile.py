"""
User profile and memory endpoints
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional

from models.user import User
from routers.auth import get_current_user

router = APIRouter()


# Schemas
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    current_role: Optional[str] = None
    years_experience: Optional[int] = None
    skills: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    preferences: Optional[Dict[str, any]] = None


class ProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    current_role: Optional[str]
    years_experience: Optional[int]
    skills: List[str]
    goals: List[str]
    preferences: Dict[str, any]


# Routes
@router.get("/me", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "current_role": current_user.current_role,
        "years_experience": current_user.years_experience,
        "skills": current_user.skills or [],
        "goals": current_user.goals or [],
        "preferences": current_user.preferences or {}
    }


@router.patch("/me", response_model=ProfileResponse)
async def update_profile(
    updates: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    # TODO: Implement profile update with DB
    raise HTTPException(status_code=501, detail="Profile update not implemented yet")
