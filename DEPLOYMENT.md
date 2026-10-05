# Panduan Deployment Project Alloc ke VPS (Nginx + PM2)

Panduan ini menjelaskan langkah-langkah men-deploy project Alloc ke server VPS (Ubuntu/Debian) menggunakan Nginx sebagai reverse proxy / web server dan PM2 sebagai process manager Node.js.

---

## 1. Persiapan VPS (Server Setup)

Jalankan perintah berikut di VPS untuk memperbarui sistem dan menginstal dependensi dasar:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx
```

### Install Node.js (v20 LTS disarankan)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifikasi instalasi:
```bash
node -v
npm -v
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

---

## 2. Clone dan Setup Project di VPS

Pindahkan atau clone repositori project ke direktori web server (misalnya `/var/www/alloc`):

```bash
sudo mkdir -p /var/www/alloc
sudo chown -R $USER:$USER /var/www/alloc
cd /var/www/alloc

# Clone repository atau salin file project Anda ke sini:
git clone <URL_REPOSITORY_ANDA> .

# Install dependencies (hanya production)
npm install --omit=dev

# Buat file environment jika diperlukan
cp .env.example .env
```

---

## 3. Jalankan Aplikasi dengan PM2

Jalankan aplikasi menggunakan konfigurasi `ecosystem.config.js` yang sudah disediakan:

```bash
# Start aplikasi
pm2 start ecosystem.config.js --env production

# Cek status aplikasi
pm2 status

# Simpan daftar proses agar otomatis hidup saat VPS reboot
pm2 save
pm2 startup
```
*(Ikuti instruksi command `sudo env PATH=...` yang dimunculkan oleh `pm2 startup` jika ada)*

---

## 4. Konfigurasi Nginx

Salin file konfigurasi Nginx dari project ke direktori Nginx:

```bash
sudo cp nginx/alloc.conf /etc/nginx/sites-available/alloc
```

Edit file konfigurasi untuk menyesuaikan domain / IP VPS Anda:
```bash
sudo nano /etc/nginx/sites-available/alloc
```
*Ganti `example.com www.example.com` pada baris `server_name` dengan domain atau IP publik VPS Anda.*
*Pastikan path `root /var/www/alloc/public;` sesuai dengan lokasi project.*

Server 2: 114.122.70.65

Aktifkan konfigurasi dengan membuat symlink ke `sites-enabled`:
```bash
sudo ln -s /etc/nginx/sites-available/alloc /etc/nginx/sites-enabled/
```

Hapus konfigurasi default Nginx (opsional, jika tidak digunakan):
```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

Uji sintaks konfigurasi Nginx:
```bash
sudo nginx -t
```

Jika muncul `syntax is ok` dan `test is successful`, reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## 5. Konfigurasi Firewall (UFW)

Buka port SSH, HTTP, dan HTTPS pada firewall server:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 6. Setup SSL / HTTPS Gratis (Let's Encrypt Certbot)

Jika Anda sudah menghubungkan domain ke IP VPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot akan otomatis memodifikasi konfigurasi Nginx untuk mengaktifkan HTTPS dan redirect otomatis dari HTTP ke HTTPS.

---

## 7. Pembaruan / Update di Masa Depan

Setiap kali ada pembaruan kode:

```bash
cd /var/www/alloc
git pull origin main
npm install --omit=dev
pm2 reload alloc-app
```

---

## Perintah Maintenance Berguna

- Melihat log aplikasi Node.js: `pm2 logs alloc-app`
- Restart aplikasi: `pm2 restart alloc-app`
- Cek log error Nginx: `sudo tail -f /var/log/nginx/error.log`
- Cek log akses Nginx: `sudo tail -f /var/log/nginx/access.log`
