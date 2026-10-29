# Website SKM Kecamatan Talun

Situs statis Survei Kepuasan Masyarakat (SKM) dan Dashboard Monitoring Indeks
dengan pengelompokan K-Means untuk Kecamatan Talun, Kabupaten Pekalongan.

## Halaman

- `index.html` - formulir survei (halaman utama)
- `dashboard.html` - dashboard monitoring indeks dan K-Means
- `style.css`, `script.js` - tampilan dan logika survei
- `dashboard.css`, `dashboard.js` - tampilan dan logika dashboard
- `apps-script/dashboard-api.gs` - fungsi `doGet` untuk data live dashboard

## Hosting di GitHub Pages

1. Upload semua file ke repository GitHub pada branch `main`.
2. Buka **Settings** > **Pages**.
3. Pada **Source**, pilih **Deploy from a branch**.
4. Pilih branch **main** dan folder **/ (root)**, lalu **Save**.
5. Tunggu 1-2 menit. Situs tersedia di:
   `https://<username>.github.io/<nama-repo>/`

Halaman survei otomatis menjadi halaman awal. Dashboard dapat dibuka dari link
di footer survei atau langsung ke `dashboard.html`.

## Data live dashboard (opsional)

Dashboard otomatis memakai data contoh jika `ENDPOINT` di `dashboard.js` masih
kosong. Untuk memakai data responden sebenarnya:

1. Buka spreadsheet SKM, lalu **Extensions** > **Apps Script**.
2. Tambahkan fungsi `doGet` dari `apps-script/dashboard-api.gs` ke project
   Apps Script yang sudah memiliki `doPost` survei. Jangan hapus `doPost`.
3. Klik **Deploy** > **New deployment** > **Web app**.
4. Atur **Execute as: Me** dan **Who has access: Anyone**, lalu **Deploy**.
5. Salin URL Web App, lalu isi `ENDPOINT` di `dashboard.js` dengan URL tersebut.
6. Upload ulang `dashboard.js` ke GitHub.

Setelah dikonfigurasi, dashboard mengambil data dari spreadsheet dan menghitung
indeks serta kelompok K-Means secara otomatis.

## Catatan

- Semua aset memakai path relatif sehingga aman di GitHub Pages.
- Pengiriman survei memakai `mode: "no-cors"` agar tidak gagal karena CORS saat
  situs dihosting di domain lain (misalnya GitHub Pages).
- File `.nojekyll` disertakan agar GitHub Pages tidak memproses situs dengan
  Jekyll.
