import time
import uuid
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from ..models.schemas import (
    ProofType,
    ProofUploadResponse,
    VerifyCheckInRequest,
    PeerApprovalRequest,
    PendingApproval,
    FeedEvent,
    FeedEventType,
    CheckInStatus,
    BurnCandidate,
    SlackerEvaluationResponse,
    PeerVote
)
from ..services.storage import save_proof_file
from ..services.deadlines import (
    calculate_day_cutoff,
    find_slackers_for_streak,
    calculate_current_streak_day
)
from ..db.store import store

router = APIRouter(prefix="/api/streaks", tags=["Streaks & Proof Verification"])


@router.get("")
@router.get("/")
def list_streaks():
    """List all active Dracarys habit challenges."""
    return list(store.streaks.values())


@router.get("/{id}")
def get_streak(id: str):
    """Get single streak configuration by ID."""
    if id not in store.streaks:
        raise HTTPException(status_code=404, detail=f"Streak {id} not found")
    return store.streaks[id]


@router.post("/upload-proof", response_model=ProofUploadResponse)
async def upload_proof(
    file: UploadFile = File(...),
    streak_id: str = Form(...),
    participant: str = Form(...),
    day: int = Form(...),
    proof_type: ProofType = Form(ProofType.CUSTOM),
    notes: Optional[str] = Form("")
):
    """
    Accepts photo uploads (gym selfies, step counters, reading pages),
    saves to local/IPFS simulated storage, and returns verified metadata proof URI.
    """
    if streak_id not in store.streaks:
        raise HTTPException(status_code=404, detail=f"Streak {streak_id} not found")

    streak = store.streaks[streak_id]
    if participant.lower() not in [p.lower() for p in streak["participants"]]:
        raise HTTPException(status_code=403, detail=f"Address {participant} is not an enrolled participant in this streak")

    # Save to storage & generate IPFS reference
    saved = await save_proof_file(
        file=file,
        streak_id=streak_id,
        participant=participant,
        day=day,
        proof_type=proof_type.value,
        notes=notes or ""
    )

    proof_id = f"proof-{uuid.uuid4().hex[:8]}"

    # Store in memory for verification
    store.checkins[proof_id] = {
        "proof_id": proof_id,
        "streak_id": streak_id,
        "participant": participant,
        "day": day,
        "proof_type": proof_type.value,
        "image_url": saved["image_url"],
        "ipfs_uri": saved["ipfs_uri"],
        "metadata_uri": saved["metadata_uri"],
        "status": "PENDING",
        "approvals": [],
        "required_approvals": streak.get("required_approvals", 2),
        "created_at": time.time(),
        "notes": notes or ""
    }

    # Automatically broadcast a 'KINDLED' event to the social feed
    event_id = f"event-{uuid.uuid4().hex[:8]}"
    store.feed_events.append({
        "id": event_id,
        "streak_id": streak_id,
        "event_type": FeedEventType.KINDLED,
        "title": "🔥 FLAME KINDLED",
        "description": f"{participant[:6]}...{participant[-4:]} uploaded {proof_type.value.upper()} proof for Day {day}! Peer verification pending.",
        "actor": participant,
        "target_user": None,
        "day": day,
        "amount": None,
        "timestamp": time.time(),
        "tx_hash": None,
        "proof_image": saved["image_url"]
    })

    return ProofUploadResponse(
        proof_id=proof_id,
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
    Evaluates peer approval for a pending check-in.
    When circle threshold is reached, automatically dispatches instant Monad payout event.
    """
    proof_id = payload.proof_id
    if proof_id not in store.checkins:
        raise HTTPException(status_code=404, detail="Proof check-in not found")

    checkin = store.checkins[proof_id]
    streak = store.streaks.get(checkin["streak_id"])
    if not streak:
        raise HTTPException(status_code=404, detail="Associated streak not found")

    # Validate approver is a peer in the streak
    if payload.approver.lower() not in [p.lower() for p in streak["participants"]]:
        raise HTTPException(status_code=403, detail="Approver must be a participant in the friend streak circle")

    # Prevent approving own proof
    if payload.approver.lower() == checkin["participant"].lower():
        raise HTTPException(status_code=400, detail="Cannot self-approve your own habit proof!")

    # Check if already voted
    existing_votes = [a["approver"].lower() for a in checkin["approvals"]]
    if payload.approver.lower() in existing_votes:
        raise HTTPException(status_code=400, detail="You have already cast your vote for this proof")

    # Record vote
    checkin["approvals"].append({
        "approver": payload.approver,
        "approved": payload.approved,
        "comment": payload.comment or "Verified 🔥",
        "voted_at": time.time()
    })

    # Broadcast peer approval to social feed
    store.feed_events.append({
        "id": f"event-{uuid.uuid4().hex[:8]}",
        "streak_id": checkin["streak_id"],
        "event_type": FeedEventType.APPROVED,
        "title": "👁️ PEER VERIFIED",
        "description": f"{payload.approver[:6]}...{payload.approver[-4:]} verified {checkin['participant'][:6]}...{checkin['participant'][-4:]}'s Day {checkin['day']} proof!",
        "actor": payload.approver,
        "target_user": checkin["participant"],
        "day": checkin["day"],
        "amount": None,
        "timestamp": time.time(),
        "tx_hash": None,
        "proof_image": checkin["image_url"]
    })

    # Count positive approvals
    positive_votes = [a for a in checkin["approvals"] if a["approved"]]
    required = checkin["required_approvals"]

    if len(positive_votes) >= required and checkin["status"] == "PENDING":
        checkin["status"] = "APPROVED"
        
        # Sub-second Monad payout event simulated
        tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}"
        daily_stake = streak.get("daily_stake", "€0.10 (0.05 MON)")
        
        store.feed_events.append({
            "id": f"event-{uuid.uuid4().hex[:8]}",
            "streak_id": checkin["streak_id"],
            "event_type": FeedEventType.STAKE_PAID,
            "title": "⚡ SUB-SECOND MONAD PAYOUT",
            "description": f"Verification quorum reached ({len(positive_votes)}/{required})! {daily_stake} streamed back to {checkin['participant'][:6]}...{checkin['participant'][-4:]}'s wallet in 340ms.",
            "actor": checkin["participant"],
            "target_user": None,
            "day": checkin["day"],
            "amount": daily_stake,
            "timestamp": time.time(),
            "tx_hash": tx_hash,
            "proof_image": None
        })

    return {
        "status": checkin["status"],
        "approvals_count": len(positive_votes),
        "required_approvals": required,
        "is_unlocked": checkin["status"] == "APPROVED",
        "proof_id": proof_id
    }


@router.get("/{id}/feed", response_model=List[FeedEvent])
async def get_streak_feed(id: str):
    """
    Real-time social feed of who kindled their flame, who approved, and who got burned.
    Also dynamically evaluates 24-hour deadlines and records burns for delinquent slackers.
    """
    if id not in store.streaks:
        raise HTTPException(status_code=404, detail=f"Streak {id} not found")

    streak = store.streaks[id]
    
    # Run automatic slacker evaluation on feed load to ensure real-time burn awareness
    slackers = find_slackers_for_streak(
        streak=streak,
        checkins=list(store.checkins.values()),
        burned_records=store.burned_records
    )

    # For each newly identified slacker, record a BURNED event
    for s in slackers:
        # Avoid duplicate burning
        already = any(b["streak_id"] == id and b["slacker"].lower() == s.slacker.lower() and b["day"] == s.day for b in store.burned_records)
        if not already:
            store.burned_records.append({
                "streak_id": id,
                "slacker": s.slacker,
                "day": s.day,
                "burned_at": time.time(),
                "amount": s.slashed_amount
            })
            
            store.feed_events.append({
                "id": f"event-{uuid.uuid4().hex[:8]}",
                "streak_id": id,
                "event_type": FeedEventType.BURNED,
                "title": "💀 DRACARYS! SLACKER BURNED",
                "description": f"Cutoff passed for Day {s.day}! {s.slacker[:6]}...{s.slacker[-4:]} failed to kindle their flame. {s.slashed_amount} burned and distributed to the survivors!",
                "actor": s.slacker,
                "target_user": s.slacker,
                "day": s.day,
                "amount": s.slashed_amount,
                "timestamp": time.time(),
                "tx_hash": f"0xburn{uuid.uuid4().hex[:28]}monad",
                "proof_image": None
            })

    # Return events for this streak sorted by newest first
    events = [e for e in store.feed_events if e["streak_id"] == id]
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    return events


@router.get("/{id}/pending-approvals", response_model=List[PendingApproval])
async def get_pending_approvals(id: str):
    """
    Lists check-ins awaiting peer approval for the friend circle.
    """
    if id not in store.streaks:
        raise HTTPException(status_code=404, detail=f"Streak {id} not found")

    streak = store.streaks[id]
    start_time = streak["start_time"]
    window_seconds = streak.get("cutoff_seconds", 86400)
    now = time.time()

    pending_list: List[PendingApproval] = []

    for checkin in store.checkins.values():
        if checkin["streak_id"] == id and checkin["status"] == "PENDING":
            cutoff = calculate_day_cutoff(start_time, checkin["day"], window_seconds)
            time_left = max(0.0, cutoff - now)
            is_expired = now > cutoff

            votes = [
                PeerVote(
                    approver=a["approver"],
                    approved=a["approved"],
                    comment=a.get("comment"),
                    voted_at=a.get("voted_at", now)
                )
                for a in checkin.get("approvals", [])
            ]

            pending_list.append(
                PendingApproval(
                    proof_id=checkin["proof_id"],
                    streak_id=id,
                    participant=checkin["participant"],
                    day=checkin["day"],
                    proof_type=checkin["proof_type"],
                    image_url=checkin["image_url"],
                    ipfs_uri=checkin["ipfs_uri"],
                    status=CheckInStatus.PENDING,
                    approvals=votes,
                    required_approvals=checkin.get("required_approvals", 2),
                    created_at=checkin["created_at"],
                    cutoff_time=cutoff,
                    time_left_seconds=time_left,
                    is_expired=is_expired
                )
            )

    return pending_list


@router.get("/{id}/slackers", response_model=SlackerEvaluationResponse)
async def get_slackers_evaluation(id: str):
    """
    Returns candidates eligible for DracarysEscrow.burnSlacker() along with calldata previews.
    """
    if id not in store.streaks:
        raise HTTPException(status_code=404, detail=f"Streak {id} not found")

    streak = store.streaks[id]
    current_day = calculate_current_streak_day(streak["start_time"], streak.get("cutoff_seconds", 86400))
    
    candidates = find_slackers_for_streak(
        streak=streak,
        checkins=list(store.checkins.values()),
        burned_records=store.burned_records
    )

    return SlackerEvaluationResponse(
        streak_id=id,
        evaluation_time=time.time(),
        current_day=current_day,
        slackers_found=len(candidates),
        burn_candidates=candidates
    )
