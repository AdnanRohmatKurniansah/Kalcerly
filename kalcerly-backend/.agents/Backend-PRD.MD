# KALCERLY — BACKEND PRD

## AI-Powered Social Fitness & Blockchain Rewards

**Slogan:** Make Movement a Culture.

---

# 1. Project Overview

Kalcerly adalah aplikasi social fitness yang memungkinkan pengguna melakukan aktivitas olahraga seperti walking, running, dan cycling, kemudian aktivitas tersebut diverifikasi menggunakan AI dan menghasilkan reward FIT Token melalui blockchain.

Kalcerly menggunakan pendekatan **Web2-first dengan optional Web3 integration**, sehingga pengguna tidak diwajibkan memiliki wallet ketika pertama kali menggunakan aplikasi.

Pengguna dapat membuat dan menggunakan akun menggunakan email/password atau Google. Wallet baru diperlukan ketika pengguna ingin menggunakan fitur yang membutuhkan blockchain, seperti menerima FIT Token atau mengaktifkan blockchain-based activity rewards.

Untuk authentication menggunakan email/password, akun harus melakukan **verifikasi email terlebih dahulu** sebelum dapat digunakan untuk login penuh.

Core flow:

```text
Track → Verify → Earn → Compete → Improve
```

Backend bertanggung jawab terhadap:

* Authentication & authorization
* User management
* Wallet management
* Activity tracking
* GPS processing
* AI activity verification
* Activity proof
* FIT reward
* Route & map
* Segments
* Challenges
* Goals
* Statistics
* Personal records
* Social feed
* Follow
* Kudos
* Comments
* Clubs
* Achievements
* Leaderboards
* Safety features
* Blockchain integration

---

# 2. Technology Stack

## Backend

* NodeJs
* TypeScript
* Express.js
* PostgreSQL
* Drizzle ORM
* Viem

## Authentication

* Email + Password
* Email Verification
* Google OAuth
* JWT Access Token
* Refresh Token

## Wallet

* Wallet Connection
* Reown AppKit / WalletConnect
* SIWE / EIP-4361
* Wallet Ownership Verification

## Blockchain

* Solidity
* Foundry
* BNB Smart Chain Testnet
* FITToken
* ActivityProof
* RewardManager
* ChallengeManager

## Mobile

* Flutter
* Reown AppKit / WalletConnect
* GPS / Location APIs

---

# 3. Authentication Architecture

Kalcerly menggunakan pendekatan **Web2-first authentication** agar pengguna dapat menggunakan aplikasi tanpa harus memiliki cryptocurrency atau wallet.

Supported login:

```text
1. Email + Password
2. Google OAuth
```

Wallet **bukan merupakan persyaratan ketika login**.

Wallet digunakan sebagai fitur tambahan yang dapat dihubungkan setelah user berhasil masuk ke dalam aplikasi.

Email/password memiliki tambahan proses verifikasi email.

Flow utama:

```text
User
 ↓
Register
 ↓
Email + Password
 ↓
Create Account
 ↓
Send Verification Email
 ↓
Verify Email
 ↓
Email Verified
 ↓
Login
 ↓
Kalcerly Account
 ↓
Use Application
 ↓
User membutuhkan Web3 Feature
 ↓
Connect Wallet
 ↓
Wallet Verification
 ↓
Wallet Linked
 ↓
Web3 Features Enabled
```

Google tetap menggunakan flow authentication tersendiri:

```text
User
 ↓
Google OAuth
 ↓
Google Identity Verification
 ↓
Kalcerly Account
 ↓
Session
 ↓
Use Application
```

Wallet tetap bukan primary login method.

Dengan arsitektur ini, user dapat menggunakan fitur social fitness tanpa wallet.

Wallet baru diperlukan ketika user menggunakan fitur yang membutuhkan blockchain, seperti:

* FIT Token reward
* Blockchain activity proof
* Blockchain challenge
* Fitur Web3 lainnya

Private key dan seed phrase pengguna tidak pernah dikirim atau disimpan di backend.

---

# 4. Authentication Flow

## 4.1 Email + Password

Email/password menggunakan proses **register → email verification → login**.

### Register

```text
Register
   ↓
POST /api/auth/register
   ↓
Validate name/email/password
   ↓
Check email uniqueness
   ↓
Hash password
   ↓
Create user
   ↓
Set emailVerifiedAt = NULL
   ↓
Generate verification token
   ↓
Store hashed verification token
   ↓
Send verification email
   ↓
Return registration response
```

User **belum mendapatkan authenticated session penuh sebelum email diverifikasi**.

Contoh response:

```json
{
  "success": true,
  "data": {
    "requiresEmailVerification": true,
    "message": "Please verify your email address."
  }
}
```

Backend tidak boleh mengembalikan password dalam response.

### Verify Email

User menerima email berisi verification link.

Contoh:

```text
https://app.kalcerly.com/verify-email?token=...
```

Flow:

```text
User clicks verification link
        ↓
POST /api/auth/verify-email
        ↓
Validate token
        ↓
Check token expiration
        ↓
Check token unused
        ↓
Mark email as verified
        ↓
Invalidate verification token
        ↓
Email Verified
```

Setelah berhasil:

```text
emailVerifiedAt = current timestamp
```

### Login

```text
POST /api/auth/login
        ↓
Find user
        ↓
Verify password
        ↓
Check emailVerifiedAt
        ↓
Email verified?
       │
       ├── NO
       │    ↓
       │  Reject Login
       │
       └── YES
            ↓
      Create Access Token
            ↓
      Create Refresh Token
            ↓
        Create Session
            ↓
       Return Tokens
```

Jika email belum diverifikasi:

```text
HTTP 403 Forbidden
```

Response:

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email before logging in."
  }
}
```

### Resend Verification Email

User yang belum melakukan verifikasi dapat meminta email verification dikirim kembali.

```text
POST /api/auth/resend-verification
        ↓
Find account
        ↓
Check email verification status
        ↓
Generate new token
        ↓
Invalidate old token
        ↓
Send verification email
```

Password wajib disimpan dalam bentuk hash menggunakan password hashing algorithm yang aman.

Backend tidak pernah menyimpan password asli.

Wallet tidak diperlukan untuk proses register maupun login menggunakan email/password.

---

# 5. Google Authentication

Google digunakan sebagai authentication provider tambahan.

Google bukan hanya digunakan untuk login pertama kali, tetapi juga dapat dihubungkan dengan akun Kalcerly yang sudah ada.

Flow:

```text
Flutter
   ↓
Google Sign-In
   ↓
Google Credential
   ↓
POST /api/auth/google
   ↓
Backend verify Google identity
   ↓
Find existing account
      │
      ├── Existing → Login
      │
      └── New → Create User
                    ↓
              Create Session
                    ↓
          Access + Refresh Token
```

Backend harus melakukan validasi credential Google sebelum membuat session.

Google account harus dapat dihubungkan dengan user Kalcerly yang sudah memiliki email.

Google authentication tidak mengikuti proses email/password verification.

Contoh:

```text
User
 ├── Email
 └── Google Account
```

Kemudian wallet dapat ditambahkan secara terpisah:

```text
User
 ├── Email
 ├── Google Account
 └── Wallet
```

Dengan demikian pengguna tidak kehilangan account ketika menggunakan metode login yang berbeda atau ketika menambahkan wallet.

Google account tidak otomatis membuat wallet.

---

# 6. Wallet Connection & Verification

Wallet tidak digunakan sebagai login utama ketika user pertama kali membuka aplikasi.

Wallet digunakan untuk mengaktifkan fitur blockchain setelah user sudah memiliki Kalcerly account.

Contoh kondisi yang membutuhkan wallet:

```text
User Login
     ↓
Home
     ↓
Start Running
     ↓
User belum memiliki wallet
     ↓
Show Connect Wallet
     ↓
User Connect Wallet
     ↓
SIWE Verification
     ↓
Wallet Linked
     ↓
Start Activity
```

Wallet digunakan untuk:

* Identitas Web3
* Menerima FIT Token
* Menghubungkan aktivitas dengan blockchain
* Activity proof
* Blockchain rewards
* Blockchain challenges
* Menandatangani transaksi jika diperlukan

Wallet connection menggunakan Reown AppKit / WalletConnect pada Flutter.

Flow:

```text
User
 ↓
Authenticated in Kalcerly
 ↓
User requests Web3 feature
 ↓
Connect Wallet
 ↓
Reown AppKit
 ↓
Wallet detected
 ↓
Wallet Address
 ↓
Request Nonce
 ↓
Generate SIWE Message
 ↓
User Signs Message
 ↓
Backend Verify Signature
 ↓
Wallet Ownership Confirmed
 ↓
Link Wallet to User
 ↓
Web3 Feature Enabled
```

Private key dan seed phrase pengguna tidak pernah dikirim atau disimpan di backend.

---

# 7. Wallet Detection

Frontend/mobile menggunakan Reown AppKit untuk mendeteksi wallet yang tersedia.

Wallet tidak perlu dideteksi pada halaman login.

Wallet baru dideteksi ketika user memilih fitur yang membutuhkan wallet atau secara manual memilih menu Connect Wallet.

Contoh:

```text
Start Running

Wallet required for FIT Rewards.

┌─────────────────────┐
│ Connect Wallet      │
└─────────────────────┘
```

Setelah user menekan Connect Wallet:

```text
Connect Wallet

┌─────────────────────┐
│ MetaMask            │
│ Trust Wallet        │
│ OKX Wallet          │
│ Other Wallet        │
└─────────────────────┘
```

Setelah wallet berhasil terhubung, frontend mendapatkan wallet address.

Contoh:

```text
0x71C...92A
```

Backend menerima wallet address untuk proses verification.

Backend tidak menerima:

* Private key
* Seed phrase
* Wallet password

---

# 8. SIWE Wallet Verification

Wallet connection menggunakan Sign-In with Ethereum untuk membuktikan bahwa user benar-benar memiliki wallet yang sedang dihubungkan.

SIWE digunakan sebagai mekanisme **wallet ownership verification**, bukan sebagai login utama Kalcerly.

Flow:

```text
POST /api/auth/wallet/nonce
        ↓
Generate cryptographic nonce
        ↓
Create SIWE message
        ↓
Flutter asks wallet to sign
        ↓
POST /api/auth/wallet/verify
        ↓
Verify signature
        ↓
Recover wallet address
        ↓
Compare with requested address
        ↓
Check nonce
        ↓
Check expiration
        ↓
Wallet Ownership Confirmed
        ↓
Link Wallet to Authenticated User
```

SIWE message minimal mengandung:

* Domain
* Wallet address
* Chain ID
* Nonce
* Issued timestamp
* Expiration timestamp
* Statement

Nonce hanya boleh digunakan satu kali.

Karena proses wallet linking dilakukan oleh user yang sudah authenticated, endpoint wallet verification harus menggunakan access token.

Contoh:

```http
Authorization: Bearer ACCESS_TOKEN
```

Dengan demikian backend mengetahui wallet tersebut sedang dihubungkan oleh user Kalcerly yang sudah login.

---

# 9. Access Token & Refresh Token

Karena Kalcerly adalah mobile application, authentication menggunakan:

```text
Short-lived Access Token
+
Long-lived Refresh Token
```

## Access Token

Digunakan untuk request API.

```http
Authorization: Bearer ACCESS_TOKEN
```

Access token memiliki lifetime pendek.

```text
Access Token
15 minutes
```

Token berisi minimal:

```json
{
  "sub": "user-id",
  "type": "access"
}
```

Jangan memasukkan data sensitif atau data activity besar ke dalam token.

---

# 10. Refresh Token

Refresh token digunakan untuk mendapatkan access token baru tanpa meminta user login kembali.

Flow:

```text
Access Token expired
        ↓
POST /api/auth/refresh
        ↓
Verify Refresh Token
        ↓
Validate Session
        ↓
Issue New Access Token
        ↓
Return New Tokens
```

Contoh:

```text
Access Token
15 minutes

Refresh Token
30 days
```

Lifetime dapat diubah melalui environment configuration.

Refresh token terhubung dengan session tertentu sehingga backend dapat melakukan session management dan revocation.

---

# 11. Refresh Token Rotation

Untuk keamanan mobile app, refresh token menggunakan rotation.

Flow:

```text
Refresh Token A
      ↓
POST /auth/refresh
      ↓
Validate A
      ↓
Invalidate A
      ↓
Create Refresh Token B
      ↓
Create Access Token B
```

Sehingga refresh token lama tidak terus-menerus dapat digunakan.

Jika refresh token yang sudah di-revoke digunakan kembali, backend dapat menganggap session tersebut compromised dan melakukan session revocation.

---

# 12. Mobile Token Storage

Flutter tidak boleh menyimpan token secara plain text.

Gunakan secure storage pada device.

```text
Flutter Secure Storage
        │
        ├── Access Token
        └── Refresh Token
```

Backend tidak pernah meminta access token dari wallet.

Wallet signature dan authentication token adalah dua hal yang berbeda.

Flow authentication:

```text
Email / Google
      ↓
Kalcerly Authentication
      ↓
Access + Refresh Token
```

Flow wallet:

```text
Authenticated User
      ↓
Connect Wallet
      ↓
Wallet Signature
      ↓
Wallet Ownership Verification
```

Keduanya tidak boleh dicampur menjadi satu credential.

---

# 13. Authentication Database Schema

## users

```text
users
├── id UUID PK
├── username UNIQUE
├── email UNIQUE NULLABLE
├── passwordHash NULLABLE
├── emailVerifiedAt NULLABLE
├── displayName
├── avatarUrl
├── bio
├── dateOfBirth
├── gender
├── location
├── isPrivate
├── createdAt
└── updatedAt
```

`passwordHash` nullable karena user dapat menggunakan Google authentication tanpa password.

Untuk user yang login menggunakan Google:

```text
passwordHash = NULL
```

Untuk user yang menggunakan email/password:

```text
passwordHash = hashed password
```

Untuk user email/password yang belum melakukan verifikasi:

```text
emailVerifiedAt = NULL
```

Untuk user email/password yang sudah melakukan verifikasi:

```text
emailVerifiedAt = timestamp
```

Google user tidak menggunakan email verification flow dari email/password.

Wallet tidak menentukan apakah user dapat memiliki account atau tidak.

---

## auth_accounts

Digunakan untuk menghubungkan external authentication provider.

```text
auth_accounts
├── id UUID PK
├── userId FK
├── provider
├── providerAccountId
├── email
├── createdAt
└── updatedAt
```

Provider:

```text
GOOGLE
```

Unique constraint:

```text
(provider, providerAccountId)
```

Wallet tidak disimpan sebagai authentication provider pada tabel ini.

Wallet memiliki tabel khusus karena wallet merupakan Web3 identity dan capability yang dapat di-link ke user setelah authentication.

---

## email_verification_tokens

Digunakan untuk proses verifikasi email pada authentication email/password.

```text
email_verification_tokens
├── id UUID PK
├── userId FK
├── tokenHash
├── expiresAt
├── usedAt NULLABLE
├── createdAt
└── updatedAt
```

Token verification:

* Harus random dan cryptographically secure.
* Tidak disimpan dalam bentuk plaintext.
* Disimpan sebagai hash.
* Memiliki expiration.
* Hanya dapat digunakan satu kali.
* Tidak dapat digunakan kembali setelah `usedAt` terisi.
* Token lama harus dapat di-invalidate ketika resend dilakukan.

Flow:

```text
Register
   ↓
Generate Token
   ↓
Hash Token
   ↓
Store Hash
   ↓
Send Raw Token via Email
   ↓
User Clicks Verification Link
   ↓
Hash Submitted Token
   ↓
Compare Hash
   ↓
Verify Email
```

---

## auth_nonces

Digunakan untuk wallet/SIWE verification.

```text
auth_nonces
├── id UUID PK
├── walletAddress
├── nonce UNIQUE
├── expiresAt
├── usedAt
└── createdAt
```

Nonce harus:

* random
* single-use
* memiliki expiration
* tidak dapat digunakan kembali

Nonce digunakan ketika user melakukan:

```text
Connect Wallet
      ↓
SIWE Verification
```

Bukan ketika user melakukan login email/password atau Google.

---

## sessions

Session menyimpan refresh token secara aman.

```text
sessions
├── id UUID PK
├── userId FK
├── refreshTokenHash
├── deviceId NULLABLE
├── deviceName NULLABLE
├── expiresAt
├── lastUsedAt
├── revokedAt NULLABLE
├── createdAt
└── updatedAt
```

Backend tidak menyimpan refresh token dalam bentuk plaintext.

Yang disimpan adalah:

```text
hash(refreshToken)
```

Satu user dapat memiliki beberapa session dari beberapa device.

Contoh:

```text
User
 ├── Session Android
 ├── Session iPhone
 └── Session Tablet
```

---

# 14. Wallet Database Schema

## wallets

Wallet digunakan sebagai Web3 identity yang terhubung dengan Kalcerly account.

```text
wallets
├── id UUID PK
├── userId FK
├── address UNIQUE
├── chainId
├── isPrimary
├── verifiedAt
├── createdAt
└── updatedAt
```

Wallet hanya dapat digunakan sebagai wallet user setelah ownership berhasil diverifikasi.

Contoh:

```text
User
  │
  └── Wallet
       ├── address: 0xABC...
       ├── chainId: 97
       ├── isPrimary: true
       └── verifiedAt: ...
```

Untuk MVP:

```text
1 User
    ↓
1 Primary Wallet
```

Arsitektur tetap dibuat agar nantinya dapat mendukung multiple wallets.

Wallet dapat dihubungkan kapan saja setelah user berhasil login.

Contoh:

```text
Login Google
     ↓
Home
     ↓
Profile
     ↓
Connect Wallet
     ↓
Wallet Linked
```

---

# 15. Authentication Routes

Login utama Kalcerly:

```text
POST   /api/auth/register
POST   /api/auth/verify-email
POST   /api/auth/resend-verification
POST   /api/auth/login
POST   /api/auth/google
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
```

Wallet tidak digunakan sebagai endpoint login utama.

Endpoint wallet authentication/verification:

```text
POST   /api/auth/wallet/nonce
POST   /api/auth/wallet/verify
```

Endpoint tersebut digunakan untuk **menghubungkan dan memverifikasi wallet terhadap authenticated user**.

Flow login email:

```text
Register
   ↓
Email Verification
   ↓
Email Verified
   ↓
Login
   ↓
Kalcerly Account
```

Flow Google:

```text
Google OAuth
   ↓
Kalcerly Account
```

Flow wallet:

```text
Authenticated User
        ↓
Connect Wallet
        ↓
SIWE Verification
        ↓
Wallet Linked
```

---

# 16. Wallet Management Routes

Wallet connection sebenarnya terjadi di Flutter melalui Reown AppKit.

Backend hanya bertugas:

```text
Verify
Store
Associate
```

Routes:

```text
GET    /api/wallet
POST   /api/wallet/connect
POST   /api/wallet/verify
PATCH  /api/wallet/primary
DELETE /api/wallet/:id
```

`POST /api/wallet/connect` dapat digunakan untuk memulai proses wallet linking.

`POST /api/wallet/verify` digunakan setelah user menandatangani SIWE message.

Contoh flow:

```text
Flutter
   ↓
Reown AppKit
   ↓
Wallet Address
   ↓
POST /api/auth/wallet/nonce
   ↓
SIWE Message
   ↓
Wallet Sign
   ↓
POST /api/auth/wallet/verify
   ↓
Wallet Linked
```

Semua endpoint wallet management membutuhkan authenticated user.

---

# 17. Authentication Service Architecture

```text
auth.controller.ts
        ↓
auth.service.ts
        ↓
┌─────────────────────────┐
│                         │
├── Email Auth            │
├── Email Verification    │
├── Google Auth           │
├── Token Service         │
└── Session Management    │
```

Wallet memiliki service terpisah karena wallet bukan bagian dari primary login flow.

```text
wallet.controller.ts
        ↓
wallet.service.ts
        ↓
wallet-auth.service.ts
        ↓
SIWE Verification
        ↓
Wallet Ownership
```

Recommended services:

```text
services/
├── auth.service.ts
├── email-verification.service.ts
├── google-auth.service.ts
├── wallet-auth.service.ts
├── token.service.ts
└── session.service.ts
```

Tanggung jawab:

```text
auth.service.ts
        ↓
Email authentication
Google authentication
User account creation
```

```text
email-verification.service.ts
        ↓
Verification token generation
Verification token validation
Email verification
Resend verification
Verification email delivery
```

```text
wallet-auth.service.ts
        ↓
Nonce generation
SIWE message
Signature verification
Wallet ownership
```

```text
token.service.ts
        ↓
Access token
Refresh token
Token rotation
```

```text
session.service.ts
        ↓
Create session
Validate session
Revoke session
```

---

# 18. Updated Backend Structure

```text
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── activity.controller.ts
│   │   ├── route.controller.ts
│   │   ├── segment.controller.ts
│   │   ├── challenge.controller.ts
│   │   ├── goal.controller.ts
│   │   ├── reward.controller.ts
│   │   ├── social.controller.ts
│   │   ├── club.controller.ts
│   │   ├── leaderboard.controller.ts
│   │   ├── achievement.controller.ts
│   │   ├── stats.controller.ts
│   │   ├── wallet.controller.ts
│   │   └── safety.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email-verification.service.ts
│   │   ├── google-auth.service.ts
│   │   ├── wallet-auth.service.ts
│   │   ├── token.service.ts
│   │   ├── session.service.ts
│   │   ├── activity.service.ts
│   │   ├── ai.service.ts
│   │   ├── route.service.ts
│   │   ├── map.service.ts
│   │   ├── segment.service.ts
│   │   ├── challenge.service.ts
│   │   ├── goal.service.ts
│   │   ├── reward.service.ts
│   │   ├── social.service.ts
│   │   ├── club.service.ts
│   │   ├── leaderboard.service.ts
│   │   ├── achievement.service.ts
│   │   ├── stats.service.ts
│   │   ├── wallet.service.ts
│   │   ├── safety.service.ts
│   │   └── blockchain.service.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── activity.routes.ts
│   │   ├── route.routes.ts
│   │   ├── segment.routes.ts
│   │   ├── challenge.routes.ts
│   │   ├── goal.routes.ts
│   │   ├── reward.routes.ts
│   │   ├── social.routes.ts
│   │   ├── club.routes.ts
│   │   ├── leaderboard.routes.ts
│   │   ├── achievement.routes.ts
│   │   ├── stats.routes.ts
│   │   ├── wallet.routes.ts
│   │   └── safety.routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── db/
│   │   ├── schema/
│   │   │   ├── users.ts
│   │   │   ├── auth-accounts.ts
│   │   │   ├── email-verification-tokens.ts
│   │   │   ├── auth-nonces.ts
│   │   │   ├── sessions.ts
│   │   │   ├── wallets.ts
│   │   │   ├── activities.ts
│   │   │   ├── activity-points.ts
│   │   │   ├── routes.ts
│   │   │   ├── segments.ts
│   │   │   ├── challenges.ts
│   │   │   ├── goals.ts
│   │   │   ├── rewards.ts
│   │   │   ├── social.ts
│   │   │   ├── clubs.ts
│   │   │   ├── achievements.ts
│   │   │   ├── stats.ts
│   │   │   ├── safety.ts
│   │   │   └── transactions.ts
│   │   └── index.ts
│   │
│   ├── blockchain/
│   │   ├── abis/
│   │   │   ├── FITToken.json
│   │   │   ├── ActivityProof.json
│   │   │   ├── RewardManager.json
│   │   │   └── ChallengeManager.json
│   │   └── contracts.ts
│   │
│   ├── providers/
│   │   ├── map.provider.ts
│   │   ├── ai.provider.ts
│   │   └── google.provider.ts
│   │
│   ├── utils/
│   │   ├── hash.ts
│   │   ├── jwt.ts
│   │   ├── geo.ts
│   │   ├── pagination.ts
│   │   └── validation.ts
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   └── index.ts
│
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── .env
└── .env.example
```

---

# 19. Authentication Middleware

Protected endpoint:

```text
Authorization: Bearer <access_token>
```

Flow:

```text
Request
   ↓
auth.middleware.ts
   ↓
Extract Access Token
   ↓
Verify JWT
   ↓
Check token type
   ↓
Get userId
   ↓
Attach user to request
   ↓
Controller
```

Expired access token:

```text
401 Unauthorized
```

Flutter kemudian menggunakan refresh token.

Wallet management juga menggunakan authentication middleware.

Contoh:

```text
POST /api/wallet/connect

Authorization:
Bearer ACCESS_TOKEN
```

Dengan demikian hanya user yang sudah login yang dapat menghubungkan wallet ke account tersebut.

---

# 20. Authentication State on Mobile

Flutter harus dapat melakukan automatic session restoration.

Flow:

```text
Open App
   ↓
Check Secure Storage
   ↓
Access Token available?
      │
      ├── Valid → Enter App
      │
      └── Expired
             ↓
        Refresh Token
             ↓
        Backend /refresh
             ↓
        New Access Token
             ↓
          Enter App
```

Jika refresh token juga expired/revoked:

```text
Refresh Failed
     ↓
Clear local tokens
     ↓
Redirect Login
```

Wallet connection tidak dilakukan otomatis pada saat aplikasi dibuka.

Wallet hanya diminta ketika:

```text
User
 ↓
Requests Web3 Feature
 ↓
Wallet Connected?
    │
    ├── YES → Continue
    │
    └── NO → Request Wallet Connection
```

Dengan demikian user tidak dipaksa connect wallet setiap membuka aplikasi.

Email verification juga tidak dilakukan setiap membuka aplikasi. Verifikasi hanya diperlukan ketika user membuat akun email/password dan belum terverifikasi.

---

# 21. Account Linking

User dapat memiliki beberapa authentication methods dalam satu account.

Contoh:

```text
Kalcerly Account
│
├── Email
│   └── user@email.com
│
├── Google
│   └── Google Account ID
│
└── Wallet
    └── 0xABC...
```

Wallet merupakan **optional linked identity**.

Hal ini penting agar user yang awalnya login menggunakan Google dapat menghubungkan wallet tanpa membuat account baru.

Flow:

```text
Google User
     ↓
Profile
     ↓
Connect Wallet
     ↓
Reown AppKit
     ↓
SIWE Verification
     ↓
Wallet linked
```

Contoh lainnya:

```text
Email User
     ↓
Start Running
     ↓
Connect Wallet
     ↓
SIWE Verification
     ↓
Wallet linked
     ↓
FIT Rewards Enabled
```

Wallet tidak menggantikan authentication method utama user.

Email/password tetap membutuhkan email verification sebelum login penuh.

Google tidak menggunakan email verification flow tersebut karena identity telah diverifikasi oleh Google.

---

# 22. Security Requirements

Authentication wajib memenuhi:

* Password tidak pernah disimpan plaintext.
* Password menggunakan secure hashing.
* Email verification token tidak disimpan plaintext.
* Email verification token disimpan dalam bentuk hash.
* Email verification token memiliki expiration.
* Email verification token bersifat single-use.
* Verification token lama di-invalidate ketika resend.
* User email/password tidak dapat login sebelum email diverifikasi.
* Private key tidak pernah disimpan.
* Seed phrase tidak pernah disimpan.
* Access token memiliki expiration.
* Refresh token memiliki expiration.
* Refresh token disimpan dalam bentuk hash.
* Refresh token rotation.
* Session revocation.
* SIWE nonce single-use.
* SIWE nonce expiration.
* Signature verification.
* Chain ID validation.
* Domain validation.
* Replay attack prevention.
* Rate limiting untuk authentication endpoint.
* Rate limiting untuk email verification endpoint.
* Rate limiting untuk wallet verification endpoint.
* Input validation.
* HTTPS pada production.
* Sensitive credentials hanya melalui environment variables.
* Wallet hanya dapat di-link oleh authenticated user.
* Satu wallet tidak dapat dimiliki oleh lebih dari satu account.
* Wallet address divalidasi sebelum disimpan.
* Wallet ownership harus diverifikasi sebelum wallet ditandai sebagai verified.

Email verification security:

```text
Registration
    ↓
Generate Secure Random Token
    ↓
Hash Token
    ↓
Store Hash
    ↓
Send Verification Email
    ↓
User Submits Token
    ↓
Hash Submitted Token
    ↓
Compare
    ↓
Check Expiration
    ↓
Check Used Status
    ↓
Verify Email
```

---

# 23. Updated Complete User Flow

```text
                     USER
                       │
              ┌────────┴────────┐
              │                 │
        Email/Password        Google
              │                 │
              ↓                 ↓
          Register           OAuth
              │                 │
              ↓                 │
      Verification Email        │
              │                 │
              ↓                 │
       Verify Email             │
              │                 │
              └────────┬────────┘
                       ↓
                AUTH SERVICE
                       ↓
                Verify Identity
                       ↓
                Find / Create
                    User
                       ↓
               Create Session
                       ↓
          ┌────────────┴────────────┐
          ↓                         ↓
    Access Token              Refresh Token
     short-lived                long-lived
          │                         │
          ↓                         ↓
     API Requests              Token Refresh
                                    │
                                    ↓
                             New Access Token
```

Setelah user berhasil login:

```text
Authenticated User
        │
        ├───────────────┐
        ↓               ↓
   Normal Features   Web3 Feature
        │               │
        │          Wallet Connected?
        │               │
        │          ┌────┴────┐
        │          ↓         ↓
        │         YES        NO
        │          │         │
        │          │    Connect Wallet
        │          │         │
        │          │    Reown AppKit
        │          │         │
        │          │      SIWE Sign
        │          │         │
        │          │    Backend Verify
        │          └────┬────┘
        │               ↓
        │        Wallet Linked
        │               ↓
        └──────── Web3 Features
```

---

# 24. Authentication + Blockchain Flow

Wallet authentication tidak lagi menjadi primary login flow.

Primary authentication:

```text
Email / Google
      ↓
Backend
      ↓
Authenticated User
      ↓
Access + Refresh Token
```

Untuk email/password:

```text
Email + Password
      ↓
Email Verified?
      │
      ├── NO → Reject Login
      │
      └── YES
           ↓
       Authenticated User
```

Wallet linking:

```text
Authenticated User
      ↓
Connect Wallet
      ↓
Reown AppKit
      ↓
SIWE
      ↓
Backend
      ↓
Wallet Ownership Verified
      ↓
Wallet Linked
```

Reward:

```text
Verified Activity
      ↓
ActivityProof
      ↓
RewardManager
      ↓
FITToken
      ↓
Primary Wallet
```

Jadi ketiga flow tetap dipisahkan:

```text
Authentication
      │
      ↓
User Session
      │
      ↓
Wallet Linking
      │
      ↓
Blockchain Reward
```

User dapat memiliki session tanpa wallet.

User dapat memiliki wallet tanpa harus menggunakan wallet sebagai login utama.

---

# 25. Activity Flow

```text
POST /api/activities
        ↓
Authenticate User
        ↓
Validate Activity
        ↓
Save PENDING
        ↓
Validate GPS
        ↓
AI Verification
        ↓
┌───────────────┬─────────────────┬──────────────┐
│               │                 │
VERIFIED     NEEDS_REVIEW      REJECTED
│               │                 │
↓               ↓                 ↓
Hash          Stop Reward       Stop
│
↓
Check Wallet
│
├── No Wallet
│      ↓
│   Activity Saved
│      ↓
│   FIT Reward Pending / Unavailable
│
└── Wallet Connected
       ↓
ActivityProof.sol
       ↓
RewardManager.sol
       ↓
FITToken.sol
       ↓
Update Stats
       ↓
Challenge
       ↓
Goals
       ↓
Achievements
       ↓
Social
```

Untuk UX, user tetap dapat melakukan tracking aktivitas walaupun belum memiliki wallet.

Namun FIT Token membutuhkan wallet yang sudah terverifikasi.

Contoh:

```text
Start Running
      ↓
Track GPS
      ↓
Finish
      ↓
AI Verification
      ↓
VERIFIED
      ↓
Wallet Connected?
      │
      ├── YES → Reward FIT
      │
      └── NO
           ↓
      Activity Saved
           ↓
      Show Connect Wallet
```

Backend harus memiliki mekanisme untuk mencegah activity lama diproses ulang secara sembarangan.

---

# 26. Route & Map

Routes tetap menjadi bagian utama backend.

```text
GET    /api/routes
GET    /api/routes/:id
POST   /api/routes
PATCH  /api/routes/:id
DELETE /api/routes/:id
POST   /api/routes/preview
GET    /api/routes/suggested
GET    /api/routes/nearby
POST   /api/routes/:id/save
DELETE /api/routes/:id/save
GET    /api/routes/saved
GET    /api/routes/popular
GET    /api/maps/heatmap/personal
GET    /api/maps/heatmap/global
GET    /api/maps/nearby
```

Route dapat memiliki:

* GPS points
* polyline
* distance
* estimated duration
* elevation
* difficulty
* activity type
* start/end location
* waypoints
* popularity

---

# 27. Strava-like Features

Backend menyediakan:

## Activity

* Walking
* Running
* Cycling
* GPS route
* Distance
* Duration
* Pace
* Speed
* Elevation
* Calories
* Splits
* Personal records
* Activity history
* Training statistics

## Routes

* Route planning
* Route preview
* Suggested routes
* Nearby routes
* Saved routes
* Popular routes
* Personal heatmap
* Global heatmap

## Segments

* Segment creation
* Segment matching
* Segment efforts
* Segment leaderboard
* Personal best

## Challenges

* Distance challenge
* Duration challenge
* Activity count challenge
* Streak challenge
* Challenge leaderboard

## Goals

* Weekly goals
* Monthly goals
* Yearly goals
* Distance goals
* Duration goals
* Activity count goals
* Elevation goals

## Social

* Feed
* Activity posts
* Follow
* Unfollow
* Kudos
* Comments
* Clubs
* Club feed

## Achievement

* Badges
* Milestones
* Personal records
* Streak achievements

## Safety

* Safety contacts
* Live activity sharing
* Emergency activity session

---

# 28. Blockchain Integration

Exactly four smart contracts digunakan:

```text
FITToken.sol
ActivityProof.sol
RewardManager.sol
ChallengeManager.sol
```

Backend tidak menggunakan:

```text
Factory
Escrow
RewardPool
```

untuk MVP.

Blockchain service menjadi satu-satunya service yang melakukan contract interaction.

```text
blockchain.service.ts
        ↓
Viem
        ↓
Smart Contracts
```

Blockchain hanya digunakan ketika aktivitas atau fitur memang membutuhkan state on-chain.

Wallet user menjadi destination untuk FIT Token reward.

User tidak perlu memiliki wallet hanya untuk menggunakan:

* Feed
* Profile
* Route
* GPS tracking
* Statistics
* Goals
* Social features
* Activity history

Wallet dibutuhkan untuk fitur Web3 seperti:

* FIT Token
* Activity proof yang dikaitkan dengan wallet
* Blockchain rewards
* Blockchain challenges

---

# 29. Source of Truth

| Data                       | Source of Truth               |
| -------------------------- | ----------------------------- |
| User profile               | PostgreSQL                    |
| Authentication             | PostgreSQL + Auth Provider    |
| Email verification         | PostgreSQL + Email Service    |
| Session                    | PostgreSQL                    |
| Wallet ownership           | PostgreSQL + Wallet Signature |
| Detailed GPS               | PostgreSQL                    |
| Activity                   | PostgreSQL                    |
| AI Verification            | Backend AI                    |
| Activity Proof             | ActivityProof.sol             |
| FIT Balance                | FITToken.sol                  |
| Activity Reward            | RewardManager.sol             |
| Challenge Blockchain State | ChallengeManager.sol          |
| Transaction Status         | Blockchain + PostgreSQL       |

---

# 30. Definition of Done — Authentication

Authentication dianggap selesai apabila:

## Email Authentication

* Register email/password
* Password hashing
* Email uniqueness validation
* Email verification token generation
* Email verification token hashing
* Verification email sending
* Email verification endpoint
* Verification token expiration
* Verification token single-use
* Verification token invalidation
* Resend verification email
* Prevent login before email verification
* Login email/password
* Create session after successful verification
* Return access token
* Return refresh token

## Google Authentication

* Google login
* Google account linking
* Google credential verification
* Google session creation

## Wallet

* Wallet detection melalui Reown AppKit
* Wallet connection
* SIWE nonce generation
* SIWE signature verification
* Wallet ownership verification
* Wallet linking
* Chain ID validation
* SIWE domain validation
* SIWE expiration validation
* SIWE nonce single-use

## Session

* Access token
* Refresh token
* Refresh token rotation
* Session database
* Logout
* Session revocation
* `/api/auth/me`
* Automatic token refresh
* Mobile secure token storage

## Security

* Authentication rate limiting
* Email verification rate limiting
* Wallet verification rate limiting
* Replay attack protection
* Private key/seed phrase never stored
* Wallet tidak wajib ketika login
* Wallet hanya diminta ketika user membutuhkan fitur Web3
* Wallet hanya dapat di-link ke authenticated user
* Wallet address tidak dapat digunakan oleh dua account

---

# 31. Final Authentication Architecture

```text
                         KALCERLY
                            │
                     Flutter Mobile
                            │
                ┌───────────┴───────────┐
                │                       │
           Email/Password             Google
                │                       │
                ↓                     OAuth
          Register / Login              │
                │                       │
                ↓                       │
        Email Verification              │
                │                       │
                └───────────┬───────────┘
                            ↓
                       Auth Service
                            ↓
                   Identity Verification
                            ↓
                       PostgreSQL
                            ↓
                         Session
                            ↓
               ┌────────────┴────────────┐
               ↓                         ↓
         Access Token              Refresh Token
          ~15 minutes                ~30 days
               │                         │
               ↓                         ↓
           API Calls                Token Refresh
                                          │
                                          ↓
                                   New Access Token
```

Wallet berada sebagai optional Web3 capability:

```text
                    AUTHENTICATED USER
                            │
                            ↓
                  Use Kalcerly Normally
                            │
            ┌───────────────┴───────────────┐
            │                               │
      Normal Features                 Web3 Feature
            │                               │
            │                       Wallet Connected?
            │                         │           │
            │                        YES          NO
            │                         │           │
            │                         │      Connect Wallet
            │                         │           │
            │                         │      Reown AppKit
            │                         │           │
            │                         │       Wallet Address
            │                         │           │
            │                         │       Request Nonce
            │                         │           │
            │                         │         SIWE
            │                         │           │
            │                         │      User Signs
            │                         │           │
            │                         │    Backend Verification
            │                         │           │
            │                         └─────┬─────┘
            │                               ↓
            │                         Wallet Linked
            │                               │
            └───────────────────────────────┤
                                            ↓
                                    Web3 Features Enabled
                                            │
                                            ↓
                                      FIT Rewards
```

Setelah authentication selesai, user dapat menggunakan:

```text
        Authenticated User
               │
     ┌─────────┼─────────┐
     ↓         ↓         ↓
 Activity    Social    Wallet
     │                   │
     ↓                   ↓
 AI Verify           FIT Token
     │                   │
     ↓                   ↓
 ActivityProof       Blockchain
     │
     ↓
 RewardManager
     │
     ↓
 FIT Reward
```

Namun wallet bersifat **optional pada level account**:

```text
User Login
    ↓
Can use Kalcerly
    ↓
No Wallet Required
```

Ketika user ingin mendapatkan reward blockchain:

```text
User
 ↓
Start Running
 ↓
Wallet not connected
 ↓
Connect Wallet
 ↓
Reown AppKit
 ↓
SIWE
 ↓
Wallet Verified
 ↓
Activity
 ↓
AI Verification
 ↓
ActivityProof
 ↓
RewardManager
 ↓
FITToken
 ↓
FIT Reward
```

Dengan arsitektur ini, Kalcerly tidak terkunci menjadi aplikasi Web3-only.

User bisa masuk seperti aplikasi fitness biasa menggunakan **email/password atau Google**, melakukan tracking, melihat route, menggunakan social features, melihat statistik, dan menggunakan fitur fitness lainnya tanpa wallet.

Untuk email/password, user cukup melakukan **satu kali verifikasi email setelah registrasi** sebelum dapat login.

Wallet hanya diperkenalkan ketika memang memberikan nilai kepada user, misalnya ketika user ingin memperoleh **FIT Token Rewards** atau menggunakan fitur blockchain.

Dengan demikian pengalaman pengguna menjadi:

```text
REGISTER
   ↓
EMAIL + PASSWORD
   ↓
VERIFY EMAIL
   ↓
LOGIN
   ↓
USE FITNESS APP
   ↓
RUN / WALK / CYCLING
   ↓
VERIFY ACTIVITY
   ↓
WANT FIT REWARD?
   ↓
CONNECT WALLET
   ↓
VERIFY OWNERSHIP
   ↓
EARN FIT
```

Arsitektur ini membuat onboarding tetap sederhana, memastikan akun email benar-benar dimiliki oleh user, mengurangi friction bagi pengguna Web2, sekaligus tetap mempertahankan seluruh kemampuan Web3 Kalcerly.
