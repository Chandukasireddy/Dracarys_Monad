# Dracarys 🐉🔥 - Verification Engine & API (Monad)

> **Social Habit Staking on Monad Testnet (Chain ID 10143)**  
> Friends bet real micro-cents (€0.10) on daily habits. Complete your daily streak to stream your money back in sub-second time; miss a day and your dime splits among your friends.

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python run.py
# Or with uvicorn directly:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive OpenAPI / Swagger documentation will be available at:  
👉 **`http://127.0.0.1:8000/docs`**

### 3. Run Integration Tests
```bash
python test_api.py
```

---

## 📡 Core API Endpoints

### 1. Upload Habit Proof
* **Route:** `POST /api/streaks/upload-proof`
* **Format:** `multipart/form-data`
* **Fields:**
  * `file`: Photo file (gym selfies, step counters, reading pages)
  * `streak_id`: Challenge identifier (e.g. `streak-berlin-7d`)
  * `participant`: Ethereum/Monad wallet address (`0x...`)
  * `day`: Day index (e.g. `1`, `2`)
  * `proof_type`: `gym` | `steps` | `reading` | `custom`
  * `notes`: Optional comment / caption
* **Response:**
  ```json
  {
    "proof_id": "proof-7b19a2c4",
    "streak_id": "streak-berlin-7d",
    "participant": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "day": 2,
    "proof_type": "gym",
    "image_url": "/uploads/streak-berlin-7d_day2_0x90F79b_1774697520.jpg",
    "ipfs_uri": "ipfs://bafkreib62f689c30c8dcab05fmonaddracarys",
    "metadata_uri": "/uploads/streak-berlin-7d_day2_0x90F79b_1774697520.jpg.json",
    "uploaded_at": 1774697520.12
  }
  ```

---

### 2. Verify & Peer Approval
* **Route:** `POST /api/streaks/verify`
* **Payload:**
  ```json
  {
    "streak_id": "streak-berlin-7d",
    "proof_id": "proof-7b19a2c4",
    "approver": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "approved": true,
    "comment": "Form looks crisp! Verified 🔥"
  }
  ```
* **Behavior:**
  * Validates that the approver is an enrolled friend in the challenge.
  * Prevents self-approval.
  * When positive approval quorum is reached (e.g. 2 friends), marks status `APPROVED` and dispatches the sub-second payout event.

---

### 3. Real-Time Social Feed
* **Route:** `GET /api/streaks/{id}/feed`
* **Returns:** Live activity feed sorted by newest events first:
  * 🔥 `KINDLED` — User checked in and uploaded proof.
  * 👁️ `APPROVED` — Peer verified proof.
  * ⚡ `STAKE_PAID` — Monad sub-second €0.10 micro-payout executed.
  * 💀 `BURNED` — Participant missed 24h cutoff, burned on-chain.

---

### 4. Pending Approvals
* **Route:** `GET /api/streaks/{id}/pending-approvals`
* **Returns:** All check-ins currently awaiting peer votes, including image preview URL, current approval tally vs. required threshold, and remaining countdown until 24-hour cutoff.

---

### 5. Deadline & Slacker Burn Helper
* **Route:** `GET /api/streaks/{id}/slackers`
* **Behavior:**
  * Computes exact 24-hour deadlines: $\text{Cutoff}_d = \text{Start} + (d \times 86,400\text{s})$.
  * Flags participants who missed the deadline without an approved check-in.
  * Generates the contract call payload ready for execution:
    * **Function:** `DracarysEscrow.burnSlacker(uint256 streakId, address slacker, uint256 day)`
    * **Calldata Preview:** Formatted 4-byte selector + zero-padded arguments.
