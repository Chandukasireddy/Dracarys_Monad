from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from ..db.database import db

router = APIRouter(prefix="/api/users", tags=["Users & Authentication"])

class UserCreateRequest(BaseModel):
    username: str
    display_name: str
    wallet_address: Optional[str] = None
    bio: Optional[str] = "Kindling my flame on Monad 🔥"
    avatar_color: Optional[str] = "peach"
    initials: Optional[str] = None

class UserLoginRequest(BaseModel):
    username_or_wallet: str

class UserResponse(BaseModel):
    id: str
    username: str
    display_name: str
    wallet_address: Optional[str] = None
    bio: str
    avatar_color: str
    initials: str
    streak_count: int
    total_earned_mon: float
    created_at: float

@router.get("", response_model=List[UserResponse])
@router.get("/", response_model=List[UserResponse])
def get_users():
    """List all registered users."""
    return db.list_all_users()

@router.get("/{identifier}", response_model=UserResponse)
def get_user(identifier: str):
    """Get user profile by username or wallet address."""
    user = db.get_user_by_identifier(identifier)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {identifier} not found")
    return user

@router.post("/register", response_model=UserResponse)
def register_user(req: UserCreateRequest):
    """Create a new account or update an existing account."""
    if not req.username.strip():
        raise HTTPException(status_code=400, detail="Username cannot be empty")
    if not req.display_name.strip():
        raise HTTPException(status_code=400, detail="Display name cannot be empty")
    
    created = db.create_or_update_user(req.dict())
    return created

@router.post("/login", response_model=UserResponse)
def login_user(req: UserLoginRequest):
    """Log in by username or connected wallet address."""
    user = db.get_user_by_identifier(req.username_or_wallet)
    if not user:
        raise HTTPException(
            status_code=404, 
            detail=f"No account found for '{req.username_or_wallet}'. Please register your profile first."
        )
    return user
