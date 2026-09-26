import time
import uuid
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from pydantic import BaseModel
from ..models.schemas import (
    ProofType,
    ProofUploadResponse,
    PeerApprovalRequest,
    PendingApproval,
    FeedEvent,
    FeedEventType,
    CheckInStatus,
    PeerVote
)
from ..services.storage import save_proof_file
from ..db.database import db

router = APIRouter(prefix="/api/streaks", tags=["Streaks & Proof Verification"])

class StreakCreateBody(BaseModel):
    title: str
    description: Optional[str] = "Kindle your flame. A stronger you."
    kind: Optional[str] = "fitness"
    duration: int = 7
    daily_stake: str = "0.05"
    creator_id: Optional[str] = None
    creator_address: Optional[str] = None
    vault_contract: Optional[str] = "0x77547711ea2726F16C8BCeDD37a347C139D346E7"
    required_approvals: int = 1

class StreakJoinBody(BaseModel):
    user_id: str
    wallet_address: Optional[str] = None

@router.get("")
@router.get("/")
def list_streaks(user_id: Optional[str] = Query(None)):
    """List habit challenges, optionally filtered by user ID."""
    return db.list_streaks(user_id=user_id)

@router.post("")
@router.post("/")
def create_streak(req: StreakCreateBody):
    """Create a new habit-staking challenge in Dracarys."""
    if not req.title.strip():
        raise HTTPException(status_code=400, detail="Streak title is required")
    created = db.create_streak(req.dict())
    
    # Broadcast event
    db.add_feed_event({
        "streak_id": created["id"],
        "event_type": "STREAK_STARTED",
        "title": "🐉 DRACARYS STREAK KINDLED",
        "description": f"Challenge '{created['title']}' initialized! Stake: {created['daily_stake']} MON/day.",
        "actor": req.creator_address or req.creator_id or "Creator",
        "day": 1,
        "amount": f"{created['daily_stake']} MON"
    })
    return created

@router.get("/invite/{code}")
def get_streak_by_invite(code: str):
    """Find a challenge by its invite code."""
    streak = db.get_streak_by_invite(code)
    if not streak:
        raise HTTPException(status_code=404, detail=f"No streak found with invite code '{code}'")
    return streak

@router.get("/pending-approvals")
def get_all_pending_approvals(user_id: Optional[str] = Query(None)):
    """List check-ins awaiting verification by friends."""
    return db.list_pending_checkins(exclude_user=user_id)

@router.get("/{id}")
def get_streak(id: str):
    """Get single streak configuration by ID."""
    streak = db.get_streak(id)
    if not streak:
        raise HTTPException(status_code=404, detail=f"Streak {id} not found")
    return streak

@router.post("/{id}/join")
def join_streak(id: str, req: StreakJoinBody):
    """Join an active friend circle streak."""
    streak = db.get_streak(id)
    if not streak:
        raise HTTPException(status_code=404, detail=f"Streak {id} not found")

    joined = db.join_streak(id, user_id=req.user_id, wallet_address=req.wallet_address)
    
    db.add_feed_event({
        "streak_id": id,
        "event_type": "JOINED",
        "title": "🤝 FRIEND JOINED CIRCLE",
        "description": f"New challenger entered the arena for '{streak['title']}'!",
        "actor": req.wallet_address or req.user_id,
        "day": 1,
    })
    return joined

@router.post("/upload-proof", response_model=ProofUploadResponse)
async def upload_proof(
    file: UploadFile = File(...),
    streak_id: str = Form(...),
    participant: str = Form(...),
    user_id: Optional[str] = Form(None),
    day: int = Form(...),
    proof_type: ProofType = Form(ProofType.CUSTOM),
    notes: Optional[str] = Form("")
):
    """
    Accepts habit proof photos, saves locally/simulated IPFS, and logs to database.
    """
    streak = db.get_streak(streak_id)
    if not streak:
        raise HTTPException(status_code=404, detail=f"Streak {streak_id} not found")

    # Save to storage & generate reference
    saved = await save_proof_file(
        file=file,
        streak_id=streak_id,
        participant=participant,
        day=day,
        proof_type=proof_type.value,
        notes=notes or ""
    )

    created_checkin = db.create_checkin({
        "streak_id": streak_id,
        "user_id": user_id or participant,
        "participant_address": participant,
        "day": day,
        "proof_type": proof_type.value,
        "image_url": saved["image_url"],
        "ipfs_uri": saved["ipfs_uri"],
        "notes": notes or "",
        "status": "PENDING",
        "required_approvals": streak.get("required_approvals", 1)
    })

    # Broadcast event
    db.add_feed_event({
        "streak_id": streak_id,
        "event_type": "KINDLED",
        "title": "🔥 FLAME KINDLED",
        "description": f"{participant[:6]}…{participant[-4:]} uploaded {proof_type.value.upper()} proof for Day {day}! Verification pending.",
        "actor": participant,
        "day": day,
        "proof_image": saved["image_url"]
    })

    return ProofUploadResponse(
        proof_id=created_checkin["id"],
        streak_id=streak_id,
        participant=participant,
        day=day,
        proof_type=proof_type,
        image_url=saved["image_url"],
        ipfs_uri=saved["ipfs_uri"],
        metadata_uri=saved["metadata_uri"],
        uploaded_at=saved["uploaded_at"]
    )

@router.post("/verify")
async def verify_proof(payload: PeerApprovalRequest):
    """
    Peer approves or rejects friend's check-in.
    """
    checkin = db.get_checkin(payload.proof_id)
    if not checkin:
        raise HTTPException(status_code=404, detail="Proof check-in not found")

    # Prevent self-approval
    if payload.approver.lower() == (checkin.get("participant_address") or "").lower() or payload.approver == checkin.get("user_id"):
        raise HTTPException(status_code=400, detail="Cannot self-approve your own habit proof!")

    # Check if already voted
    existing_votes = [a["approver_id"].lower() for a in checkin.get("approvals", [])]
    if payload.approver.lower() in existing_votes:
        raise HTTPException(status_code=400, detail="You have already cast your vote for this proof")

    result = db.add_approval(
        proof_id=payload.proof_id,
        approver_id=payload.approver,
        approver_address=payload.approver if payload.approver.startswith("0x") else None,
        approved=payload.approved,
        comment=payload.comment or "Verified 🔥"
    )

    db.add_feed_event({
        "streak_id": checkin["streak_id"],
        "event_type": "APPROVED" if payload.approved else "REJECTED",
        "title": "👁️ PEER VERIFIED" if payload.approved else "❌ PROOF REJECTED",
        "description": f"{payload.approver[:6]}… verified Day {checkin['day_index']} proof!",
        "actor": payload.approver,
        "target_user": checkin.get("participant_address") or checkin.get("user_id"),
        "day": checkin["day_index"]
    })

    return result

@router.get("/{id}/feed", response_model=List[FeedEvent])
async def get_streak_feed(id: str):
    """
    Real-time social feed of activity for this challenge.
    """
    events = db.get_feed_events(streak_id=id)
    return [
        FeedEvent(
            id=e["id"],
            streak_id=e["streak_id"],
            event_type=FeedEventType(e["event_type"]) if e["event_type"] in FeedEventType.__members__ else FeedEventType.KINDLED,
            title=e["title"],
            description=e["description"],
            actor=e["actor"],
            target_user=e.get("target_user"),
            day=e.get("day") or 1,
            amount=e.get("amount"),
            timestamp=e["timestamp"],
            tx_hash=e.get("tx_hash"),
            proof_image=e.get("proof_image")
        )
        for e in events
    ]
