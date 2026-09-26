import os
import sqlite3
import time
import uuid
import hashlib
import binascii
import json
from pathlib import Path
from typing import Dict, List, Any, Optional

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{binascii.hexlify(salt).decode('ascii')}${binascii.hexlify(pwd_hash).decode('ascii')}"

def verify_password(password: str, stored: Optional[str]) -> bool:
    if not stored or "$" not in stored:
        return False
    salt_str, hash_str = stored.split("$", 1)
    salt = binascii.unhexlify(salt_str.encode('ascii'))
    check_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return binascii.hexlify(check_hash).decode('ascii') == hash_str

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
        self.postgres_url = (
            os.getenv("POSTGRES_URL")
            or os.getenv("DATABASE_URL")
            or os.getenv("POSTGRES_URL_NON_POOLING")
            or os.getenv("POSTGRES_PRISMA_URL")
        )
        self.is_postgres = False
        self.postgres_error = None

        if self.postgres_url:
            try:
                import psycopg2
                conn_url = self.postgres_url
                if "sslmode=" not in conn_url:
                    conn_url += ("&" if "?" in conn_url else "?") + "sslmode=require"
                test_conn = psycopg2.connect(conn_url)
                test_conn.close()
                self.postgres_url = conn_url
                self.is_postgres = True
                print("Connected to PostgreSQL / Neon Database successfully!")
            except Exception as e:
                self.postgres_error = str(e)
                print(f"PostgreSQL connection failed, falling back to SQLite: {e}")
                self.is_postgres = False

        self.init_schema()

    def status(self) -> Dict[str, Any]:
        env_keys = [k for k in ["POSTGRES_URL", "DATABASE_URL", "POSTGRES_URL_NON_POOLING", "POSTGRES_PRISMA_URL"] if os.getenv(k)]
        return {
            "engine": "PostgreSQL (Neon)" if self.is_postgres else "SQLite (/tmp)",
            "is_postgres": self.is_postgres,
            "has_env_vars": len(env_keys) > 0,
            "detected_env_vars": env_keys,
            "postgres_error": self.postgres_error,
            "users_count": len(self.list_all_users()),
            "streaks_count": len(self.list_streaks())
        }

    def get_connection(self):
        if self.is_postgres and self.postgres_url:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            return psycopg2.connect(self.postgres_url, cursor_factory=RealDictCursor)
        else:
            conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
            conn.row_factory = sqlite3.Row
            return conn

    def init_schema(self):
        conn = self.get_connection()
        cursor = conn.cursor()

        if self.is_postgres:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE,
                    password_hash TEXT,
                    display_name TEXT NOT NULL,
                    wallet_address TEXT,
                    bio TEXT,
                    avatar_color TEXT DEFAULT 'purple',
                    initials TEXT,
                    streak_count INTEGER DEFAULT 0,
                    total_earned_mon REAL DEFAULT 0.0,
                    created_at DOUBLE PRECISION
                );

                CREATE TABLE IF NOT EXISTS streaks (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    kind TEXT DEFAULT 'fitness',
                    duration INTEGER NOT NULL DEFAULT 7,
                    daily_stake TEXT NOT NULL DEFAULT '0.05',
                    creator_id TEXT NOT NULL,
                    creator_address TEXT,
                    vault_contract TEXT,
                    invite_code TEXT UNIQUE,
                    required_approvals INTEGER DEFAULT 1,
                    start_time DOUBLE PRECISION,
                    created_at DOUBLE PRECISION,
                    onchain_id TEXT
                );

                CREATE TABLE IF NOT EXISTS streak_members (
                    id TEXT PRIMARY KEY,
                    streak_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    wallet_address TEXT,
                    role TEXT DEFAULT 'member',
                    completed_days INTEGER DEFAULT 0,
                    joined_at DOUBLE PRECISION
                );

                CREATE TABLE IF NOT EXISTS check_ins (
                    id TEXT PRIMARY KEY,
                    streak_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    participant_address TEXT,
                    day_index INTEGER NOT NULL,
                    check_in_date TEXT NOT NULL,
                    proof_type TEXT DEFAULT 'custom',
                    image_url TEXT,
                    ipfs_uri TEXT,
                    notes TEXT,
                    status TEXT DEFAULT 'PENDING',
                    required_approvals INTEGER DEFAULT 1,
                    created_at DOUBLE PRECISION
                );

                CREATE TABLE IF NOT EXISTS check_in_approvals (
                    id TEXT PRIMARY KEY,
                    proof_id TEXT NOT NULL,
                    approver_id TEXT NOT NULL,
                    approver_address TEXT,
                    approved INTEGER NOT NULL DEFAULT 1,
                    comment TEXT,
                    created_at DOUBLE PRECISION
                );

                CREATE TABLE IF NOT EXISTS invitations (
                    id TEXT PRIMARY KEY,
                    streak_id TEXT NOT NULL,
                    inviter_id TEXT NOT NULL,
                    invitee_id TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at DOUBLE PRECISION
                );

                CREATE TABLE IF NOT EXISTS feed_events (
                    id TEXT PRIMARY KEY,
                    streak_id TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    target_user TEXT,
                    day INTEGER,
                    amount TEXT,
                    timestamp DOUBLE PRECISION,
                    tx_hash TEXT,
                    proof_image TEXT
                );
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE,
                    password_hash TEXT,
                    display_name TEXT NOT NULL,
                    wallet_address TEXT,
                    bio TEXT,
                    avatar_color TEXT DEFAULT 'purple',
                    initials TEXT,
                    streak_count INTEGER DEFAULT 0,
                    total_earned_mon REAL DEFAULT 0.0,
                    created_at REAL
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS streaks (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    kind TEXT DEFAULT 'fitness',
                    duration INTEGER NOT NULL DEFAULT 7,
                    daily_stake TEXT NOT NULL DEFAULT '0.05',
                    creator_id TEXT NOT NULL,
                    creator_address TEXT,
                    vault_contract TEXT,
                    invite_code TEXT UNIQUE,
                    required_approvals INTEGER DEFAULT 1,
                    start_time REAL,
                    created_at REAL,
                    onchain_id TEXT
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS streak_members (
                    id TEXT PRIMARY KEY,
                    streak_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    wallet_address TEXT,
                    role TEXT DEFAULT 'member',
                    completed_days INTEGER DEFAULT 0,
                    joined_at REAL
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS check_ins (
                    id TEXT PRIMARY KEY,
                    streak_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    participant_address TEXT,
                    day_index INTEGER NOT NULL,
                    check_in_date TEXT NOT NULL,
                    proof_type TEXT DEFAULT 'custom',
                    image_url TEXT,
                    ipfs_uri TEXT,
                    notes TEXT,
                    status TEXT DEFAULT 'PENDING',
                    required_approvals INTEGER DEFAULT 1,
                    created_at REAL
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS check_in_approvals (
                    id TEXT PRIMARY KEY,
                    proof_id TEXT NOT NULL,
                    approver_id TEXT NOT NULL,
                    approver_address TEXT,
                    approved INTEGER NOT NULL DEFAULT 1,
                    comment TEXT,
                    created_at REAL
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS invitations (
                    id TEXT PRIMARY KEY,
                    streak_id TEXT NOT NULL,
                    inviter_id TEXT NOT NULL,
                    invitee_id TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at REAL
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS feed_events (
                    id TEXT PRIMARY KEY,
                    streak_id TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    target_user TEXT,
                    day INTEGER,
                    amount TEXT,
                    timestamp REAL,
                    tx_hash TEXT,
                    proof_image TEXT
                );
            """)

        # Older databases were created before streaks tracked their on-chain ID.
        if self.is_postgres:
            cursor.execute("ALTER TABLE streaks ADD COLUMN IF NOT EXISTS onchain_id TEXT")
        else:
            columns = [row[1] for row in cursor.execute("PRAGMA table_info(streaks)").fetchall()]
            if "onchain_id" not in columns:
                cursor.execute("ALTER TABLE streaks ADD COLUMN onchain_id TEXT")

        conn.commit()
        conn.close()

    # ================= USER AUTHENTICATION & MANAGEMENT =================

    def get_user_by_identifier(self, identifier: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        clean = identifier.strip().lower()
        ph = "%s" if self.is_postgres else "?"
        query = f"""
            SELECT * FROM users
            WHERE lower(username) = {ph} 
               OR lower(COALESCE(email, '')) = {ph} 
               OR lower(COALESCE(wallet_address, '')) = {ph} 
               OR id = {ph}
        """
        cursor.execute(query, (clean, clean, clean, identifier.strip()))
        row = cursor.fetchone()
        conn.close()
        if row:
            res = dict(row)
            res.pop("password_hash", None)
            return res
        return None

    def get_user_with_credentials(self, identifier: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        clean = identifier.strip().lower()
        ph = "%s" if self.is_postgres else "?"
        query = f"""
            SELECT * FROM users
            WHERE lower(username) = {ph} 
               OR lower(COALESCE(email, '')) = {ph} 
               OR lower(COALESCE(wallet_address, '')) = {ph} 
               OR id = {ph}
        """
        cursor.execute(query, (clean, clean, clean, identifier.strip()))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def create_user(self, data: Dict[str, Any]) -> Dict[str, Any]:
        conn = self.get_connection()
        cursor = conn.cursor()
        username = data["username"].strip().lower()
        email_raw = data.get("email") or ""
        email = email_raw.strip().lower() or None
        password = data.get("password")
        password_hash = hash_password(password) if password else None

        display_name = data.get("display_name", username.capitalize()).strip()
        parts = display_name.split()
        initials = data.get("initials")
        if not initials:
            if len(parts) >= 2:
                initials = (parts[0][0] + parts[1][0]).upper()
            else:
                initials = parts[0][:2].upper()

        user_id = f"user-{uuid.uuid4().hex[:8]}"
        ph = "%s" if self.is_postgres else "?"
        query = f"""
            INSERT INTO users (id, username, email, password_hash, display_name, wallet_address, bio, avatar_color, initials, streak_count, total_earned_mon, created_at)
            VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
        """
        cursor.execute(query, (
            user_id,
            username,
            email,
            password_hash,
            display_name,
            data.get("wallet_address"),
            data.get("bio", "Kindling my flame on Monad 🔥"),
            data.get("avatar_color", "purple"),
            initials,
            0,
            0.0,
            time.time()
        ))
        conn.commit()
        conn.close()
        return self.get_user_by_identifier(user_id) # type: ignore

    def authenticate_user(self, identifier: str, password: Optional[str] = None, wallet_address: Optional[str] = None) -> Optional[Dict[str, Any]]:
        # Wallet login
        if wallet_address and not password:
            return self.get_user_by_identifier(wallet_address)

        user_record = self.get_user_with_credentials(identifier)
        if not user_record:
            return None

        # If user registered with a password, verify password
        stored_hash = user_record.get("password_hash")
        if stored_hash:
            if not password or not verify_password(password, stored_hash):
                return None
        elif password:
            # User had no password, set it now
            self.set_user_password(user_record["id"], password)

        user_record.pop("password_hash", None)
        return user_record

    def set_user_password(self, user_id: str, password: str):
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        query = f"UPDATE users SET password_hash = {ph} WHERE id = {ph}"
        cursor.execute(query, (hash_password(password), user_id))
        conn.commit()
        conn.close()

    def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        query = f"""
            UPDATE users
            SET display_name = COALESCE({ph}, display_name),
                wallet_address = COALESCE({ph}, wallet_address),
                bio = COALESCE({ph}, bio),
                avatar_color = COALESCE({ph}, avatar_color),
                streak_count = COALESCE({ph}, streak_count),
                total_earned_mon = COALESCE({ph}, total_earned_mon)
            WHERE id = {ph}
        """
        cursor.execute(query, (
            updates.get("display_name"),
            updates.get("wallet_address"),
            updates.get("bio"),
            updates.get("avatar_color"),
            updates.get("streak_count"),
            updates.get("total_earned_mon"),
            user_id
        ))
        conn.commit()
        conn.close()
        return self.get_user_by_identifier(user_id)

    def list_all_users(self) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users ORDER BY created_at ASC")
        rows = cursor.fetchall()
        conn.close()
        cleaned = []
        for r in rows:
            d = dict(r)
            d.pop("password_hash", None)
            cleaned.append(d)
        return cleaned

    # ================= STREAKS / CHALLENGES =================

    def create_streak(self, data: Dict[str, Any]) -> Dict[str, Any]:
        conn = self.get_connection()
        cursor = conn.cursor()
        streak_id = f"streak-{uuid.uuid4().hex[:8]}"
        invite_code = f"DRA-{uuid.uuid4().hex[:6].upper()}"
        now = time.time()
        ph = "%s" if self.is_postgres else "?"

        query = f"""
            INSERT INTO streaks (id, title, description, kind, duration, daily_stake, creator_id, creator_address, vault_contract, invite_code, required_approvals, start_time, created_at, onchain_id)
            VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
        """
        cursor.execute(query, (
            streak_id,
            data.get("title", "Kindle your flame"),
            data.get("description", "Daily commitment on Monad"),
            data.get("kind", "fitness"),
            int(data.get("duration", 7)),
            str(data.get("daily_stake", "0.05")),
            data.get("creator_id", "creator"),
            data.get("creator_address"),
            data.get("vault_contract", "0x77547711ea2726F16C8BCeDD37a347C139D346E7"),
            invite_code,
            int(data.get("required_approvals", 1)),
            now,
            now,
            data.get("onchain_id")
        ))

        # Add creator as initial member
        member_id = f"mem-{uuid.uuid4().hex[:8]}"
        m_query = f"""
            INSERT INTO streak_members (id, streak_id, user_id, wallet_address, role, completed_days, joined_at)
            VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
        """
        cursor.execute(m_query, (
            member_id,
            streak_id,
            data.get("creator_id", "creator"),
            data.get("creator_address"),
            "creator",
            0,
            now
        ))

        conn.commit()
        conn.close()
        return self.get_streak(streak_id) # type: ignore

    def get_streak(self, streak_id: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        cursor.execute(f"SELECT * FROM streaks WHERE id = {ph}", (streak_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        streak = dict(row)

        # Get participants / members
        cursor.execute(f"SELECT * FROM streak_members WHERE streak_id = {ph}", (streak_id,))
        members = [dict(m) for m in cursor.fetchall()]
        conn.close()

        streak["members"] = members
        streak["member_count"] = len(members)
        streak["participants"] = [m["wallet_address"] or m["user_id"] for m in members]
        return streak

    def get_streak_by_invite(self, code: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        cursor.execute(f"SELECT * FROM streaks WHERE UPPER(invite_code) = {ph}", (code.strip().upper(),))
        row = cursor.fetchone()
        conn.close()
        if row:
            return self.get_streak(row["id"])
        return None

    def join_streak(self, streak_id: str, user_id: str, wallet_address: Optional[str] = None) -> Dict[str, Any]:
        streak = self.get_streak(streak_id)
        if not streak:
            raise ValueError(f"Streak {streak_id} not found")

        # Check if already a member
        for m in streak["members"]:
            if m["user_id"] == user_id or (wallet_address and m.get("wallet_address") == wallet_address):
                return streak

        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        member_id = f"mem-{uuid.uuid4().hex[:8]}"
        m_query = f"""
            INSERT INTO streak_members (id, streak_id, user_id, wallet_address, role, completed_days, joined_at)
            VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
        """
        cursor.execute(m_query, (
            member_id,
            streak_id,
            user_id,
            wallet_address,
            "member",
            0,
            time.time()
        ))
        conn.commit()
        conn.close()
        return self.get_streak(streak_id) # type: ignore

    def delete_streak(self, streak_id: str, user_id: str) -> str:
        """Creators delete the whole streak; other members only leave it."""
        streak = self.get_streak(streak_id)
        if not streak:
            raise ValueError(f"Streak {streak_id} not found")

        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        if streak["creator_id"] == user_id:
            cursor.execute(
                f"DELETE FROM check_in_approvals WHERE proof_id IN (SELECT id FROM check_ins WHERE streak_id = {ph})",
                (streak_id,),
            )
            for table in ("check_ins", "invitations", "feed_events", "streak_members"):
                cursor.execute(f"DELETE FROM {table} WHERE streak_id = {ph}", (streak_id,))
            cursor.execute(f"DELETE FROM streaks WHERE id = {ph}", (streak_id,))
            result = "deleted"
        else:
            cursor.execute(
                f"DELETE FROM streak_members WHERE streak_id = {ph} AND user_id = {ph}",
                (streak_id, user_id),
            )
            result = "left"
        conn.commit()
        conn.close()
        return result

    def list_streaks(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"

        if user_id:
            query = f"""
                SELECT DISTINCT s.* FROM streaks s
                JOIN streak_members sm ON s.id = sm.streak_id
                WHERE sm.user_id = {ph} OR s.creator_id = {ph}
                ORDER BY s.created_at DESC
            """
            cursor.execute(query, (user_id, user_id))
        else:
            cursor.execute("SELECT * FROM streaks ORDER BY created_at DESC")

        rows = cursor.fetchall()
        conn.close()
        results = []
        for r in rows:
            st = self.get_streak(r["id"])
            if st:
                results.append(st)
        return results

    # ================= CHECK-INS & PROOFS =================

    def create_checkin(self, data: Dict[str, Any]) -> Dict[str, Any]:
        conn = self.get_connection()
        cursor = conn.cursor()
        proof_id = f"proof-{uuid.uuid4().hex[:8]}"
        now = time.time()
        ph = "%s" if self.is_postgres else "?"

        query = f"""
            INSERT INTO check_ins (id, streak_id, user_id, participant_address, day_index, check_in_date, proof_type, image_url, ipfs_uri, notes, status, required_approvals, created_at)
            VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
        """
        cursor.execute(query, (
            proof_id,
            data["streak_id"],
            data.get("user_id", "anon"),
            data.get("participant_address"),
            int(data.get("day", 1)),
            data.get("check_in_date", time.strftime("%Y-%m-%d")),
            data.get("proof_type", "custom"),
            data.get("image_url", ""),
            data.get("ipfs_uri", ""),
            data.get("notes", ""),
            data.get("status", "PENDING"),
            int(data.get("required_approvals", 1)),
            now
        ))
        conn.commit()
        conn.close()
        return self.get_checkin(proof_id) # type: ignore

    def get_checkin(self, proof_id: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        cursor.execute(f"SELECT * FROM check_ins WHERE id = {ph}", (proof_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        res = dict(row)

        cursor.execute(f"SELECT * FROM check_in_approvals WHERE proof_id = {ph}", (proof_id,))
        res["approvals"] = [dict(a) for a in cursor.fetchall()]
        conn.close()
        return res

    def list_pending_checkins(self, streak_id: Optional[str] = None, exclude_user: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"

        if streak_id:
            cursor.execute(f"SELECT * FROM check_ins WHERE streak_id = {ph} AND status = 'PENDING' ORDER BY created_at DESC", (streak_id,))
        else:
            cursor.execute("SELECT * FROM check_ins WHERE status = 'PENDING' ORDER BY created_at DESC")

        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()

        results = []
        streaks: Dict[str, Optional[Dict[str, Any]]] = {}
        for r in rows:
            if exclude_user and (r["user_id"] == exclude_user or r.get("participant_address") == exclude_user):
                continue
            if r["streak_id"] not in streaks:
                streaks[r["streak_id"]] = self.get_streak(r["streak_id"])
            streak = streaks[r["streak_id"]]
            # Only fellow members can approve a proof on-chain.
            if exclude_user and streak and exclude_user not in [m["user_id"] for m in streak["members"]]:
                continue
            item = self.get_checkin(r["id"])
            if item:
                item["onchain_id"] = streak.get("onchain_id") if streak else None
                results.append(item)
        return results

    def add_approval(self, proof_id: str, approver_id: str, approver_address: Optional[str], approved: bool, comment: str) -> Dict[str, Any]:
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        appr_id = f"appr-{uuid.uuid4().hex[:8]}"

        query = f"""
            INSERT INTO check_in_approvals (id, proof_id, approver_id, approver_address, approved, comment, created_at)
            VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
        """
        cursor.execute(query, (
            appr_id,
            proof_id,
            approver_id,
            approver_address,
            1 if approved else 0,
            comment,
            time.time()
        ))

        # Check total approvals
        cursor.execute(f"SELECT count(*) as count FROM check_in_approvals WHERE proof_id = {ph} AND approved = 1", (proof_id,))
        cnt = cursor.fetchone()["count"]

        # Check required approvals on check-in
        cursor.execute(f"SELECT required_approvals, streak_id, user_id FROM check_ins WHERE id = {ph}", (proof_id,))
        ci = cursor.fetchone()
        is_approved = False
        if ci and cnt >= ci["required_approvals"]:
            is_approved = True
            cursor.execute(f"UPDATE check_ins SET status = 'APPROVED' WHERE id = {ph}", (proof_id,))
            # Update member completed days
            cursor.execute(f"UPDATE streak_members SET completed_days = completed_days + 1 WHERE streak_id = {ph} AND user_id = {ph}", (ci["streak_id"], ci["user_id"]))
            cursor.execute(f"UPDATE users SET streak_count = streak_count + 1, total_earned_mon = total_earned_mon + 0.05 WHERE id = {ph}", (ci["user_id"],))

        conn.commit()
        conn.close()
        return {
            "proof_id": proof_id,
            "status": "APPROVED" if is_approved else "PENDING",
            "approvals_count": cnt,
            "is_unlocked": is_approved
        }

    # ================= FEED EVENTS =================

    def add_feed_event(self, event: Dict[str, Any]):
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        eid = event.get("id") or f"evt-{uuid.uuid4().hex[:8]}"
        query = f"""
            INSERT INTO feed_events (id, streak_id, event_type, title, description, actor, target_user, day, amount, timestamp, tx_hash, proof_image)
            VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
        """
        cursor.execute(query, (
            eid,
            event.get("streak_id", ""),
            event.get("event_type", "INFO"),
            event.get("title", ""),
            event.get("description", ""),
            event.get("actor", ""),
            event.get("target_user"),
            event.get("day"),
            event.get("amount"),
            event.get("timestamp", time.time()),
            event.get("tx_hash"),
            event.get("proof_image")
        ))
        conn.commit()
        conn.close()

    def get_feed_events(self, streak_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        if streak_id:
            cursor.execute(f"SELECT * FROM feed_events WHERE streak_id = {ph} ORDER BY timestamp DESC LIMIT {limit}", (streak_id,))
        else:
            cursor.execute(f"SELECT * FROM feed_events ORDER BY timestamp DESC LIMIT {limit}")
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return rows

    # ================= INVITATIONS =================

    def create_invitation(self, streak_id: str, inviter_id: str, invitee_identifier: str) -> Dict[str, Any]:
        invitee = self.get_user_by_identifier(invitee_identifier)
        if not invitee:
            raise ValueError(f"User '{invitee_identifier}' not found")

        streak = self.get_streak(streak_id)
        if not streak:
            raise ValueError(f"Streak '{streak_id}' not found")

        for m in streak.get("members", []):
            if m["user_id"] == invitee["id"] or (invitee.get("wallet_address") and m.get("wallet_address") == invitee["wallet_address"]):
                raise ValueError(f"{invitee['display_name']} is already enrolled in this streak!")

        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"

        cursor.execute(f"SELECT * FROM invitations WHERE streak_id = {ph} AND invitee_id = {ph} AND status = 'pending'", (streak_id, invitee["id"]))
        existing = cursor.fetchone()
        if existing:
            conn.close()
            return dict(existing)

        inv_id = f"inv-{uuid.uuid4().hex[:8]}"
        now = time.time()
        query = f"""
            INSERT INTO invitations (id, streak_id, inviter_id, invitee_id, status, created_at)
            VALUES ({ph}, {ph}, {ph}, {ph}, 'pending', {ph})
        """
        cursor.execute(query, (inv_id, streak_id, inviter_id, invitee["id"], now))
        conn.commit()
        conn.close()

        self.add_feed_event({
            "streak_id": streak_id,
            "event_type": "INVITED",
            "title": "💌 STREAK INVITATION SENT",
            "description": f"Invited {invitee['display_name']} (@{invitee['username']}) to join '{streak['title']}'!",
            "actor": inviter_id,
            "target_user": invitee["id"]
        })

        return {
            "id": inv_id,
            "streak_id": streak_id,
            "inviter_id": inviter_id,
            "invitee_id": invitee["id"],
            "invitee_name": invitee["display_name"],
            "invitee_username": invitee["username"],
            "status": "pending",
            "created_at": now
        }

    def list_user_invitations(self, user_id: str) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        query = f"""
            SELECT i.id, i.streak_id, i.inviter_id, i.invitee_id, i.status, i.created_at,
                   s.title as streak_title, s.description as streak_description,
                   s.kind as streak_kind, s.duration as streak_duration, s.daily_stake as streak_stake,
                   s.invite_code as streak_invite_code,
                   u.display_name as inviter_name, u.username as inviter_username, u.avatar_color as inviter_color
            FROM invitations i
            JOIN streaks s ON i.streak_id = s.id
            LEFT JOIN users u ON i.inviter_id = u.id OR i.inviter_id = u.wallet_address
            WHERE i.invitee_id = {ph} AND i.status = 'pending'
            ORDER BY i.created_at DESC
        """
        cursor.execute(query, (user_id,))
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return rows

    def respond_invitation(self, invitation_id: str, accept: bool, user_id: Optional[str] = None, wallet_address: Optional[str] = None) -> Dict[str, Any]:
        conn = self.get_connection()
        cursor = conn.cursor()
        ph = "%s" if self.is_postgres else "?"
        cursor.execute(f"SELECT * FROM invitations WHERE id = {ph}", (invitation_id,))
        inv = cursor.fetchone()
        if not inv:
            conn.close()
            raise ValueError("Invitation not found")
        inv_dict = dict(inv)

        new_status = "accepted" if accept else "declined"
        cursor.execute(f"UPDATE invitations SET status = {ph} WHERE id = {ph}", (new_status, invitation_id))
        conn.commit()
        conn.close()

        streak = self.get_streak(inv_dict["streak_id"])

        if accept:
            actual_user_id = user_id or inv_dict["invitee_id"]
            self.join_streak(inv_dict["streak_id"], actual_user_id, wallet_address)
            self.add_feed_event({
                "streak_id": inv_dict["streak_id"],
                "event_type": "JOINED",
                "title": "🤝 INVITATION ACCEPTED",
                "description": f"Challenge invitation accepted for '{streak['title'] if streak else 'Challenge'}'!",
                "actor": wallet_address or actual_user_id,
                "day": 1
            })

        return {
            "invitation_id": invitation_id,
            "status": new_status,
            "streak": streak
        }

db = DatabaseManager()
