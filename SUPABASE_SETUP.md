# Supabase Kurulum

Proje Prisma'dan Supabase'e taşındı. Sıfırdan kurulum adımları:

---

## 1. Supabase projesi oluştur

1. [supabase.com](https://supabase.com) → **New project**
2. Proje adı, şifre gir → **Create**
3. **Settings** → **API** bölümünden kopyala:
   - **Project URL** → `.env` içinde `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role** (anon değil!) → `.env` içinde `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Tabloları oluştur

1. Supabase Dashboard → **SQL Editor**
2. **New query** → `supabase/migrations/001_init.sql` dosyasının **tüm içeriğini** kopyala yapıştır
3. **Run** tıkla
4. `002_add_chatbot_rules.sql` ve `003_add_chatbot_data.sql` dosyalarını da çalıştır (chatbot kurallarını admin’den düzenlemek için)

---

## 3. .env güncelle

`.env` dosyasına ekle (veya güncelle):

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

AUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="güçlü-şifre"
```

---

## 4. Admin kullanıcısı oluştur

```bash
npm run db:seed
```

Bu komut `ADMIN_EMAIL` ve `ADMIN_PASSWORD` ile admin kullanıcı oluşturur.

---

## 5. Profile ve FAQ'yi doldur

`data/profile.ts` içeriğini Profile ve FAQ tablolarına aktarmak için:

```bash
npm run db:seed-profile-faq
```

## 6. Projeleri import et

Eski SQLite'daki veya `content/projects.json` dosyasındaki projeleri Supabase'e aktarmak için:

```bash
npm run db:import
```

Bu komut `content/projects.json` içindeki tüm projeleri veritabanına ekler. Mevcut slug varsa atlanır.

---

## 7. Uygulamayı çalıştır

```bash
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login

---

## Chatbot nerede?

- **Admin panel** → Dashboard'daki **Chatbot** kartına tıkla veya `/admin/chatbot` adresine git
- **System prompt**, **Rules** ve **Data** buradan düzenlenir; Profile ve FAQ Dashboard'dan
- Site üzerinde sağ altta chatbot widget'ı var
- `.env` içinde `OPENROUTER_API_KEY` veya `OPENAI_API_KEY` tanımlanmalı

---

## Özet sıra

1. Supabase projesi oluştur
2. SQL Editor'da `001_init.sql`, `002_add_chatbot_rules.sql`, `003_add_chatbot_data.sql` çalıştır
3. `.env` doldur
4. `npm run db:seed` → admin oluştur
5. `npm run db:seed-profile-faq` → Profile ve FAQ doldur
6. `npm run db:import` → projeleri yükle
7. `npm run dev` → başlat
