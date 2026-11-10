# Project Planning Document: AutoFinance Tracker

## 1. Project Overview & Objectives
- **Nama Proyek:** AutoFinance Tracker
- **Platform Strategi (Tahap Awal):** Web App (Fokus pengembangan awal berbasis web untuk validasi pasar dan kemudahan akses lintas perangkat, sebelum nantinya merambah ke versi APK Mobile).
- **Tujuan Utama:** Mengeliminasi proses *input* manual yang melelahkan dalam pencatatan keuangan pribadi dengan menyediakan alternatif otomatisasi yang ramah web (seperti *import* mutasi rekening CSV/PDF dan *Quick Text/SMS Parser*).
- **Target Pengguna:** Pekerja muda, mahasiswa, dan *freelancer* yang aktif menggunakan dompet digital (*e-wallet*) serta *mobile banking* tetapi sering lupa mencatat pengeluaran harian.

---

## 2. Scope & Features Breakdown (MVP)
Berikut adalah ruang lingkup fitur yang akan dibangun secara bertahap:

| Fase | Modul / Fitur | Deskripsi Fungsional | Prioritas |
| :--- | :--- | :--- | :--- |
| **Phase 1 (MVP - Web App)** | *Import Mutasi / File Parser* | Mengunggah file laporan transaksi (CSV/PDF) dari *m-banking* atau *e-wallet* untuk diproses otomatis. | **High** |
| | *Quick Text / SMS Parser* | Fitur *copy-paste* teks riwayat/SMS transaksi untuk ekstrak data otomatis secara instan. | **High** |
| | *Text Parser Engine* | Mengekstrak data krusial (Nominal, Nama Merchant, Tanggal) menggunakan *Regex* / *Rule-based*. | **High** |
| | *Local Storage & Dashboard* | Menyimpan data secara lokal di HP dan menampilkan ringkasan pengeluaran bulanan. | **High** |
| | *Manual Entry & Edit* | Memungkinkan pengguna menambah/mengoreksi transaksi yang gagal terbaca otomatis. | **Medium** |
| **Phase 2** | *Auto-Categorization* | Mengelompokkan transaksi otomatis (cth: "GoFood" $
ightarrow$ "Kuliner"). | **Medium** |
| | *Budget Alert* | Memberikan peringatan jika anggaran bulanan atau kategori tertentu hampir habis. | **Low** |
| | *Export to CSV/Excel* | Fitur unduh laporan keuangan bagi pengguna yang ingin analisis lebih mendalam. | **Low** |

---

## 3. High-Level User Flow (Alur Pengguna)
1. **Onboarding:** Pengguna membuka aplikasi, memberikan izin akses notifikasi (*Notification Access Permission*), dan menetapkan batas anggaran bulanan.
2. **Transaksi:** Pengguna melakukan pembayaran menggunakan *e-wallet* atau *m-banking* (misal: bayar kopi via QRIS).
3. **Auto-Capture:** Sistem mendeteksi notifikasi masuk dari aplikasi pembayaran tersebut di latar belakang (*background*).
4. **Parsing & Saving:** Sistem membaca nominal dan merchant, lalu otomatis mencatatnya ke dalam *database* lokal aplikasi.
5. **Review:** Pengguna membuka aplikasi kapan saja untuk melihat grafik pengeluaran atau melakukan koreksi jika ada data yang kurang pas.

---

## 4. Risiko Bisnis & Strategi Mitigasi
Sebagai *Business Analyst*, penting untuk mengantisipasi kendala sejak awal proyek:

- **Risiko Privasi & Kepercayaan:** Pengguna ragu memberikan izin akses notifikasi karena takut data pribadi/chat ikut terbaca.
  - *Mitigasi:* Terapkan kebijakan *Local-First Architecture* (semua data diproses dan disimpan secara lokal di perangkat pengguna, tidak dikirim ke server luar) serta jelaskan dengan transparan bahwa aplikasi hanya memfilter kata kunci finansial tertentu.
- **Risiko Perubahan Format Notifikasi:** Bank atau *e-wallet* sering memperbarui format pesan/notifikasi mereka, yang bisa membuat *parser* error.
  - *Mitigasi:* Buat sistem *parser* yang modular dan sediakan mekanisme pembaruan pola regex secara dinamis, atau sediakan tombol "Lapor Format Error" di aplikasi.

---

## 5. Timeline & Tahapan Eksekusi (Roadmap)
- **Bulan 1 (Analisis & Desain):** Finalisasi *wireframe UI/UX* (fokus pada kemudahan navigasi dasbor) dan perancangan skema *database* lokal.
- **Bulan 2 - 3 (Pengembangan MVP):** Pemrograman inti (Android/Cross-platform), implementasi *Notification Listener*, dan pembuatan *parser*.
- **Bulan 4 (Pengujian & *Bug Fixing*):** Uji coba stabilitas *background service* di berbagai jenis *smartphone* dan pengujian akurasi pembacaan notifikasi.
- **Bulan 5 (Peluncuran Terbatas / Beta):** Rilis ke segmen pengguna terbatas (keluarga/teman dekat) untuk mengumpulkan masukan nyata.
