# 🌾 Rice Guard — Frontend

Antarmuka web untuk platform deteksi penyakit dan hama tanaman padi berbasis AI.

## Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Next.js** | 14.x | React framework (App Router) |
| **React** | 18.x | UI library |
| **Tailwind CSS** | 3.x | Utility-first CSS |
| **Axios** | 1.6 | HTTP client |
| **SweetAlert2** | 11.x | Notifikasi & dialog |
| **js-cookie** | 3.x | Manajemen cookie |
| **Font Awesome** | 6.5 | Ikon |

---

## Struktur Folder

```
frontend/
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.jsx          # Root layout (metadata, font, navbar)
│   │   ├── page.jsx            # Landing page (beranda)
│   │   ├── login/              # Halaman login
│   │   ├── register/           # Halaman registrasi
│   │   ├── dashboard/          # Dashboard (statistik & ringkasan)
│   │   ├── scan/               # Upload & scan gambar
│   │   ├── history/            # Riwayat deteksi
│   │   └── camera/             # Scan via kamera
│   ├── components/
│   │   ├── AppShell.jsx        # Layout sidebar untuk halaman app
│   │   ├── LandingContent.jsx  # Konten halaman beranda
│   │   ├── Navbar.jsx          # Navigasi utama
│   │   └── Providers.jsx       # Context providers wrapper
│   ├── context/
│   │   └── AuthContext.jsx     # Auth state management
│   ├── hooks/
│   │   └── useAuth.js          # Custom hook autentikasi
│   ├── lib/
│   │   ├── api.js              # Axios instance (base config)
│   │   ├── authAPI.js          # API calls autentikasi
│   │   ├── detectionAPI.js     # API calls deteksi
│   │   ├── notify.js           # SweetAlert2 helpers
│   │   └── seoConfig.js        # SEO metadata generator
│   ├── styles/
│   │   └── globals.css         # Global styles & CSS variables
│   └── utils/
│       └── authUtils.js        # Token & cookie utilities
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── package.json
└── README.md
```

---

## Instalasi & Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Konfigurasi API

Edit file `src/lib/api.js` untuk mengarahkan ke backend:

```js
const api = axios.create({
  baseURL: 'http://localhost:8000', // URL backend
});
```

### 3. Jalankan development server

```bash
npm run dev
```

Buka `http://localhost:3000`

### 4. Build untuk production

```bash
npm run build
npm start
```

---

## Halaman & Fitur

| Route | Halaman | Deskripsi |
|-------|---------|-----------|
| `/` | Beranda | Landing page company profile |
| `/login` | Login | Form masuk akun |
| `/register` | Daftar | Form registrasi akun baru |
| `/dashboard` | Dashboard | Statistik, deteksi terakhir, aksi cepat |
| `/scan` | Scan | Upload gambar untuk dianalisis AI |
| `/history` | Riwayat | Daftar semua hasil scan |
| `/camera` | Kamera | Scan langsung dari kamera device |

---

## Arsitektur

### Autentikasi

- Token JWT disimpan di **cookie** (`js-cookie`)
- `AuthContext` menyediakan state `isLoggedIn`, `user`, `login`, `logout`, `updateName`
- Protected routes redirect ke `/login` jika belum login
- Token dikirim otomatis via Axios interceptor di header `Authorization`

### Layout

- **Landing page** (`/`) — full-width tanpa sidebar, navbar transparan di hero
- **App pages** (`/dashboard`, `/scan`, `/history`) — menggunakan `AppShell` dengan fixed sidebar di desktop dan floating hamburger di mobile

### Design System

CSS variables (didefinisikan di `globals.css`):

| Variable | Warna | Fungsi |
|----------|-------|--------|
| `--mint` | `#CCDCDB` | Background utama |
| `--mint-soft` | `#A1D8B5` | Aksen hijau muda |
| `--leaf` | `#4CB572` | Primary / CTA |
| `--forest` | `#135E4B` | Teks heading |
| `--charcoal` | `#1f2a28` | Teks body |
| `--muted` | `#5b6a65` | Teks sekunder |

Font: **Plus Jakarta Sans** (Google Fonts)

---

## API Integration

Semua API calls terpusat di folder `src/lib/`:

### `authAPI.js`
- `register(email, name, password)` — Daftar akun
- `login(email, password)` — Login
- `getProfile(token)` — Ambil profil user
- `updateName(name)` — Ubah nama

### `detectionAPI.js`
- `scan(file, imageName)` — Upload & deteksi
- `getHistory()` — Ambil riwayat
- `getStats()` — Ambil statistik dashboard
- `renameDetection(id, name)` — Rename label
- `deleteOne(id)` — Hapus 1 deteksi
- `deleteAll()` — Hapus semua

---

## Scripts

```bash
npm run dev      # Development server (port 3000)
npm run build    # Build production
npm start        # Start production server
npm run lint     # Jalankan ESLint
```
