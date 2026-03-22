# Proje görselleri yükleme (Supabase Storage)

Yerel disk (`public/uploads`) bazen çalışmaz: **OneDrive** klasörü, **Vercel / serverless** (kalıcı disk yok), izin sorunları. Bu projede önerilen yol: **Supabase Storage** + ortam değişkeni.

## 1. Bucket oluştur

### A) SQL ile (önerilen)

1. [Supabase Dashboard](https://supabase.com/dashboard) → projen → **SQL Editor**
2. `supabase/migrations/004_storage_project_uploads.sql` dosyasının içeriğini yapıştır → **Run**

### B) Elle (UI)

1. **Storage** → **New bucket**
2. **Name:** `project-uploads` (kod ve `.env` ile aynı olmalı)
3. **Public bucket:** açık (portfolio’da görseller herkese açık URL ile yüklenecek)

## 2. Ortam değişkeni

Proje kökündeki `.env` dosyasına ekleyin:

```env
SUPABASE_UPLOAD_BUCKET=project-uploads
```

Zaten tanımlı olması gerekenler (Supabase API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...   # veya eyJ... (service role — sunucuda kalır, paylaşmayın)
```

**Önemli:** `SUPABASE_SERVICE_ROLE_KEY` **service role** olmalı (anon key değil). Dashboard → **Project Settings** → **API** → *service_role* **secret**.

## 3. Sunucuyu yeniden başlat

```bash
npm run dev
```

`.env` değişince Next.js’i mutlaka yeniden başlatın.

## 4. Kontrol

1. Admin’e giriş yapın → proje düzenle / yeni proje
2. **Slug** doldurun (yeni projede yükleme için zorunlu)
3. Görsel sürükleyin veya dosya seçin
4. Hata alırsanız tarayıcıda **Network** sekmesinde `POST /api/admin/upload` cevabına bakın (JSON `error` mesajı)

## Sık hatalar

| Mesaj / durum | Ne yapmalı |
|----------------|------------|
| `Unauthorized` / 401 | Admin oturumu açık mı? Tekrar giriş yapın. |
| `Bucket not found` | Bucket adı tam `project-uploads` mi? `SUPABASE_UPLOAD_BUCKET` aynı mı? |
| `new row violates row-level security` | Service role key kullanıldığından emin olun (anon değil). |
| Yerelde disk yazılmıyor | `SUPABASE_UPLOAD_BUCKET` ekleyip Storage kullanın (OneDrive altında `public/` yazma sorunları sık görülür). |
| 5MB üstü | Görselleri sıkıştırın veya migration’daki `file_size_limit` değerini artırın (ve bucket ayarını güncelleyin). |

## Yerel disk modu (Storage kullanmadan)

`SUPABASE_UPLOAD_BUCKET` **tanımlı değilse** dosyalar `public/uploads/projects/...` altına yazılır. Bunun için:

- Proje **OneDrive dışında** veya yazma izni sorunsuz bir dizinde olmalı
- **Production’da** (Vercel vb.) genelde **Storage zorunlu**
