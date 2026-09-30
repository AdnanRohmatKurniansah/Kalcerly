# 🎗️ Kalcerly — AI-Powered Social Fitness & Blockchain Rewards

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **"Make Movement a Culture."**

Kalcerly adalah platform **Social Fitness** yang mendorong masyarakat untuk menjadikan aktivitas fisik sebagai bagian dari gaya hidup sehari-hari. Kami menggabungkan **activity tracking**, **AI activity verification**, **social fitness**, **gamification**, dan **blockchain rewards** dalam satu platform.

Pengguna dapat melakukan aktivitas seperti **walking, running, dan cycling**, kemudian sistem akan menganalisis aktivitas tersebut menggunakan AI untuk memastikan bahwa aktivitas benar-benar dilakukan secara valid. Aktivitas yang berhasil diverifikasi akan menghasilkan **Activity Proof** dan dapat dicatat ke blockchain sebagai bukti aktivitas yang dapat diverifikasi.

Sebagai insentif, pengguna memperoleh **FIT Token** berdasarkan aktivitas yang berhasil diverifikasi, pencapaian, konsistensi, dan partisipasi dalam challenge.

Alur utama Kalcerly: **Track → Verify → Earn → Compete → Improve**

---

## 🚀 Mengapa Kalcerly Penting?

Banyak orang ingin hidup lebih aktif, tetapi masih kesulitan mempertahankan motivasi dan konsistensi dalam berolahraga:

* ❌ **Kurangnya Motivasi:** Aktivitas fisik sering dilakukan hanya sesekali dan sulit menjadi kebiasaan.
* ❌ **Kurangnya Validasi:** Sistem fitness biasa mencatat aktivitas tanpa memastikan apakah aktivitas tersebut benar-benar dilakukan.
* ❌ **Kurangnya Insentif:** Pengguna melakukan aktivitas fisik tetapi tidak memperoleh manfaat atau reward yang mendorong konsistensi.
* ❌ **Kurangnya Komunitas:** Aktivitas olahraga sering dilakukan secara individual sehingga motivasi dapat menurun.
* ❌ **Data Mudah Dimanipulasi:** Sistem tracking dapat disalahgunakan dengan menggunakan kendaraan atau memanipulasi data aktivitas.
* ❌ **Achievement Tidak Terverifikasi:** Pencapaian pengguna umumnya hanya tersimpan di database aplikasi dan tidak memiliki bukti yang dapat diverifikasi.

**Kalcerly menggabungkan AI, social fitness, dan blockchain untuk menciptakan ekosistem aktivitas fisik yang lebih terpercaya, kompetitif, dan rewarding.**

---

## ✨ Fitur Utama

### 1. 📍 Activity Tracking
Pengguna dapat mencatat aktivitas fisik menggunakan GPS dan sensor smartphone. Aktivitas yang didukung: **Walking**, **Running**, dan **Cycling**.
* ✔ Mencatat jarak, durasi, pace, dan speed secara real-time.
* ✔ Merekam route GPS, movement pattern, dan perubahan kecepatan.
* ✔ Semua data dikirim ke backend untuk proses verifikasi setelah aktivitas selesai.

### 2. 🧠 AI Activity Verification
Setelah aktivitas selesai, data dianalisis oleh AI untuk memastikan validitas aktivitas yang dilakukan.
* ✔ Menganalisis GPS trajectory, acceleration, dan movement pattern secara bersamaan.
* ✔ Mendeteksi aktivitas yang tidak sesuai, misalnya pola kendaraan saat *Running* dipilih.
* ✔ Memberikan tiga status: **Verified** ✅, **Needs Review** ⚠️, atau **Rejected** ❌.

### 3. 🤝 Activity Proof
Setiap aktivitas yang berhasil diverifikasi akan menghasilkan sebuah **Activity Proof** berupa *unique hash*.
* ✔ Hash dibuat dari data seperti User ID, Activity Type, Distance, Duration, dan Timestamp.
* ✔ Data detail GPS tetap tersimpan di backend — blockchain hanya menyimpan *proof/hash*.
* ✔ Berfungsi sebagai identitas digital yang dapat diverifikasi untuk setiap aktivitas.

### 4. ⛓️ Blockchain Verification
Activity Proof dari aktivitas yang telah diverifikasi dicatat ke blockchain untuk memberikan jaminan keamanan.
* ✔ Menyimpan proof secara *immutable* dan *tamper-resistant*.
* ✔ Alur: **Activity → AI Verification → Activity Hash → Smart Contract → Blockchain**.
* ✔ Penggunaan blockchain yang efisien karena hanya menyimpan hash, bukan seluruh data aktivitas.

### 5. 🪙 FIT Token Reward
Kalcerly memiliki utility reward token bernama **FIT** yang diberikan setelah aktivitas berhasil diverifikasi.
* ✔ Reward mempertimbangkan jenis aktivitas, jarak, durasi, dan konsistensi.
* ✔ Bonus tambahan dari *challenge completion* dan *achievement*.
* ✔ Dirancang sebagai **utility/reward token dalam ekosistem Kalcerly**, bukan aset spekulatif.

### 6. 🏆 Challenge & Gamification
Kalcerly menyediakan challenge dan sistem gamifikasi untuk meningkatkan motivasi pengguna.
* ✔ Hanya aktivitas dengan status **Verified** yang dihitung ke dalam challenge.
* ✔ Contoh challenge: *Run 50 KM in 30 Days*, *7 Days Movement Streak*, *Cycle 100 KM*.
* ✔ Penyelesaian challenge memberikan FIT, Achievement, Badge, dan Leaderboard points.

### 7. 📷 Social Feed & Komunitas
Pengguna dapat membagikan aktivitas yang telah dilakukan ke komunitas fitness Kalcerly.
* ✔ Post aktivitas otomatis menampilkan jarak, durasi, dan status **Verified Activity**.
* ✔ Pengguna lain dapat memberikan *Follow*, *Kudos*, *Comment*, dan *Share*.
* ✔ Menjadikan Kalcerly bukan sekadar *activity tracker*, melainkan **social fitness platform**.

---

## 🧱 Tech Stack

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Mobile** | Tauri + React | Cross-platform mobile application (Android & iOS). |
| **Backend Runtime** | NodeJs | JavaScript/TypeScript runtime yang cepat dan efisien. |
| **Backend** | Express.js | REST API dan business logic utama. |
| **AI** | AI/ML Model | Engine verifikasi aktivitas pengguna. |
| **Blockchain SDK** | Viem | Interaksi dengan EVM-compatible blockchain. |
| **Smart Contract** | Solidity | Logika reward, activity proof, dan challenge on-chain. |
| **SC Development** | Foundry | Smart contract development & testing framework. |
| **GPS** | Tauri Mobile APIs / Native APIs | Activity tracking dan perekaman route. |
| **Wallet** | WalletConnect / Reown | Koneksi mobile wallet untuk pengguna. |

---

## 📦 Struktur Folder Proyek

### Frontend (Flutter)
```
frontend/
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   ├── theme/
│   │   └── utils/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── activity/
│   │   ├── verification/
│   │   ├── challenge/
│   │   ├── achievement/
│   │   ├── leaderboard/
│   │   ├── social/
│   │   ├── wallet/
│   │   └── profile/
│   │
│   ├── services/
│   │   ├── api/
│   │   ├── gps/
│   │   └── blockchain/
│   │
│   └── main.dart
│
└── pubspec.yaml
```

### Backend (Express + NodeJs)
```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── activity.controller.ts
│   │   ├── challenge.controller.ts
│   │   ├── reward.controller.ts
│   │   └── social.controller.ts
│   │
│   ├── services/
│   │   ├── ai.service.ts
│   │   ├── activity.service.ts
│   │   ├── reward.service.ts
│   │   └── blockchain.service.ts
│   │
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   └── index.ts
│
├── package.json
├── tsconfig.json
└── .env
```

### Smart Contract (Solidity + Foundry)
```
contracts/
├── src/
│   ├── FITToken.sol
│   ├── ActivityProof.sol
│   ├── RewardManager.sol
│   └── ChallengeManager.sol
│
├── script/
│   └── Deploy.s.sol
│
├── test/
│   ├── FITToken.t.sol
│   ├── ActivityProof.t.sol
│   └── RewardManager.t.sol
│
├── foundry.toml
└── README.md
```

---

## 🔧 Cara Instalasi & Menjalankan Proyek

Pastikan Anda telah menginstal **Flutter & Dart**, **NodeJs**, **Foundry**, dan **Git**.

### A. Menjalankan Backend (Express + NodeJs)

1.  **Arahkan ke Direktori Backend:**
    ```bash
    cd backend
    ```

2.  **Instal Dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment:**
    Buat file `.env` di direktori `backend/` dan isi dengan konfigurasi Anda:
    ```
    PORT=8000
    DATABASE_URL=...
    AI_API_KEY=...
    RPC_URL=...
    PRIVATE_KEY=...
    FIT_TOKEN_ADDRESS=...
    ACTIVITY_PROOF_ADDRESS=...
    REWARD_MANAGER_ADDRESS=...
    ```

4.  **Jalankan Development Server:**
    ```bash
    npm run dev
    ```
    Backend akan berjalan dan siap menerima permintaan di **[http://localhost:8000](http://localhost:8000)**.

### B. Menjalankan Frontend (Flutter)

1.  **Pindah Direktori ke Frontend:**
    ```bash
    cd frontend
    ```

2.  **Instal Dependensi Tauri:**
    ```bash
    npm install
    ```

3.  **Jalankan Aplikasi:**
    ```bash
    npm run tauri android dev
    ```
    Aplikasi akan berjalan di emulator atau perangkat fisik yang terhubung.

### C. Smart Contract (Foundry)

1.  **Masuk ke Direktori Contracts:**
    ```bash
    cd contracts
    ```

2.  **Install Dependency & Compile:**
    ```bash
    forge install
    forge build
    ```

3.  **Menjalankan Test:**
    ```bash
    forge test
    ```

4.  **Deploy ke Blockchain:**
    ```bash
    forge script script/Deploy.s.sol \
      --rpc-url $RPC_URL \
      --broadcast
    ```

> ℹ️ **Catatan:** Setelah deployment, masukkan alamat smart contract ke environment backend dan konfigurasi frontend agar seluruh sistem terhubung.

---

## 🛡️ Keamanan & Anti-Cheat

Kami membangun sistem ini dengan memprioritaskan validitas aktivitas dan keamanan reward:

* ✔ **AI Verification:** Menganalisis pola aktivitas secara menyeluruh untuk mendeteksi aktivitas yang tidak wajar atau tidak sesuai.
* ✔ **Server-Side Validation:** Reward tidak diberikan hanya berdasarkan data yang dikirim oleh client, semua diverifikasi di backend.
* ✔ **Activity Hash:** Setiap aktivitas yang telah diverifikasi memiliki *unique proof* yang tidak bisa direplikasi.
* ✔ **Blockchain Record:** Proof aktivitas dicatat secara *immutable* di blockchain sehingga tidak dapat dimanipulasi.
* ✔ **Smart Contract Rules:** Distribusi FIT dilakukan berdasarkan aturan yang telah ditentukan oleh smart contract, bukan secara manual.
* ✔ **Reward Limitation:** Sistem memberlakukan batas reward harian untuk mengurangi potensi eksploitasi dan *abuse*.

---

## 🏆 Mengapa Kalcerly Layak Dikembangkan?

Kalcerly bukan hanya *activity tracker*, tapi sebuah **movement ecosystem** yang menggabungkan tiga teknologi utama:

1.  **Solusi Nyata:** Menjawab masalah rendahnya konsistensi aktivitas fisik dengan memberikan insentif terverifikasi yang nyata dan transparan.
2.  **Integrasi Teknologi Kompleks:** Berhasil menggabungkan AI, GPS tracking, blockchain, dan social platform dalam satu alur yang mulus: **Move → Verify → Reward → Share → Compete**.
3.  **Anti-Cheat by Design:** Mekanisme AI verification dan blockchain proof memastikan bahwa setiap reward diberikan hanya untuk aktivitas yang benar-benar dilakukan.
4.  **Actionable Output:** Menghasilkan *verifiable activity proof* yang dapat digunakan sebagai portofolio fitness digital yang tidak bisa dimanipulasi.
