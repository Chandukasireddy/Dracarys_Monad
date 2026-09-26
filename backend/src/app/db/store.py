import time
import uuid
from typing import Dict, List, Any, Optional

# In-memory storage for rapid hackathon iteration & testing
class DracarysStore:
    def __init__(self):
        self.streaks: Dict[str, Dict[str, Any]] = {}
        self.checkins: Dict[str, Dict[str, Any]] = {}  # key: proof_id
        self.feed_events: List[Dict[str, Any]] = []
        self.burned_records: List[Dict[str, Any]] = []
        self._seed_demo_data()

    def _seed_demo_data(self):
        now = time.time()
        one_day = 86400

        # Seed Challenge: Monad Blitz Berlin 7-Day Habit Staking
        streak_id = "streak-berlin-7d"
        # Start time 26 hours ago so Day 1 cutoff has passed (to demonstrate slacker burn)
        # and Day 2 is actively ongoing!
        start_time = now - (26 * 3600)

        alice = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
        bob = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
        chad = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"

        self.streaks[streak_id] = {
            "id": streak_id,
            "name": "🔥 Monad Blitz Berlin 10k Steps & Gym",
            "creator": alice,
            "daily_stake": "€0.10 (0.05 MON)",
            "duration_days": 7,
            "start_time": start_time,
            "cutoff_seconds": one_day,
            "required_approvals": 2,
            "participants": [alice, bob, chad],
            "vault_contract": "0xDracarysEscrowMonad10143",
            "created_at": start_time - 3600
        }

        # Day 1: Alice kindled and got approved
        proof_alice_d1 = f"proof-{uuid.uuid4().hex[:8]}"
        self.checkins[proof_alice_d1] = {
            "proof_id": proof_alice_d1,
            "streak_id": streak_id,
            "participant": alice,
            "day": 1,
            "proof_type": "steps",
            "image_url": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80",
            "ipfs_uri": "ipfs://bafkreibalice10kstepsmonadd1",
            "status": "APPROVED",
            "approvals": [
                {"approver": bob, "approved": True, "comment": "Legit 10,240 steps! 🔥", "voted_at": start_time + 4000},
                {"approver": chad, "approved": True, "comment": "Verified on Strava 👍", "voted_at": start_time + 4500}
            ],
            "required_approvals": 2,
            "created_at": start_time + 3600,
            "notes": "Morning jog in Tiergarten Berlin"
        }

        # Day 2: Bob just uploaded a gym selfie (PENDING APPROVAL)
        proof_bob_d2 = f"proof-{uuid.uuid4().hex[:8]}"
        self.checkins[proof_bob_d2] = {
            "proof_id": proof_bob_d2,
            "streak_id": streak_id,
            "participant": bob,
            "day": 2,
            "proof_type": "gym",
            "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
            "ipfs_uri": "ipfs://bafkreibbobgymselfiemonadd2",
            "status": "PENDING",
            "approvals": [
                {"approver": alice, "approved": True, "comment": "Crushed leg day 🔥", "voted_at": now - 1200}
            ],
            "required_approvals": 2,
            "created_at": now - 3600,
            "notes": "Deadlifts & bench press session done"
        }

        # Seed Feed Events
        self.feed_events.extend([
            {
                "id": f"event-{uuid.uuid4().hex[:8]}",
                "streak_id": streak_id,
                "event_type": "STREAK_STARTED",
                "title": "🐉 DRACARYS VAULT LOCKED",
                "description": "Challenge initialized! Alice, Bob, and Chad each deposited €0.70 into the Monad escrow.",
                "actor": alice,
                "target_user": None,
                "day": 1,
                "amount": "€2.10 (1.05 MON)",
                "timestamp": start_time,
                "tx_hash": "0x3f98a7c2b5d4e1f8901234567890abcdef1234567890abcdef1234567890abc1",
                "proof_image": None
            },
            {
                "id": f"event-{uuid.uuid4().hex[:8]}",
                "streak_id": streak_id,
                "event_type": "KINDLED",
                "title": "🔥 FLAME KINDLED",
                "description": "Alice uploaded proof for Day 1 (10,240 steps).",
                "actor": alice,
                "target_user": None,
                "day": 1,
                "amount": None,
                "timestamp": start_time + 3600,
                "tx_hash": None,
                "proof_image": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80"
            },
            {
                "id": f"event-{uuid.uuid4().hex[:8]}",
                "streak_id": streak_id,
                "event_type": "STAKE_PAID",
                "title": "⚡ SUB-SECOND PAYOUT DISPATCHED",
                "description": "Alice's flame was peer-verified! €0.10 returned to her wallet in 380ms.",
                "actor": alice,
                "target_user": None,
                "day": 1,
                "amount": "€0.10 (0.05 MON)",
                "timestamp": start_time + 4500,
                "tx_hash": "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
                "proof_image": None
            },
            {
                "id": f"event-{uuid.uuid4().hex[:8]}",
                "streak_id": streak_id,
                "event_type": "KINDLED",
                "title": "🔥 FLAME KINDLED",
                "description": "Bob uploaded gym proof for Day 2! Awaiting 1 more peer approval.",
                "actor": bob,
                "target_user": None,
                "day": 2,
                "amount": None,
                "timestamp": now - 3600,
                "tx_hash": None,
                "proof_image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80"
            }
        ])

store = DracarysStore()
