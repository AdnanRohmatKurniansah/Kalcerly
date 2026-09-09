**# KALCERLY — DATABASE PRD**

**## AI-Powered Social Fitness & Blockchain Rewards**

\*\*Slogan:\*\* Make Movement a Culture.

\---

**# 1. Project Overview**

Kalcerly adalah aplikasi social fitness yang memungkinkan pengguna melakukan aktivitas olahraga seperti walking, running, dan cycling, kemudian aktivitas tersebut diverifikasi menggunakan AI dan menghasilkan reward FIT Token melalui blockchain.

Kalcerly menggunakan pendekatan \*\*Web2-first dengan optional Web3 integration\*\*, sehingga pengguna tidak diwajibkan memiliki wallet ketika pertama kali menggunakan aplikasi.

Pengguna dapat membuat dan menggunakan akun menggunakan email/password atau Google. Untuk registrasi menggunakan email/password, alamat email wajib diverifikasi terlebih dahulu sebelum akun dapat digunakan untuk login. Wallet baru diperlukan ketika pengguna ingin menggunakan fitur yang membutuhkan blockchain, seperti menerima FIT Token atau mengaktifkan blockchain-based activity rewards.

Core flow:

\`\`\`text

Track → Verify → Earn → Compete → Improve

\`\`\`

Backend bertanggung jawab terhadap:

\* Authentication & authorization

\* User management

\* Wallet management

\* Activity tracking

\* GPS processing

\* AI activity verification

\* Activity proof

\* FIT reward

\* Route & map

\* Segments

\* Challenges

\* Goals

\* Statistics

\* Personal records

\* Social feed

\* Follow

\* Kudos

\* Comments

\* Clubs

\* Achievements

\* Leaderboards

\* Safety features

\* Blockchain integration

\---

**# 2. Technology Stack**

**## Backend**

\* NodeJs

\* TypeScript

\* Express.js

\* PostgreSQL

\* Drizzle ORM

\* Viem

**## Authentication**

\* Email + Password

\* Google OAuth

\* JWT Access Token

\* Refresh Token

**## Wallet**

\* Wallet Connection

\* Reown AppKit / WalletConnect

\* SIWE / EIP-4361

\* Wallet Ownership Verification

**## Blockchain**

\* Solidity

\* Foundry

\* BNB Smart Chain Testnet

\* FITToken

\* ActivityProof

\* RewardManager

\* ChallengeManager

**## Mobile**

\* Flutter

\* Reown AppKit / WalletConnect

\* GPS / Location APIs

\---

**# 3. Authentication Architecture**

Kalcerly menggunakan pendekatan \*\*Web2-first authentication\*\* agar pengguna dapat menggunakan aplikasi tanpa harus memiliki cryptocurrency atau wallet.

Supported login:

\`\`\`text

1\. Email + Password

2\. Google OAuth

\`\`\`

Wallet \*\*bukan merupakan persyaratan ketika login\*\*.

Wallet digunakan sebagai fitur tambahan yang dapat dihubungkan setelah user berhasil masuk ke dalam aplikasi.

Flow utama:

\`\`\`text

User

 ↓

Login

 ├── Email + Password

 └── Google

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

\`\`\`

Dengan arsitektur ini, user dapat menggunakan fitur social fitness tanpa wallet.

Wallet baru diperlukan ketika user menggunakan fitur yang membutuhkan blockchain, seperti:

\* FIT Token reward

\* Blockchain activity proof

\* Blockchain challenge

\* Fitur Web3 lainnya

Private key dan seed phrase pengguna tidak pernah dikirim atau disimpan di backend.

\---

**# 4. Authentication Flow**

**## 4.1 Email + Password**

Register:

\`\`\`text

Register

   ↓

POST /api/auth/register

   ↓

Validate email/password

   ↓

Hash password

   ↓

Create user

   ↓

Create session

   ↓

Create refresh token

   ↓

Return access + refresh token

\`\`\`

Login:

\`\`\`text

POST /api/auth/login

        ↓

Find user

        ↓

Verify password

        ↓

Create access token

        ↓

Create refresh token

        ↓

Create session

        ↓

Return tokens

\`\`\`

Password wajib disimpan dalam bentuk hash menggunakan password hashing algorithm yang aman.

Backend tidak pernah menyimpan password asli.

User email/password dengan `emailVerifiedAt = NULL` tidak boleh membuat authenticated session. User harus menyelesaikan email verification terlebih dahulu.

Wallet tidak diperlukan untuk proses register maupun login menggunakan email/password.

\---

**# 5. Google Authentication**

Google digunakan sebagai authentication provider tambahan.

Google bukan hanya digunakan untuk login pertama kali, tetapi juga dapat dihubungkan dengan akun Kalcerly yang sudah ada.

Flow:

\`\`\`text

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

\`\`\`

Backend harus melakukan validasi credential Google sebelum membuat session.

Google account harus dapat dihubungkan dengan user Kalcerly yang sudah memiliki email.

Contoh:

\`\`\`text

User

 ├── Email

 └── Google Account

\`\`\`

Kemudian wallet dapat ditambahkan secara terpisah:

\`\`\`text

User

 ├── Email

 ├── Google Account

 └── Wallet

\`\`\`

Dengan demikian pengguna tidak kehilangan account ketika menggunakan metode login yang berbeda atau ketika menambahkan wallet.

Google account tidak otomatis membuat wallet.

\---

**# 6. Wallet Connection & Verification**

Wallet tidak digunakan sebagai login utama ketika user pertama kali membuka aplikasi.

Wallet digunakan untuk mengaktifkan fitur blockchain setelah user sudah memiliki Kalcerly account.

Contoh kondisi yang membutuhkan wallet:

\`\`\`text

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

\`\`\`

Wallet digunakan untuk:

\* Identitas Web3

\* Menerima FIT Token

\* Menghubungkan aktivitas dengan blockchain

\* Activity proof

\* Blockchain rewards

\* Blockchain challenges

\* Menandatangani transaksi jika diperlukan

Wallet connection menggunakan Reown AppKit / WalletConnect pada Flutter.

Flow:

\`\`\`text

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

\`\`\`

Private key dan seed phrase pengguna tidak pernah dikirim atau disimpan di backend.

\---

**# 7. Wallet Detection**

Frontend/mobile menggunakan Reown AppKit untuk mendeteksi wallet yang tersedia.

Wallet tidak perlu dideteksi pada halaman login.

Wallet baru dideteksi ketika user memilih fitur yang membutuhkan wallet atau secara manual memilih menu Connect Wallet.

Contoh:

\`\`\`text

Start Running

Wallet required for FIT Rewards.

┌─────────────────────┐

│ Connect Wallet      │

└─────────────────────┘

\`\`\`

Setelah user menekan Connect Wallet:

\`\`\`text

Connect Wallet

┌─────────────────────┐

│ MetaMask            │

│ Trust Wallet        │

│ OKX Wallet          │

│ Other Wallet        │

└─────────────────────┘

\`\`\`

Setelah wallet berhasil terhubung, frontend mendapatkan wallet address.

Contoh:

\`\`\`text

0x71C...92A

\`\`\`

Backend menerima wallet address untuk proses verification.

Backend tidak menerima:

\* Private key

\* Seed phrase

\* Wallet password

\---

**# 8. SIWE Wallet Verification**

Wallet connection menggunakan Sign-In With Ethereum untuk membuktikan bahwa user benar-benar memiliki wallet yang sedang dihubungkan.

SIWE digunakan sebagai mekanisme \*\*wallet ownership verification\*\*, bukan sebagai login utama Kalcerly.

Flow:

\`\`\`text

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

\`\`\`

SIWE message minimal mengandung:

\* Domain

\* Wallet address

\* Chain ID

\* Nonce

\* Issued timestamp

\* Expiration timestamp

\* Statement

Nonce hanya boleh digunakan satu kali.

Karena proses wallet linking dilakukan oleh user yang sudah authenticated, endpoint wallet verification harus menggunakan access token.

Contoh:

\`\`\`http

Authorization: Bearer ACCESS\_TOKEN

\`\`\`

Dengan demikian backend mengetahui wallet tersebut sedang dihubungkan oleh user Kalcerly yang sudah login.

\---

**# 9. Access Token & Refresh Token**

Karena Kalcerly adalah mobile application, authentication menggunakan:

\`\`\`text

Short-lived Access Token

\+

Long-lived Refresh Token

\`\`\`

**## Access Token**

Digunakan untuk request API.

Contoh:

\`\`\`http

Authorization: Bearer ACCESS\_TOKEN

\`\`\`

Access token memiliki lifetime pendek.

Contoh konfigurasi:

\`\`\`text

Access Token

15 minutes

\`\`\`

Token berisi minimal:

\`\`\`json

{

  "sub": "user-id",

  "type": "access"

}

\`\`\`

Jangan memasukkan data sensitif atau data activity besar ke dalam token.

\---

**# 10. Refresh Token**

Refresh token digunakan untuk mendapatkan access token baru tanpa meminta user login kembali.

Flow:

\`\`\`text

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

\`\`\`

Contoh:

\`\`\`text

Access Token

15 minutes

Refresh Token

30 days

\`\`\`

Lifetime dapat diubah melalui environment configuration.

Refresh token terhubung dengan session tertentu sehingga backend dapat melakukan session management dan revocation.

\---

**# 11. Refresh Token Rotation**

Untuk keamanan mobile app, refresh token menggunakan rotation.

Flow:

\`\`\`text

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

\`\`\`

Sehingga refresh token lama tidak terus-menerus dapat digunakan.

Jika refresh token yang sudah di-revoke digunakan kembali, backend dapat menganggap session tersebut compromised dan melakukan session revocation.

\---

**# 12. Mobile Token Storage**

Flutter tidak boleh menyimpan token secara plain text.

Gunakan secure storage pada device.

Contoh:

\`\`\`text

Flutter Secure Storage

        │

        ├── Access Token

        └── Refresh Token

\`\`\`

Backend tidak pernah meminta access token dari wallet.

Wallet signature dan authentication token adalah dua hal yang berbeda.

Flow authentication:

\`\`\`text

Email / Google

      ↓

Kalcerly Authentication

      ↓

Access + Refresh Token

\`\`\`

Flow wallet:

\`\`\`text

Authenticated User

      ↓

Connect Wallet

      ↓

Wallet Signature

      ↓

Wallet Ownership Verification

\`\`\`

Keduanya tidak boleh dicampur menjadi satu credential.

\---

**# 13. Authentication Database Schema**

**## 13.1 users**

Menyimpan identitas utama user Kalcerly.

\`\`\`text

users

├── id UUID PK

├── fullname VARCHAR(100) NOT NULL

├── email VARCHAR(255) UNIQUE NULLABLE

├── password TEXT NULLABLE

├── avatarUrl TEXT NULLABLE

├── bio TEXT NULLABLE

├── dateOfBirth DATE NULLABLE

├── gender VARCHAR(20) NULLABLE

├── location VARCHAR(255) NULLABLE

├── isPrivate BOOLEAN NOT NULL DEFAULT false

├── isActive BOOLEAN NOT NULL DEFAULT true

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

\`password\` nullable karena user dapat menggunakan Google authentication tanpa password.

Untuk user yang login menggunakan Google:

\`\`\`text

password = NULL

\`\`\`

Untuk user yang menggunakan email/password:

\`\`\`text

password = hashed password

\`\`\`

Wallet tidak menentukan apakah user dapat memiliki account atau tidak.

\---

**## 13.2 email_verification_tokens**

Menyimpan token verifikasi email dalam bentuk hash. Token plaintext tidak pernah disimpan di database.

```text
email_verification_tokens
├── id UUID PK
├── userId UUID FK → users.id
├── tokenHash TEXT NOT NULL
├── expiresAt TIMESTAMP NOT NULL
├── usedAt TIMESTAMP NULLABLE
├── createdAt TIMESTAMP NOT NULL
└── updatedAt TIMESTAMP NOT NULL
```

Token harus:

* cryptographically secure
* disimpan dalam bentuk hash
* memiliki expiration
* single-use
* memiliki `usedAt` setelah berhasil digunakan
* token lama harus diinvalidate ketika user meminta resend verification

Relationship:

```text
users 1 ───── N email_verification_tokens
```

Flow database:

```text
Create User
    ↓
emailVerifiedAt = NULL
    ↓
Create Verification Token
    ↓
Store tokenHash
    ↓
User verifies email
    ↓
Set emailVerifiedAt
    ↓
Set usedAt
```

Satu token hanya dapat digunakan satu kali dan token yang sudah expired atau sudah digunakan tidak dapat diverifikasi kembali.

---

**## 13.3 auth\_accounts**

Digunakan untuk menghubungkan external authentication provider.

\`\`\`text

auth\_accounts

├── id UUID PK

├── userId UUID FK → users.id

├── provider VARCHAR(30) NOT NULL

├── providerAccountId VARCHAR(255) NOT NULL

├── email VARCHAR(255) NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Provider:

\`\`\`text

GOOGLE

\`\`\`

Constraint:

\`\`\`text

UNIQUE(provider, providerAccountId)

\`\`\`

Relationship:

\`\`\`text

users 1 ───── N auth\_accounts

\`\`\`

Wallet tidak disimpan sebagai authentication provider pada tabel ini.

\---

**## 13.4 auth\_nonces**

Digunakan untuk wallet/SIWE verification.

\`\`\`text

auth\_nonces

├── id UUID PK

├── walletAddress VARCHAR(42) NOT NULL

├── nonce VARCHAR(255) UNIQUE NOT NULL

├── chainId INTEGER NOT NULL

├── domain VARCHAR(255) NOT NULL

├── expiresAt TIMESTAMP NOT NULL

├── usedAt TIMESTAMP NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Nonce harus:

\* random

\* single-use

\* memiliki expiration

\* tidak dapat digunakan kembali

\* terikat dengan wallet address

\* terikat dengan chain ID

\* terikat dengan domain

Nonce digunakan ketika user melakukan:

\`\`\`text

Connect Wallet

      ↓

SIWE Verification

\`\`\`

Bukan ketika user melakukan login email/password atau Google.

\---

**## 13.5 sessions**

Session menyimpan refresh token secara aman.

\`\`\`text

sessions

├── id UUID PK

├── userId UUID FK → users.id

├── refreshTokenHash TEXT NOT NULL

├── deviceId VARCHAR(255) NULLABLE

├── deviceName VARCHAR(255) NULLABLE

├── expiresAt TIMESTAMP NOT NULL

├── lastUsedAt TIMESTAMP NOT NULL

├── revokedAt TIMESTAMP NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Backend tidak menyimpan refresh token dalam bentuk plaintext.

Yang disimpan adalah:

\`\`\`text

hash(refreshToken)

\`\`\`

Relationship:

\`\`\`text

users 1 ───── N sessions

\`\`\`

Satu user dapat memiliki beberapa session dari beberapa device.

Contoh:

\`\`\`text

User

 ├── Session Android

 ├── Session iPhone

 └── Session Tablet

\`\`\`

\---

**# 14. Wallet Database Schema**

**## 14.1 wallets**

Wallet digunakan sebagai Web3 identity yang terhubung dengan Kalcerly account.

\`\`\`text

wallets

├── id UUID PK

├── userId UUID FK → users.id

├── address VARCHAR(42) UNIQUE NOT NULL

├── chainId INTEGER NOT NULL

├── isPrimary BOOLEAN NOT NULL DEFAULT false

├── verifiedAt TIMESTAMP NOT NULL

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Wallet hanya dapat digunakan sebagai wallet user setelah ownership berhasil diverifikasi.

Contoh:

\`\`\`text

User

  │

  └── Wallet

       ├── address: 0xABC...

       ├── chainId: 97

       ├── isPrimary: true

       └── verifiedAt: ...

\`\`\`

Untuk MVP:

\`\`\`text

1 User

    ↓

1 Primary Wallet

\`\`\`

Arsitektur tetap dibuat agar nantinya dapat mendukung multiple wallets.

Constraint yang direkomendasikan:

\`\`\`text

UNIQUE(address, chainId)

\`\`\`

Untuk MVP BSC Testnet:

\`\`\`text

chainId = 97

\`\`\`

Wallet dapat dihubungkan kapan saja setelah user berhasil login.

Contoh:

\`\`\`text

Login Google

     ↓

Home

     ↓

Profile

     ↓

Connect Wallet

     ↓

Wallet Linked

\`\`\`

\---

**# 15. User Profile Database Schema**

**## 15.1 user\_settings**

Menyimpan konfigurasi personal user.

\`\`\`text

user\_settings

├── id UUID PK

├── userId UUID FK → users.id UNIQUE

├── distanceUnit VARCHAR(10) DEFAULT 'KM'

├── weightUnit VARCHAR(10) DEFAULT 'KG'

├── notificationsEnabled BOOLEAN DEFAULT true

├── activityNotifications BOOLEAN DEFAULT true

├── socialNotifications BOOLEAN DEFAULT true

├── challengeNotifications BOOLEAN DEFAULT true

├── rewardNotifications BOOLEAN DEFAULT true

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Relationship:

\`\`\`text

users 1 ───── 1 user\_settings

\`\`\`

\---

**## 15.2 user\_statistics**

Menyimpan aggregated statistics user.

\`\`\`text

user\_statistics

├── id UUID PK

├── userId UUID FK → users.id UNIQUE

├── totalActivities INTEGER DEFAULT 0

├── totalDistanceMeters BIGINT DEFAULT 0

├── totalDurationSeconds BIGINT DEFAULT 0

├── totalElevationMeters BIGINT DEFAULT 0

├── totalCalories BIGINT DEFAULT 0

├── totalWalkingDistanceMeters BIGINT DEFAULT 0

├── totalRunningDistanceMeters BIGINT DEFAULT 0

├── totalCyclingDistanceMeters BIGINT DEFAULT 0

├── currentStreak INTEGER DEFAULT 0

├── longestStreak INTEGER DEFAULT 0

├── updatedAt TIMESTAMP NOT NULL

└── createdAt TIMESTAMP NOT NULL

\`\`\`

\---

**# 16. Activity Database Schema**

**## 16.1 activities**

Menyimpan aktivitas utama user.

\`\`\`text

activities

├── id UUID PK

├── userId UUID FK → users.id

├── type VARCHAR(20) NOT NULL

├── status VARCHAR(30) NOT NULL

├── title VARCHAR(255) NULLABLE

├── description TEXT NULLABLE

├── distanceMeters BIGINT NOT NULL

├── durationSeconds INTEGER NOT NULL

├── elevationMeters INTEGER DEFAULT 0

├── calories INTEGER DEFAULT 0

├── averagePaceSeconds INTEGER NULLABLE

├── averageSpeedMps NUMERIC(10,3) NULLABLE

├── startLatitude NUMERIC(9,6) NULLABLE

├── startLongitude NUMERIC(9,6) NULLABLE

├── endLatitude NUMERIC(9,6) NULLABLE

├── endLongitude NUMERIC(9,6) NULLABLE

├── startedAt TIMESTAMP NOT NULL

├── endedAt TIMESTAMP NOT NULL

├── verifiedAt TIMESTAMP NULLABLE

├── rejectedAt TIMESTAMP NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Activity type:

\`\`\`text

WALKING

RUNNING

CYCLING

\`\`\`

Activity status:

\`\`\`text

PENDING

VERIFYING

VERIFIED

NEEDS\_REVIEW

REJECTED

\`\`\`

Relationship:

\`\`\`text

users 1 ───── N activities

\`\`\`

\---

**## 16.2 activity\_points**

Menyimpan GPS points detail aktivitas.

\`\`\`text

activity\_points

├── id BIGSERIAL PK

├── activityId UUID FK → activities.id

├── sequence INTEGER NOT NULL

├── latitude NUMERIC(9,6) NOT NULL

├── longitude NUMERIC(9,6) NOT NULL

├── altitudeMeters NUMERIC(8,2) NULLABLE

├── accuracyMeters NUMERIC(8,2) NULLABLE

├── speedMps NUMERIC(8,3) NULLABLE

├── timestamp TIMESTAMP NOT NULL

└── createdAt TIMESTAMP NOT NULL

\`\`\`

Constraint:

\`\`\`text

UNIQUE(activityId, sequence)

\`\`\`

GPS detail tetap off-chain.

Blockchain tidak menyimpan raw GPS data.

Relationship:

\`\`\`text

activities 1 ───── N activity\_points

\`\`\`

\---

**# 17. AI Verification Database Schema**

**## 17.1 activity\_verifications**

Menyimpan hasil verifikasi AI.

\`\`\`text

activity\_verifications

├── id UUID PK

├── activityId UUID FK → activities.id UNIQUE

├── provider VARCHAR(100) NOT NULL

├── model VARCHAR(100) NULLABLE

├── result VARCHAR(30) NOT NULL

├── confidence NUMERIC(5,4) NULLABLE

├── score NUMERIC(8,4) NULLABLE

├── reason TEXT NULLABLE

├── metadata JSONB NULLABLE

├── verifiedAt TIMESTAMP NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Result:

\`\`\`text

VERIFIED

NEEDS\_REVIEW

REJECTED

\`\`\`

Contoh:

\`\`\`text

activity\_verifications

        │

        ├── result: VERIFIED

        ├── confidence: 0.9821

        └── provider: AI\_PROVIDER

\`\`\`

\---

**# 18. Activity Proof Database Schema**

**## 18.1 activity\_proofs**

Menyimpan hubungan activity dengan blockchain proof.

\`\`\`text

activity\_proofs

├── id UUID PK

├── activityId UUID FK → activities.id UNIQUE

├── activityHash VARCHAR(66) UNIQUE NOT NULL

├── contractAddress VARCHAR(42) NOT NULL

├── blockchainId INTEGER NOT NULL

├── proofId VARCHAR(100) NULLABLE

├── transactionId UUID FK → blockchain\_transactions.id NULLABLE

├── verified BOOLEAN NOT NULL DEFAULT false

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Relationship:

\`\`\`text

activities 1 ───── 1 activity\_proofs

\`\`\`

\`activityHash\` harus sama dengan hash yang dikirim ke \`ActivityProof.sol\`.

\---

**# 19. Reward Database Schema**

**## 19.1 rewards**

Menyimpan reward activity pada backend.

\`\`\`text

rewards

├── id UUID PK

├── userId UUID FK → users.id

├── activityId UUID FK → activities.id UNIQUE

├── walletId UUID FK → wallets.id NULLABLE

├── rewardType VARCHAR(30) NOT NULL

├── amountBaseUnits NUMERIC(78,0) NOT NULL

├── status VARCHAR(30) NOT NULL

├── contractAddress VARCHAR(42) NULLABLE

├── transactionId UUID FK → blockchain\_transactions.id NULLABLE

├── rewardedAt TIMESTAMP NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Reward type:

\`\`\`text

ACTIVITY

CHALLENGE

ACHIEVEMENT

\`\`\`

Status:

\`\`\`text

PENDING

PROCESSING

COMPLETED

FAILED

UNAVAILABLE

\`\`\`

Jika wallet belum tersedia:

\`\`\`text

status = UNAVAILABLE

\`\`\`

atau sesuai business rule MVP:

\`\`\`text

status = PENDING

\`\`\`

Reward tidak boleh dibuat dua kali untuk activity yang sama.

\---

**## 19.2 reward\_daily\_limits**

Menyimpan penggunaan reward harian.

\`\`\`text

reward\_daily\_limits

├── id UUID PK

├── userId UUID FK → users.id

├── rewardDate DATE NOT NULL

├── totalAmountBaseUnits NUMERIC(78,0) NOT NULL DEFAULT 0

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Constraint:

\`\`\`text

UNIQUE(userId, rewardDate)

\`\`\`

Digunakan untuk membantu tracking daily reward cap di backend.

Smart contract \`RewardManager.sol\` tetap menjadi authority untuk aturan on-chain.

\---

**# 20. Blockchain Database Schema**

**## 20.1 blockchain\_transactions**

Menyimpan semua transaksi blockchain yang dibuat backend.

\`\`\`text

blockchain\_transactions

├── id UUID PK

├── userId UUID FK → users.id NULLABLE

├── activityId UUID FK → activities.id NULLABLE

├── type VARCHAR(50) NOT NULL

├── chainId INTEGER NOT NULL

├── contractAddress VARCHAR(42) NOT NULL

├── functionName VARCHAR(100) NOT NULL

├── transactionHash VARCHAR(66) UNIQUE NULLABLE

├── blockNumber BIGINT NULLABLE

├── status VARCHAR(30) NOT NULL

├── gasUsed NUMERIC(78,0) NULLABLE

├── gasPrice NUMERIC(78,0) NULLABLE

├── errorMessage TEXT NULLABLE

├── submittedAt TIMESTAMP NULLABLE

├── confirmedAt TIMESTAMP NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Transaction type:

\`\`\`text

CREATE\_ACTIVITY\_PROOF

REWARD\_ACTIVITY

COMPLETE\_CHALLENGE

CLAIM\_CHALLENGE\_REWARD

OTHER

\`\`\`

Status:

\`\`\`text

PENDING

SUBMITTED

CONFIRMED

FAILED

\`\`\`

\---

**## 20.2 blockchain\_contracts**

Menyimpan konfigurasi contract yang digunakan backend.

\`\`\`text

blockchain\_contracts

├── id UUID PK

├── name VARCHAR(100) NOT NULL

├── address VARCHAR(42) NOT NULL

├── chainId INTEGER NOT NULL

├── version VARCHAR(50) NULLABLE

├── isActive BOOLEAN NOT NULL DEFAULT true

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Contract MVP:

\`\`\`text

FITToken

ActivityProof

RewardManager

ChallengeManager

\`\`\`

Untuk BSC Testnet:

\`\`\`text

chainId = 97

\`\`\`

\---

**# 21. Route & Map Database Schema**

**## 21.1 routes**

\`\`\`text

routes

├── id UUID PK

├── userId UUID FK → users.id

├── name VARCHAR(255) NOT NULL

├── description TEXT NULLABLE

├── activityType VARCHAR(20) NOT NULL

├── distanceMeters BIGINT NOT NULL

├── estimatedDurationSeconds INTEGER NULLABLE

├── elevationMeters INTEGER DEFAULT 0

├── difficulty VARCHAR(20) NULLABLE

├── startLatitude NUMERIC(9,6) NOT NULL

├── startLongitude NUMERIC(9,6) NOT NULL

├── endLatitude NUMERIC(9,6) NOT NULL

├── endLongitude NUMERIC(9,6) NOT NULL

├── polyline TEXT NULLABLE

├── isPublic BOOLEAN DEFAULT true

├── popularityScore NUMERIC(12,4) DEFAULT 0

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Relationship:

\`\`\`text

users 1 ───── N routes

\`\`\`

\---

**## 21.2 route\_points**

\`\`\`text

route\_points

├── id BIGSERIAL PK

├── routeId UUID FK → routes.id

├── sequence INTEGER NOT NULL

├── latitude NUMERIC(9,6) NOT NULL

├── longitude NUMERIC(9,6) NOT NULL

├── elevationMeters NUMERIC(8,2) NULLABLE

└── createdAt TIMESTAMP NOT NULL

\`\`\`

Constraint:

\`\`\`text

UNIQUE(routeId, sequence)

\`\`\`

\---

**## 21.3 saved\_routes**

\`\`\`text

saved\_routes

├── id UUID PK

├── userId UUID FK → users.id

├── routeId UUID FK → routes.id

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Constraint:

\`\`\`text

UNIQUE(userId, routeId)

\`\`\`

\---

**## 21.4 route\_waypoints**

\`\`\`text

route\_waypoints

├── id UUID PK

├── routeId UUID FK → routes.id

├── name VARCHAR(255) NULLABLE

├── latitude NUMERIC(9,6) NOT NULL

├── longitude NUMERIC(9,6) NOT NULL

├── sequence INTEGER NOT NULL

└── createdAt TIMESTAMP NOT NULL

\`\`\`

\---

**# 22. Segment Database Schema**

**## 22.1 segments**

\`\`\`text

segments

├── id UUID PK

├── creatorId UUID FK → users.id

├── name VARCHAR(255) NOT NULL

├── activityType VARCHAR(20) NOT NULL

├── distanceMeters BIGINT NOT NULL

├── elevationGainMeters INTEGER DEFAULT 0

├── startLatitude NUMERIC(9,6) NOT NULL

├── startLongitude NUMERIC(9,6) NOT NULL

├── endLatitude NUMERIC(9,6) NOT NULL

├── endLongitude NUMERIC(9,6) NOT NULL

├── polyline TEXT NULLABLE

├── isPublic BOOLEAN DEFAULT true

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

\---

**## 22.2 segment\_efforts**

\`\`\`text

segment\_efforts

├── id UUID PK

├── segmentId UUID FK → segments.id

├── activityId UUID FK → activities.id

├── userId UUID FK → users.id

├── elapsedSeconds INTEGER NOT NULL

├── averageSpeedMps NUMERIC(10,3) NULLABLE

├── rank INTEGER NULLABLE

├── isPersonalBest BOOLEAN DEFAULT false

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Constraint:

\`\`\`text

UNIQUE(segmentId, activityId)

\`\`\`

\---

**# 23. Challenge Database Schema**

**## 23.1 challenges**

Menyimpan challenge pada database backend.

\`\`\`text

challenges

├── id UUID PK

├── blockchainChallengeId BIGINT NULLABLE

├── creatorId UUID FK → users.id NULLABLE

├── name VARCHAR(255) NOT NULL

├── description TEXT NULLABLE

├── type VARCHAR(30) NOT NULL

├── targetDistanceMeters BIGINT NULLABLE

├── targetDurationSeconds BIGINT NULLABLE

├── targetActivities INTEGER NULLABLE

├── targetStreakDays INTEGER NULLABLE

├── rewardAmountBaseUnits NUMERIC(78,0) NULLABLE

├── startAt TIMESTAMP NOT NULL

├── endAt TIMESTAMP NOT NULL

├── isActive BOOLEAN NOT NULL DEFAULT true

├── contractAddress VARCHAR(42) NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Challenge type:

\`\`\`text

DISTANCE

DURATION

ACTIVITY\_COUNT

STREAK

\`\`\`

\---

**## 23.2 challenge\_participants**

\`\`\`text

challenge\_participants

├── id UUID PK

├── challengeId UUID FK → challenges.id

├── userId UUID FK → users.id

├── progressDistanceMeters BIGINT DEFAULT 0

├── progressDurationSeconds BIGINT DEFAULT 0

├── progressActivities INTEGER DEFAULT 0

├── currentStreak INTEGER DEFAULT 0

├── joinedAt TIMESTAMP NOT NULL

├── completedAt TIMESTAMP NULLABLE

├── rewardClaimedAt TIMESTAMP NULLABLE

├── blockchainProgress BIGINT NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Constraint:

\`\`\`text

UNIQUE(challengeId, userId)

\`\`\`

\---

**## 23.3 challenge\_activity\_usages**

Mencegah satu activity digunakan kembali pada challenge yang sama.

\`\`\`text

challenge\_activity\_usages

├── id UUID PK

├── challengeId UUID FK → challenges.id

├── participantId UUID FK → challenge\_participants.id

├── activityId UUID FK → activities.id

├── progressAmount BIGINT NOT NULL

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Constraint:

\`\`\`text

UNIQUE(challengeId, activityId)

\`\`\`

Satu activity hanya dapat digunakan satu kali dalam challenge tertentu.

\---

**# 24. Goals Database Schema**

**## 24.1 goals**

\`\`\`text

goals

├── id UUID PK

├── userId UUID FK → users.id

├── type VARCHAR(30) NOT NULL

├── period VARCHAR(20) NOT NULL

├── targetValue BIGINT NOT NULL

├── currentValue BIGINT DEFAULT 0

├── startDate DATE NOT NULL

├── endDate DATE NOT NULL

├── completedAt TIMESTAMP NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Goal type:

\`\`\`text

DISTANCE

DURATION

ACTIVITY\_COUNT

ELEVATION

\`\`\`

Period:

\`\`\`text

WEEKLY

MONTHLY

YEARLY

\`\`\`

\---

**# 25. Social Database Schema**

**## 25.1 posts**

\`\`\`text

posts

├── id UUID PK

├── userId UUID FK → users.id

├── activityId UUID FK → activities.id NULLABLE

├── content TEXT NULLABLE

├── visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC'

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Visibility:

\`\`\`text

PUBLIC

FOLLOWERS

PRIVATE

\`\`\`

\---

**## 25.2 follows**

\`\`\`text

follows

├── id UUID PK

├── followerId UUID FK → users.id

├── followingId UUID FK → users.id

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Constraint:

\`\`\`text

UNIQUE(followerId, followingId)

\`\`\`

User tidak boleh follow dirinya sendiri.

\---

**## 25.3 kudos**

\`\`\`text

kudos

├── id UUID PK

├── userId UUID FK → users.id

├── postId UUID FK → posts.id

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Constraint:

\`\`\`text

UNIQUE(userId, postId)

\`\`\`

\---

**## 25.4 comments**

\`\`\`text

comments

├── id UUID PK

├── userId UUID FK → users.id

├── postId UUID FK → posts.id

├── parentCommentId UUID NULLABLE

├── content TEXT NOT NULL

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

\`parentCommentId\` digunakan jika nantinya ingin mendukung nested replies.

\---

**# 26. Club Database Schema**

**## 26.1 clubs**

\`\`\`text

clubs

├── id UUID PK

├── ownerId UUID FK → users.id

├── name VARCHAR(255) UNIQUE NOT NULL

├── description TEXT NULLABLE

├── avatarUrl TEXT NULLABLE

├── isPrivate BOOLEAN DEFAULT false

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

\---

**## 26.2 club\_members**

\`\`\`text

club\_members

├── id UUID PK

├── clubId UUID FK → clubs.id

├── userId UUID FK → users.id

├── role VARCHAR(20) NOT NULL DEFAULT 'MEMBER'

├── joinedAt TIMESTAMP NOT NULL

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Role:

\`\`\`text

OWNER

ADMIN

MEMBER

\`\`\`

Constraint:

\`\`\`text

UNIQUE(clubId, userId)

\`\`\`

\---

**## 26.3 club\_posts**

\`\`\`text

club\_posts

├── id UUID PK

├── clubId UUID FK → clubs.id

├── userId UUID FK → users.id

├── content TEXT NULLABLE

├── activityId UUID FK → activities.id NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

\---

**# 27. Achievement Database Schema**

**## 27.1 achievements**

Master data achievement.

\`\`\`text

achievements

├── id UUID PK

├── code VARCHAR(100) UNIQUE NOT NULL

├── name VARCHAR(255) NOT NULL

├── description TEXT NULLABLE

├── iconUrl TEXT NULLABLE

├── type VARCHAR(50) NOT NULL

├── requirementValue BIGINT NULLABLE

├── isActive BOOLEAN DEFAULT true

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Contoh:

\`\`\`text

FIRST\_RUN

10\_KM\_RUNNER

100\_KM\_RUNNER

FIRST\_5K

7\_DAY\_STREAK

100\_ACTIVITIES

\`\`\`

\---

**## 27.2 user\_achievements**

\`\`\`text

user\_achievements

├── id UUID PK

├── userId UUID FK → users.id

├── achievementId UUID FK → achievements.id

├── progressValue BIGINT DEFAULT 0

├── unlockedAt TIMESTAMP NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Constraint:

\`\`\`text

UNIQUE(userId, achievementId)

\`\`\`

\---

**# 28. Personal Records Database Schema**

**## 28.1 personal\_records**

\`\`\`text

personal\_records

├── id UUID PK

├── userId UUID FK → users.id

├── activityType VARCHAR(20) NOT NULL

├── recordType VARCHAR(30) NOT NULL

├── distanceMeters BIGINT NULLABLE

├── durationSeconds INTEGER NULLABLE

├── paceSeconds INTEGER NULLABLE

├── speedMps NUMERIC(10,3) NULLABLE

├── activityId UUID FK → activities.id

├── achievedAt TIMESTAMP NOT NULL

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Record type:

\`\`\`text

FASTEST\_1K

FASTEST\_5K

FASTEST\_10K

LONGEST\_DISTANCE

LONGEST\_DURATION

HIGHEST\_SPEED

\`\`\`

\---

**# 29. Statistics Database Schema**

**## 29.1 activity\_statistics**

Menyimpan statistik hasil kalkulasi activity.

\`\`\`text

activity\_statistics

├── id UUID PK

├── activityId UUID FK → activities.id UNIQUE

├── averagePaceSeconds INTEGER NULLABLE

├── averageSpeedMps NUMERIC(10,3) NULLABLE

├── maxSpeedMps NUMERIC(10,3) NULLABLE

├── elevationGainMeters INTEGER DEFAULT 0

├── elevationLossMeters INTEGER DEFAULT 0

├── calories INTEGER DEFAULT 0

├── movingTimeSeconds INTEGER NULLABLE

├── elapsedTimeSeconds INTEGER NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

\---

**## 29.2 activity\_splits**

Menyimpan split seperti 1 km, 5 km, dan seterusnya.

\`\`\`text

activity\_splits

├── id UUID PK

├── activityId UUID FK → activities.id

├── splitNumber INTEGER NOT NULL

├── distanceMeters BIGINT NOT NULL

├── durationSeconds INTEGER NOT NULL

├── paceSeconds INTEGER NULLABLE

├── averageSpeedMps NUMERIC(10,3) NULLABLE

├── elevationGainMeters INTEGER DEFAULT 0

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Constraint:

\`\`\`text

UNIQUE(activityId, splitNumber)

\`\`\`

\---

**# 30. Safety Database Schema**

**## 30.1 safety\_contacts**

\`\`\`text

safety\_contacts

├── id UUID PK

├── userId UUID FK → users.id

├── name VARCHAR(255) NOT NULL

├── phoneNumber VARCHAR(50) NOT NULL

├── relationship VARCHAR(100) NULLABLE

├── isPrimary BOOLEAN DEFAULT false

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

\---

**## 30.2 activity\_sharing\_sessions**

Menyimpan sesi live activity sharing.

\`\`\`text

activity\_sharing\_sessions

├── id UUID PK

├── activityId UUID FK → activities.id

├── userId UUID FK → users.id

├── shareTokenHash TEXT UNIQUE NOT NULL

├── startedAt TIMESTAMP NOT NULL

├── expiresAt TIMESTAMP NULLABLE

├── endedAt TIMESTAMP NULLABLE

├── isActive BOOLEAN DEFAULT true

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Share token disimpan dalam bentuk hash.

\---

**## 30.3 emergency\_events**

\`\`\`text

emergency\_events

├── id UUID PK

├── userId UUID FK → users.id

├── activityId UUID FK → activities.id NULLABLE

├── latitude NUMERIC(9,6) NULLABLE

├── longitude NUMERIC(9,6) NULLABLE

├── status VARCHAR(30) NOT NULL

├── triggeredAt TIMESTAMP NOT NULL

├── resolvedAt TIMESTAMP NULLABLE

├── createdAt TIMESTAMP NOT NULL

└── updatedAt TIMESTAMP NOT NULL

\`\`\`

Status:

\`\`\`text

TRIGGERED

NOTIFIED

RESOLVED

CANCELLED

\`\`\`

\---

**# 31. Complete Database Relationship**

Secara high-level:

\`\`\`text

                              users

                                │

         ┌──────────────────────┼──────────────────────┐

         │                      │                      │

         ↓                      ↓                      ↓

   auth\_accounts             sessions               wallets

         │                                             │

         │                                             │

         └──────────────────────┬──────────────────────┘

                                │

                                ↓

                            activities

                                │

              ┌─────────────────┼─────────────────┐

              │                 │                 │

              ↓                 ↓                 ↓

      activity\_points    activity\_verifications  activity\_statistics

                                │

                                ↓

                         activity\_proofs

                                │

                                ↓

                             rewards

                                │

                                ↓

                    blockchain\_transactions

\`\`\`

Social:

\`\`\`text

users

 │

 ├── posts

 │     ├── kudos

 │     └── comments

 │

 ├── follows

 │

 └── clubs

       ├── club\_members

       └── club\_posts

\`\`\`

Fitness:

\`\`\`text

users

 │

 ├── activities

 ├── routes

 │    ├── route\_points

 │    ├── route\_waypoints

 │    └── saved\_routes

 │

 ├── segments

 │    └── segment\_efforts

 │

 ├── challenges

 │    └── challenge\_participants

 │           └── challenge\_activity\_usages

 │

 ├── goals

 ├── personal\_records

 ├── user\_statistics

 └── achievements

        └── user\_achievements

\`\`\`

Safety:

\`\`\`text

users

 │

 ├── safety\_contacts

 ├── activity\_sharing\_sessions

 └── emergency\_events

\`\`\`

\---

**# 32. Authentication Routes**

Login utama Kalcerly:

\`\`\`text

POST   /api/auth/register

POST   /api/auth/login

POST   /api/auth/google

POST   /api/auth/refresh

POST   /api/auth/logout

GET    /api/auth/me

\`\`\`

Wallet tidak digunakan sebagai endpoint login utama.

Endpoint wallet authentication/verification:

\`\`\`text

POST   /api/auth/wallet/nonce

POST   /api/auth/wallet/verify

\`\`\`

Endpoint tersebut digunakan untuk \*\*menghubungkan dan memverifikasi wallet terhadap authenticated user\*\*.

Flow login:

\`\`\`text

Email + Password

       │

       └──────┐

              ↓

        Kalcerly Account

              ↑

       Google OAuth

\`\`\`

Flow wallet:

\`\`\`text

Authenticated User

       ↓

Connect Wallet

       ↓

SIWE Verification

       ↓

Wallet Linked

\`\`\`

\---

**# 33. Wallet Management Routes**

Wallet connection sebenarnya terjadi di Flutter melalui Reown AppKit.

Backend hanya bertugas:

\`\`\`text

Verify

Store

Associate

\`\`\`

Routes:

\`\`\`text

GET    /api/wallet

POST   /api/wallet/connect

POST   /api/wallet/verify

PATCH  /api/wallet/primary

DELETE /api/wallet/\:id

\`\`\`

\`POST /api/wallet/connect\` dapat digunakan untuk memulai proses wallet linking.

\`POST /api/wallet/verify\` digunakan setelah user menandatangani SIWE message.

Contoh flow:

\`\`\`text

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

\`\`\`

Semua endpoint wallet management membutuhkan authenticated user.

\---

**# 34. Authentication Service Architecture**

\`\`\`text

auth.controller.ts

        ↓

auth.service.ts

        ↓

┌─────────────────────────┐

│                         │

├── Email Auth            │

├── Google Auth           │

├── Token Service         │

└── Session Management    │

\`\`\`

Wallet memiliki service terpisah karena wallet bukan lagi bagian dari primary login flow.

\`\`\`text

wallet.controller.ts

        ↓

wallet.service.ts

        ↓

wallet-auth.service.ts

        ↓

SIWE Verification

        ↓

Wallet Ownership

\`\`\`

Recommended services:

\`\`\`text

services/

├── auth.service.ts

├── google-auth.service.ts

├── wallet-auth.service.ts

├── token.service.ts

└── session.service.ts

\`\`\`

Tanggung jawab:

\`\`\`text

auth.service.ts

        ↓

Email authentication

Google authentication

User account creation

\`\`\`

\`\`\`text

wallet-auth.service.ts

        ↓

Nonce generation

SIWE message

Signature verification

Wallet ownership

\`\`\`

\`\`\`text

token.service.ts

        ↓

Access token

Refresh token

Token rotation

\`\`\`

\`\`\`text

session.service.ts

        ↓

Create session

Validate session

Revoke session

\`\`\`

\---

**# 35. Updated Backend Structure**

\`\`\`text

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

│   │   │   ├── user-settings.ts

│   │   │   ├── user-statistics.ts

│   │   │   ├── auth-accounts.ts

│   │   │   ├── auth-nonces.ts

│   │   │   ├── sessions.ts

│   │   │   ├── wallets.ts

│   │   │   ├── activities.ts

│   │   │   ├── activity-points.ts

│   │   │   ├── activity-verifications.ts

│   │   │   ├── activity-proofs.ts

│   │   │   ├── activity-statistics.ts

│   │   │   ├── activity-splits.ts

│   │   │   ├── routes.ts

│   │   │   ├── route-points.ts

│   │   │   ├── route-waypoints.ts

│   │   │   ├── saved-routes.ts

│   │   │   ├── segments.ts

│   │   │   ├── segment-efforts.ts

│   │   │   ├── challenges.ts

│   │   │   ├── challenge-participants.ts

│   │   │   ├── challenge-activity-usages.ts

│   │   │   ├── goals.ts

│   │   │   ├── rewards.ts

│   │   │   ├── reward-daily-limits.ts

│   │   │   ├── posts.ts

│   │   │   ├── follows.ts

│   │   │   ├── kudos.ts

│   │   │   ├── comments.ts

│   │   │   ├── clubs.ts

│   │   │   ├── club-members.ts

│   │   │   ├── club-posts.ts

│   │   │   ├── achievements.ts

│   │   │   ├── user-achievements.ts

│   │   │   ├── personal-records.ts

│   │   │   ├── safety-contacts.ts

│   │   │   ├── activity-sharing-sessions.ts

│   │   │   ├── emergency-events.ts

│   │   │   ├── blockchain-contracts.ts

│   │   │   └── blockchain-transactions.ts

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

\`\`\`

\---

**# 36. Authentication Middleware**

Protected endpoint:

\`\`\`text

Authorization: Bearer \<access\_token>

\`\`\`

Flow:

\`\`\`text

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

\`\`\`

Expired access token:

\`\`\`text

401 Unauthorized

\`\`\`

Flutter kemudian menggunakan refresh token.

Wallet management juga menggunakan authentication middleware.

Contoh:

\`\`\`text

POST /api/wallet/connect

Authorization:

Bearer ACCESS\_TOKEN

\`\`\`

Dengan demikian hanya user yang sudah login yang dapat menghubungkan wallet ke account tersebut.

\---

**# 37. Authentication State on Mobile**

Flutter harus dapat melakukan automatic session restoration.

Flow:

\`\`\`text

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

\`\`\`

Jika refresh token juga expired/revoked:

\`\`\`text

Refresh Failed

     ↓

Clear local tokens

     ↓

Redirect Login

\`\`\`

Wallet connection tidak dilakukan otomatis pada saat aplikasi dibuka.

Wallet hanya diminta ketika:

\`\`\`text

User

 ↓

Requests Web3 Feature

 ↓

Wallet Connected?

    │

    ├── YES → Continue

    │

    └── NO → Request Wallet Connection

\`\`\`

Dengan demikian user tidak dipaksa connect wallet setiap membuka aplikasi.

\---

**# 38. Account Linking**

User dapat memiliki beberapa authentication methods dalam satu account.

Contoh:

\`\`\`text

Kalcerly Account

│

├── Email

│   └── user\@email.com

│

├── Google

│   └── Google Account ID

│

└── Wallet

    └── 0xABC...

\`\`\`

Wallet merupakan \*\*optional linked identity\*\*.

Hal ini penting agar user yang awalnya login menggunakan Google dapat menghubungkan wallet tanpa membuat account baru.

Flow:

\`\`\`text

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

\`\`\`

Contoh lainnya:

\`\`\`text

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

\`\`\`

Wallet tidak menggantikan authentication method utama user.

Sebaliknya, wallet dapat digunakan sebagai identitas Web3 yang melekat pada account.

\---

**# 39. Security Requirements**

Authentication wajib memenuhi:

\* Password tidak pernah disimpan plaintext
* Email/password user wajib diverifikasi sebelum authenticated session dibuat
* Verification token tidak pernah disimpan plaintext
* Verification token memiliki expiration dan single-use
* Verification token lama diinvalidate saat resend verification

\* Private key tidak pernah disimpan

\* Seed phrase tidak pernah disimpan

\* Access token memiliki expiration

\* Refresh token memiliki expiration

\* Refresh token disimpan dalam bentuk hash

\* Refresh token rotation

\* Session revocation

\* SIWE nonce single-use

\* SIWE nonce expiration

\* Signature verification

\* Chain ID validation

\* Domain validation

\* Replay attack prevention

\* Rate limiting untuk authentication endpoint

\* Rate limiting untuk wallet verification endpoint

\* Input validation

\* HTTPS pada production

\* Sensitive credentials hanya melalui environment variables

\* Wallet hanya dapat di-link oleh authenticated user

\* Satu wallet tidak dapat dimiliki oleh lebih dari satu account

\* Wallet address divalidasi sebelum disimpan

\* Wallet ownership harus diverifikasi sebelum wallet ditandai sebagai verified

\* Blockchain transaction status harus dapat diverifikasi

\* Reward tidak boleh diproses dua kali

\* Activity tidak boleh membuat duplicate proof

\* Activity tidak boleh digunakan dua kali dalam challenge yang sama

\---

**# 40. Updated Complete User Flow**

\`\`\`text

                    USER

                      │

               ┌──────┴──────┐

               │             │

             Email         Google

               │             │

            Password        OAuth

               │             │

               └──────┬──────┘

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

          ┌───────────┴───────────┐

          ↓                       ↓

    Access Token            Refresh Token

     short-lived              long-lived

          │                       │

          ↓                       ↓

     API Requests            Token Refresh

                                  │

                                  ↓

                           New Access Token

\`\`\`

Setelah user berhasil login:

\`\`\`text

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

        │          │         │

        │          └────┬────┘

        │               ↓

        │        Wallet Linked

        │               │

        └────────── Web3 Features

\`\`\`

\---

**# 41. Authentication + Blockchain Flow**

Wallet authentication tidak lagi menjadi primary login flow.

Primary authentication:

\`\`\`text

Email / Google

 ↓

Backend

 ↓

Authenticated User

 ↓

Access + Refresh Token

\`\`\`

Wallet linking:

\`\`\`text

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

\`\`\`

Reward:

\`\`\`text

Verified Activity

 ↓

ActivityProof

 ↓

RewardManager

 ↓

FITToken

 ↓

Primary Wallet

\`\`\`

Jadi ketiga flow tetap dipisahkan:

\`\`\`text

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

\`\`\`

User dapat memiliki session tanpa wallet.

User dapat memiliki wallet tanpa harus menggunakan wallet sebagai login utama.

\---

**# 42. Activity Flow**

\`\`\`text

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

VERIFIED     NEEDS\_REVIEW      REJECTED

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

\`\`\`

Untuk UX, user tetap dapat melakukan tracking aktivitas walaupun belum memiliki wallet.

Namun FIT Token membutuhkan wallet yang sudah terverifikasi.

Contoh:

\`\`\`text

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

\`\`\`

Backend harus memiliki mekanisme untuk mencegah activity lama diproses ulang secara sembarangan.

\---

**# 43. Route & Map**

Routes tetap menjadi bagian utama backend.

\`\`\`text

GET    /api/routes

GET    /api/routes/\:id

POST   /api/routes

PATCH  /api/routes/\:id

DELETE /api/routes/\:id

POST   /api/routes/preview

GET    /api/routes/suggested

GET    /api/routes/nearby

POST   /api/routes/\:id/save

DELETE /api/routes/\:id/save

GET    /api/routes/saved

GET    /api/routes/popular

GET    /api/maps/heatmap/personal

GET    /api/maps/heatmap/global

GET    /api/maps/nearby

\`\`\`

Route dapat memiliki:

\* GPS points

\* polyline

\* distance

\* estimated duration

\* elevation

\* difficulty

\* activity type

\* start/end location

\* waypoints

\* popularity

\---

**# 44. Strava-like Features**

Backend menyediakan:

**## Activity**

\* Walking

\* Running

\* Cycling

\* GPS route

\* Distance

\* Duration

\* Pace

\* Speed

\* Elevation

\* Calories

\* Splits

\* Personal records

\* Activity history

\* Training statistics

**## Routes**

\* Route planning

\* Route preview

\* Suggested routes

\* Nearby routes

\* Saved routes

\* Popular routes

\* Personal heatmap

\* Global heatmap

**## Segments**

\* Segment creation

\* Segment matching

\* Segment efforts

\* Segment leaderboard

\* Personal best

**## Challenges**

\* Distance challenge

\* Duration challenge

\* Activity count challenge

\* Streak challenge

\* Challenge leaderboard

**## Goals**

\* Weekly goals

\* Monthly goals

\* Yearly goals

\* Distance goals

\* Duration goals

\* Activity count goals

\* Elevation goals

**## Social**

\* Feed

\* Activity posts

\* Follow

\* Unfollow

\* Kudos

\* Comments

\* Clubs

\* Club feed

**## Achievement**

\* Badges

\* Milestones

\* Personal records

\* Streak achievements

**## Safety**

\* Safety contacts

\* Live activity sharing

\* Emergency activity session

\---

**# 45. Blockchain Integration**

Exactly four smart contracts digunakan:

\`\`\`text

FITToken.sol

ActivityProof.sol

RewardManager.sol

ChallengeManager.sol

\`\`\`

Backend tidak menggunakan:

\`\`\`text

Factory

Escrow

RewardPool

\`\`\`

untuk MVP.

Blockchain service menjadi satu-satunya service yang melakukan contract interaction.

\`\`\`text

blockchain.service.ts

        ↓

Viem

        ↓

Smart Contracts

\`\`\`

Blockchain hanya digunakan ketika aktivitas atau fitur memang membutuhkan state on-chain.

Wallet user menjadi destination untuk FIT Token reward.

User tidak perlu memiliki wallet hanya untuk menggunakan:

\* Feed

\* Profile

\* Route

\* GPS tracking

\* Statistics

\* Goals

\* Social features

\* Activity history

Wallet dibutuhkan untuk fitur Web3 seperti:

\* FIT Token

\* Activity proof yang dikaitkan dengan wallet

\* Blockchain rewards

\* Blockchain challenges

\---

**# 46. Source of Truth**

\| Data                       | Source of Truth               |

\| -------------------------- | ----------------------------- |

\| User profile               | PostgreSQL                    |

\| Authentication             | PostgreSQL + Auth Provider    |

\| Session                    | PostgreSQL                    |

\| Wallet ownership           | PostgreSQL + Wallet Signature |

\| Detailed GPS               | PostgreSQL                    |

\| Activity                   | PostgreSQL                    |

\| AI Verification            | Backend AI                    |

\| Activity Proof             | ActivityProof.sol             |

\| FIT Balance                | FITToken.sol                  |

\| Activity Reward            | RewardManager.sol             |

\| Challenge Blockchain State | ChallengeManager.sol          |

\| Transaction Status         | Blockchain + PostgreSQL       |

\| Social Feed                | PostgreSQL                    |

\| Routes                     | PostgreSQL                    |

\| Statistics                 | PostgreSQL                    |

\| Goals                      | PostgreSQL                    |

\| Achievements               | PostgreSQL                    |

\| Safety                     | PostgreSQL                    |

Untuk data blockchain, PostgreSQL berfungsi sebagai application-level record dan cache/status tracking, sedangkan blockchain tetap menjadi authority untuk state on-chain.

\---

**# 47. Database Design Principles**

Database Kalcerly harus mengikuti prinsip berikut:

**## 47.1 UUID**

Entity utama menggunakan UUID:

\`\`\`text

users

activities

routes

challenges

goals

posts

clubs

rewards

transactions

\`\`\`

Hal ini menghindari sequential ID yang mudah ditebak pada public API.

\---

**## 47.2 Timestamp**

Entity utama menggunakan:

\`\`\`text

createdAt

updatedAt

\`\`\`

Status-based entity dapat memiliki timestamp tambahan:

\`\`\`text

verifiedAt

completedAt

revokedAt

rewardedAt

\`\`\`

\---

**## 47.3 Foreign Key**

Relasi antar entity harus menggunakan foreign key.

Contoh:

\`\`\`text

activities.userId

    ↓

users.id

\`\`\`

dan:

\`\`\`text

rewards.activityId

    ↓

activities.id

\`\`\`

\---

**## 47.4 Unique Constraints**

Digunakan untuk mencegah duplicate state.

Contoh:

\`\`\`text

users.email

auth\_accounts(provider, providerAccountId)

wallets.address

activities → activity proof

rewards.activityId

challenge\_participants(challengeId, userId)

challenge\_activity\_usages(challengeId, activityId)

follows(followerId, followingId)

kudos(userId, postId)

\`\`\`

\---

**## 47.5 Indexing**

Index utama yang direkomendasikan:

\`\`\`text

users.email

sessions.userId

sessions.refreshTokenHash

wallets.userId

wallets.address

activities.userId

activities.status

activities.startedAt

activity\_points.activityId

activity\_verifications.activityId

rewards.userId

rewards.activityId

rewards.status

blockchain\_transactions.transactionHash

blockchain\_transactions.userId

blockchain\_transactions.status

routes.userId

routes.activityType

segments.activityType

challenges.isActive

challenges.startAt

challenges.endAt

challenge\_participants.challengeId

challenge\_participants.userId

posts.userId

posts.createdAt

follows.followerId

follows.followingId

\`\`\`

\---

**# 48. Definition of Done — Authentication**

Authentication dianggap selesai apabila:

\* Register email/password

\* Login email/password

\* Password hashing

\* Google login

\* Google account linking

\* Wallet detection melalui Reown AppKit

\* Wallet connection

\* SIWE nonce generation

\* SIWE signature verification

\* Wallet ownership verification

\* Wallet linking

\* Access token

\* Refresh token

\* Refresh token rotation

\* Session database

\* Logout

\* Session revocation

\* \`/api/auth/me\`

\* Automatic token refresh

\* Mobile secure token storage

\* Authentication rate limiting

\* Wallet verification rate limiting

\* Replay attack protection

\* Private key/seed phrase never stored

\* Wallet tidak wajib ketika login

\* Wallet hanya diminta ketika user membutuhkan fitur Web3

\* Wallet hanya dapat di-link ke authenticated user

\* Wallet address tidak dapat digunakan oleh dua account

\* Chain ID validation

\* SIWE domain validation

\* SIWE expiration validation

\* SIWE nonce single-use

\---

**# 49. Definition of Done — Database**

Database dianggap siap apabila:

\* Semua schema utama telah dibuat menggunakan Drizzle ORM

\* Semua primary key telah ditentukan

\* Semua foreign key telah ditentukan

\* Unique constraint telah diterapkan

\* Index utama telah dibuat

\* Migration dapat dijalankan dari database kosong

\* Migration dapat dijalankan secara incremental

\* Relations Drizzle telah didefinisikan

\* Enum/status memiliki nilai yang konsisten

\* Timestamp menggunakan timezone yang konsisten

\* Password tidak pernah disimpan plaintext

\* Refresh token tidak pernah disimpan plaintext

\* Wallet address disimpan dalam format yang tervalidasi

\* Activity GPS tersimpan off-chain

\* Activity proof memiliki unique activity hash

\* Reward activity memiliki duplicate protection

\* Challenge activity usage memiliki duplicate protection

\* Blockchain transaction memiliki tracking status

\* Database transaction digunakan untuk operasi multi-table yang harus atomic

\---

**# 50. Final Authentication Architecture**

\`\`\`text

                         KALCERLY

                            │

                     Flutter Mobile

                            │

                ┌───────────┴───────────┐

                │                       │

           Email/Password             Google

                │                       │

                │                     OAuth

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

          \~15 minutes                \~30 days

               │                         │

               ↓                         ↓

           API Calls                Token Refresh

                                         │

                                         ↓

                                  New Access Token

\`\`\`

Wallet berada sebagai optional Web3 capability:

\`\`\`text

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

\`\`\`

Setelah authentication selesai, user dapat menggunakan:

\`\`\`text

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

\`\`\`

Namun wallet bersifat \*\*optional pada level account\*\*:

\`\`\`text

User Login

    ↓

Can use Kalcerly

    ↓

No Wallet Required

\`\`\`

Ketika user ingin mendapatkan reward blockchain:

\`\`\`text

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

\`\`\`

Dengan arsitektur ini, Kalcerly tidak terkunci menjadi aplikasi Web3-only.

User bisa masuk seperti aplikasi fitness biasa menggunakan \*\*email/password atau Google\*\*, melakukan tracking, melihat route, menggunakan social features, melihat statistik, dan menggunakan fitur fitness lainnya tanpa wallet.

Wallet hanya diperkenalkan ketika memang memberikan nilai kepada user, misalnya ketika user ingin memperoleh \*\*FIT Token Rewards\*\* atau menggunakan fitur blockchain.

Dengan demikian pengalaman pengguna menjadi:

\`\`\`text

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

\`\`\`

Arsitektur database mendukung keseluruhan lifecycle tersebut:

\`\`\`text

                         KALCERLY USER

                              │

                ┌─────────────┼─────────────┐

                ↓             ↓             ↓

          Authentication    Profile       Wallet

                │                           │

                ↓                           ↓

             Session                    SIWE Verify

                │                           │

                └─────────────┬─────────────┘

                              ↓

                           Activity

                              │

                   ┌──────────┴──────────┐

                   ↓                     ↓

              GPS Tracking           AI Verify

                   │                     │

                   └──────────┬──────────┘

                              ↓

                          VERIFIED

                              │

                    ┌─────────┴─────────┐

                    ↓                   ↓

               No Wallet            Wallet

                    │                   │

              Save Activity             ↓

                    │             ActivityProof

                    │                   │

                    │             RewardManager

                    │                   │

                    │                FITToken

                    │                   │

                    └─────────┬─────────┘

                              ↓

                         Statistics

                              │

             ┌────────────────┼────────────────┐

             ↓                ↓                ↓

         Challenge          Goals         Achievement

             │                │                │

             └────────────────┼────────────────┘

                              ↓

                           Social

                              │

                     Feed / Kudos / Comments

                              │

                            Clubs

\`\`\`

Dengan demikian PostgreSQL menjadi pusat data aplikasi, sedangkan blockchain digunakan secara terkontrol untuk \*\*proof, reward, dan challenge state\*\* yang memang membutuhkan verifiability on-chain.