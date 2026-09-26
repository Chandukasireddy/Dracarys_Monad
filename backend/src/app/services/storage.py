import os
import hashlib
import time
import json
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def calculate_content_hash(data: bytes) -> str:
    """Calculate SHA-256 hash of image data."""
    return hashlib.sha256(data).hexdigest()


def generate_mock_ipfs_cid(content_hash: str) -> str:
    """Generate a realistic looking IPFS CID v1 base32 string."""
    # Prefix 'bafkreib' is common for raw sha2-256 CIDs in IPFS CIDv1
    short_hash = content_hash[:32].lower()
    return f"ipfs://bafkreib{short_hash}monaddracarys"


async def save_proof_file(
    file: UploadFile,
    streak_id: str,
    participant: str,
    day: int,
    proof_type: str,
    notes: str = ""
) -> dict:
    """
    Saves an uploaded photo to storage and generates metadata and IPFS reference.
    """
    contents = await file.read()
    file_size = len(contents)
    content_hash = calculate_content_hash(contents)
    
    # Preserve extension or default to .jpg
    ext = Path(file.filename or "proof.jpg").suffix
    if not ext:
        ext = ".jpg"
        
    filename = f"{streak_id}_day{day}_{participant[:8]}_{int(time.time())}{ext}"
    file_path = UPLOAD_DIR / filename
    
    with open(file_path, "wb") as f:
        f.write(contents)
        
    ipfs_uri = generate_mock_ipfs_cid(content_hash)
    
    # Create metadata JSON for on-chain/attestation reference
    metadata = {
        "name": f"Dracarys Proof - Streak {streak_id} - Day {day}",
        "description": f"Verified {proof_type} check-in by {participant} on Monad",
        "image": ipfs_uri,
        "properties": {
            "streak_id": streak_id,
            "participant": participant,
            "day": day,
            "proof_type": proof_type,
            "notes": notes,
            "file_size": file_size,
            "sha256": content_hash,
            "timestamp": time.time(),
            "network": "Monad Testnet (10143)"
        }
    }
    
    metadata_filename = f"{filename}.json"
    metadata_path = UPLOAD_DIR / metadata_filename
    with open(metadata_path, "w") as mf:
        json.dump(metadata, mf, indent=2)
        
    return {
        "filename": filename,
        "image_url": f"/uploads/{filename}",
        "ipfs_uri": ipfs_uri,
        "metadata_uri": f"/uploads/{metadata_filename}",
        "sha256": content_hash,
        "file_size": file_size,
        "uploaded_at": time.time()
    }
