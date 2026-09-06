# Kalcerly — Smart Contract PRD

## 1. Overview

Kalcerly adalah social fitness platform dengan konsep:

**Track → Verify → Earn → Compete → Improve**

Smart contract digunakan untuk membuat aktivitas fitness yang telah diverifikasi AI menjadi **verifiable on-chain records** dan memberikan reward berupa **FIT Token** kepada pengguna.

Blockchain **tidak menyimpan data GPS mentah** maupun data aktivitas yang besar. Data detail aktivitas tetap disimpan di backend/database. Blockchain hanya menyimpan data penting untuk verifikasi, seperti activity hash, wallet address, status proof, timestamp, dan reward record.

Smart contract architecture untuk MVP terdiri dari **4 contract utama**:

```text
contracts/
├── src/
│   ├── FITToken.sol
│   ├── ActivityProof.sol
│   ├── RewardManager.sol
│   └── ChallengeManager.sol
├── script/
│   └── Deploy.s.sol
├── test/
│   ├── FITToken.t.sol
│   ├── ActivityProof.t.sol
│   ├── RewardManager.t.sol
│   └── ChallengeManager.t.sol
├── foundry.toml
└── README.md
```

Tidak diperlukan `Factory`, `Escrow`, atau `RewardPool` untuk MVP.

---

# 2. Smart Contract Goals

Smart contract harus menyediakan kemampuan berikut:

1. Membuat dan mengelola FIT Token.
2. Mencatat proof dari aktivitas yang telah diverifikasi.
3. Mencegah activity proof yang sama digunakan lebih dari satu kali.
4. Memberikan FIT Token berdasarkan aktivitas yang valid.
5. Membatasi reward untuk mencegah abuse.
6. Mengelola challenge.
7. Mencatat progress pengguna pada challenge.
8. Memberikan reward ketika challenge selesai.
9. Menyediakan event yang dapat digunakan backend/frontend untuk tracking.
10. Memastikan hanya address yang memiliki permission tertentu yang dapat melakukan operasi sensitif.

---

# 3. Architecture

Arsitektur smart contract:

```text
                    ┌─────────────────────┐
                    │   Kalcerly Backend  │
                    │                     │
                    │ GPS + Activity Data │
                    │ AI Verification     │
                    └──────────┬──────────┘
                               │
                               │ Verified Activity
                               ▼
                    ┌─────────────────────┐
                    │   ActivityProof     │
                    │                     │
                    │ activityHash        │
                    │ user                │
                    │ activityType        │
                    │ distance            │
                    │ timestamp           │
                    └──────────┬──────────┘
                               │
                               │ valid proof
                               ▼
                    ┌─────────────────────┐
                    │   RewardManager     │
                    │                     │
                    │ reward calculation  │
                    │ duplicate check     │
                    │ reward limit        │
                    └──────────┬──────────┘
                               │
                               │ mint reward
                               ▼
                    ┌─────────────────────┐
                    │      FITToken       │
                    │                     │
                    │ ERC20 Token         │
                    │ Mint / Transfer     │
                    └─────────────────────┘


                    ┌─────────────────────┐
                    │ ChallengeManager    │
                    │                     │
                    │ Create Challenge    │
                    │ Track Progress      │
                    │ Complete Challenge  │
                    │ Challenge Reward    │
                    └─────────────────────┘
```

---

# 4. Contract Responsibilities

## 4.1 FITToken.sol

### Purpose

`FITToken.sol` adalah ERC20 utility/reward token yang digunakan oleh Kalcerly.

FIT Token digunakan sebagai reward untuk:

* Verified activity
* Challenge completion
* Achievement/reward system
* Future ecosystem utility

### Requirements

Contract harus:

* Menggunakan ERC20.
* Menggunakan Solidity `^0.8.20` atau versi compatible.
* Memiliki controlled minting.
* Hanya address yang memiliki role/permission yang sesuai yang dapat melakukan mint.
* Memiliki maximum supply.
* Mendukung transfer ERC20 standar.

### Token Configuration

```text
Name:
FIT Token

Symbol:
FIT

Decimals:
18

Maximum Supply:
1,000,000 FIT
```

Maximum supply harus dinyatakan dalam base unit Solidity:

```solidity
uint256 public constant MAX_SUPPLY = 1_000_000 ether;
```

### Mint Requirements

`mint()` hanya boleh dipanggil oleh address yang diberi permission sebagai reward distributor/manager.

Contoh:

```solidity
function mint(
    address to,
    uint256 amount
) external onlyRole(MINTER_ROLE)
```

Contract harus memastikan:

```text
currentSupply + amount <= MAX_SUPPLY
```

Jika melebihi maximum supply, transaksi harus revert.

### Events

Minimal menyediakan:

```solidity
event TokensMinted(
    address indexed to,
    uint256 amount
);
```

### Security

* Tidak boleh ada public unrestricted mint.
* Mint tidak boleh melewati `MAX_SUPPLY`.
* Gunakan OpenZeppelin ERC20.
* Gunakan access control yang jelas.
* Jangan menyimpan logic reward calculation di token contract.

---

# 5. ActivityProof.sol

## Purpose

`ActivityProof.sol` digunakan untuk membuat bukti on-chain bahwa sebuah aktivitas fitness telah diverifikasi.

Contract ini **bukan tempat menyimpan seluruh activity data**.

Data seperti:

* GPS route
* GPS coordinates
* Sensor data
* Detailed AI analysis
* Raw activity logs

tetap berada di backend.

Blockchain hanya menyimpan minimal information yang dibutuhkan untuk verifikasi.

---

## Activity Proof Data

Setiap activity proof minimal memiliki:

```solidity
struct ActivityProof {
    address user;
    bytes32 activityHash;
    ActivityType activityType;
    uint256 distance;
    uint256 duration;
    uint256 timestamp;
    bool verified;
}
```

Activity type:

```solidity
enum ActivityType {
    WALKING,
    RUNNING,
    CYCLING
}
```

Distance dapat disimpan dalam satuan yang konsisten, misalnya meter.

Duration dapat disimpan dalam seconds.

---

## Activity Hash

Setiap aktivitas harus mempunyai unique hash.

Contoh konsep:

```text
activityHash =
keccak256(
    user +
    activityId +
    activityType +
    distance +
    duration +
    timestamp
)
```

Hash digunakan sebagai identifier untuk memastikan aktivitas yang sama tidak dapat dicatat kembali.

Contract harus menyediakan:

```solidity
mapping(bytes32 => bool) public proofExists;
```

Jika hash sudah pernah digunakan:

```text
REVERT
```

---

## Create Proof

Backend yang telah melakukan AI verification dapat memanggil function untuk membuat proof.

Contoh interface:

```solidity
function createProof(
    address user,
    bytes32 activityHash,
    ActivityType activityType,
    uint256 distance,
    uint256 duration
) external onlyRole(VERIFIER_ROLE)
```

Requirements:

1. `activityHash` tidak boleh sudah terdaftar.
2. `user` tidak boleh zero address.
3. `distance > 0`.
4. `duration > 0`.
5. Activity type harus valid.
6. Timestamp dibuat oleh blockchain menggunakan `block.timestamp`.
7. Proof disimpan on-chain.
8. Event harus emit.

---

## Verification Model

AI verification dilakukan **off-chain**.

Flow:

```text
User records activity
        ↓
Backend receives activity
        ↓
AI Verification
        ↓
┌───────────────┐
│   VERIFIED    │
└───────┬───────┘
        ↓
Generate Activity Hash
        ↓
ActivityProof.sol
```

Jika status:

```text
NEEDS_REVIEW
```

atau:

```text
REJECTED
```

maka aktivitas **tidak boleh mendapatkan reward**.

---

## Events

Minimal:

```solidity
event ActivityProofCreated(
    bytes32 indexed activityHash,
    address indexed user,
    ActivityType activityType,
    uint256 distance,
    uint256 duration,
    uint256 timestamp
);
```

---

# 6. RewardManager.sol

## Purpose

`RewardManager.sol` bertanggung jawab terhadap pemberian FIT Token kepada pengguna berdasarkan aktivitas yang telah diverifikasi.

Contract ini menjadi penghubung:

```text
ActivityProof
      ↓
RewardManager
      ↓
FITToken
```

---

## Reward Requirements

Reward hanya boleh diberikan jika:

1. Activity proof valid.
2. Activity proof sudah tercatat.
3. Activity proof belum pernah diberi reward.
4. Activity merupakan aktivitas yang verified.
5. User valid.
6. Reward tidak melebihi batas yang ditentukan.
7. FIT Token memiliki supply yang cukup.

---

## Reward Calculation

Reward dapat mempertimbangkan:

```text
Activity Type
Distance
Duration
Consistency
Challenge completion
```

Untuk MVP, reward calculation harus dibuat sederhana dan predictable.

Contoh:

```text
Walking:
1 FIT / KM

Running:
2 FIT / KM

Cycling:
1.5 FIT / KM
```

Implementasi dapat menggunakan integer base units dan tidak boleh menggunakan floating point.

Contoh sederhana:

```solidity
reward = distanceInKm * rewardRate;
```

Jika distance disimpan dalam meter:

```text
distanceKm = distance / 1000
```

Pastikan pembulatan dan unit conversion konsisten.

---

## Reward Limits

Untuk mencegah abuse, harus terdapat batas reward.

Contoh:

```text
MAX_DAILY_REWARD = 100 FIT
```

Contract harus melakukan tracking reward per user per day.

Konsep:

```solidity
mapping(address => mapping(uint256 => uint256))
    public dailyRewards;
```

Dengan:

```text
day = block.timestamp / 1 days
```

Jika reward menyebabkan daily reward melebihi limit:

```text
REVERT
```

---

## Duplicate Reward Prevention

Setiap activity hash hanya dapat menghasilkan reward satu kali.

Gunakan:

```solidity
mapping(bytes32 => bool) public rewardClaimed;
```

Flow:

```text
activityHash
      ↓
Already claimed?
   ┌──┴──┐
  YES    NO
   ↓      ↓
 REVERT  Verify Proof
             ↓
        Calculate Reward
             ↓
        Mint FIT Token
             ↓
        Mark Claimed
```

---

## Reward Function

Contoh interface:

```solidity
function rewardActivity(
    bytes32 activityHash
) external onlyRole(REWARDER_ROLE)
```

Function harus:

1. Memastikan proof exists.
2. Memastikan reward belum claimed.
3. Mengambil data proof.
4. Menghitung reward.
5. Memastikan daily limit tidak terlampaui.
6. Mint FIT Token.
7. Mark reward as claimed.
8. Emit event.

---

## Events

```solidity
event ActivityRewarded(
    bytes32 indexed activityHash,
    address indexed user,
    uint256 amount
);
```

---

# 7. ChallengeManager.sol

## Purpose

`ChallengeManager.sol` digunakan untuk mengelola challenge fitness.

Contoh challenge:

```text
Run 50 KM in 30 Days

7 Days Movement Streak

Cycle 100 KM
```

Challenge hanya boleh menggunakan aktivitas yang sudah verified.

---

# 8. Challenge Data

Minimal challenge structure:

```solidity
struct Challenge {
    uint256 id;
    string name;
    ActivityType activityType;
    uint256 targetDistance;
    uint256 duration;
    uint256 reward;
    uint256 startTime;
    uint256 endTime;
    bool active;
}
```

Contoh:

```text
ID:
1

Name:
Run 50 KM in 30 Days

Type:
RUNNING

Target:
50 KM

Duration:
30 Days

Reward:
100 FIT
```

---

# 9. Challenge User Progress

Progress pengguna dapat disimpan menggunakan:

```solidity
struct UserChallenge {
    uint256 progress;
    bool joined;
    bool completed;
    bool rewardClaimed;
}
```

Mapping:

```solidity
mapping(
    uint256 => mapping(address => UserChallenge)
) public userChallenges;
```

---

# 10. Challenge Flow

```text
Create Challenge
       ↓
User Join Challenge
       ↓
User performs activity
       ↓
AI Verification
       ↓
ActivityProof created
       ↓
Challenge progress updated
       ↓
Target reached?
    ┌──┴──┐
   NO     YES
   ↓       ↓
Continue  Completed
             ↓
       Reward FIT Token
```

---

# 11. Challenge Requirements

## Create Challenge

Hanya authorized admin dapat membuat challenge.

```solidity
function createChallenge(...)
    external
    onlyRole(ADMIN_ROLE)
```

Requirements:

* Name tidak boleh kosong.
* Target distance harus > 0.
* Reward harus > 0.
* Start time valid.
* End time > start time.
* Challenge ID harus unique.

---

## Join Challenge

User dapat join challenge:

```solidity
function joinChallenge(
    uint256 challengeId
) external
```

Requirements:

* Challenge exists.
* Challenge active.
* User belum join.
* Challenge belum selesai.

---

## Update Progress

Progress harus berasal dari aktivitas yang verified.

Jangan memperbolehkan user mengirim progress secara manual.

Contoh:

```solidity
function recordActivityProgress(
    uint256 challengeId,
    bytes32 activityHash
) external onlyRole(REWARDER_ROLE)
```

Contract harus:

1. Memastikan challenge valid.
2. Memastikan user telah join.
3. Memastikan activity proof valid.
4. Memastikan activity type sesuai challenge.
5. Memastikan activity belum digunakan untuk progress yang sama.
6. Menambahkan distance ke progress.
7. Mengecek apakah target tercapai.
8. Jika tercapai, status menjadi completed.

---

# 12. Challenge Reward

Jika challenge selesai:

```text
completed = true
```

User dapat menerima FIT reward.

Reward tidak boleh diberikan dua kali.

Gunakan:

```solidity
rewardClaimed
```

atau mekanisme equivalent.

---

## Challenge Events

Minimal:

```solidity
event ChallengeCreated(
    uint256 indexed challengeId,
    string name
);

event ChallengeJoined(
    uint256 indexed challengeId,
    address indexed user
);

event ChallengeProgressUpdated(
    uint256 indexed challengeId,
    address indexed user,
    uint256 progress
);

event ChallengeCompleted(
    uint256 indexed challengeId,
    address indexed user
);

event ChallengeRewarded(
    uint256 indexed challengeId,
    address indexed user,
    uint256 amount
);
```

---

# 13. Access Control

Smart contract harus menggunakan access control.

Role minimal:

```text
DEFAULT_ADMIN_ROLE
VERIFIER_ROLE
REWARDER_ROLE
MINTER_ROLE
```

Responsibilities:

### DEFAULT_ADMIN_ROLE

Digunakan untuk:

* Grant/revoke roles.
* Contract configuration.
* Emergency administration.

### VERIFIER_ROLE

Digunakan untuk:

* Membuat Activity Proof.

### REWARDER_ROLE

Digunakan untuk:

* Memproses activity reward.
* Mengupdate challenge progress.
* Memproses challenge reward jika diperlukan.

### MINTER_ROLE

Digunakan oleh:

* RewardManager
* ChallengeManager jika architecture membutuhkan direct mint

Preferensi MVP:

```text
RewardManager → MINTER_ROLE
ChallengeManager → MINTER_ROLE
```

Namun jika ChallengeManager memanggil RewardManager untuk reward, lebih baik hanya `RewardManager` yang memiliki `MINTER_ROLE`.

Gunakan desain yang paling sederhana dan minim permission.

---

# 14. Contract Interaction

Expected deployment:

```text
FITToken
   │
   ├───────────────┐
   │               │
   ▼               ▼
RewardManager   ChallengeManager
   │
   │
   ▼
ActivityProof
```

Recommended dependency:

```text
FITToken
   ↓
ActivityProof
   ↓
RewardManager
   ↓
ChallengeManager
```

Tetapi dependency tidak harus mengikuti urutan deployment secara kaku.

Deployment script harus:

1. Deploy FITToken.
2. Deploy ActivityProof.
3. Deploy RewardManager.
4. Deploy ChallengeManager.
5. Configure contract addresses.
6. Grant required roles.
7. Revoke unnecessary deployer permissions if appropriate.
8. Output deployed addresses.

---

# 15. Recommended Contract Interfaces

## FITToken

```solidity
function mint(
    address to,
    uint256 amount
) external;

function MAX_SUPPLY()
    external
    view
    returns (uint256);
```

---

## ActivityProof

```solidity
function createProof(
    address user,
    bytes32 activityHash,
    ActivityType activityType,
    uint256 distance,
    uint256 duration
) external;

function proofExists(
    bytes32 activityHash
) external
view
returns (bool);
```

---

## RewardManager

```solidity
function rewardActivity(
    bytes32 activityHash
) external;

function calculateReward(
    bytes32 activityHash
) public view returns (uint256);
```

---

## ChallengeManager

```solidity
function createChallenge(...) external;

function joinChallenge(
    uint256 challengeId
) external;

function recordActivityProgress(
    uint256 challengeId,
    bytes32 activityHash
) external;
```

---

# 16. Security Requirements

Smart contracts harus mempertimbangkan:

### Reentrancy

Gunakan OpenZeppelin `ReentrancyGuard` jika terdapat external interaction yang berpotensi menyebabkan reentrancy.

### Access Control

Function sensitif tidak boleh public tanpa authorization.

### Integer Overflow

Gunakan Solidity `^0.8.x` arithmetic safety.

### Duplicate Activity

Satu activity hash tidak boleh didaftarkan dua kali.

### Duplicate Reward

Satu activity tidak boleh menghasilkan reward dua kali.

### Daily Reward Limit

User tidak boleh memperoleh reward melebihi daily limit.

### Maximum Token Supply

FIT Token tidak boleh melebihi:

```text
1,000,000 FIT
```

### Zero Address

Reject zero address pada operation yang membutuhkan user/token recipient.

### Invalid Challenge

Reject:

* nonexistent challenge
* inactive challenge
* expired challenge
* invalid target
* invalid duration

### Challenge Double Reward

Challenge completion hanya boleh memberikan reward satu kali.

---

# 17. Gas Efficiency

Blockchain storage harus seminimal mungkin.

Jangan menyimpan:

```text
GPS coordinates
GPS route
Raw sensor data
AI response
Large strings
Images
Videos
Detailed activity logs
```

Simpan hanya:

```text
activityHash
user
activityType
distance
duration
timestamp
verification/proof status
```

Gunakan `bytes32` untuk hash.

Gunakan `uint256` untuk numerical values.

Gunakan events untuk data yang hanya dibutuhkan sebagai historical logs dan tidak perlu selalu dibaca dari storage.

---

# 18. AI Verification Boundary

AI tidak dijalankan di smart contract.

Architecture:

```text
Flutter
   ↓
Backend
   ↓
AI Verification
   ↓
Verification Result
   ↓
Backend validates result
   ↓
Activity Hash
   ↓
ActivityProof.sol
```

Possible AI status:

```text
VERIFIED
NEEDS_REVIEW
REJECTED
```

Only:

```text
VERIFIED
```

can continue to blockchain reward flow.

Smart contract tidak perlu menjalankan model AI.

Smart contract hanya menerima hasil yang telah diproses oleh authorized verifier.

---

# 19. Anti-Cheat Model

Kalcerly harus menggunakan beberapa layer anti-cheat.

```text
Layer 1
GPS + Sensor Data
        ↓
Layer 2
Backend Validation
        ↓
Layer 3
AI Activity Verification
        ↓
Layer 4
Unique Activity Hash
        ↓
Layer 5
On-chain Activity Proof
        ↓
Layer 6
Duplicate Reward Protection
        ↓
Layer 7
Daily Reward Limit
```

Smart contract bertanggung jawab terutama pada:

* Unique proof.
* Immutable proof record.
* Duplicate reward prevention.
* Reward limits.
* Authorized reward execution.
* Challenge validation.

---

# 20. Backend Integration

Backend menggunakan Viem untuk berinteraksi dengan smart contract.

Backend harus memiliki:

```text
RPC_URL
PRIVATE_KEY
FIT_TOKEN_ADDRESS
ACTIVITY_PROOF_ADDRESS
REWARD_MANAGER_ADDRESS
CHALLENGE_MANAGER_ADDRESS
```

Backend flow:

```text
POST /activities
        ↓
Save activity
        ↓
AI Verification
        ↓
if VERIFIED
        ↓
Generate activityHash
        ↓
ActivityProof.createProof()
        ↓
RewardManager.rewardActivity()
        ↓
Save transaction hash
        ↓
Return verification + reward result
```

Backend harus menyimpan transaction hash untuk audit/reference.

---

# 21. Blockchain Data vs Database Data

## Database

Database menyimpan:

```text
user
activity
GPS route
sensor data
AI analysis
verification result
activity metadata
transaction hash
challenge history
social data
```

## Blockchain

Blockchain menyimpan:

```text
activityHash
wallet address
activity type
distance
duration
timestamp
reward amount
challenge completion
```

Principle:

> Store detailed data off-chain, store verifiable proof on-chain.

---

# 22. Testing Requirements

Setiap contract wajib memiliki Foundry tests.

## FITToken Tests

Test:

* Token name.
* Token symbol.
* Initial supply.
* Mint by authorized address.
* Unauthorized mint must revert.
* Maximum supply.
* Mint exceeding max supply must revert.
* Transfer.

---

## ActivityProof Tests

Test:

* Create valid proof.
* Unauthorized verifier must revert.
* Duplicate activity hash must revert.
* Zero address must revert.
* Invalid distance must revert.
* Invalid duration must revert.
* Proof existence.
* Event emission.

---

## RewardManager Tests

Test:

* Valid activity receives reward.
* Invalid proof cannot receive reward.
* Duplicate reward must revert.
* Unauthorized reward call must revert.
* Daily reward limit.
* Correct reward calculation.
* FIT token balance increases.
* Event emission.

---

## ChallengeManager Tests

Test:

* Create challenge.
* Unauthorized creation must revert.
* Join challenge.
* Cannot join twice.
* Invalid challenge must revert.
* Record verified activity.
* Incorrect activity type rejected.
* Progress calculation.
* Challenge completion.
* Challenge reward.
* Duplicate challenge reward rejected.

---

# 23. Deployment Requirements

Use Foundry.

Commands:

```bash
forge build
```

```bash
forge test
```

Deployment:

```bash
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --broadcast
```

For BSC Testnet or another supported EVM testnet, RPC configuration must be provided through environment variables.

Never hardcode:

```text
PRIVATE_KEY
RPC_URL
```

inside Solidity source code.

---

# 24. Environment Variables

Example:

```env
RPC_URL=
PRIVATE_KEY=

FIT_TOKEN_ADDRESS=
ACTIVITY_PROOF_ADDRESS=
REWARD_MANAGER_ADDRESS=
CHALLENGE_MANAGER_ADDRESS=
```

Do not commit `.env` to Git.

Provide `.env.example`.

---

# 25. Coding Standards

Use:

* Solidity `^0.8.20`
* OpenZeppelin contracts
* Foundry
* Clear naming conventions
* NatSpec for public/external functions
* Custom errors where useful
* Events for important state changes
* Explicit access control
* Minimal storage

Prefer:

```solidity
error Unauthorized();
error InvalidActivity();
error ActivityAlreadyExists();
error RewardAlreadyClaimed();
error DailyRewardLimitExceeded();
```

over unnecessary string-based revert messages.

---

# 26. MVP Scope

The smart contract implementation MUST focus on the following:

### Required

* FIT ERC20 token.
* Maximum supply.
* Controlled minting.
* Activity proof.
* Unique activity hash.
* Verified activity record.
* Activity reward.
* Duplicate reward prevention.
* Daily reward limit.
* Challenge creation.
* Challenge joining.
* Challenge progress.
* Challenge completion.
* Challenge reward.
* Access control.
* Events.
* Foundry tests.
* Deployment script.

### Not Required for MVP

Do NOT implement:

* Reward Factory.
* Escrow.
* Reward Pool.
* NFT marketplace.
* NFT achievement system.
* DAO governance.
* Staking.
* Token swapping.
* DEX.
* Cross-chain bridge.
* Complex tokenomics.
* On-chain AI.
* On-chain GPS storage.

These features may be considered for future versions but must not complicate the MVP architecture.

---

# 27. Definition of Done

Smart contract implementation is considered complete when:

* [ ] `FITToken.sol` compiles.
* [ ] `ActivityProof.sol` compiles.
* [ ] `RewardManager.sol` compiles.
* [ ] `ChallengeManager.sol` compiles.
* [ ] All Foundry tests pass.
* [ ] Unauthorized operations revert.
* [ ] Duplicate activity proofs are rejected.
* [ ] Duplicate rewards are rejected.
* [ ] Daily reward limit works.
* [ ] FIT maximum supply cannot be exceeded.
* [ ] Verified activities can generate FIT rewards.
* [ ] Challenge progress only accepts valid verified activities.
* [ ] Completed challenges can generate rewards.
* [ ] Challenge rewards cannot be claimed twice.
* [ ] Events are emitted correctly.
* [ ] Deployment script successfully deploys all contracts.
* [ ] Contract addresses can be configured by backend.
* [ ] Backend can interact with contracts using Viem.
* [ ] No raw GPS or large activity data is stored on-chain.
* [ ] No Factory/Escrow architecture is introduced unless explicitly requested.

---

# 28. Core Principle

The smart contract layer of Kalcerly should remain **simple, verifiable, secure, and hackathon-ready**.

The blockchain is not intended to replace the backend.

The responsibilities are divided as follows:

```text
┌──────────────────────────────────────────┐
│                 BACKEND                  │
│                                          │
│ GPS Tracking                             │
│ Activity Storage                         │
│ AI Verification                          │
│ Social Features                          │
│ Detailed Analytics                       │
└───────────────────┬──────────────────────┘
                    │
                    │ Verified Activity
                    ▼
┌──────────────────────────────────────────┐
│               BLOCKCHAIN                 │
│                                          │
│ ActivityProof.sol                        │
│        ↓                                 │
│ RewardManager.sol                        │
│        ↓                                 │
│ FITToken.sol                             │
│                                          │
│ ChallengeManager.sol                     │
└──────────────────────────────────────────┘
```

The primary value of blockchain in Kalcerly is:

> **Making verified physical activity provable, tamper-resistant, and rewardable.**

Do not add blockchain components merely because they are technically possible. Every contract and on-chain storage field must have a clear purpose related to **verification, rewards, challenges, or trust**.
