# Nexus SMS Engine

Nexus SMS Engine; Next.js App Router, TypeScript, Prisma, PostgreSQL, Redis ve BullMQ ile gelistirilmis uretim odakli SMS operasyon platformudur.

## Ozellik Ozeti

- Toplu SMS gonderimi (chunk bazli kuyruk)
- Bireysel SMS (maksimum 10 alici)
- SMS rehber yonetimi ve import/export
- SMS kara liste (kullanici + global)
- Kredi rezerv/debit/refund islem kayitlari
- Coklu saglayici mimarisi (ilk adapter: Uipapp/Dise)
- Admin paneli ve rol bazli erisim
- Worker ile async gonderim ve rapor senkronizasyonu

## Teknoloji Yigini

- Next.js (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- Tailwind CSS
- Docker / Docker Compose

## Ortam Degiskenleri

`.env.example` dosyasini `.env` olarak kopyalayin ve degerleri doldurun:

```bash
cp .env.example .env
```

## Lokal Kurulum

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Worker'i ayri terminalde calistirin:

```bash
npm run dev:worker
```

## Prisma Komutlari

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:studio
```

## Seed Davranisi

- Varsayilan: `ENABLE_SEED=false`
- Seed calisinca demo veri uretmez
- Sadece admin kullanici olusturur
- `DEFAULT_SMS_PROVIDER_TOKEN` doluysa ilk Uipapp saglayicisini olusturur

## Docker ile Calistirma

```bash
docker compose up --build
```

Production benzeri:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## API Yollari

### Musteri

- `GET /api/sms/dashboard`
- `GET /api/sms/providers`
- `GET /api/sms/providers/balance`
- `POST /api/sms/send/bulk`
- `POST /api/sms/send/individual`
- `GET /api/sms/campaigns`
- `GET /api/sms/campaigns/:id`
- `POST /api/sms/campaigns/:id/cancel`
- `POST /api/sms/campaigns/:id/report-sync`
- `GET /api/sms/phone-books`
- `POST /api/sms/phone-books`
- `POST /api/sms/phone-books/:id/import`
- `DELETE /api/sms/phone-books/:id`
- `GET /api/sms/blacklist`
- `POST /api/sms/blacklist/bulk`
- `DELETE /api/sms/blacklist/:id`
- `GET /api/sms/history/individual`

### Admin

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id`
- `POST /api/admin/users/:id/credits`
- `GET /api/admin/sms/campaigns`
- `GET /api/admin/sms/phone-books`
- `GET /api/admin/sms/blacklist`
- `GET /api/admin/sms/otp-history`
- `GET /api/admin/sms/individual-history`
- `GET /api/admin/sms/providers`
- `POST /api/admin/sms/providers`
- `PATCH /api/admin/sms/providers/:id`
- `POST /api/admin/sms/providers/:id/test-balance`
- `POST /api/admin/sms/providers/:id/fetch-prices`

## GitHub Repo Manuel Baslatma

```bash
git init
git add .
git commit -m "feat: build nexus sms engine"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Not: `git push` komutunu sadece remote URL'yi ekledikten sonra calistirin.
