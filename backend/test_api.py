"""
Verification & Integration Test Script for Dracarys FastAPI Verification Engine
"""
import io
import sys
import time

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from pathlib import Path
# Add src to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from fastapi.testclient import TestClient
from src.app.main import app


client = TestClient(app)

def test_dracarys_pipeline():
    print("=" * 60)
    print("🐉 TESTING DRACARYS VERIFICATION ENGINE ON MONAD")
    print("=" * 60)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✅ 1. Health check passed:", res.json()["engine"])

    streak_id = "streak-berlin-7d"
    alice = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    bob = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    chad = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"

    # 2. Upload proof (Chad uploads proof for Day 2)
    fake_photo_bytes = b"fake_gym_selfie_image_bytes_here"
    file_payload = {
        "file": ("gym_selfie.jpg", io.BytesIO(fake_photo_bytes), "image/jpeg")
    }
    form_data = {
        "streak_id": streak_id,
        "participant": chad,
        "day": 2,
        "proof_type": "gym",
        "notes": "Bench press 100kg PR today! 🔥"
    }

    upload_res = client.post("/api/streaks/upload-proof", files=file_payload, data=form_data)
    assert upload_res.status_code == 200, f"Upload proof failed: {upload_res.text}"
    proof_data = upload_res.json()
    proof_id = proof_data["proof_id"]
    print(f"✅ 2. Uploaded proof successfully: {proof_id}")
    print(f"   IPFS URI: {proof_data['ipfs_uri']}")
    print(f"   Metadata URI: {proof_data['metadata_uri']}")

    # 3. Check pending approvals
    pending_res = client.get(f"/api/streaks/{streak_id}/pending-approvals")
    assert pending_res.status_code == 200, f"Pending approvals failed: {pending_res.text}"
    pending = pending_res.json()
    print(f"✅ 3. Retrieved {len(pending)} pending approval items awaiting peer review.")

    # 4. Peer approval 1: Alice approves Chad's proof
    vote1_res = client.post("/api/streaks/verify", json={
        "streak_id": streak_id,
        "proof_id": proof_id,
        "approver": alice,
        "approved": True,
        "comment": "Form was clean! Approved 🔥"
    })
    assert vote1_res.status_code == 200, f"Vote 1 failed: {vote1_res.text}"
    print("✅ 4. Peer approval 1 recorded by Alice (1/2 votes)")

    # 5. Peer approval 2: Bob approves Chad's proof (triggers quorum & Monad sub-second payout)
    vote2_res = client.post("/api/streaks/verify", json={
        "streak_id": streak_id,
        "proof_id": proof_id,
        "approver": bob,
        "approved": True,
        "comment": "Total beast mode! Approved."
    })
    assert vote2_res.status_code == 200, f"Vote 2 failed: {vote2_res.text}"
    vote2_data = vote2_data = vote2_res.json()
    assert vote2_data["status"] == "APPROVED"
    assert vote2_data["is_unlocked"] is True
    print("✅ 5. Quorum reached! Chad's flame unlocked & €0.10 payout triggered.")

    # 6. Verify Social Feed (Who kindled, who approved, who got burned)
    feed_res = client.get(f"/api/streaks/{streak_id}/feed")
    assert feed_res.status_code == 200, f"Feed retrieval failed: {feed_res.text}"
    feed = feed_res.json()
    print(f"✅ 6. Real-time social feed retrieved: {len(feed)} events logged.")
    for item in feed[:4]:
        print(f"   [{item['event_type']}] {item['title']}: {item['description']}")

    # 7. Slacker evaluation & Burn Helper
    slackers_res = client.get(f"/api/streaks/{streak_id}/slackers")
    assert slackers_res.status_code == 200, f"Slacker evaluation failed: {slackers_res.text}"
    slackers_data = slackers_res.json()
    print(f"✅ 7. Slacker & Deadline evaluation completed:")
    print(f"   Slackers found: {slackers_data['slackers_found']}")
    for s in slackers_data["burn_candidates"]:
        print(f"   🔥 Slacker candidate: {s['slacker']} (Day {s['day']})")
        print(f"      Contract Call: {s['contract_function']}")
        print(f"      Calldata preview: {s['calldata_preview']}")

    # 8. User Account Creation & Login test
    users_res = client.get("/api/users")
    assert users_res.status_code == 200, f"Users listing failed: {users_res.text}"
    users_list = users_res.json()
    assert len(users_list) >= 3, "Expected at least 3 seeded users"
    print(f"✅ 8. User registry active: {len(users_list)} friends seeded ({', '.join(u['display_name'] for u in users_list)})")

    # Register custom user
    new_user_res = client.post("/api/users/register", json={
        "username": "monad_blitz",
        "display_name": "Blitz Winner",
        "wallet_address": "0x1234567890123456789012345678901234567890",
        "bio": "Habit staking champion",
        "avatar_color": "lilac"
    })
    assert new_user_res.status_code == 200, f"User registration failed: {new_user_res.text}"
    user_data = new_user_res.json()
    assert user_data["username"] == "monad_blitz"
    print(f"✅ 9. User account created: {user_data['display_name']} (@{user_data['username']}) - Initials: {user_data['initials']}")

    # Login
    login_res = client.post("/api/users/login", json={"username_or_wallet": "monad_blitz"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    print(f"✅ 10. Login successful for @{login_res.json()['username']}")

    print("=" * 60)
    print("🎉 ALL DRACARYS VERIFICATION & USER AUTH TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    test_dracarys_pipeline()
