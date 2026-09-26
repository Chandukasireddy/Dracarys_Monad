import os
import sqlite3
import time
import uuid
from pathlib import Path
from typing import Dict, List, Any, Optional

def get_db_path() -> Path:
    # Use /tmp for serverless/Vercel or local directory
    try:
        local_path = Path(__file__).resolve().parent.parent.parent.parent / "dracarys.db"
        local_path.touch(exist_ok=True)
        return local_path
    except (OSError, PermissionError):
        tmp_path = Path("/tmp/dracarys.db")
        tmp_path.touch(exist_ok=True)
        return tmp_path

class DatabaseManager:
    def __init__(self):
        self.db_path = get_db_path()
        self.postgres_url = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL")
        self.init_schema()

    def get_connection(self):
        conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def init_schema(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                display_name TEXT NOT NULL,
                wallet_address TEXT,
                bio TEXT,
                avatar_color TEXT,
                initials TEXT,
                streak_count INTEGER DEFAULT 0,
                total_earned_mon REAL DEFAULT 0.0,
                created_at REAL
            )
        """)
        conn.commit()
        conn.close()
        self.seed_defaults()

    def seed_defaults(self):
        now = time.time()
        defaults = [
            {
                "id": "user-chandu",
                "username": "chandu",
                "display_name": "Chandu",
                "wallet_address": "0x0CD9489AfcCc42B0ccFD463E53D3C9bb24c9A3f3",
                "bio": "Building Dracarys on Monad Testnet 🔥",
                "avatar_color": "purple",
                "initials": "CK",
                "streak_count": 5,
                "total_earned_mon": 0.25,
                "created_at": now - (5 * 86400)
            },
            {
                "id": "user-abubaker",
                "username": "abubaker",
                "display_name": "Abubaker",
                "wallet_address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                "bio": "Building a better me every day",
                "avatar_color": "peach",
                "initials": "AB",
                "streak_count": 8,
                "total_earned_mon": 0.40,
                "created_at": now - (8 * 86400)
            },
            {
                "id": "user-abdul",
                "username": "abdul",
                "display_name": "Abdul",
                "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
                "bio": "Consistency is my superpower",
                "avatar_color": "mint",
                "initials": "AJ",
                "streak_count": 6,
                "total_earned_mon": 0.30,
                "created_at": now - (6 * 86400)
            }
        ]

        conn = self.get_connection()
        cursor = conn.cursor()
        for u in defaults:
            cursor.execute("""
                INSERT OR IGNORE INTO users (id, username, display_name, wallet_address, bio, avatar_color, initials, streak_count, total_earned_mon, created_at)
                VALUES (:id, :username, :display_name, :wallet_address, :bio, :avatar_color, :initials, :streak_count, :total_earned_mon, :created_at)
            """, u)
        conn.commit()
        conn.close()

    def get_user_by_identifier(self, identifier: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        clean = identifier.strip().lower()
        cursor.execute("""
            SELECT * FROM users
            WHERE lower(username) = ? OR lower(wallet_address) = ? OR id = ?
        """, (clean, clean, identifier))
        row = cursor.fetchone()
        conn.close()
        if row:
            return dict(row)
        return None

    def create_or_update_user(self, data: Dict[str, Any]) -> Dict[str, Any]:
        conn = self.get_connection()
        cursor = conn.cursor()
        username = data["username"].strip().lower()
        existing = self.get_user_by_identifier(username)

        initials = data.get("initials")
        if not initials and data.get("display_name"):
            parts = data["display_name"].strip().split()
            if len(parts) >= 2:
                initials = (parts[0][0] + parts[1][0]).upper()
            else:
                initials = parts[0][:2].upper()

        if existing:
            # Update
            cursor.execute("""
                UPDATE users
                SET display_name = :display_name,
                    wallet_address = COALESCE(:wallet_address, wallet_address),
                    bio = COALESCE(:bio, bio),
                    avatar_color = COALESCE(:avatar_color, avatar_color),
                    initials = COALESCE(:initials, initials)
                WHERE username = :username
            """, {
                "display_name": data.get("display_name", existing["display_name"]),
                "wallet_address": data.get("wallet_address", existing["wallet_address"]),
                "bio": data.get("bio", existing["bio"]),
                "avatar_color": data.get("avatar_color", existing["avatar_color"]),
                "initials": initials or existing["initials"],
                "username": username
            })
            user_id = existing["id"]
        else:
            user_id = f"user-{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO users (id, username, display_name, wallet_address, bio, avatar_color, initials, streak_count, total_earned_mon, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id,
                username,
                data.get("display_name", username.capitalize()),
                data.get("wallet_address"),
                data.get("bio", "Kindling my flame on Monad 🔥"),
                data.get("avatar_color", "peach"),
                initials or username[:2].upper(),
                data.get("streak_count", 0),
                data.get("total_earned_mon", 0.0),
                time.time()
            ))

        conn.commit()
        conn.close()
        return self.get_user_by_identifier(user_id) # type: ignore

    def list_all_users(self) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users ORDER BY created_at ASC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

db = DatabaseManager()
