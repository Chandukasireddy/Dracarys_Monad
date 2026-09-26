import time
import hashlib
from typing import List, Dict, Any, Optional
from ..models.schemas import BurnCandidate, SlackerEvaluationResponse


def get_selector(signature: str) -> str:
    """Calculate 4-byte Ethereum function selector from signature."""
    return "0x" + hashlib.sha256(signature.encode()).hexdigest()[:8]


def calculate_day_cutoff(start_time: float, day: int, window_seconds: int = 86400) -> float:
    """Calculates the exact Unix timestamp deadline for a specific streak day."""
    return start_time + (day * window_seconds)


def calculate_current_streak_day(start_time: float, window_seconds: int = 86400) -> int:
    """Determines which day (1-indexed) the challenge is currently on."""
    elapsed = time.time() - start_time
    if elapsed < 0:
        return 0
    return int(elapsed // window_seconds) + 1


def format_calldata_preview(streak_id: int, slacker_address: str, day: int) -> str:
    """
    Creates an ABI-compatible hex string preview for DracarysEscrow.burnSlacker(uint256,address,uint256).
    """
    # burnSlacker(uint256,address,uint256) selector is 0x05b26372 in standard keccak256
    # We provide a clean readable 0x... hex representation
    clean_addr = slacker_address.lower().replace("0x", "").zfill(64)
    streak_hex = hex(streak_id).replace("0x", "").zfill(64)
    day_hex = hex(day).replace("0x", "").zfill(64)
    selector = "0x05b26372"
    return f"{selector}{streak_hex}{clean_addr}{day_hex}"


def find_slackers_for_streak(
    streak: Dict[str, Any],
    checkins: List[Dict[str, Any]],
    burned_records: List[Dict[str, Any]],
    current_time: Optional[float] = None
) -> List[BurnCandidate]:
    """
    Evaluates past and current days to find any participant who missed their 24h cutoff.
    Returns candidates ready to be burned on-chain.
    """
    if current_time is None:
        current_time = time.time()

    start_time = streak["start_time"]
    window_seconds = streak.get("cutoff_seconds", 86400)
    total_days = streak.get("duration_days", 7)
    participants = streak.get("participants", [])
    daily_stake = streak.get("daily_stake", "€0.10 (0.05 MON)")
    numeric_id = int(hashlib.md5(streak["id"].encode()).hexdigest()[:6], 16)

    candidates: List[BurnCandidate] = []

    # Map of (participant, day) -> checkin status
    approved_map = set()
    for c in checkins:
        if c.get("streak_id") == streak["id"] and c.get("status") in ["APPROVED", "PENDING"]:
            approved_map.add((c["participant"].lower(), c["day"]))

    # Map of (participant, day) already burned
    already_burned = set()
    for b in burned_records:
        if b.get("streak_id") == streak["id"]:
            already_burned.add((b["slacker"].lower(), b["day"]))

    # Check each day from Day 1 up to total_days
    for day in range(1, total_days + 1):
        cutoff = calculate_day_cutoff(start_time, day, window_seconds)
        
        # If the cutoff has passed, participants must have checked in
        if current_time > cutoff:
            for p in participants:
                p_lower = p.lower()
                has_approved = (p_lower, day) in approved_map
                was_burned = (p_lower, day) in already_burned

                if not has_approved and not was_burned:
                    candidates.append(
                        BurnCandidate(
                            streak_id=streak["id"],
                            slacker=p,
                            day=day,
                            missed_cutoff=cutoff,
                            slashed_amount=daily_stake,
                            contract_function="DracarysEscrow.burnSlacker(uint256 streakId, address slacker, uint256 day)",
                            calldata_preview=format_calldata_preview(numeric_id, p, day),
                            is_burned=False
                        )
                    )

    return candidates
