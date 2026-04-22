# PRD: E-Satpam Backend API
**Stack:** NestJS · Prisma ORM · Supabase (PostgreSQL)  
**Versi:** 1.0.0 · April 2026

---

## 1. Latar Belakang

E-Satpam adalah aplikasi mobile untuk petugas keamanan (satpam) yang mendukung mode **offline-first**. Semua data di mobile disimpan lokal dengan `sync_status = 0` (PENDING) dan akan disinkronisasi ke backend saat ada koneksi internet. Backend NestJS berfungsi sebagai pusat data resmi yang menyimpan, memvalidasi, dan mengelola seluruh laporan dari semua modul.

---

## 2. Arsitektur Sinkronisasi (Offline → Backend)

```
[Mobile App] → Simpan offline (sync_status=0)
     ↓ (ada sinyal)
[Background Sync Hook] → POST/PUT ke API Endpoint
     ↓ (berhasil)
[Backend Nest] → Simpan ke Supabase
     ↓
[Response OK] → Mobile update sync_status=1
```

Setiap endpoint **POST (create)** dan **PATCH (update status)** harus idempoten menggunakan UUID dari mobile sebagai primary key.

---

## 3. Auth & User

### Model: `User`
```prisma
model User {
  id         String   @id @default(uuid())
  name       String
  email      String   @unique
  password   String   // hashed
  role       Role     @default(SATPAM)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum Role {
  SATPAM
  ADMIN
  SUPERVISOR
}
```

### Endpoints
| Method | Path | Keterangan |
|--------|------|------------|
| POST | `/auth/login` | Login, return JWT |
| GET | `/auth/me` | Get current user |
| POST | `/auth/register` | Daftarkan satpam baru (ADMIN only) |

---

## 4. Modul-Modul Backend

---

### 4.1 Lembar Mutasi (`/mutasi`)

**Konsep:** Master-Detail berjenjang 2 level.
- **Master (`Mutasi`)** → Header shift (pos, shift, tanggal, status)
- **Detail Level 1 (`MutasiMember`)** → Daftar anggota + kehadiran
- **Detail Level 2 (`MutasiActivity`)** → Log aktivitas/kegiatan selama shift

**Alur Status:**
```
ACTIVE  →  SUBMITTED
(shift sedang berjalan)  →  (shift selesai, submit ke backend)
```

#### Model Prisma
```prisma
model Mutasi {
  id          String          @id @default(uuid())
  posName     String
  shiftName   String
  date        DateTime
  createdBy   String
  status      MutasiStatus    @default(ACTIVE)
  members     MutasiMember[]
  activities  MutasiActivity[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

enum MutasiStatus {
  ACTIVE
  SUBMITTED
}

model MutasiMember {
  id         String      @id @default(uuid())
  mutasiId   String
  mutasi     Mutasi      @relation(fields: [mutasiId], references: [id])
  guardName  String
  jabatan    String?
  attendance Attendance
}

enum Attendance {
  HADIR
  SAKIT
  IZIN
}

model MutasiActivity {
  id         String   @id @default(uuid())
  mutasiId   String
  mutasi     Mutasi   @relation(fields: [mutasiId], references: [id])
  guardName  String
  time       String   // "07:30"
  description String
  createdAt  DateTime @default(now())
}
```

#### Endpoints
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/mutasi` | **Default: hari ini saja** (filter `createdAt = today`) |
| GET | `/mutasi?history=true` | Semua hari (untuk halaman History di mobile) |
| POST | `/mutasi` | Buat mutasi baru |
| GET | `/mutasi/:id` | Detail mutasi + members + activities |
| PATCH | `/mutasi/:id/submit` | Submit / tutup shift |
| POST | `/mutasi/:id/members` | Tambah anggota |
| POST | `/mutasi/:id/activities` | Tambah log aktivitas |

---

### 4.2 Laporan Kejadian (`/kejadian`)

**Konsep:** Single document laporan insiden yang kaya field. Tidak ada sub-relasi. Satu laporan = satu record lengkap.

**Alur Status:**
```
PENDING (offline) → SUBMITTED → REVIEWED (opsional oleh supervisor)
```

#### Model Prisma
```prisma
model LaporanKejadian {
  id           String           @id @default(uuid())
  nomor        String           @unique
  perihal      String
  tempat       String
  tanggal      String
  pukul        String
  korbanNama   String?
  korbanAlamat String?
  pelakuNama   String?
  pelakuAlamat String?
  saksi1       String?
  saksi2       String?
  saksi3       String?
  saksi4       String?
  bukti1       String?
  bukti2       String?
  bukti3       String?
  bukti4       String?
  kronologis   String?          @db.Text
  kerugian     String?
  tindakan     String?          @db.Text
  status       KejadianStatus   @default(SUBMITTED)
  createdBy    String
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}

enum KejadianStatus {
  SUBMITTED
  REVIEWED
}
```

#### Endpoints
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/kejadian` | **Default: hari ini saja** (filter `createdAt = today`) |
| GET | `/kejadian?history=true` | Semua hari (untuk halaman History) |
| POST | `/kejadian` | Submit laporan kejadian baru |
| GET | `/kejadian/:id` | Detail laporan |
| PATCH | `/kejadian/:id/review` | Mark sebagai REVIEWED (SUPERVISOR only) |

---

### 4.3 Piket Staff (`/piket`)

**Konsep:** Log kunjungan/patroli sederhana. Satu record = satu kunjungan pos. Tidak ada sub-relasi.

#### Model Prisma
```prisma
model LaporanPiket {
  id          String   @id @default(uuid())
  lokasi      String
  petugas     String
  hasil       String
  keterangan  String?  @db.Text
  createdBy   String
  createdAt   DateTime @default(now())
}
```

#### Endpoints
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/piket` | **Default: hari ini saja** (filter `createdAt = today`) |
| GET | `/piket?history=true` | Semua hari (untuk halaman History) |
| POST | `/piket` | Submit laporan piket baru |
| GET | `/piket/:id` | Detail laporan piket |

---

### 4.4 Buku Tamu (`/tamu`)

**Konsep:** Log tamu yang masuk ke area. Sederhana, satu record = satu kunjungan tamu. Field `pukul` di-generate otomatis oleh mobile saat submit.

#### Model Prisma
```prisma
model BukuTamu {
  id          String   @id @default(uuid())
  namaTamu    String
  tujuan      String?
  pukul       String   // "14:35" – digenerate mobile saat simpan
  keterangan  String?
  noTelp      String?
  createdBy   String
  createdAt   DateTime @default(now())
}
```

#### Endpoints
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/tamu` | **Default: hari ini saja** (filter `createdAt = today`) |
| GET | `/tamu?history=true` | Semua hari (untuk halaman History) |
| POST | `/tamu` | Tambah data tamu baru |
| GET | `/tamu/:id` | Detail tamu |

---

### 4.5 Log Kunci (`/keylog`)

**Konsep:** Master-Detail 1 level.
- **Master (`KeyLog`)** → Kunci yang dititipkan di Pos
- **Detail (inline update)** → Kunci diambil (update record yang sama dengan data pengambil)

**Alur Status:**
```
DEPOSITED  →  TAKEN
(kunci dititipkan di pos)  →  (kunci diambil oleh seseorang)
```

#### Model Prisma
```prisma
model KeyLog {
  id                String     @id @default(uuid())
  keyName           String
  depositorName     String
  depositorDivision String?
  depositTime       DateTime   @default(now())
  status            KeyStatus  @default(DEPOSITED)
  takerName         String?
  takerDivision     String?
  keterangan        String?
  takeTime          DateTime?
  createdBy         String
  updatedAt         DateTime   @updatedAt
}

enum KeyStatus {
  DEPOSITED
  TAKEN
}
```

#### Endpoints
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/keylog` | **Default: hari ini saja** (filter `createdAt = today`) |
| GET | `/keylog?history=true` | Semua hari (untuk halaman History) |
| POST | `/keylog` | Titipkan kunci baru |
| GET | `/keylog/:id` | Detail kunci |
| PATCH | `/keylog/:id/ambil` | Proses pengambilan kunci (status → TAKEN) |

---

### 4.6 Log Kontainer (`/container`)

**Konsep:** Master-Detail 1 level. Kendaraan kontainer yang masuk dan keluar area pabrik. Container masuk = check-in (status IN), keluar = checkout (status OUT).

**Alur Status:**
```
IN  →  OUT
(kendaraan masuk area)  →  (kendaraan keluar area + nomor kontainer keluar dicatat)
```

#### Model Prisma
```prisma
model ContainerLog {
  id            String          @id @default(uuid())
  plateNumber   String
  driverName    String
  driverId      String
  vehicleType   String
  cargo         String
  total         String
  containerIn   String
  identityNote  String?
  checkInTime   DateTime        @default(now())
  status        ContainerStatus @default(IN)
  containerOut  String?
  checkOutTime  DateTime?
  createdBy     String
  updatedAt     DateTime        @updatedAt
}

enum ContainerStatus {
  IN
  OUT
}
```

#### Endpoints
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/container` | **Default: hari ini saja** (filter `createdAt = today`) |
| GET | `/container?history=true` | Semua hari (untuk halaman History) |
| POST | `/container` | Check-in kontainer baru |
| GET | `/container/:id` | Detail kontainer |
| PATCH | `/container/:id/checkout` | Check-out kontainer (status → OUT) |

---

### 4.7 Log Afkir (`/afkir`)

**Konsep:** Mirip dengan Container, namun untuk kendaraan afkir/scrap yang membawa barang limbah keluar area. Check-in saat masuk, check-out saat keluar.

**Alur Status:**
```
IN  →  OUT
(kendaraan afkir masuk untuk loading)  →  (kendaraan afkir keluar)
```

#### Model Prisma
```prisma
model AfkirLog {
  id            String       @id @default(uuid())
  plateNumber   String
  driverName    String
  driverId      String
  vehicleType   String
  itemType      String
  total         String
  buyer         String
  approvedBy    String
  identityNote  String?
  checkInTime   DateTime     @default(now())
  status        AfkirStatus  @default(IN)
  checkOutTime  DateTime?
  createdBy     String
  updatedAt     DateTime     @updatedAt
}

enum AfkirStatus {
  IN
  OUT
}
```

#### Endpoints
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/afkir` | **Default: hari ini saja** (filter `createdAt = today`) |
| GET | `/afkir?history=true` | Semua hari (untuk halaman History) |
| POST | `/afkir` | Check-in afkir baru |
| GET | `/afkir/:id` | Detail afkir |
| PATCH | `/afkir/:id/checkout` | Check-out afkir |

---

### 4.8 Izin Staff (`/izin`)

**Konsep:** Log keluar-masuk staff untuk keperluan di luar area kerja. Mirip absensi keluar, saat kembali status diupdate ke RETURNED.

**Alur Status:**
```
OUT  →  RETURNED
(staff keluar area)  →  (staff kembali ke area)
```

#### Model Prisma
```prisma
model IzinStaff {
  id          String      @id @default(uuid())
  name        String
  department  String
  reasonType  ReasonType
  destination String
  note        String?
  timeOut     DateTime    @default(now())
  timeIn      DateTime?
  status      IzinStatus  @default(OUT)
  createdBy   String
  updatedAt   DateTime    @updatedAt
}

enum IzinStatus {
  OUT
  RETURNED
}

enum ReasonType {
  KERJA
  PRIBADI
}
```

#### Endpoints
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/izin` | **Default: hari ini saja** (filter `createdAt = today`) |
| GET | `/izin?history=true` | Semua hari (untuk halaman History) |
| POST | `/izin` | Catat izin keluar baru |
| GET | `/izin/:id` | Detail izin |
| PATCH | `/izin/:id/kembali` | Update status → RETURNED + catat timeIn |

---

## 5. Desain Arsitektur Dashboard vs History

### Konsep Utama

> **Dashboard (Hari Ini):** Setiap module hanya menampilkan log yang dibuat pada hari yang sedang berjalan. Saat tengah malam (pergantian hari), data otomatis **tidak muncul** karena filter `createdAt` berubah ke hari baru.

> **History (Semua Hari):** Halaman terpisah di bottom navigation yang menampilkan seluruh log dari semua hari dan semua modul, dapat difilter dan dicari.

```
Bottom Navigation Mobile:
├── [Dashboard] → Modul grid → Tap modul → GET /mutasi        (hari ini)
└── [History]   → Feed all  → GET /history?module=all          (semua hari)
```

### Implementasi Filter di Backend (NestJS Service)

Setiap service menggunakan helper `buildDateFilter(history: boolean)`:

```typescript
// Dalam setiap service
findAll(history: boolean) {
    const where = history ? {} : {
        createdAt: {
            gte: startOfDay(new Date()),
            lte: endOfDay(new Date()),
        }
    };
    return this.prisma.model.findMany({ where, orderBy: { createdAt: 'desc' } });
}
```

### Behavior Pergantian Hari
- Filter `gte: startOfDay` & `lte: endOfDay` di-compute **server-side** saat request masuk
- Tidak ada cron job atau reset otomatis yang diperlukan
- Mobile *offline cache* tetap menyimpan semua data lokal, filter hari ini dilakukan di sisi mobile juga (double filter)

---

## 6. Endpoint History Agregat (`/history`)

**Konsep:** Single endpoint agregat yang menggabungkan data dari semua modul ke dalam satu feed timeline untuk halaman History di mobile.

### Endpoint
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/history` | Feed semua log dari semua modul (semua hari) |
| GET | `/history?module=kejadian` | Filter per modul tertentu |
| GET | `/history?from=2026-04-01&to=2026-04-16` | Filter rentang tanggal |
| GET | `/history?module=kejadian&from=...&to=...` | Kombinasi filter |

### Response Format
```json
{
  "success": true,
  "data": [
    { "module": "kejadian", "id": "uuid", "title": "Perihal kejadian", "createdAt": "2026-04-16T07:30:00Z", "status": "SUBMITTED" },
    { "module": "tamu", "id": "uuid", "title": "Budi Santoso", "createdAt": "2026-04-16T06:00:00Z", "status": null },
    ...
  ],
  "meta": { "total": 150, "page": 1, "limit": 20 }
}
```

> Response feed ini bersifat **lightweight** (hanya field ringkasan tiap modul), detail lengkap tetap diambil lewat `GET /:module/:id`.

---

## 7. Endpoint Sync (Offline-First)

Untuk mendukung sinkronisasi dari mobile, setiap modul mendukung pola **upsert by UUID**. Mobile mengirimkan data dengan UUID yang sudah dibuat di device.

```
POST /sync/batch
Body: {
  module: "tamu" | "kejadian" | "piket" | "keylog" | "container" | "afkir" | "izin",
  records: [ { id: "uuid-dari-mobile", ...data } ]
}
Response: { synced: ["uuid-1", "uuid-2"], failed: [] }
```

Di dalam handler, tiap record di-upsert menggunakan `prisma.upsert({ where: { id }, create: ..., update: ... })`.

---

## 8. Struktur Project NestJS (Enterprise-Grade)

### Folder Architecture

```
src/
│
├── modules/                          ← Semua domain modul
│   ├── mutasi/
│   │   ├── dto/
│   │   │   ├── create-mutasi.dto.ts
│   │   │   └── update-mutasi.dto.ts
│   │   ├── mutasi.controller.ts
│   │   ├── mutasi.service.ts
│   │   └── mutasi.module.ts
│   ├── kejadian/
│   ├── piket/
│   ├── tamu/
│   ├── keylog/
│   ├── container/
│   ├── afkir/
│   ├── izin/
│   ├── history/                      ← Aggregated history feed
│   │   ├── history.controller.ts
│   │   ├── history.service.ts
│   │   └── history.module.ts
│   └── sync/                         ← Offline batch sync
│       ├── sync.controller.ts
│       ├── sync.service.ts
│       └── sync.module.ts
│
├── auth/                             ← Auth (cross-cutting concern)
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── common/                           ← Shared, reusable code
│   ├── decorators/
│   │   ├── current-user.decorator.ts   ← @CurrentUser()
│   │   ├── public.decorator.ts         ← @Public() (skip JWT)
│   │   └── roles.decorator.ts          ← @Roles(Role.ADMIN)
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   └── response.interceptor.ts     ← Auto-wrap { success, data, message }
│   ├── filters/
│   │   └── http-exception.filter.ts    ← Global error handler
│   ├── pipes/
│   │   └── validation.pipe.ts          ← Auto-validate all DTOs
│   └── helpers/
│       └── date.helper.ts              ← startOfDay(), endOfDay(), isToday()
│
├── config/                           ← Environment configs
│   ├── app.config.ts
│   ├── database.config.ts
│   └── jwt.config.ts
│
├── prisma/                           ← Prisma singleton
│   └── prisma.service.ts
│
├── app.module.ts
└── main.ts
```

### Konvensi Penamaan Standar

Setiap modul **wajib** memiliki struktur file berikut (contoh: `tamu/`):

| File | Fungsi |
|------|--------|
| `tamu.module.ts` | Deklarasi module NestJS |
| `tamu.controller.ts` | Route handler, validasi input via DTO |
| `tamu.service.ts` | Business logic, query Prisma |
| `dto/create-tamu.dto.ts` | Validasi body POST (class-validator) |
| `dto/update-tamu.dto.ts` | Validasi body PATCH (PartialType) |

### Standard Features yang Wajib Dipakai

```typescript
// main.ts — Bootstrap standar tech company
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 1. Global prefix versi API
    app.setGlobalPrefix('api/v1');

    // 2. Auto-validasi semua DTO secara global
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,       // strip field tidak dikenal
        transform: true,       // auto-convert tipe (string → number dll)
        forbidNonWhitelisted: true,
    }));

    // 3. Auto-wrap semua response ke format standar
    app.useGlobalInterceptors(new ResponseInterceptor());

    // 4. Auto-handle semua error ke format standar
    app.useGlobalFilters(new HttpExceptionFilter());

    // 5. Swagger API Documentation
    const config = new DocumentBuilder()
        .setTitle('E-Satpam API')
        .setDescription('API Backend untuk aplikasi E-Satpam Mobile')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // 6. CORS untuk Mobile
    app.enableCors({ origin: '*' });

    // 7. Versioning (future-proof)
    app.enableVersioning({ type: VersioningType.URI });

    await app.listen(3000);
}
```

---

## 9. Prisma & Supabase Setup

```env
# .env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
JWT_SECRET="your_very_long_secret_key_min_32_chars"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

```bash
# Setup awal
npm install @prisma/client prisma
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
npm install @nestjs/throttler         # rate limiting
npm install date-fns                  # date helper (startOfDay, endOfDay)

npx prisma init
npx prisma generate
npx prisma migrate dev --name init
```

### `prisma.service.ts` Standar

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();
    }
}
```

> `PrismaModule` harus di-export dengan `global: true` agar tidak perlu import ulang di setiap module.

---

## 10. Ringkasan Master-Detail per Modul

| Modul | Tipe | Status Flow | Sub-relasi |
|-------|------|-------------|------------|
| Lembar Mutasi | Master-Detail 2 level | ACTIVE → SUBMITTED | Members + Activities |
| Log Kunci | Master-Detail 1 level | DEPOSITED → TAKEN | Inline update |
| Log Kontainer | Master-Detail 1 level | IN → OUT | Inline checkout |
| Log Afkir | Master-Detail 1 level | IN → OUT | Inline checkout |
| Izin Staff | Master-Detail 1 level | OUT → RETURNED | Inline kembali |
| Laporan Kejadian | Single Document | SUBMITTED → REVIEWED | Tidak ada |
| Piket Staff | Single Log | — | Tidak ada |
| Buku Tamu | Single Log | — | Tidak ada |

---

## 11. Response Format Standar

Dihandle otomatis oleh `ResponseInterceptor` — developer tidak perlu wrap manual.

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": { ... }
}
```

**Paginated:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [ ... ],
  "meta": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
}
```

**Error (dari HttpExceptionFilter):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [ "nama_tamu must not be empty" ]
}
```

---

## 12. Non-Functional Requirements

| Kategori | Implementasi |
|----------|-------------|
| **Auth** | JWT Bearer, semua endpoint protected kecuali `POST /auth/login`. Gunakan `@Public()` untuk skip |
| **Roles** | `@Roles(Role.ADMIN)` guard untuk endpoint khusus admin/supervisor |
| **Validasi** | `class-validator` di DTO, `ValidationPipe` global, tidak ada validasi manual |
| **Pagination** | Standar: `?page=1&limit=10`, response selalu include `meta` |
| **Filtering** | `?history=true` untuk semua data, default hari ini saja |
| **Idempotent Sync** | UUID dari mobile sebagai PK, gunakan `prisma.upsert` di seluruh POST create |
| **Rate Limiting** | `@nestjs/throttler` — max 100 req/menit per IP |
| **API Versioning** | Prefix `/api/v1/` — route-based versioning |
| **Dokumentasi** | Swagger auto-generated di `/api/docs` |
| **Error Handling** | Global `HttpExceptionFilter` — tidak ada try-catch di controller |
| **Date Helper** | `date-fns` untuk `startOfDay()`, `endOfDay()` — tidak ada manipulasi Date manual |

