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

### POST `/api/auth/me`

🔒 **Requires Bearer token**

Update profile user. Menggunakan `multipart/form-data` karena mendukung upload avatar. Semua field opsional.

**Headers**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form fields**

| Field | Type | Keterangan |
|---|---|---|
| `fullname` | string | Maks 100 karakter |
| `bio` | string | Maks 500 karakter |
| `dateOfBirth` | string | Format `YYYY-MM-DD` |
| `gender` | string | Maks 20 karakter |
| `location` | string | Maks 255 karakter |
| `isPrivate` | `"true"` / `"false"` | Privat atau publik |
| `avatar` | file (image) | Upload foto profil, maks 5MB |

Jika `avatar` dikirim, file lama di Cloudinary otomatis dihapus dan diganti yang baru.

**Response** `200`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "fullname": "Adnan Baru",
    "email": "adnan@example.com",
    "avatarUrl": "https://res.cloudinary.com/...",
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

## Challenges

Challenge adalah kompetisi fitness berbasis target yang dapat diikuti oleh semua user. Semua endpoint memerlukan Bearer token.

**Challenge types:**
- `DISTANCE` — total jarak yang harus ditempuh (meter)
- `DURATION` — total durasi aktivitas (detik)
- `ACTIVITY_COUNT` — jumlah aktivitas yang harus diselesaikan
- `STREAK` — jumlah hari berturut-turut beraktivitas

**Business rules:**
- Hanya challenge yang `isActive = true` dan dalam periode `startAt`–`endAt` yang tampil di list aktif
- User hanya bisa join challenge yang belum berakhir (`endAt > now`)
- Satu user tidak bisa join challenge yang sama dua kali — UNIQUE `(challenge_id, user_id)`
- User tidak bisa leave challenge yang sudah `completedAt`
- Progress hanya bisa ditambahkan dari activity berstatus `VERIFIED`
- Activity harus dilakukan dalam periode challenge (`startedAt` antara `startAt` dan `endAt`)
- Satu activity hanya bisa digunakan sekali per challenge — UNIQUE `(challenge_id, activity_id)` di `challenge_activity_usages`
- Challenge selesai otomatis (`completedAt` terisi) saat target tercapai

**Progress calculation per type:**

| Type | Sumber data | Field yang diupdate |
|---|---|---|
| `DISTANCE` | `activity.distanceMeters` | `progressDistanceMeters` |
| `DURATION` | `activity.durationSeconds` | `progressDurationSeconds` |
| `ACTIVITY_COUNT` | +1 per activity | `progressActivities` |
| `STREAK` | +1 per activity | `currentStreak` |

---

### POST `/api/challenges`

🔒 **Requires Bearer token**

Buat challenge baru. Creator otomatis menjadi `creatorId`.

**Request**
```json
{
  "name": "Run 50km in December",
  "description": "Complete 50km of running in December",
  "type": "DISTANCE",
  "targetDistanceMeters": 50000,
  "startAt": "2026-12-01T00:00:00.000Z",
  "endAt": "2026-12-31T23:59:59.000Z"
}
```

Field wajib: `name`, `type`, `startAt`, `endAt`, dan target sesuai type:
- `DISTANCE` → `targetDistanceMeters`
- `DURATION` → `targetDurationSeconds`
- `ACTIVITY_COUNT` → `targetActivities`
- `STREAK` → `targetStreakDays`

`endAt` harus setelah `startAt`.

**Response** `201`
```json
{
  "success": true,
  "message": "Challenge created",
  "data": {
    "id": "uuid",
    "name": "Run 50km in December",
    "type": "DISTANCE",
    "targetDistanceMeters": 50000,
    "startAt": "2026-12-01T00:00:00.000Z",
    "endAt": "2026-12-31T23:59:59.000Z",
    "isActive": true
  }
}
```

---

### GET `/api/challenges`

🔒 **Requires Bearer token**

List challenge yang sedang aktif (isActive = true dan dalam periode saat ini).

**Query params:** `page` (default 1), `limit` (default 20, max 100)

**Response** `200`
```json
{
  "success": true,
  "message": "Challenges retrieved",
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### GET `/api/challenges/me`

🔒 **Requires Bearer token**

List challenge yang diikuti oleh user yang sedang login, diurutkan berdasarkan `joinedAt` terbaru.

**Query params:** `page`, `limit`

**Response** `200` — array of `challenge_participants` records

---

### GET `/api/challenges/:id`

🔒 **Requires Bearer token**

Detail satu challenge, termasuk `participantCount` dan status partisipasi user saat ini (`myParticipation`).

**Response** `200`
```json
{
  "success": true,
  "message": "Challenge retrieved",
  "data": {
    "id": "uuid",
    "name": "Run 50km in December",
    "type": "DISTANCE",
    "targetDistanceMeters": 50000,
    "isActive": true,
    "participantCount": 42,
    "myParticipation": {
      "id": "uuid",
      "progressDistanceMeters": 12000,
      "completedAt": null
    }
  }
}
```

`myParticipation` bernilai `null` jika user belum join.

---

### POST `/api/challenges/:id/join`

🔒 **Requires Bearer token**

Bergabung ke challenge.

**Response** `201`
```json
{
  "success": true,
  "message": "Joined challenge successfully",
  "data": {
    "id": "uuid",
    "challengeId": "uuid",
    "userId": "uuid",
    "progressDistanceMeters": 0,
    "joinedAt": "2026-12-01T08:00:00.000Z"
  }
}
```

**Error** `409` — sudah join sebelumnya
```json
{ "success": false, "message": "Already joined this challenge", "errors": "ALREADY_JOINED" }
```

**Error** `400` — challenge sudah berakhir
```json
{ "success": false, "message": "Challenge has already ended", "errors": "CHALLENGE_ENDED" }
```

---

### DELETE `/api/challenges/:id/leave`

🔒 **Requires Bearer token**

Keluar dari challenge. Tidak bisa leave challenge yang sudah `completedAt`.

**Response** `200`
```json
{ "success": true, "message": "Left challenge successfully" }
```

**Error** `400` — challenge sudah selesai
```json
{ "success": false, "message": "Cannot leave a completed challenge", "errors": "CHALLENGE_ALREADY_COMPLETED" }
```

---

### POST `/api/challenges/:id/progress`

🔒 **Requires Bearer token**

Tambahkan progress dari activity yang sudah `VERIFIED`. Backend menghitung contribution otomatis berdasarkan challenge type dan mendeteksi completion.

**Request**
```json
{
  "activityId": "uuid"
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Progress added",
  "data": {
    "participant": {
      "id": "uuid",
      "progressDistanceMeters": 22000,
      "completedAt": null
    },
    "progressAmount": 10000,
    "isCompleted": false
  }
}
```

Jika target tercapai, `isCompleted` bernilai `true` dan `participant.completedAt` terisi.

**Error** `400` — activity bukan VERIFIED
```json
{ "success": false, "message": "Only VERIFIED activities can contribute to challenge progress", "errors": "ACTIVITY_NOT_VERIFIED" }
```

**Error** `400` — activity di luar periode challenge
```json
{ "success": false, "message": "Activity was not performed during the challenge period", "errors": "ACTIVITY_OUTSIDE_PERIOD" }
```

**Error** `409` — activity sudah digunakan di challenge ini
```json
{ "success": false, "message": "Activity has already been used for this challenge", "errors": "ACTIVITY_ALREADY_USED" }
```

---

### GET `/api/challenges/:id/participants`

🔒 **Requires Bearer token**

List participants challenge, diurutkan berdasarkan `progressDistanceMeters` tertinggi.

**Query params:** `page`, `limit`

**Response** `200` — array of `challenge_participants` records dengan pagination

---

## Goals

Goal adalah target fitness personal per periode waktu. Semua endpoint memerlukan Bearer token dan goal hanya bisa diakses oleh owner-nya.

**Goal types:** `DISTANCE`, `DURATION`, `ACTIVITY_COUNT`, `ELEVATION`

**Periods:** `WEEKLY`, `MONTHLY`, `YEARLY`

**Business rules:**
- Goal bersifat privat — user hanya bisa melihat dan mengelola goal miliknya sendiri
- `endDate` harus setelah `startDate` (format `YYYY-MM-DD`)
- Progress hanya bisa ditambahkan dari activity berstatus `VERIFIED`
- Activity harus dilakukan dalam periode goal (`startDate` ≤ `activityDate` ≤ `endDate`)
- Goal selesai otomatis (`completedAt` terisi) saat `currentValue >= targetValue`
- Tidak bisa menambah progress ke goal yang sudah `completedAt`

**Progress calculation per type:**

| Type | Sumber data |
|---|---|
| `DISTANCE` | `activity.distanceMeters` |
| `DURATION` | `activity.durationSeconds` |
| `ACTIVITY_COUNT` | +1 per activity |
| `ELEVATION` | `activity.elevationMeters` |

---

### POST `/api/goals`

🔒 **Requires Bearer token**

Buat goal baru.

**Request**
```json
{
  "type": "DISTANCE",
  "period": "MONTHLY",
  "targetValue": 100000,
  "startDate": "2026-12-01",
  "endDate": "2026-12-31"
}
```

Field wajib: `type`, `period`, `targetValue`, `startDate`, `endDate`.

`targetValue` minimal 1. `endDate` harus setelah `startDate`.

**Response** `201`
```json
{
  "success": true,
  "message": "Goal created",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "type": "DISTANCE",
    "period": "MONTHLY",
    "targetValue": 100000,
    "currentValue": 0,
    "startDate": "2026-12-01",
    "endDate": "2026-12-31",
    "completedAt": null
  }
}
```

---

### GET `/api/goals`

🔒 **Requires Bearer token**

List semua goal milik user, diurutkan terbaru.

**Query params:** `page` (default 1), `limit` (default 20, max 100)

**Response** `200`
```json
{
  "success": true,
  "message": "Goals retrieved",
  "data": [...],
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### GET `/api/goals/:id`

🔒 **Requires Bearer token**

Detail satu goal. Hanya bisa diakses oleh owner.

**Response** `200`
```json
{
  "success": true,
  "message": "Goal retrieved",
  "data": {
    "id": "uuid",
    "type": "DISTANCE",
    "period": "MONTHLY",
    "targetValue": 100000,
    "currentValue": 35000,
    "startDate": "2026-12-01",
    "endDate": "2026-12-31",
    "completedAt": null
  }
}
```

---

### DELETE `/api/goals/:id`

🔒 **Requires Bearer token** — hanya owner

Hapus goal.

**Response** `200`
```json
{ "success": true, "message": "Goal deleted" }
```

---

### POST `/api/goals/:id/progress`

🔒 **Requires Bearer token**

Tambahkan progress dari activity yang sudah `VERIFIED`. Backend menghitung contribution otomatis berdasarkan goal type dan mendeteksi completion.

**Request**
```json
{
  "activityId": "uuid"
}
```

**Response** `200`
```json
{
  "success": true,
  "message": "Goal progress updated",
  "data": {
    "goal": {
      "id": "uuid",
      "currentValue": 45000,
      "completedAt": null
    },
    "contribution": 10000,
    "isCompleted": false
  }
}
```

Jika target tercapai, `isCompleted` bernilai `true` dan `goal.completedAt` terisi.

**Error** `400` — activity bukan VERIFIED
```json
{ "success": false, "message": "Only VERIFIED activities can contribute to goal progress", "errors": "ACTIVITY_NOT_VERIFIED" }
```

**Error** `400` — activity di luar periode goal
```json
{ "success": false, "message": "Activity was not performed during the goal period", "errors": "ACTIVITY_OUTSIDE_PERIOD" }
```

**Error** `400` — goal sudah selesai
```json
{ "success": false, "message": "Goal is already completed", "errors": "GOAL_ALREADY_COMPLETED" }
```

---

## Rewards & Transactions

Rewards adalah FIT Token yang diperoleh user dari aktivitas yang sudah `VERIFIED`. Semua endpoint memerlukan Bearer token.

**Blockchain reward flow:**
```
VERIFIED Activity
       ↓
POST /api/rewards/activities/:activityId
       ↓
Check duplicate (rewards.activityId UNIQUE)
       ↓
Find primary wallet
       ↓
No wallet? → status = PENDING (reward tersimpan, diproses saat wallet terhubung)
       ↓
Wallet found? → status = PROCESSING
       ↓
ActivityProof.sol  ← recordProof(activityHash, walletAddress, timestamp)
       ↓
RewardManager.sol  ← rewardActivity(walletAddress, amountBaseUnits)
       ↓
FITToken.sol       ← token dikirim ke primary wallet
       ↓
reward.status = COMPLETED, rewardedAt terisi
```

**Reward status:**

| Status | Keterangan |
|---|---|
| `PENDING` | Activity verified tapi belum ada wallet |
| `PROCESSING` | Transaksi blockchain sedang berjalan |
| `COMPLETED` | FIT reward berhasil dikirim ke wallet |
| `FAILED` | Transaksi blockchain gagal |

**Transaction status:**

| Status | Keterangan |
|---|---|
| `PENDING` | Record dibuat, belum dikirim ke blockchain |
| `SUBMITTED` | Tx hash diterima, menunggu konfirmasi |
| `CONFIRMED` | Tx terkonfirmasi on-chain |
| `FAILED` | Tx gagal atau reverted |

**Business rules:**
- Reward tidak bisa dibuat dua kali untuk activity yang sama — UNIQUE `activity_id` di tabel `rewards`
- Hanya activity berstatus `VERIFIED` yang eligible
- Activity harus memiliki `activityHash` (di-generate saat `POST /api/activities/:id/verify`)
- Reward membutuhkan primary wallet; tanpa wallet reward disimpan dengan status `PENDING`
- Daily reward cap tracking tersimpan di `reward_daily_limits` — smart contract tetap menjadi authority on-chain
- Hanya 4 smart contract yang digunakan: `FITToken`, `ActivityProof`, `RewardManager`, `ChallengeManager`

---

### POST `/api/rewards/activities/:activityId`

🔒 **Requires Bearer token**

Proses reward untuk activity yang sudah `VERIFIED`. Jika reward sudah ada, mengembalikan record yang ada (idempotent).

**Response** `200` — wallet tersedia, reward diproses
```json
{
  "success": true,
  "message": "Reward processed",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "activityId": "uuid",
    "walletId": "uuid",
    "rewardType": "ACTIVITY",
    "amountBaseUnits": "10000000000000000000",
    "status": "COMPLETED",
    "contractAddress": "0x...",
    "transactionId": "uuid",
    "rewardedAt": "2026-09-07T10:00:00.000Z"
  }
}
```

**Response** `200` — belum ada wallet, reward ditahan
```json
{
  "success": true,
  "message": "Reward processed",
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "amountBaseUnits": "10000000000000000000",
    "walletId": null
  }
}
```

**Error** `400` — activity belum VERIFIED
```json
{ "success": false, "message": "Only VERIFIED activities are eligible for rewards", "errors": "ACTIVITY_NOT_VERIFIED" }
```

**Error** `400` — activity hash belum ada
```json
{ "success": false, "message": "Activity hash is missing", "errors": "MISSING_ACTIVITY_HASH" }
```

---

### GET `/api/rewards/activities/:activityId`

🔒 **Requires Bearer token**

Cek status reward untuk activity tertentu. Mengembalikan `null` jika belum ada reward.

**Response** `200`
```json
{
  "success": true,
  "message": "Reward retrieved",
  "data": {
    "id": "uuid",
    "status": "COMPLETED",
    "amountBaseUnits": "10000000000000000000",
    "rewardedAt": "2026-09-07T10:00:00.000Z"
  }
}
```

---

### GET `/api/rewards`

🔒 **Requires Bearer token**

Riwayat semua reward milik user, diurutkan terbaru.

**Query params:** `page` (default 1), `limit` (default 20, max 100)

**Response** `200`
```json
{
  "success": true,
  "message": "Rewards retrieved",
  "data": [...],
  "total": 8,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### GET `/api/rewards/balance`

🔒 **Requires Bearer token**

Ambil saldo FIT Token dari primary wallet on-chain via `FITToken.sol`.

**Response** `200` — wallet tersedia
```json
{
  "success": true,
  "message": "FIT balance retrieved",
  "data": {
    "address": "0xabc123...",
    "balance": "50000000000000000000",
    "hasWallet": true
  }
}
```

**Response** `200` — belum ada wallet
```json
{
  "success": true,
  "message": "FIT balance retrieved",
  "data": {
    "address": null,
    "balance": "0",
    "hasWallet": false
  }
}
```

---

### GET `/api/rewards/transactions`

🔒 **Requires Bearer token**

Riwayat semua blockchain transactions milik user, diurutkan terbaru. Mencakup semua tipe: `CREATE_ACTIVITY_PROOF`, `REWARD_ACTIVITY`, `COMPLETE_CHALLENGE`.

**Query params:** `page` (default 1), `limit` (default 20, max 100)

**Response** `200`
```json
{
  "success": true,
  "message": "Transactions retrieved",
  "data": [
    {
      "id": "uuid",
      "type": "REWARD_ACTIVITY",
      "chainId": 97,
      "contractAddress": "0x...",
      "functionName": "rewardActivity",
      "transactionHash": "0xabc...",
      "blockNumber": 12345678,
      "status": "CONFIRMED",
      "submittedAt": "2026-09-07T10:00:00.000Z",
      "confirmedAt": "2026-09-07T10:00:05.000Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

## Social

Social domain mencakup follow/unfollow antar user, activity posts, kudos, comments, dan feed. Semua endpoint memerlukan Bearer token.

**Business rules:**
- User tidak bisa follow dirinya sendiri
- Satu user hanya bisa follow user yang sama satu kali — UNIQUE `(follower_id, following_id)`
- Satu user hanya bisa memberi kudos pada post yang sama satu kali — UNIQUE `(user_id, post_id)`
- Hanya owner post yang bisa edit atau hapus post-nya
- Hanya owner comment yang bisa edit atau hapus comment-nya
- Post visibility: `PUBLIC` (siapa saja), `FOLLOWERS` (hanya follower + owner), `PRIVATE` (hanya owner)
- Post harus punya `content` atau `activityId` — tidak boleh keduanya kosong
- Feed menampilkan post dari user yang di-follow + post sendiri

**Post visibility rules:**

| Visibility | Siapa yang bisa lihat |
|---|---|
| `PUBLIC` | Semua authenticated user |
| `FOLLOWERS` | Owner + user yang follow owner |
| `PRIVATE` | Owner saja |

---

### GET `/api/social/feed`

🔒 **Requires Bearer token**

Ambil feed — post dari user yang di-follow + post sendiri, diurutkan terbaru. Post `FOLLOWERS` dari user yang di-follow tetap tampil. Post `PRIVATE` hanya milik sendiri yang tampil.

**Query params:** `page` (default 1), `limit` (default 20, max 100)

**Response** `200`
```json 
{
  "success": true,
  "message": "Feed retrieved",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "activityId": "uuid",
      "content": "Great run this morning!",
      "visibility": "PUBLIC",
      "createdAt": "2026-09-07T07:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### POST `/api/social/posts`

🔒 **Requires Bearer token**

Buat post baru. Harus memiliki `content` atau `activityId` (atau keduanya).

**Request**
```json
{
  "content": "Just finished a 10km run!",
  "activityId": "uuid",
  "visibility": "PUBLIC"
}
```

`visibility`: `PUBLIC` (default), `FOLLOWERS`, atau `PRIVATE`.

**Response** `201`
```json
{
  "success": true,
  "message": "Post created",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "activityId": "uuid",
    "content": "Just finished a 10km run!",
    "visibility": "PUBLIC",
    "createdAt": "2026-09-07T07:00:00.000Z"
  }
}
```

---

### GET `/api/social/posts/:id`

🔒 **Requires Bearer token**

Ambil detail post beserta `kudoCount`, `commentCount`, dan `hasKudo` (apakah requester sudah memberi kudos).

Post `PRIVATE` hanya bisa diakses owner. Post `FOLLOWERS` hanya bisa diakses owner + follower-nya.

**Response** `200`
```json
{
  "success": true,
  "message": "Post retrieved",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "content": "Great run!",
    "visibility": "PUBLIC",
    "kudoCount": 12,
    "commentCount": 3,
    "hasKudo": false
  }
}
```

**Error** `404` — post tidak ditemukan atau tidak berhak mengakses
```json
{ "success": false, "message": "Post not found", "errors": "POST_NOT_FOUND" }
```

---

### GET `/api/social/users/:userId/posts`

🔒 **Requires Bearer token**

List post milik user tertentu. Visibility difilter: non-owner hanya lihat `PUBLIC` dan `FOLLOWERS` (jika following).

**Query params:** `page`, `limit`

---

### PATCH `/api/social/posts/:id`

🔒 **Requires Bearer token** — hanya owner post

Update `content` atau `visibility`.

**Request**
```json
{
  "content": "Updated content",
  "visibility": "FOLLOWERS"
}
```

**Error** `403` — bukan owner
```json
{ "success": false, "message": "You do not have permission to edit this post", "errors": "FORBIDDEN" }
```

---

### DELETE `/api/social/posts/:id`

🔒 **Requires Bearer token** — hanya owner post

**Error** `403` — bukan owner
```json
{ "success": false, "message": "You do not have permission to delete this post", "errors": "FORBIDDEN" }
```

---

### POST `/api/social/users/:userId/follow`

🔒 **Requires Bearer token**

Follow user lain.

**Response** `201`
```json
{
  "success": true,
  "message": "User followed",
  "data": {
    "id": "uuid",
    "followerId": "uuid",
    "followingId": "uuid",
    "createdAt": "2026-09-07T08:00:00.000Z"
  }
}
```

**Error** `400` — self follow
```json
{ "success": false, "message": "You cannot follow yourself", "errors": "SELF_FOLLOW" }
```

**Error** `409` — sudah following
```json
{ "success": false, "message": "Already following this user", "errors": "ALREADY_FOLLOWING" }
```

---

### DELETE `/api/social/users/:userId/follow`

🔒 **Requires Bearer token**

Unfollow user.

**Error** `404` — tidak sedang following
```json
{ "success": false, "message": "You are not following this user", "errors": "NOT_FOLLOWING" }
```

---

### GET `/api/social/users/:userId/followers`

🔒 **Requires Bearer token**

List followers dari user tertentu, diurutkan terbaru.

**Query params:** `page`, `limit`

**Response** `200` — array of follow records dengan pagination

---

### GET `/api/social/users/:userId/following`

🔒 **Requires Bearer token**

List user yang di-follow oleh user tertentu.

**Query params:** `page`, `limit`

---

### POST `/api/social/posts/:id/kudos`

🔒 **Requires Bearer token**

Beri kudos pada post. Idempoten berdasarkan `(userId, postId)`.

**Response** `201`
```json
{
  "success": true,
  "message": "Kudos given",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "postId": "uuid"
  }
}
```

**Error** `409` — sudah memberi kudos
```json
{ "success": false, "message": "Already given kudos to this post", "errors": "ALREADY_KUDOED" }
```

---

### DELETE `/api/social/posts/:id/kudos`

🔒 **Requires Bearer token**

Hapus kudos dari post.

**Error** `404` — belum memberi kudos
```json
{ "success": false, "message": "You have not given kudos to this post", "errors": "KUDO_NOT_FOUND" }
```

---

### POST `/api/social/posts/:id/comments`

🔒 **Requires Bearer token**

Tambah komentar pada post. Mendukung reply via `parentCommentId`.

**Request**
```json
{
  "content": "Great effort!",
  "parentCommentId": "uuid"
}
```

`parentCommentId` opsional — diisi untuk reply ke komentar lain. Harus berupa UUID valid dan komentar tersebut harus berada pada post yang sama.

**Response** `201`
```json
{
  "success": true,
  "message": "Comment created",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "postId": "uuid",
    "parentCommentId": null,
    "content": "Great effort!",
    "createdAt": "2026-09-07T08:30:00.000Z"
  }
}
```

---

### GET `/api/social/posts/:id/comments`

🔒 **Requires Bearer token**

List top-level comments pada post (tanpa replies), diurutkan terbaru.

**Query params:** `page`, `limit`

**Response** `200` — array of comment records dengan pagination

---

### PATCH `/api/social/posts/:id/comments/:commentId`

🔒 **Requires Bearer token** — hanya owner comment

Update isi komentar.

**Request**
```json
{ "content": "Updated comment" }
```

**Error** `403` — bukan owner
```json
{ "success": false, "message": "You do not have permission to edit this comment", "errors": "FORBIDDEN" }
```

---

### DELETE `/api/social/posts/:id/comments/:commentId`

🔒 **Requires Bearer token** — hanya owner comment

**Error** `403` — bukan owner
```json
{ "success": false, "message": "You do not have permission to delete this comment", "errors": "FORBIDDEN" }
```

---

## Clubs

Club adalah komunitas fitness yang dapat dibuat oleh user. Semua endpoint memerlukan Bearer token.

**Roles:**

| Role | Keterangan |
|---|---|
| `OWNER` | Pembuat club, hak penuh |
| `ADMIN` | Dipromosikan oleh OWNER, bisa kelola member |
| `MEMBER` | Anggota biasa |

**Membership rules:**
- Creator otomatis menjadi `OWNER`
- OWNER tidak bisa leave club — harus hapus club
- Satu user hanya bisa join club yang sama satu kali — UNIQUE `(club_id, user_id)`
- Hanya `OWNER` yang bisa update club, hapus club, ubah role member
- `OWNER` dan `ADMIN` bisa remove member, tapi ADMIN tidak bisa remove ADMIN lain
- Club owner tidak bisa di-remove oleh siapapun
- Hanya member yang bisa posting di club

**Private club rules:**
- Non-member melihat info terbatas (hanya `id`, `name`, `isPrivate`, `memberCount`)
- Member list dan club posts private club hanya bisa diakses oleh member

---

### POST `/api/clubs`

🔒 **Requires Bearer token**

Buat club baru. Creator otomatis menjadi member dengan role `OWNER`.

**Request**
```json
{
  "name": "Jogja Running Community",
  "description": "Komunitas lari di Yogyakarta",
  "isPrivate": false
}
```

Field wajib: `name`. `isPrivate` default `false`.

**Response** `201`
```json
{
  "success": true,
  "message": "Club created",
  "data": {
    "id": "uuid",
    "ownerId": "uuid",
    "name": "Jogja Running Community",
    "description": "Komunitas lari di Yogyakarta",
    "isPrivate": false,
    "createdAt": "2026-09-07T08:00:00.000Z"
  }
}
```

**Error** `409` — nama sudah dipakai
```json
{ "success": false, "message": "Club name already taken", "errors": "CLUB_NAME_TAKEN" }
```

---

### GET `/api/clubs`

🔒 **Requires Bearer token**

List semua club, diurutkan terbaru. Supports search by name.

**Query params:** `page` (default 1), `limit` (default 20, max 100), `search` (opsional)

**Response** `200` — array of clubs dengan pagination

---

### GET `/api/clubs/me`

🔒 **Requires Bearer token**

List club yang diikuti user saat ini (sebagai member dengan role apapun), diurutkan berdasarkan `joinedAt` terbaru.

**Query params:** `page`, `limit`

---

### GET `/api/clubs/:id`

🔒 **Requires Bearer token**

Detail satu club. Private club hanya menampilkan info terbatas ke non-member.

**Response** `200` — member atau public club
```json
{
  "success": true,
  "message": "Club retrieved",
  "data": {
    "id": "uuid",
    "name": "Jogja Running Community",
    "description": "...",
    "isPrivate": false,
    "memberCount": 42,
    "membership": {
      "role": "MEMBER",
      "joinedAt": "2026-09-01T08:00:00.000Z"
    }
  }
}
```

`membership` bernilai `null` jika user belum join.

**Response** `200` — non-member pada private club
```json
{
  "success": true,
  "message": "Club retrieved",
  "data": {
    "id": "uuid",
    "name": "Private Club",
    "isPrivate": true,
    "memberCount": 10
  }
}
```

---

### PATCH `/api/clubs/:id`

🔒 **Requires Bearer token** — hanya OWNER

Update nama, deskripsi, atau visibilitas club.

**Request**
```json
{
  "name": "New Name",
  "description": "Updated description",
  "isPrivate": true
}
```

**Error** `403` — bukan owner
```json
{ "success": false, "message": "Only the club owner can update club details", "errors": "FORBIDDEN" }
```

---

### DELETE `/api/clubs/:id`

🔒 **Requires Bearer token** — hanya OWNER

Hapus club beserta semua member dan posts (cascade).

---

### POST `/api/clubs/:id/join`

🔒 **Requires Bearer token**

Bergabung ke club.

**Response** `201`
```json
{
  "success": true,
  "message": "Joined club successfully",
  "data": {
    "id": "uuid",
    "clubId": "uuid",
    "userId": "uuid",
    "role": "MEMBER",
    "joinedAt": "2026-09-07T08:00:00.000Z"
  }
}
```

**Error** `409` — sudah member
```json
{ "success": false, "message": "Already a member of this club", "errors": "ALREADY_MEMBER" }
```

---

### DELETE `/api/clubs/:id/leave`

🔒 **Requires Bearer token**

Keluar dari club. Owner tidak bisa leave.

**Error** `400` — owner mencoba leave
```json
{ "success": false, "message": "Club owner cannot leave. Transfer ownership or delete the club.", "errors": "OWNER_CANNOT_LEAVE" }
```

---

### GET `/api/clubs/:id/members`

🔒 **Requires Bearer token**

List members club, diurutkan berdasarkan `joinedAt` terbaru. Private club: hanya member yang bisa akses.

**Query params:** `page`, `limit`

**Response** `200` — array of member records dengan pagination

---

### DELETE `/api/clubs/:id/members/:userId`

🔒 **Requires Bearer token** — OWNER atau ADMIN

Kick member dari club.

**Error** `403` — tidak punya izin
```json
{ "success": false, "message": "Only OWNER or ADMIN can remove members", "errors": "FORBIDDEN" }
```

**Error** `400` — mencoba remove owner
```json
{ "success": false, "message": "Cannot remove the club owner", "errors": "CANNOT_REMOVE_OWNER" }
```

---

### PATCH `/api/clubs/:id/members/:userId/role`

🔒 **Requires Bearer token** — hanya OWNER

Update role member menjadi `MEMBER` atau `ADMIN`.

**Request**
```json
{ "role": "ADMIN" }
```

Role yang bisa di-set: `MEMBER`, `ADMIN`. `OWNER` tidak bisa di-set via API.

**Error** `403` — bukan owner
```json
{ "success": false, "message": "Only the club owner can change member roles", "errors": "FORBIDDEN" }
```

---

### POST `/api/clubs/:id/posts`

🔒 **Requires Bearer token** — hanya member club

Buat post di club. Harus punya `content` atau `activityId`.

**Request**
```json
{
  "content": "Great group run today!",
  "activityId": "uuid"
}
```

**Response** `201`
```json
{
  "success": true,
  "message": "Post created",
  "data": {
    "id": "uuid",
    "clubId": "uuid",
    "userId": "uuid",
    "content": "Great group run today!",
    "activityId": "uuid",
    "createdAt": "2026-09-07T09:00:00.000Z"
  }
}
```

**Error** `403` — bukan member
```json
{ "success": false, "message": "You must be a member to post in this club", "errors": "NOT_A_MEMBER" }
```

---

### GET `/api/clubs/:id/posts`

🔒 **Requires Bearer token**

List posts di club, diurutkan terbaru. Private club: hanya member yang bisa akses.

**Query params:** `page`, `limit`

---

### DELETE `/api/clubs/:id/posts/:postId`

🔒 **Requires Bearer token** — post owner atau OWNER/ADMIN

Hapus post dari club. Pemilik post bisa hapus post miliknya. OWNER dan ADMIN bisa hapus post siapapun.

**Error** `403` — tidak punya izin
```json
{ "success": false, "message": "You do not have permission to delete this post", "errors": "FORBIDDEN" }
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
