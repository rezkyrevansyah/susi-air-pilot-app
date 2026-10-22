# Tes Teknis Fullstack Developer

**Susi Air · Aplikasi Pilot · Nuxt 3 + NestJS**

Tes teknis ini adalah bagian dari proses rekrutmen posisi Fullstack Developer di Susi Air. Bacalah petunjuknya sebelum mulai. Jika ada yang kurang jelas, hubungi it.admin@susiair.com.

## Gambaran Proyek

Anda akan membuat sebagian kecil dari aplikasi Pilot Susi Air. Aplikasi ini berupa situs web yang nyaman dipakai di ponsel. Pilot menggunakannya untuk melihat jadwal, mencatat jam terbang, dan mengetahui seberapa dekat jam terbang mereka dengan batas yang berlaku.

Tes ini mencakup **frontend** (tampilan yang digunakan pilot) dan **backend** (layanan yang menyediakan data untuk tampilan).

## Teknologi yang Digunakan

### Frontend

- Nuxt 3 dengan Composition API dan `<script setup>`.
- Pinia untuk mengelola state atau data yang dipakai bersama di frontend.
- SCSS untuk mengatur tampilan.

### Backend

- NestJS di Node.js.
- TypeScript wajib di backend dan lebih disukai juga di frontend.
- Sumber data berasal dari file JSON yang diberikan. Baca data tersebut saat layanan mulai berjalan. Anda **tidak wajib** memakai database. Jika ingin memakai SQLite dengan Prisma atau TypeORM, itu diperbolehkan, tetapi tidak diharapkan.

## Cakupan Pekerjaan

### Backend: REST API

Buat layanan NestJS dengan endpoint berikut. *Endpoint* adalah alamat API yang dapat dipanggil frontend. Saat backend mulai berjalan, muat file JSON yang diberikan sebagai sumber datanya.

| Metode | Alamat | Yang harus dilakukan |
| --- | --- | --- |
| `POST` | `/auth/login` | Terima `{ username, password }`, lalu kembalikan token. Cukup buat satu akun pilot yang ditulis langsung di kode. |
| `GET` | `/pilot/me` | Kembalikan profil pilot: nama, total jam terbang, dan URL avatar. |
| `GET` | `/flight-hours?from=YYYY-MM-DD&to=YYYY-MM-DD` | Kembalikan jam terbang per hari dari tanggal `from` sampai `to`. |
| `GET` | `/flight-hours/summary?range=...` | Kembalikan deret hasil penjumlahan bergulir untuk grafik. Nilai `range` yang tersedia: `1w`, `1m`, `3m`, `6m`, dan `1y`. Perhitungannya harus dilakukan di server. |
| `GET` | `/documents` | Kembalikan daftar dokumen pilot beserta tanggal kedaluwarsanya. |
| `GET` | `/schedules?year=YYYY&month=MM` | Kembalikan jadwal untuk satu bulan yang diminta. |

**Ketentuan backend:**

- Pisahkan kode dengan rapi menjadi *module*, *controller*, *service*, dan DTO. DTO digunakan untuk mendefinisikan bentuk data yang diterima API.
- Validasi input pada endpoint yang menerima parameter. Contohnya, periksa format tanggal dan pilihan `range`.
- Gunakan *global exception filter* agar error dari seluruh API mempunyai bentuk respons yang konsisten.
- Lindungi semua endpoint dengan *auth guard*, kecuali `/auth/login`. Guard harus memeriksa token yang diberikan oleh `/auth/login`.
- Penjumlahan bergulir untuk `/flight-hours/summary` harus dihitung di backend, bukan di frontend.
- Username akun pilot: `johndoe`.
- Password akun pilot: `susiairtest`.

### Frontend: Tiga Layar

Buat tiga layar berikut dan hubungkan ke backend. Jangan menyimpan data contoh (*mock data*) di frontend; ambil semua data dari API.

#### 1. Halaman Masuk (Sign In)

- Form login pilot dengan kolom username dan password.
- Tampilkan pesan yang jelas jika API menyatakan username atau password salah.

#### 2. Halaman Beranda (Home)

- Bagian atas berisi sapaan, nama pilot, total jam terbang, dan avatar.
- Bagian **Hours to Limit** berisi empat kartu ringkasan dan grafik penjumlahan bergulir. Sediakan pilihan `1w`, `1m`, `3m`, `6m`, dan `1y`. Rincian grafik dijelaskan di bawah. Data grafik berasal dari `/flight-hours/summary`.
- Daftar **My Documents**. Setiap dokumen menampilkan penanda masa berlaku sesuai tingkat urgensi: hijau = aman, kuning jingga = segera kedaluwarsa, merah = sudah kedaluwarsa. Status penanda berasal dari API.
- Navigasi di bagian bawah: Home, Schedule, Logbook, dan More.

#### 3. Halaman Jadwal (Schedule)

- Kalender bulanan dengan tombol untuk melihat bulan sebelumnya dan bulan berikutnya. Setiap pergantian bulan harus memanggil `/schedules?year=YYYY&month=MM`.
- Warnai hari berdasarkan jenis tugas (`DUTY`, `RL`, `SCK`, `TR`, `TX`, `ADM`, `FER`, `MED`, `REC`, `UL`). Gunakan nilai `base_color` dari API.
- Tampilkan status tugas pada setiap hari: beri tanda centang jika `count_logbooks` sama dengan `count_schedules`. Jika belum sama, tampilkan jumlah tugas yang masih tersisa.
- Tampilkan legenda atau keterangan warna di bawah kalender.
- Saat pengguna mengetuk sebuah tanggal, buka halaman sementara dengan tulisan “Detail page coming soon”. Anda tidak perlu membuat layar detailnya.

## Bagian Hours to Limit: Rincian

**Penjumlahan bergulir** berarti menjumlahkan jam terbang selama sejumlah hari yang berakhir pada tanggal tertentu. Perhitungan untuk bagian ini dilakukan oleh layanan NestJS. Frontend hanya menampilkan hasil yang dikirim API.

### A. Kartu Ringkasan Batas Jam Terbang

Tampilkan empat kartu yang membandingkan jam terbang saat ini dengan batas yang berlaku:

| Kartu | Batas | Periode yang dijumlahkan |
| --- | --- | --- |
| Harian | 8 jam | Hari ini saja |
| Mingguan | 40 jam | 7 hari bergulir |
| Bulanan | 100 jam | 30 hari bergulir |
| Tahunan | 1050 jam | 365 hari bergulir |

Setiap kartu harus menampilkan jumlah jam dalam periode tersebut, batasnya, dan penanda visual agar mudah dibandingkan.

### B. Grafik Tren Jam Terbang

- **Sumbu X** menunjukkan tanggal: 7 hari sebelum hari ini, hari ini, dan 7 hari setelah hari ini. Hari ini selalu berada di tengah grafik.
- **Sumbu Y** menunjukkan jumlah jam. Nilai maksimum sumbu Y berubah sesuai pilihan periode.
- Gambar garis batas berwarna merah secara mendatar pada nilai batas periode yang dipilih.
- Sediakan pilihan `1w`, `1m`, `3m`, `6m`, dan `1y`. Pilihan awal adalah `1w`.

### C. Batas Grafik untuk Setiap Pilihan

| Pilihan | Periode penjumlahan | Garis batas merah | Nilai maksimum sumbu Y |
| --- | --- | --- | --- |
| `1w` | 7 hari terakhir | 40 jam | 45 jam |
| `1m` | 30 hari terakhir | 100 jam | 125 jam |
| `3m` | 90 hari terakhir | 300 jam | 325 jam |
| `6m` | 180 hari terakhir | 600 jam | 625 jam |
| `1y` | 365 hari terakhir | 1050 jam | 1200 jam |

### D. Kondisi yang Perlu Ditangani

Data yang diberikan memuat beberapa kondisi khusus:

- Hari dengan 0 jam terbang tetap menyumbang 0 ke hasil penjumlahan. Tanggal yang tidak ada di data juga harus ditangani; jangan membuat rentang perhitungannya terputus.
- Pada tanggal dekat awal data, periode penjumlahan dapat dimulai sebelum tanggal pertama yang tersedia. Tentukan cara menangani bagian yang belum memiliki data itu.
- Tanggal mendatang yang muncul pada grafik tetap harus memiliki nilai. Tentukan arti penjumlahan bergulir untuk tanggal mendatang tersebut.
- Pada beberapa periode, hasil bergulir `1w` atau `1m` melewati garis batas merah. Grafik harus tetap dapat menampilkannya tanpa merusak tata letak.

## Arahan Desain

Tidak ada contoh desain yang disediakan. Sesuaikan tampilan dengan identitas Susi Air yang terlihat di susiair.com dan Instagram @susiairofficial. Buat desain yang sederhana, rapi, mengutamakan layar ponsel, dan cocok untuk kebutuhan operasional maskapai. Bayangkan alat kerja pilot, bukan aplikasi pemesanan perjalanan.

### Palet Warna

| Kegunaan | Warna |
| --- | --- |
| Biru tua utama | `#0E2138` |
| Merah merek (tombol utama dan aksen) | `#E63757` |
| Latar belakang | `#F5F6F8` |
| Permukaan kartu | `#FFFFFF` |
| Teks utama | `#0E2138` |
| Teks pendukung | `#6B7280` |
| Status aman | `#1FBF8F` |
| Status peringatan | `#F59E0B` |
| Status bahaya | `#E63757` |
| Aksen grafik | `#22C5E8` |

### Huruf dan Komponen Tampilan

- Gunakan font **Plus Jakarta Sans** dari Google Fonts. Pakai ketebalan huruf *bold* untuk angka penting.
- Sudut kartu membulat sekitar 12–16 px. Tombol utama berbentuk seperti kapsul (*pill*).
- Beri bayangan yang halus pada kartu. Gunakan ikon bergaya garis, misalnya dari Lucide, Phosphor, atau Heroicons.
- Untuk logo Susi Air, gunakan aset dari susiair.com.

## Data yang Disediakan

Ada tiga file JSON. Muat ketiganya saat layanan NestJS mulai berjalan. Menyimpan data di memori aplikasi sudah cukup.

- `mock-flight-hours.json`: data jam terbang selama 521 hari, dari 27 Desember 2024 sampai 31 Mei 2026, termasuk konfigurasi batas jam dan ukuran grafik.
- `mock-documents.json`: dokumen pilot, tanggal kedaluwarsa, dan konfigurasi ambang peringatan.
- `mock-schedules.json`: jadwal April, Mei, dan Juni 2026, beserta legenda jenis tugas.

**Dalam logika aplikasi, anggap hari ini adalah 15 Mei 2026. Jangan gunakan `new Date()` untuk menentukan “hari ini”.** Tulis tanggal tersebut langsung di kode atau jadikan konfigurasi agar perilaku aplikasi tetap sama saat diperiksa.

## Hasil yang Harus Dikumpulkan

- Repositori GitHub dengan dua folder, `/nuxt` dan `/nest`, atau dua repositori terpisah.
- Kedua aplikasi sudah dapat diakses secara online. Frontend dapat dipasang di Vercel atau Netlify; backend di Railway, Render, atau Fly. Paket gratis boleh digunakan.
- README yang menjelaskan cara menyiapkan dan menjalankan masing-masing aplikasi, variabel lingkungan yang dibutuhkan, keputusan utama beserta alasannya, dan hal yang ingin Anda perbaiki jika memiliki lebih banyak waktu.

## Tenggat Waktu

Kumpulkan dalam waktu **5 hari kalender** sejak menerima petunjuk tes ini. Jika membutuhkan waktu tambahan, beri tahu pihak Susi Air.

## Cara Mengumpulkan

Kirim tautan repositori GitHub dan kedua URL aplikasi yang sudah online ke it.admin@susiair.com.
