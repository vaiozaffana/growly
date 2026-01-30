# 🌱 Growly

**Growly** adalah aplikasi mobile untuk pembentukan kebiasaan sehat dengan refleksi berbasis AI. Aplikasi ini memandu pengguna dalam merefleksikan kebiasaan mereka melalui interaksi dengan AI yang memberikan respons mendalam, personal, dan memotivasi.

![Growly Banner](./assets/splash.png)

## ✨ Fitur Utama

### 📋 Habit Tracking
- Checklist kebiasaan harian dengan 3 kategori: **Kesehatan Fisik**, **Etika & Moral**, dan **Kesehatan Mental**
- Template kebiasaan bawaan yang dapat dikustomisasi
- Visualisasi progres mingguan dan## 👥 Team

**Growly** - Aplikasi habit tracking dengan AI reflection

Dibuat dengan 💚 untuk membantu kamu membangun kebiasaan sehat dan berkembang menjadi versi terbaik dirimu.

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - Amazing mobile development platform
- [Elysia.js](https://elysiajs.com/) - Fast and elegant backend framework  
- [Bun](https://bun.sh/) - Lightning-fast JavaScript runtime
- [Google Generative AI](https://ai.google.dev/) - Powerful AI capabilities
- [NativeWind](https://www.nativewind.dev/) - TailwindCSS for React Native
- [Lottie Files](https://lottiefiles.com/) - Beautiful animations
- [Prisma](https://www.prisma.io/) - Next-generation ORM

### Special Thanks
- React Native community for excellent libraries
- Expo team for seamless development experience
- Everyone who contributed feedback and suggestions

---

## 📸 Screenshots

### Light Mode
![Dashboard](./docs/screenshots/dashboard-light.png)
![Chat](./docs/screenshots/chat-light.png)

### Dark Mode  
![Dashboard Dark](./docs/screenshots/dashboard-dark.png)
![Profile Dark](./docs/screenshots/profile-dark.png)

### Celebration
![Streak Celebration](./docs/screenshots/streak-celebration.png)

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] Social features - Share progress with friends
- [ ] Custom habit templates
- [ ] Habit categories customization
- [ ] Export data to CSV/PDF
- [ ] Weekly/Monthly insights report
- [ ] Habit reminders and notifications
- [ ] Multi-language support
- [ ] Widget support for iOS/Android
- [ ] Apple Health / Google Fit integration
- [ ] Habit suggestions based on AI analysis

### Planned Improvements
- [ ] Offline mode support
- [ ] Data sync across devices
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] More animation variations
- [ ] Customizable color themes

---

<p align="center">
  <strong>Made with ❤️ for healthier habits and personal growth</strong><br>
  🌱 Growly - Tumbuh Bersama, Bahagia Bersama 🌱
</p> streak otomatis dengan validasi harian

### 🔥 Streak System
- **Pelacakan streak harian** dengan animasi yang menarik
- **Animasi Celebration** - Lottie fire animation dengan haptic feedback saat mencapai milestone
- **Level System**: 
  - 🔥 Streak 1-2: Perjalanan dimulai
  - ✨ Streak 3-6: Terus pertahankan
  - 🌟 Streak 7-13: Seminggu penuh
  - ⭐ Streak 14-20: 2 minggu konsisten
  - 🏆 Streak 21-29: 3 minggu berturut-turut
  - 👑 Streak 30+: Legenda!
- Rekap pencapaian streak terpanjang
- Progress bar menuju level maksimum

### 🗓️ Calendar View
- Visualisasi penyelesaian kebiasaan per bulan
- Marker warna untuk menunjukkan tingkat penyelesaian
- Detail kebiasaan per tanggal
- Statistik lengkap per hari

### 🤖 AI Reflection Chat
- Chat interaktif dengan AI coach berbahasa Indonesia
- Refleksi mendalam tentang kebiasaan dan perasaan
- Respons personal dan memotivasi menggunakan Google Gemini AI
- Riwayat chat tersimpan per user
- Privacy-focused: Data chat terpisah per user

### 🎨 Modern UI/UX
- **Dark Mode** support dengan toggle manual
- **Splash Screen** animasi smooth dengan logo dan gradient
- **Bottom Navigation Bar** dengan safe area handling untuk semua device
- Desain modern dengan color palette coral (#FF6B6B), mint (#38D99A), dan lavender (#A78BFA)
- Animasi halus menggunakan react-native-animatable
- Glassmorphism effect pada card components

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
| Lottie React Native | Smooth animations (fire celebration) |
| react-native-animatable | Component animations |
| react-native-calendars | Calendar visualization |
| expo-linear-gradient | Gradient backgrounds |
| expo-blur | Blur effects for modals |
| expo-haptics | Haptic feedback |
| Axios | HTTP client |
| date-fns | Date manipulation |

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
│   │   │       ├── StreakCounter.tsx
│   │   │       └── StreakCelebration.tsx  # NEW: Animated celebration modal
│   │   ├── screens/
│   │   │   ├── SplashScreen.tsx  # NEW: Custom splash screen
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
│   │   ├── contexts/          # React Context (Theme)
│   │   │   └── ThemeContext.tsx
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
│       ├── icon.png           # App icon
│       ├── splash.png         # Splash image
│       └── animation/
│           └── Fire.json      # Lottie fire animation
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
- **MySQL** v8.0+ (database production-ready)
- **Expo CLI**
- **Android Studio** atau **Xcode** (untuk emulator)
- **Google Gemini API Key** (untuk AI chat)

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
# DATABASE_URL="mysql://user:password@localhost:3306/growly"
# JWT_SECRET="your-secret-key"
# GEMINI_API_KEY="your-gemini-api-key"

# Buat database MySQL
# mysql -u root -p
# CREATE DATABASE growly;
# EXIT;

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

### Color Palette (Modern & Playful)

| Name | Hex | Usage |
|------|-----|-------|
| **Primary (Coral)** | `#FF6B6B` | Main actions, links, streak fire |
| **Secondary (Mint)** | `#38D99A` | Success states, completed habits |
| **Accent Purple** | `#A78BFA` | Highlights, premium features |
| **Accent Orange** | `#FFA94D` | Warnings, achievements |
| **Accent Pink** | `#F687B3` | Decorative elements |
| **Accent Yellow** | `#FFE66D` | Celebrations, positive feedback |
| **Neutral Light** | `#FAF9F7` | Backgrounds (Light mode) |
| **Neutral Dark** | `#1A1A1A` | Backgrounds (Dark mode) |
| **Surface** | `#FFFFFF` / `#2A2A2A` | Card backgrounds |
| **Text** | `#252422` / `#F5F5F5` | Primary text |
| **Success** | `#38D99A` | Completions, positive states |
| **Error** | `#FF6B6B` | Errors, destructive actions |

### Dark Mode

Aplikasi mendukung **Dark Mode** dengan:
- Toggle manual di halaman Profile
- Persisten menggunakan Zustand storage
- Warna disesuaikan untuk kenyamanan mata
- Transisi smooth antar mode

### Typography

- **Heading**: System Font Bold, 24-32px
- **Body**: System Font Regular, 14-16px
- **Caption**: System Font Medium, 12px

### Components

UI components dibangun dengan konsep modern dan playful:
- **Glassmorphism effects** pada card dan modal
- **Smooth animations** menggunakan react-native-animatable
- **Haptic feedback** untuk interaksi penting
- **Lottie animations** untuk celebration moments
- **Linear gradients** untuk header dan highlight
- **Safe area handling** untuk semua device (notch, home indicator)

### Animasi Khusus

1. **Streak Celebration Modal**:
   - Fire animation (Lottie)
   - Pulse & bounce effects
   - Shimmer text
   - Floating particles
   - Haptic feedback
   - Tap to dismiss

2. **Splash Screen**:
   - Gradient background
   - Logo bounce animation
   - Text fade in
   - Loading dots pulse

3. **Navigation**:
   - Tab icon bounce on focus
   - Screen slide transitions
   - Floating tab bar with shadow

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
# Database (PostgreSQL)
DATABASE_URL="postgresql://root:password@localhost:3306/growly"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key-from-google-ai-studio"

# Server
PORT=3000
NODE_ENV="development"
```

### Frontend (.env)

```env
# API URL - Sesuaikan dengan platform:
# Android Emulator: http://10.0.2.2:3000
# iOS Simulator: http://localhost:3000
# Physical Device: http://YOUR_IP:3000
EXPO_PUBLIC_API_URL="http://10.0.2.2:3000"
```

### Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in dengan Google Account
3. Click "Create API Key"
4. Copy dan paste ke `backend/.env` sebagai `GEMINI_API_KEY`
5. API key gratis dengan rate limit yang cukup untuk development

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
   psql -u [yourusername]
   CREATE DATABASE growly;
   EXIT;
   ```
4. **Jalankan migrasi:**
   ```bash
   cd backend
   bunx prisma migrate dev
   bunx prisma generate
   ```

### Streak tidak bertambah

1. **Pastikan timezone server dan device sama**
2. **Streak logic menggunakan date-only comparison (00:00:00)**
3. **Cek backend logs untuk streak calculation**
4. **Streak akan reset jika melewati 1 hari tanpa check-in**

### Bottom Navigation tertutup

- Sudah diperbaiki dengan **safe area insets**
- Tab bar otomatis menyesuaikan dengan home indicator device
- Chat input memiliki padding ekstra untuk floating tab bar

### Dark Mode tidak tersimpan

- Dark mode menggunakan **Zustand persist storage**
- Pastikan tidak ada error di console
- Restart aplikasi untuk memastikan state tersimpan

### Splash Screen terlalu cepat

- Default duration: **3 detik**
- Edit `App.tsx` bagian `setTimeout(resolve, 3000)` untuk mengubah durasi

### Login/Register Error

1. Pastikan backend berjalan dan database terkoneksi
2. Cek console log di terminal backend untuk error details
3. Pastikan email valid dan password minimal 6 karakter
4. Gunakan email unik yang belum terdaftar untuk register

### AI Chat tidak merespons

1. Pastikan `GEMINI_API_KEY` sudah diset di `backend/.env`
2. Cek kuota API di [Google AI Studio](https://makersuite.google.com/)
3. Lihat error di console backend
4. Pastikan koneksi internet stabil

---

## 🎯 Recent Updates & Features

### v1.0.0 - Major Visual Redesign & Enhancements

#### 🎨 Complete UI Overhaul
- **New Color Palette**: Modern coral, mint, and lavender theme
- **Dark Mode**: Full dark mode support with manual toggle
- **Custom Splash Screen**: Animated logo with gradient background
- **Floating Tab Bar**: Safe area aware navigation with shadow effects

#### 🔥 Enhanced Streak System
- **Streak Celebration Modal**: 
  - Animated fire (Lottie) when completing habits
  - Dynamic messages based on streak level (1-30+ days)
  - Progress bar showing journey to "Legend" status
  - Haptic feedback on celebration
  - Tap anywhere to dismiss
- **Automatic Streak Tracking**: 
  - Date-only comparison for accurate tracking
  - Streak resets after missing a day
  - Validates last completion within 24 hours
- **Level-based Rewards**: Different emojis and colors per milestone

#### 💬 Improved Chat Experience
- **Chat Input Padding**: Fixed overlap with floating tab bar
- **Privacy-focused**: Chat history isolated per user
- **Better UX**: Celebration appears after AI responds

#### 🛠️ Bug Fixes
- Fixed profile stats showing non-zero for new users (changed `||` to `??`)
- Fixed streak not incrementing when day changes (rewrote logic)
- Fixed bottom nav collision with device home indicator
- Fixed chat input being covered by tab bar

#### 📱 Better Device Support
- Safe area insets for all device types (iPhone X+, Android gesture nav)
- Responsive padding for floating UI elements
- Improved touch targets and spacing

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

- **Developer** - [vaiozaffana](https://github.com/vaiozaffana)

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
