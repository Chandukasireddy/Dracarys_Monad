from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ProofType(str, Enum):
    GYM = "gym"
    STEPS = "steps"
    READING = "reading"
    CUSTOM = "custom"


class CheckInStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    BURNED = "BURNED"


class FeedEventType(str, Enum):
    STREAK_STARTED = "STREAK_STARTED"
    KINDLED = "KINDLED"          # User uploaded proof & kindled their flame
    APPROVED = "APPROVED"        # Friend circle approved check-in
    STAKE_PAID = "STAKE_PAID"    # Monad sub-second payout dispatched
    BURNED = "BURNED"            # Slacker missed deadline and was burned


class ProofUploadResponse(BaseModel):
    proof_id: str
    streak_id: str
    participant: str
    day: int
    proof_type: ProofType
    image_url: str
    ipfs_uri: str
    metadata_uri: str
    uploaded_at: float


class VerifyCheckInRequest(BaseModel):
    streak_id: str
    participant: str
    day: int
    proof_uri: str
    proof_type: Optional[ProofType] = ProofType.CUSTOM
    notes: Optional[str] = None


class PeerApprovalRequest(BaseModel):
    streak_id: str
    proof_id: str
    approver: str
    approved: bool = True
    comment: Optional[str] = "Flame verified 🔥"


class PeerVote(BaseModel):
    approver: str
    approved: bool
    comment: Optional[str] = None
    voted_at: float


class PendingApproval(BaseModel):
    proof_id: str
    streak_id: str
    participant: str
    day: int
    proof_type: str
    image_url: str
    ipfs_uri: str
    status: CheckInStatus
    approvals: List[PeerVote] = Field(default_factory=list)
    required_approvals: int
    created_at: float
    cutoff_time: float
    time_left_seconds: float
    is_expired: bool


class FeedEvent(BaseModel):
    id: str
    streak_id: str
    event_type: FeedEventType
    title: str
    description: str
    actor: str
    target_user: Optional[str] = None
    day: int
    amount: Optional[str] = None
    timestamp: float
    tx_hash: Optional[str] = None
    proof_image: Optional[str] = None


class BurnCandidate(BaseModel):
    streak_id: str
    slacker: str
    day: int
    missed_cutoff: float
    slashed_amount: str
    contract_function: str = "DracarysEscrow.burnSlacker(uint256 streakId, address slacker, uint256 day)"
    calldata_preview: str
    is_burned: bool = False


class SlackerEvaluationResponse(BaseModel):
    streak_id: str
    evaluation_time: float
    current_day: int
    slackers_found: int
    burn_candidates: List[BurnCandidate]
