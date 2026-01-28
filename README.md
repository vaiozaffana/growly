# 🌱 Growly

**Growly** adalah aplikasi mobile untuk pembentukan kebiasaan sehat dengan refleksi berbasis AI. Aplikasi ini memandu pengguna dalam merefleksikan kebiasaan mereka melalui interaksi dengan AI yang memberikan respons mendalam, personal, dan memotivasi.

![Growly Banner](./assets/splash.png)

## ✨ Fitur Utama

### 📋 Habit Tracking
- Checklist kebiasaan harian dengan 3 kategori: **Kesehatan Fisik**, **Etika & Moral**, dan **Kesehatan Mental**
- Template kebiasaan bawaan yang dapat dikustomisasi
- Visualisasi progres mingguan dan bulanan

### 🔥 Streak Counter
- Pelacakan streak harian dengan animasi yang menarik
- Motivasi visual untuk mempertahankan konsistensi
- Rekap pencapaian streak terpanjang

### 🗓️ Calendar View
- Visualisasi penyelesaian kebiasaan per bulan
- Marker warna untuk menunjukkan tingkat penyelesaian
- Detail kebiasaan per tanggal

### 🤖 AI Reflection Chat
- Chat interaktif dengan AI coach berbahasa Indonesia
- Refleksi mendalam tentang kebiasaan dan perasaan
- Respons personal dan memotivasi menggunakan Google Gemini AI

### 🔔 Smart Notifications
- Pengingat kebiasaan yang dapat dikustomisasi
- Notifikasi motivasi harian
- Celebrasi saat menyelesaikan kebiasaan

---

## 🛠️ Tech Stack

### Frontend (Mobile App)
| Technology | Purpose |
|------------|---------|
| React Native | Cross-platform mobile development |
| Expo SDK 54 | Development platform & tooling |
| TypeScript | Type-safe JavaScript |
| NativeWind | TailwindCSS for React Native |
| React Navigation | Navigation management |
| Zustand | State management |
| Lottie | Animations |
| react-native-calendars | Calendar visualization |
| Axios | HTTP client |

### Backend (API Server)
| Technology | Purpose |
|------------|---------|
| Elysia.js | Fast Bun-based web framework |
| Bun | JavaScript runtime |
| Prisma ORM | Database management |
| MySQL | Relational database |
| JWT | Authentication |
| Google Generative AI | AI chat integration |

---

## 📁 Struktur Project

```
growly/
├── 📱 Frontend (React Native)
│   ├── App.tsx                 # Entry point
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/            # Reusable UI components
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Checkbox.tsx
│   │   │       └── StreakCounter.tsx
│   │   ├── screens/
│   │   │   ├── auth/          # Authentication screens
│   │   │   │   ├── LandingScreen.tsx
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── RegisterScreen.tsx
│   │   │   └── main/          # Main app screens
│   │   │       ├── DashboardScreen.tsx
│   │   │       ├── CalendarScreen.tsx
│   │   │       ├── ChatScreen.tsx
│   │   │       └── ProfileScreen.tsx
│   │   ├── navigation/        # Navigation setup
│   │   │   └── AppNavigator.tsx
│   │   ├── services/          # API & notification services
│   │   │   ├── api.ts
│   │   │   └── notifications.ts
│   │   ├── store/             # Zustand state management
│   │   │   └── index.ts
│   │   ├── constants/         # Theme & habit templates
│   │   │   ├── theme.ts
│   │   │   └── habits.ts
│   │   └── types/             # TypeScript interfaces
│   │       └── index.ts
│   └── assets/                # Images & icons
│
└── 🖥️ Backend (Elysia.js)
    └── backend/
        ├── src/
        │   ├── index.ts       # Server entry point
        │   ├── lib/
        │   │   └── prisma.ts  # Prisma client
        │   ├── routes/        # API routes
        │   │   ├── auth.ts
        │   │   ├── habits.ts
        │   │   ├── reflections.ts
        │   │   ├── ai.ts
        │   │   ├── stats.ts
        │   │   └── calendar.ts
        │   └── seed.ts        # Database seeder
        └── prisma/
            └── schema.prisma  # Database schema
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **Bun** v1.0+ (untuk backend)
- **PostgreSQL** v14+ (atau MySQL v8.0+)
- **Expo CLI**
- **Android Studio** atau **Xcode** (untuk emulator)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/growly.git
cd growly
```

### 2. Setup Backend (JALANKAN TERLEBIH DAHULU!)

```bash
# Navigate to backend folder
cd backend

# Install dependencies with Bun
bun install

# Copy environment file
cp .env.example .env

# Edit .env dengan kredensial database Anda:
# DATABASE_URL="postgresql://user:password@localhost:5432/growly"
# JWT_SECRET="your-secret-key"
# GOOGLE_AI_API_KEY="your-gemini-api-key"

# Buat database PostgreSQL
# Atau gunakan perintah: createdb growly

# Run database migrations
bunx prisma migrate dev --name init

# Generate Prisma client
bunx prisma generate

# (Opsional) Seed database dengan data awal
bun run db:seed

# Start development server
bun run dev

# Server akan berjalan di http://localhost:3000
# Tes dengan mengakses http://localhost:3000/ di browser
```

### 3. Setup Frontend

```bash
# Kembali ke root folder
cd ..

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env sesuai kebutuhan:
# - Android Emulator: EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
# - iOS Simulator: EXPO_PUBLIC_API_URL=http://localhost:3000
# - Physical Device: EXPO_PUBLIC_API_URL=http://YOUR_IP:3000

# Start Expo development server
npm start
```

### 4. Menentukan API URL yang Benar

| Platform | URL |
|----------|-----|
| Android Emulator | `http://10.0.2.2:3000` |
| iOS Simulator | `http://localhost:3000` |
| Physical Device | `http://192.168.x.x:3000` (IP komputer Anda) |
| Web Browser | `http://localhost:3000` |

Edit file `.env` di root project atau langsung di `src/services/api.ts`.

---

## 📱 Running the App

### Development Mode

```bash
# Terminal 1 - Start Backend
cd backend && bun run dev

# Terminal 2 - Start Frontend
npm start
```

Scan QR code dengan **Expo Go** app di device atau tekan `a` untuk Android emulator / `i` untuk iOS simulator.

### Production Build

```bash
# Build APK for Android
npx expo build:android

# Build IPA for iOS
npx expo build:ios
```

---

## 🎨 Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#2E9DBB` | Main actions, links |
| Accent | `#8B5FBF` | Highlights, achievements |
| Neutral Light | `#F5F7FA` | Backgrounds |
| Neutral Dark | `#2D3748` | Text |
| Success | `#48BB78` | Completions, positive |
| Warning | `#F6AD55` | Alerts, reminders |
| Error | `#FC8181` | Errors, destructive |

### Typography

- **Heading**: Inter Bold, 24-32px
- **Body**: Inter Regular, 14-16px
- **Caption**: Inter Medium, 12px

### Components

UI components dibangun dengan konsep **glassmorphism** dan animasi subtle untuk pengalaman yang modern dan menyenangkan.

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all habits |
| GET | `/api/habits/today` | Get today's habits |
| POST | `/api/habits` | Create new habit |
| PUT | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| POST | `/api/habits/:id/log` | Log habit completion |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Send message to AI |
| GET | `/api/ai/history` | Get chat history |
| DELETE | `/api/ai/history` | Clear chat history |

### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get user statistics |

### Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar` | Get monthly calendar data |
| GET | `/api/calendar/:date` | Get specific date details |

---

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend && bun test
```

---

## 📄 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/growly"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# Google AI
GEMINI_API_KEY="your-gemini-api-key"

# Server
PORT=3000
```

### Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy and paste to `.env`

---

## 🔧 Troubleshooting

### API tidak terkoneksi / Network Error

1. **Pastikan backend berjalan:**
   ```bash
   cd backend
   bun run dev
   ```
   Tes dengan membuka `http://localhost:3000/` di browser - harus menampilkan JSON response.

2. **Cek API URL sesuai platform:**
   - Android Emulator: `http://10.0.2.2:3000`
   - iOS Simulator: `http://localhost:3000`
   - Physical Device: `http://YOUR_COMPUTER_IP:3000`

3. **Untuk Physical Device:**
   - Pastikan HP dan komputer di jaringan WiFi yang sama
   - Cari IP komputer dengan `ipconfig` (Windows) atau `ifconfig` (Mac/Linux)
   - Contoh: `http://192.168.1.100:3000`

### Database Connection Error

1. **Pastikan PostgreSQL berjalan**
2. **Cek kredensial di `.env`**
3. **Buat database jika belum:**
   ```bash
   createdb growly
   # atau
   psql -c "CREATE DATABASE growly;"
   ```
4. **Jalankan migrasi:**
   ```bash
   cd backend
   bunx prisma migrate dev
   ```

### Login/Register Error

1. Pastikan backend berjalan dan database terkoneksi
2. Cek console log di terminal backend untuk error details
3. Pastikan email valid dan password minimal 6 karakter

### AI Chat tidak merespons

1. Pastikan `GOOGLE_AI_API_KEY` sudah diset di `backend/.env`
2. Cek kuota API di Google AI Studio
3. Lihat error di console backend

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Developer** - [Your Name](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing mobile development platform
- [Elysia.js](https://elysiajs.com/) for the fast and elegant backend framework
- [Google Generative AI](https://ai.google.dev/) for the AI capabilities
- [NativeWind](https://www.nativewind.dev/) for bringing TailwindCSS to React Native

---

<p align="center">
  Made with 💚 for healthier habits
</p>
