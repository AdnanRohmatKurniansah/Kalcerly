# KALCERLY — Backend API

> **Make Movement a Culture.**

Social fitness platform yang menggabungkan GPS tracking, AI activity verification, social features, dan blockchain reward via FIT Token.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js |
| Framework | Express.js + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT + Google OAuth + Email Verification |
| Wallet | SIWE / EIP-4361 + Reown AppKit |
| Blockchain | BNB Smart Chain Testnet (Chain ID: 97) |
| Email | Nodemailer (SMTP) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Development
npm run dev
```

---

## Environment Variables

```env
# App
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
APP_DOMAIN=app.kalcerly.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/kalcerly

# JWT
JWT_ACCESS_SECRET=secret
JWT_REFRESH_SECRET=secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@kalcerly.com
EMAIL_VERIFICATION_URL=http://localhost:3000/verify-email

# Blockchain (BNB Smart Chain Testnet)
BLOCKCHAIN_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
BLOCKCHAIN_PRIVATE_KEY=
BLOCKCHAIN_CHAIN_ID=97
CONTRACT_FIT_TOKEN=0x...
CONTRACT_ACTIVITY_PROOF=0x...
CONTRACT_REWARD_MANAGER=0x...
CONTRACT_CHALLENGE_MANAGER=0x...

AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=gsk_...
AI_MODEL=llama-3.3-70b-versatile
```

---

## Authentication Flow

```
Email + Password          Google OAuth
       │                       │
   Register               Google Sign-In
       │                       │
 Email Verification            │
       │                       │
   Verified Email              │
       └───────────┬───────────┘
                   │
            Access Token +
            Refresh Token
                   │
            Use Application
                   │
           Blockchain Feature?
                   │
            Connect Wallet (SIWE)
                   │
            Wallet Linked (optional)
```

- Email + Password wajib verifikasi email sebelum bisa login
- Google OAuth langsung dapat session tanpa verification
- Wallet bersifat **optional**, hanya diperlukan untuk fitur blockchain

Token lifetime:

| Token | Lifetime |
|---|---|
| Access Token | 15 menit |
| Refresh Token | 30 hari |
| Email Verification Token | 24 jam |

---

# API Documentation

Base URL: `/api`

Response format:

```json
// Success
{ "success": true, "message": "...", "data": {} }

// Error
{ "success": false, "message": "...", "errors": [...] }
```

---

## Auth

### POST `/api/auth/register`

Daftarkan akun baru. Tidak membuat session — user harus verifikasi email terlebih dahulu.

**Request**
```json
{
  "fullname": "Adnan Rohmat",
  "email": "adnan@example.com",
  "password": "password123"
}
```

**Response** `201`
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "requiresEmailVerification": true
  }
}
```

---

### POST `/api/auth/verify-email`

Verifikasi email menggunakan token yang dikirim ke email.

**Request**
```json
{
  "token": "raw-verification-token"
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error** `400` — token invalid / expired / sudah digunakan
```json
{
  "success": false,
  "message": "Invalid or expired verification token",
  "errors": "INVALID_TOKEN"
}
```

---

### POST `/api/auth/resend-verification`

Kirim ulang email verifikasi. Token lama diinvalidate otomatis.

Rate limited: **3 request per 15 menit**.

**Request**
```json
{
  "email": "adnan@example.com"
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

### POST `/api/auth/login`

Login dengan email + password. User yang belum verifikasi email akan ditolak.

**Request**
```json
{
  "email": "adnan@example.com",
  "password": "password123"
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Login successfully",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "uuid",
      "fullname": "Adnan Rohmat",
      "email": "adnan@example.com",
      "avatarUrl": null
    }
  }
}
```

**Error** `401` — credentials salah
```json
{
  "success": false,
  "message": "Invalid credentials",
  "errors": "INVALID_CREDENTIALS"
}
```

**Error** `403` — email belum diverifikasi
```json
{
  "success": false,
  "message": "Email verification is required before login.",
  "errors": "EMAIL_NOT_VERIFIED"
}
```

---

### POST `/api/auth/google`

Login atau register via Google OAuth.

**Request**
```json
{
  "credential": "google-id-token-from-client"
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "uuid",
      "fullname": "Adnan Rohmat",
      "email": "adnan@gmail.com",
      "avatarUrl": "https://..."
    }
  }
}
```

---

### POST `/api/auth/refresh`

Dapatkan access token baru. Refresh token lama direvoke (rotation).

**Request**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### POST `/api/auth/logout`

🔒 **Requires Bearer token**

Revoke session saat ini.

**Headers**
```
Authorization: Bearer <access_token>
```

**Request**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET `/api/auth/me`

🔒 **Requires Bearer token**

Ambil data user yang sedang login.

**Headers**
```
Authorization: Bearer <access_token>
```

**Response** `200`
```json
{
  "success": true,
  "message": "User data",
  "data": {
    "id": "uuid",
    "fullname": "Adnan Rohmat",
    "email": "adnan@example.com",
    "avatarUrl": null,
    "bio": null,
    "dateOfBirth": null,
    "gender": null,
    "location": null,
    "isPrivate": false,
    "emailVerified": true
  }
}
```

---

### PATCH `/api/auth/me`

🔒 **Requires Bearer token**

Update profile user. Semua field opsional.

**Headers**
```
Authorization: Bearer <access_token>
```

**Request**
```json
{
  "fullname": "Adnan Baru",
  "bio": "Saya suka lari pagi.",
  "dateOfBirth": "1999-05-20",
  "gender": "male",
  "location": "Yogyakarta, Indonesia",
  "isPrivate": false
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "fullname": "Adnan Baru",
    "email": "adnan@example.com",
    "avatarUrl": null,
    "bio": "Saya suka lari pagi.",
    "dateOfBirth": "1999-05-20",
    "gender": "male",
    "location": "Yogyakarta, Indonesia",
    "isPrivate": false,
    "emailVerified": true
  }
}
```

---

## Wallet

Wallet bersifat **optional** — hanya diperlukan untuk fitur blockchain (FIT Token reward, Activity Proof).

User harus **login terlebih dahulu** sebelum melakukan wallet linking. **Semua endpoint wallet memerlukan Bearer token.**

### Wallet Linking Flow

```
Flutter (Reown AppKit / WalletConnect)
       │
       ▼
User selects wallet (MetaMask, Trust, OKX, dll)
       │
       ▼
POST /api/wallet/nonce  (authenticated)
       │
       ▼
Generate SIWE message with nonce
       │
       ▼
User signs message in wallet app
       │
       ▼
POST /api/wallet/verify  (authenticated)
       │
       ▼
Backend verifies signature (viem)
       │
       ▼
Wallet linked to user account
```

**Private key dan seed phrase tidak pernah dikirim atau disimpan backend.**

Nonce bersifat single-use dan expire dalam **10 menit**. Nonce lama diinvalidate otomatis saat request nonce baru untuk address yang sama.

Wallet pertama yang dihubungkan otomatis menjadi **primary wallet**. Jika primary wallet dihapus, wallet berikutnya otomatis menjadi primary.

---

### POST `/api/wallet/nonce`

🔒 **Requires Bearer token**

Generate SIWE nonce untuk proses wallet ownership verification.

**Headers**
```
Authorization: Bearer <access_token>
```

**Request**
```json
{
  "address": "0xABC123..."
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Nonce generated",
  "data": {
    "nonce": "a1b2c3d4e5f6...",
    "expiresAt": "2026-09-06T10:15:00.000Z",
    "domain": "app.kalcerly.com",
    "chainId": 97
  }
}
```

---

### GET `/api/wallet`

🔒 **Requires Bearer token**

Ambil daftar wallet yang terhubung ke akun.

**Headers**
```
Authorization: Bearer <access_token>
```

**Response** `200`
```json
{
  "success": true,
  "message": "Wallets retrieved",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "address": "0xabc123...",
      "chainId": 97,
      "isPrimary": true,
      "verifiedAt": "2026-09-06T10:00:00.000Z",
      "createdAt": "2026-09-06T10:00:00.000Z",
      "updatedAt": "2026-09-06T10:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/wallet/verify`

🔒 **Requires Bearer token**

Verifikasi kepemilikan wallet via SIWE signature dan hubungkan ke akun.

**Headers**
```
Authorization: Bearer <access_token>
```

**Request**
```json
{
  "address": "0xABC123...",
  "signature": "0xSIG...",
  "message": "app.kalcerly.com wants you to sign in with your Ethereum account:\n0xABC123...\n\nNonce: a1b2c3d4",
  "chainId": 97
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Wallet verified and linked",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "address": "0xabc123...",
    "chainId": 97,
    "isPrimary": true,
    "verifiedAt": "2026-09-06T10:00:00.000Z"
  }
}
```

**Error** `400` — nonce invalid/expired
```json
{ "success": false, "message": "Invalid or expired nonce", "errors": "INVALID_NONCE" }
```

**Error** `401` — signature tidak valid
```json
{ "success": false, "message": "Invalid signature", "errors": "INVALID_SIGNATURE" }
```

**Error** `409` — wallet sudah dimiliki akun lain
```json
{ "success": false, "message": "Wallet is already linked to another account", "errors": "WALLET_OWNED_BY_OTHER" }
```

---

### PATCH `/api/wallet/primary`

🔒 **Requires Bearer token**

Set wallet sebagai primary wallet.

**Headers**
```
Authorization: Bearer <access_token>
```

**Request**
```json
{
  "walletId": "uuid"
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Primary wallet updated",
  "data": {
    "id": "uuid",
    "address": "0xabc123...",
    "chainId": 97,
    "isPrimary": true,
    "verifiedAt": "2026-09-06T10:00:00.000Z"
  }
}
```

---

### DELETE `/api/wallet/:id`

🔒 **Requires Bearer token**

Hapus wallet dari akun. Jika wallet yang dihapus adalah primary, wallet lain otomatis menjadi primary.

**Headers**
```
Authorization: Bearer <access_token>
```

**Response** `200`
```json
{
  "success": true,
  "message": "Wallet deleted successfully"
}
```

---

## Activity

Activity tracking adalah inti dari Kalcerly. User mencatat aktivitas olahraga (walking, running, cycling), mengupload GPS points, lalu mengajukan ke proses verifikasi.

**Status lifecycle:**
```
PENDING → VERIFYING → VERIFIED
                    → NEEDS_REVIEW
                    → REJECTED
```

**Flow:**
```
POST /api/activities          (buat activity, status = PENDING)
       ↓
POST /api/activities/:id/points  (upload GPS points, bisa berulang)
       ↓
POST /api/activities/:id/verify  (submit untuk verifikasi, status → VERIFYING)
       ↓
AI Verification (INTERNAL/provider)
       ↓
status → VERIFIED / NEEDS_REVIEW / REJECTED
       ↓
Jika VERIFIED + wallet terhubung → Blockchain proof + FIT Reward
```

**Semua endpoint activity memerlukan Bearer token.**

### AI Verification

Saat `POST /api/activities/:id/verify` dipanggil, backend langsung menjalankan AI verification dan mengembalikan hasilnya dalam satu request.

**Provider yang didukung — dikonfigurasi via `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`:**

| Provider | `AI_BASE_URL` |
|---|---|
| **Groq** | `https://api.groq.com/openai/v1` |
| **OpenAI** | `https://api.openai.com/v1` |
| **Together AI** | `https://api.together.xyz/v1` |
| **Anyscale** | `https://api.endpoints.anyscale.com/v1` |
| **LM Studio (local)** | `http://localhost:1234/v1` |
| **Ollama (local)** | `http://localhost:11434/v1` |
| Semua OpenAI-compatible | custom URL |

Contoh konfigurasi Groq di `.env`:
```env
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=gsk_...
AI_MODEL=llama-3.3-70b-versatile
```

Selain itu, **Gemini** didukung sebagai provider alternate (format API berbeda) — dikonfigurasi dengan `GEMINI_API_KEY` dan `GEMINI_MODEL`.

**Priority fallback:**
```
OpenAI-compatible (AI_API_KEY) → Gemini (GEMINI_API_KEY) → Rule-based fallback
```

**Rule-based fallback** aktif otomatis jika semua provider tidak dikonfigurasi atau gagal. Batas kecepatan per activity type:

| Type | Normal | Hard Max |
|---|---|---|
| WALKING | ≤ 2.5 m/s | 3.5 m/s |
| RUNNING | ≤ 6.5 m/s | 9.0 m/s |
| CYCLING | ≤ 15.0 m/s | 22.0 m/s |

Backend mengirim sample GPS points (max 20 titik) ke AI untuk menekan biaya token. AI menganalisis konsistensi kecepatan, jarak, durasi, dan pola GPS.

---

🔒 **Requires Bearer token**

Buat activity baru. Status awal: `PENDING`.

**Request**
```json
{
  "type": "RUNNING",
  "startedAt": "2026-09-06T07:00:00.000Z",
  "endedAt": "2026-09-06T07:45:00.000Z",
  "distanceMeters": 8000,
  "durationSeconds": 2700,
  "elevationMeters": 45,
  "calories": 380,
  "averagePaceSeconds": 338,
  "averageSpeedMps": "2.963",
  "title": "Morning Run",
  "startLatitude": "-7.795600",
  "startLongitude": "110.369500",
  "endLatitude": "-7.801200",
  "endLongitude": "110.374100"
}
```

Field wajib: `type`, `startedAt`, `endedAt`, `distanceMeters`, `durationSeconds`.

Type valid: `WALKING`, `RUNNING`, `CYCLING`.

`endedAt` harus setelah `startedAt`.

**Response** `201`
```json
{
  "success": true,
  "message": "Activity created",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "type": "RUNNING",
    "status": "PENDING",
    "distanceMeters": 8000,
    "durationSeconds": 2700,
    "startedAt": "2026-09-06T07:00:00.000Z",
    "endedAt": "2026-09-06T07:45:00.000Z"
  }
}
```

---

### GET `/api/activities`

🔒 **Requires Bearer token**

Ambil daftar activity milik user, diurutkan terbaru.

**Query params**
```
page  — default 1
limit — default 20, max 100
```

**Response** `200`
```json
{
  "success": true,
  "message": "Activities retrieved",
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### GET `/api/activities/:id`

🔒 **Requires Bearer token**

Ambil detail activity beserta GPS points, verification result, dan statistics.

**Response** `200`
```json
{
  "success": true,
  "message": "Activity retrieved",
  "data": {
    "id": "uuid",
    "type": "RUNNING",
    "status": "VERIFIED",
    "activityHash": "0x...",
    "points": [...],
    "verification": {
      "result": "VERIFIED",
      "provider": "INTERNAL",
      "confidence": "0.9821"
    },
    "stats": null
  }
}
```

---

### PATCH `/api/activities/:id`

🔒 **Requires Bearer token**

Update `title` atau `description`. Tidak bisa edit activity berstatus `VERIFIED`.

**Request**
```json
{
  "title": "Sunday Long Run",
  "description": "Recovery pace"
}
```

---

### DELETE `/api/activities/:id`

🔒 **Requires Bearer token**

Hapus activity. Tidak bisa menghapus activity berstatus `VERIFIED`.

**Response** `200`
```json
{ "success": true, "message": "Activity deleted" }
```

---

### POST `/api/activities/:id/points`

🔒 **Requires Bearer token**

Upload GPS points untuk activity. Bisa dipanggil berkali-kali. Max 5000 points per request.

Tidak bisa upload ke activity yang sudah `VERIFIED` atau `REJECTED`.

**Request**
```json
{
  "points": [
    {
      "sequence": 0,
      "latitude": "-7.795600",
      "longitude": "110.369500",
      "altitudeMeters": "115.50",
      "accuracyMeters": "5.00",
      "speedMps": "2.50",
      "timestamp": "2026-09-06T07:00:00.000Z"
    },
    {
      "sequence": 1,
      "latitude": "-7.796100",
      "longitude": "110.369800",
      "timestamp": "2026-09-06T07:00:05.000Z"
    }
  ]
}
```

Field wajib per point: `sequence`, `latitude`, `longitude`, `timestamp`.

**Response** `200`
```json
{
  "success": true,
  "message": "GPS points uploaded",
  "data": { "uploaded": 2, "total": 2 }
}
```

---

### GET `/api/activities/:id/points`

🔒 **Requires Bearer token**

Ambil seluruh GPS points activity, diurutkan berdasarkan sequence.

**Response** `200`
```json
{
  "success": true,
  "message": "GPS points retrieved",
  "data": [
    {
      "id": 1,
      "activityId": "uuid",
      "sequence": 0,
      "latitude": "-7.795600",
      "longitude": "110.369500",
      "altitudeMeters": "115.50",
      "speedMps": "2.50",
      "timestamp": "2026-09-06T07:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/activities/:id/verify`

🔒 **Requires Bearer token**

Submit activity untuk proses verifikasi. Syarat: status `PENDING` dan sudah ada GPS points.

Activity hash (SHA-256 dari data utama) dibuat saat submit — digunakan nanti untuk blockchain proof.

Status berubah ke `VERIFYING`. Verification result (`VERIFIED` / `NEEDS_REVIEW` / `REJECTED`) diproses secara asinkron oleh AI.

**Response** `200`
```json
{
  "success": true,
  "message": "Activity submitted for verification",
  "data": {
    "id": "uuid",
    "status": "VERIFYING",
    "activityHash": "0xabc123..."
  }
}
```

**Error** `400` — tidak ada GPS points
```json
{ "success": false, "message": "Activity has no GPS points. Upload GPS data before verifying.", "errors": "NO_GPS_POINTS" }
```

**Error** `400` — status bukan PENDING
```json
{ "success": false, "message": "Only PENDING activities can be submitted for verification", "errors": "INVALID_STATUS" }
```

---

## Routes

Route adalah rute olahraga yang dapat dibuat, dibagikan, dan disimpan oleh user. Route bersifat publik atau privat.

**Business rules:**
- Hanya creator yang dapat update atau delete route miliknya
- `GET /api/routes` dan `GET /api/routes/:id` dapat diakses tanpa login (public routes)
- Create, update, delete, save/unsave memerlukan Bearer token

---

### GET `/api/routes`

List semua public routes, diurutkan berdasarkan `popularity_score` tertinggi.

**Query params:** `page` (default 1), `limit` (default 20, max 100)

**Response** `200`
```json
{
  "success": true,
  "message": "Routes retrieved",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Kali Urang Loop",
      "activityType": "RUNNING",
      "distanceMeters": 8500,
      "elevationMeters": 120,
      "difficulty": "MODERATE",
      "isPublic": true,
      "popularityScore": "15.0000"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### GET `/api/routes/:id`

Detail satu route. Dapat diakses tanpa login.

---

### POST `/api/routes`

🔒 **Requires Bearer token**

Buat route baru.

**Request**
```json
{
  "name": "Kali Urang Loop",
  "activityType": "RUNNING",
  "distanceMeters": 8500,
  "estimatedDurationSeconds": 3000,
  "elevationMeters": 120,
  "difficulty": "MODERATE",
  "startLatitude": "-7.795600",
  "startLongitude": "110.369500",
  "endLatitude": "-7.795600",
  "endLongitude": "110.369500",
  "polyline": "encodedPolylineString",
  "isPublic": true
}
```

Field wajib: `name`, `activityType`, `distanceMeters`, `startLatitude`, `startLongitude`, `endLatitude`, `endLongitude`.

`activityType`: `WALKING`, `RUNNING`, `CYCLING`.
`difficulty`: `EASY`, `MODERATE`, `HARD`, `EXPERT` (opsional).

**Response** `201`

---

### PATCH `/api/routes/:id`

🔒 **Requires Bearer token** — hanya creator route

Update field route. Semua field opsional.

---

### DELETE `/api/routes/:id`

🔒 **Requires Bearer token** — hanya creator route

---

### POST `/api/routes/:id/save`

🔒 **Requires Bearer token**

Simpan route ke koleksi saved routes user. Idempotent — tidak error jika sudah disimpan.

**Response** `201`
```json
{ "success": true, "message": "Route saved", "data": { "saved": true } }
```

---

### DELETE `/api/routes/:id/save`

🔒 **Requires Bearer token**

Hapus route dari saved routes.

**Response** `200`
```json
{ "success": true, "message": "Route unsaved", "data": { "saved": false } }
```

---

### GET `/api/routes/saved`

🔒 **Requires Bearer token**

List semua route yang disimpan user. **Endpoint ini harus dipanggil sebelum `GET /api/routes/:id`** pada path `/saved` agar tidak di-match sebagai `:id`.

**Query params:** `page`, `limit`

---

## Segments

Segment adalah bagian dari rute yang dapat dikompetisikan. User merekam waktu tempuh mereka pada suatu segment (*effort*) dari activity yang sudah `VERIFIED`.

**Business rules:**
- Hanya creator segment yang dapat menghapus segment
- Effort hanya dapat direkam dari activity berstatus `VERIFIED`
- Satu activity hanya dapat merekam satu effort per segment (UNIQUE: `segment_id, activity_id`)
- Effort diurutkan berdasarkan `elapsed_seconds` terpendek (tercepat = rank 1)
- Rank di-update otomatis setelah setiap effort baru masuk

---

### GET `/api/segments`

List semua public segments.

**Query params:** `page`, `limit`

---

### GET `/api/segments/:id`

Detail satu segment.

---

### POST `/api/segments`

🔒 **Requires Bearer token**

Buat segment baru.

**Request**
```json
{
  "name": "Jalan Kaliurang KM 5-7",
  "activityType": "CYCLING",
  "distanceMeters": 2000,
  "elevationGainMeters": 45,
  "startLatitude": "-7.730000",
  "startLongitude": "110.388000",
  "endLatitude": "-7.710000",
  "endLongitude": "110.390000",
  "polyline": "encodedPolyline",
  "isPublic": true
}
```

Field wajib: `name`, `activityType`, `distanceMeters`, start/end coordinates.

**Response** `201`

---

### DELETE `/api/segments/:id`

🔒 **Requires Bearer token** — hanya creator segment

---

### POST `/api/segments/:id/efforts`

🔒 **Requires Bearer token**

Rekam effort user pada segment dari activity yang sudah `VERIFIED`.

**Request**
```json
{
  "activityId": "uuid",
  "elapsedSeconds": 420,
  "averageSpeedMps": "4.762"
}
```

**Response** `201`
```json
{
  "success": true,
  "message": "Segment effort recorded",
  "data": {
    "id": "uuid",
    "segmentId": "uuid",
    "activityId": "uuid",
    "userId": "uuid",
    "elapsedSeconds": 420,
    "rank": 3,
    "isPersonalBest": true
  }
}
```

**Error** `400` — activity belum VERIFIED
```json
{ "success": false, "message": "Only VERIFIED activities can record segment efforts", "errors": "ACTIVITY_NOT_VERIFIED" }
```

**Error** `409` — effort sudah ada untuk activity ini
```json
{ "success": false, "message": "Effort already recorded for this activity on this segment", "errors": "EFFORT_EXISTS" }
```

---

### GET `/api/segments/:id/leaderboard`

Leaderboard segment — diurutkan berdasarkan waktu tercepat.

**Query params:** `limit` (default 20, max 100)

**Response** `200`
```json
{
  "success": true,
  "message": "Leaderboard retrieved",
  "data": {
    "segment": { "id": "uuid", "name": "Jalan Kaliurang KM 5-7" },
    "efforts": [
      { "rank": 1, "userId": "uuid", "elapsedSeconds": 380, "isPersonalBest": true },
      { "rank": 2, "userId": "uuid", "elapsedSeconds": 420 }
    ],
    "total": 15
  }
}
```

---

# Database Schema

Database: **PostgreSQL + Drizzle ORM** — semua ID menggunakan UUID.

---

## Authentication & Users

### `users`

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| fullname | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NULLABLE |
| password | TEXT | NULLABLE |
| email_verified_at | TIMESTAMP | NULLABLE |
| avatar_url | TEXT | NULLABLE |
| bio | TEXT | NULLABLE |
| date_of_birth | DATE | NULLABLE |
| gender | VARCHAR(20) | NULLABLE |
| location | VARCHAR(255) | NULLABLE |
| is_private | BOOLEAN | DEFAULT false |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

`password = NULL` untuk user Google. `email_verified_at = NULL` artinya belum terverifikasi.

---

### `email_verification_tokens`

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| token_hash | TEXT | NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| used_at | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Token disimpan sebagai hash SHA-256. Plaintext tidak pernah disimpan.

---

### `auth_accounts`

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| provider | VARCHAR(30) | NOT NULL |
| provider_account_id | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NULLABLE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

UNIQUE: `(provider, provider_account_id)`. Provider: `GOOGLE`.

---

### `sessions`

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| refresh_token_hash | TEXT | NOT NULL |
| device_id | VARCHAR | NULLABLE |
| device_name | VARCHAR | NULLABLE |
| expires_at | TIMESTAMP | NOT NULL |
| last_used_at | TIMESTAMP | NOT NULL |
| revoked_at | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

---

### `auth_nonces`

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| wallet_address | VARCHAR(42) | NOT NULL |
| nonce | VARCHAR(255) | UNIQUE NOT NULL |
| chain_id | INTEGER | NOT NULL |
| domain | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| used_at | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Single-use, expires dalam 10 menit.

---

## Wallet

### `wallets`

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| address | VARCHAR(42) | UNIQUE NOT NULL |
| chain_id | INTEGER | NOT NULL |
| is_primary | BOOLEAN | DEFAULT false |
| verified_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

UNIQUE: `(address, chain_id)`. MVP: 1 user → 0 atau 1 primary wallet.

---

## Activity

### `activities`

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| type | VARCHAR(20) | NOT NULL — `WALKING`, `RUNNING`, `CYCLING` |
| status | VARCHAR(30) | DEFAULT `PENDING` |
| title | VARCHAR(255) | NULLABLE |
| distance_meters | BIGINT | NOT NULL |
| duration_seconds | INTEGER | NOT NULL |
| elevation_meters | INTEGER | DEFAULT 0 |
| calories | INTEGER | DEFAULT 0 |
| average_pace_seconds | INTEGER | NULLABLE |
| average_speed_mps | NUMERIC | NULLABLE |
| max_speed_mps | NUMERIC | NULLABLE |
| start/end_latitude/longitude | NUMERIC | NULLABLE |
| activity_hash | VARCHAR(66) | NULLABLE |
| started_at | TIMESTAMP | NOT NULL |
| ended_at | TIMESTAMP | NOT NULL |
| verified_at | TIMESTAMP | NULLABLE |
| rejected_at | TIMESTAMP | NULLABLE |
| created_at / updated_at | TIMESTAMP | NOT NULL |

Status: `PENDING` → `VERIFYING` → `VERIFIED` / `REJECTED` / `NEEDS_REVIEW`

---

### `activity_points`

GPS points off-chain. UNIQUE: `(activity_id, sequence)`.

### `activity_verifications`

Hasil AI verification per activity. UNIQUE per activity.

### `activity_statistics`

Kalkulasi statistik per activity. UNIQUE per activity.

### `activity_splits`

Split per km/distance. UNIQUE: `(activity_id, split_number)`.

### `activity_proofs`

Link activity ke blockchain proof. UNIQUE per activity.

---

## Blockchain

### `blockchain_transactions`

Tracking semua transaksi on-chain yang dibuat backend.

Type: `CREATE_ACTIVITY_PROOF`, `REWARD_ACTIVITY`, `COMPLETE_CHALLENGE`, `CLAIM_CHALLENGE_REWARD`, `OTHER`

Status: `PENDING` → `SUBMITTED` → `CONFIRMED` / `FAILED`

### `blockchain_contracts`

Konfigurasi 4 smart contract MVP: `FITToken`, `ActivityProof`, `RewardManager`, `ChallengeManager`.

---

## Routes & Map

### `routes`

| Column | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| name | VARCHAR(255) | NOT NULL |
| activity_type | VARCHAR(20) | NOT NULL |
| distance_meters | BIGINT | NOT NULL |
| elevation_meters | INTEGER | DEFAULT 0 |
| difficulty | VARCHAR(20) | NULLABLE |
| polyline | TEXT | NULLABLE |
| is_public | BOOLEAN | DEFAULT true |
| popularity_score | NUMERIC | DEFAULT 0 |
| start/end lat/lng | NUMERIC | NOT NULL |
| created_at / updated_at | TIMESTAMP | NOT NULL |

### `route_points` — GPS points rute. UNIQUE: `(route_id, sequence)`.
### `route_waypoints` — Waypoints rute.
### `saved_routes` — Rute yang disimpan user. UNIQUE: `(user_id, route_id)`.

---

## Segments & Efforts

### `segments`

Segmen rute yang dapat dikompetisikan.

### `segment_efforts`

Performa user per segmen. UNIQUE: `(segment_id, activity_id)`.

---

## Challenges

### `challenges`

| Column | Keterangan |
|---|---|
| type | `DISTANCE`, `DURATION`, `ACTIVITY_COUNT`, `STREAK` |
| target_* | Target sesuai type |
| reward_amount_base_units | Reward dalam FIT Token base units |
| start_at / end_at | Periode challenge |
| blockchain_challenge_id | ID on-chain (nullable) |

### `challenge_participants`

Progress per user per challenge. UNIQUE: `(challenge_id, user_id)`.

### `challenge_activity_usages`

Mencegah satu activity dipakai dua kali dalam challenge yang sama. UNIQUE: `(challenge_id, activity_id)`.

---

## Goals

### `goals`

| Column | Keterangan |
|---|---|
| type | `DISTANCE`, `DURATION`, `ACTIVITY_COUNT`, `ELEVATION` |
| period | `WEEKLY`, `MONTHLY`, `YEARLY` |
| target_value / current_value | Target dan progress |
| start_date / end_date | Periode goal |

---

## Rewards

### `rewards`

Type: `ACTIVITY`, `CHALLENGE`, `ACHIEVEMENT`

Status: `PENDING` → `PROCESSING` → `COMPLETED` / `FAILED` / `UNAVAILABLE`

### `reward_daily_limits`

Daily cap tracking per user. UNIQUE: `(user_id, reward_date)`.

---

## Social

### `posts`

Post activity ke feed. Visibility: `PUBLIC`, `FOLLOWERS`, `PRIVATE`.

### `follows`

UNIQUE: `(follower_id, following_id)`. Self-follow tidak diizinkan.

### `kudos`

Like/kudo pada post. UNIQUE: `(user_id, post_id)`.

### `comments`

Komentar pada post. Support nested reply via `parent_comment_id`.

---

## Clubs

### `clubs`

UNIQUE: `name`.

### `club_members`

Role: `OWNER`, `ADMIN`, `MEMBER`. UNIQUE: `(club_id, user_id)`.

### `club_posts`

Post dalam konteks club.

---

## Achievements

### `achievements`

Master data badge/achievement. UNIQUE: `code`.

### `user_achievements`

Achievement yang sudah diraih user. UNIQUE: `(user_id, achievement_id)`.

---

## Statistics & Records

### `user_statistics`

Aggregated stats per user (total distance, duration, streak, dll). UNIQUE per user.

### `personal_records`

Record type: `FASTEST_1K`, `FASTEST_5K`, `FASTEST_10K`, `LONGEST_DISTANCE`, `LONGEST_DURATION`, `HIGHEST_SPEED`.

---

## Safety

### `safety_contacts`

Kontak darurat user.

### `activity_sharing_sessions`

Session berbagi lokasi live. `share_token_hash` disimpan sebagai hash.

### `emergency_events`

Event darurat yang di-trigger user. Status: `TRIGGERED`, `NOTIFIED`, `RESOLVED`, `CANCELLED`.

---

## Entity Relationship Overview

```
users
├── email_verification_tokens
├── auth_accounts
├── sessions
├── wallets
│
├── activities
│    ├── activity_points
│    ├── activity_verifications
│    ├── activity_statistics
│    ├── activity_splits
│    └── activity_proofs
│         └── blockchain_transactions
│
├── routes
│    ├── route_points
│    ├── route_waypoints
│    └── saved_routes
│
├── segments
│    └── segment_efforts
│
├── challenges
│    └── challenge_participants
│         └── challenge_activity_usages
│
├── goals
│
├── rewards
│    ├── reward_daily_limits
│    └── blockchain_transactions
│
├── posts
│    ├── kudos
│    └── comments
│
├── follows
│
├── clubs
│    ├── club_members
│    └── club_posts
│
├── achievements
│    └── user_achievements
│
├── user_statistics
├── personal_records
│
└── safety_contacts
     ├── activity_sharing_sessions
     └── emergency_events
```
