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

    # 2. Register real user
    reg_res = client.post("/api/users/register", json={
        "username": "testchad",
        "display_name": "Chad Bro",
        "password": "chadpassword123",
        "wallet_address": "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
    })
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    user = reg_res.json()
    print("✅ 2. User registered:", user["username"])

    # 3. Create a real streak
    alice = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    bob = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    chad = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"

    streak_res = client.post("/api/streaks", json={
        "title": "🔥 Monad Blitz Berlin 10k Steps & Gym",
        "creator_id": user["id"],
        "creator_address": chad,
        "duration": 7,
        "daily_stake": "0.05",
        "required_approvals": 1
    })
    assert streak_res.status_code == 200, f"Streak creation failed: {streak_res.text}"
    streak = streak_res.json()
    streak_id = streak["id"]
    print("✅ 3. Created streak:", streak_id, streak["invite_code"])

    # 4. Join friend bob to streak
    join_res = client.post(f"/api/streaks/{streak_id}/join", json={
        "user_id": "bob-user",
        "wallet_address": bob
    })
    assert join_res.status_code == 200, f"Join streak failed: {join_res.text}"
    print("✅ 4. Friend joined streak")

    # 5. Upload proof (Chad uploads proof for Day 1)
    fake_photo_bytes = b"fake_gym_selfie_image_bytes_here"
    file_payload = {
        "file": ("gym_selfie.jpg", io.BytesIO(fake_photo_bytes), "image/jpeg")
    }
    form_data = {
        "streak_id": streak_id,
        "participant": chad,
        "user_id": user["id"],
        "day": 1,
        "proof_type": "gym",
        "notes": "Bench press 100kg PR today! 🔥"
    }

    upload_res = client.post("/api/streaks/upload-proof", files=file_payload, data=form_data)
    assert upload_res.status_code == 200, f"Upload proof failed: {upload_res.text}"
    proof_data = upload_res.json()
    proof_id = proof_data["proof_id"]
    print(f"✅ 5. Uploaded proof successfully: {proof_id}")

    # 6. Check pending approvals
    pending_res = client.get("/api/streaks/pending-approvals")
    assert pending_res.status_code == 200
    pending_list = pending_res.json()
    assert len(pending_list) >= 1
    print(f"✅ 6. Pending check-in found in queue: {len(pending_list)}")

    # 7. Bob verifies Chad's proof
    verify_res = client.post("/api/streaks/verify", json={
        "streak_id": streak_id,
        "proof_id": proof_id,
        "approver": bob,
        "approved": True,
        "comment": "Legit bench form verified on Monad! 🔥"
    })
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["status"] == "APPROVED"
    assert verify_data["is_unlocked"] is True
    print(f"✅ 7. Peer verification quorum reached: {verify_data['status']}")

    # 8. Feed check
    feed_res = client.get(f"/api/streaks/{streak_id}/feed")
    assert feed_res.status_code == 200
    feed = feed_res.json()
    assert len(feed) >= 1
    print(f"✅ 8. Social feed events captured: {len(feed)}")
    print("=" * 60)
    print("🔥 ALL DRACARYS BACKEND PIPELINE TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    test_dracarys_pipeline()
