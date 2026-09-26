from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel
from ..db.database import db

router = APIRouter(prefix="/api/users", tags=["Users & Authentication"])

class UserRegisterRequest(BaseModel):
    username: str
    display_name: str
    email: Optional[str] = None
    password: Optional[str] = None
    wallet_address: Optional[str] = None
    bio: Optional[str] = "Kindling my flame on Monad 🔥"
    avatar_color: Optional[str] = "purple"
    initials: Optional[str] = None

class UserLoginRequest(BaseModel):
    username_or_email: str
    password: Optional[str] = None
    wallet_address: Optional[str] = None

class UserUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    wallet_address: Optional[str] = None
    bio: Optional[str] = None
    avatar_color: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    display_name: str
    wallet_address: Optional[str] = None
    bio: Optional[str] = None
    avatar_color: Optional[str] = "purple"
    initials: Optional[str] = None
    streak_count: int = 0
    total_earned_mon: float = 0.0
    created_at: float

@router.get("", response_model=List[UserResponse])
@router.get("/", response_model=List[UserResponse])
def get_users():
    """List all registered users."""
    return db.list_all_users()

@router.get("/{identifier}", response_model=UserResponse)
def get_user(identifier: str):
    """Get user profile by username, email, or wallet address."""
    user = db.get_user_by_identifier(identifier)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{identifier}' not found")
    return user

@router.post("/register", response_model=UserResponse)
def register_user(req: UserRegisterRequest):
    """
    Create a new account with username, display name, optional email and password.
    Directly modeled after the Streaker authentication flow.
    """
    clean_username = req.username.strip().lower()
    if not clean_username:
        raise HTTPException(status_code=400, detail="Username is required")
    if len(clean_username) < 3 or len(clean_username) > 25:
        raise HTTPException(status_code=400, detail="Username must be between 3 and 25 characters")
    if not req.display_name.strip():
        raise HTTPException(status_code=400, detail="Display name is required")

    # Check if username or email is already taken
    existing = db.get_user_by_identifier(clean_username)
    if existing:
        raise HTTPException(status_code=400, detail=f"Username '@{clean_username}' is already taken")

    if req.email and req.email.strip():
        existing_email = db.get_user_by_identifier(req.email.strip())
        if existing_email:
            raise HTTPException(status_code=400, detail="An account with this email already exists")

    created = db.create_user(req.dict())
    return created

@router.post("/login", response_model=UserResponse)
def login_user(req: UserLoginRequest):
    """
    Log in using username/email and password, or connected wallet address.
    """
    identifier = req.username_or_email.strip()
    if not identifier and not req.wallet_address:
        raise HTTPException(status_code=400, detail="Username, email, or wallet address is required to log in")

    user = db.authenticate_user(
        identifier=identifier,
        password=req.password,
        wallet_address=req.wallet_address
    )
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Please check your username/password or register a new account."
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: str, req: UserUpdateRequest):
    """Update profile information or link/unlink wallet."""
    existing = db.get_user_by_identifier(user_id)
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    updated = db.update_user_profile(user_id, req.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    return updated

@router.post("/logout")
def logout_user():
    """Client handles session clearance; server acknowledges logout."""
    return {"status": "logged_out", "message": "Successfully logged out of Dracarys."}
