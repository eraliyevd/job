# IshBor — O'zbekiston Ish Portali

Full-stack job board, Railway-ga deploy qilish uchun tayyor.

## Tech Stack

- **Next.js 14** (App Router, full-stack)
- **MongoDB** (Mongoose ODM)
- **Tailwind CSS** (dark mode, mobile-first)
- **JWT Auth** (jose — Edge runtime, httpOnly cookies, refresh token rotation)
- **Zod** (input validation)
- **bcryptjs** (password hashing, 12 rounds)

## Sahifalar

| Yo'l | Tavsif | Himoya |
|------|--------|--------|
| `/` | Bosh sahifa (hero, kategoriyalar, top vakansiyalar) | — |
| `/jobs` | Vakansiyalar ro'yxati + filtrlar | — |
| `/jobs/[id]` | Vakansiya batafsil | — |
| `/login` | Kirish (telefon + parol) | Faqat mehmon |
| `/register` | Ro'yxatdan o'tish | Faqat mehmon |
| `/post-job` | Vakansiya joylash | Login talab |
| `/dashboard` | Foydalanuvchi paneli | Login talab |
| `/profile` | Profil + parol o'zgartirish | Login talab |
| `/pricing` | Tarif rejalari | — |
| `/admin` | Admin panel (foydalanuvchilar) | Faqat admin |

## API Endpointlar

### Auth
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Kirish |
| POST | `/api/auth/logout` | Chiqish (token revoke) |
| POST | `/api/auth/refresh` | Token yangilash (rotation) |
| GET  | `/api/auth/me` | Joriy foydalanuvchi |
| PATCH| `/api/auth/me` | Profilni yangilash |
| PATCH| `/api/auth/me/change-password` | Parolni o'zgartirish |

### Jobs
| Method | Endpoint | Tavsif | Himoya |
|--------|----------|--------|--------|
| GET  | `/api/jobs` | Vakansiyalar ro'yxati | — |
| POST | `/api/jobs` | Vakansiya joylash | Login |

### Admin
| Method | Endpoint | Tavsif | Himoya |
|--------|----------|--------|--------|
| GET    | `/api/admin/users` | Foydalanuvchilar | Admin |
| PATCH  | `/api/admin/users` | Yangilash | Admin |
| DELETE | `/api/admin/users?userId=` | O'chirish | Admin |

## O'rnatish

```bash
# 1. Klonlash
git clone <repo>
cd job-board

# 2. Paketlarni o'rnatish
npm install

# 3. Muhit o'zgaruvchilarini sozlash
cp .env.example .env
# .env faylini to'ldiring

# 4. Dev server
npm run dev
```

## Railway Deploy

1. Railway.app'ga kirish
2. "New Project" → "Deploy from GitHub repo"
3. Environment variables ni `.env.example` asosida to'ldiring:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_ACCESS_SECRET` — `openssl rand -base64 64`
   - `JWT_REFRESH_SECRET` — `openssl rand -base64 64`
4. Deploy avtomatik boshlanadi

## Xavfsizlik

- Parollar **bcrypt** (12 round) bilan hash'lanadi
- JWT tokenlar **httpOnly cookie** da saqlanadi (XSS himoyasi)
- Access token: **15 daqiqa** | Refresh token: **30 kun**
- Refresh token **rotation** — har safar yangi token beriladi
- Refresh token **reuse detection** — barcha sessiyalar revoke qilinadi
- Rate limiting: login (10/15min), register (5/10min) per IP
- Zod bilan barcha inputlar tekshiriladi
- CSRF himoyasi: `sameSite: strict` cookie
- Xavfsizlik headerlari: `X-Frame-Options`, `X-XSS-Protection`, va h.k.

## Tillar

- 🇺🇿 O'zbek (Lotin) — `uz-latn`
- 🇺🇿 O'zbek (Kiril) — `uz-cyrl`
- 🇷🇺 Rus — `ru`
