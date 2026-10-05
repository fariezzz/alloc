# Dokumentasi Deployment Project Alloc

Dokumentasi ini mencatat secara lengkap arsitektur dan langkah-langkah deployment project **Alloc** ke server hingga aktif di domain publik (**https://kiraya.my.id**).

---

## 1. Arsitektur Sistem

Karena server berada di jaringan lokal (LXC Proxmox dengan koneksi ISP rumahan / CGNAT) yang tidak memiliki IP publik statis dan memblokir port masuk (*inbound port* 80 & 443), arsitektur deployment menggunakan kombinasi **PM2 + Nginx + Cloudflare Tunnel**:

```
Browser Pengunjung (HTTPS)
       │
       ▼
Cloudflare Edge Network (Menangani SSL/HTTPS, Caching, & DDoS Guard)
       │
       ▼ (Terkoneksi via Cloudflare Tunnel terenkripsi / Outbound)
Server LXC Proxmox (Layanan background: cloudflared.service)
       │
       ▼ (Port 80)
Nginx Web Server (Reverse Proxy, Kompresi Gzip, Static Asset Cache)
       │
       ▼ (Port 3000)
Node.js Express (PM2 Process Manager: alloc-app)
```

---

## 2. Persiapan File Project (Sisi Aplikasi)

### A. Dinamisasi Port (`server.js`)
Pastikan port membaca nilai environment variable agar fleksibel:
```javascript
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Running at http://localhost:${PORT}`);
  });
}
```

### B. Konfigurasi PM2 (`ecosystem.config.js`)
File konfigurasi process manager untuk Node.js agar berjalan di background dan otomatis restart jika crash:
```javascript
module.exports = {
  apps: [
    {
      name: 'alloc-app',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

### C. Konfigurasi Nginx (`nginx/alloc.conf`)
Menangani routing, security header, dan caching aset statis:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name kiraya.my.id www.kiraya.my.id;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # Proxy ke Node.js Express (PM2 port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static Assets Caching
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/alloc/public;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri @proxy;
    }

    location @proxy {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

---

## 3. Langkah Setup di Server (LXC / Linux) dari Nol

### Langkah 1: Instalasi Paket Dasar
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 secara global
sudo npm install -g pm2
```

### Langkah 2: Setup Direktori dan Install Dependency Project
```bash
sudo mkdir -p /var/www/alloc
sudo chown -R $USER:$USER /var/www/alloc
cd /var/www/alloc

# Clone repository
git clone <URL_REPOSITORY> .

# Install dependency production
npm install --omit=dev
cp .env.example .env
```

### Langkah 3: Menjalankan Aplikasi via PM2
```bash
# Jalankan aplikasi
pm2 start ecosystem.config.js --env production

# Simpan proses agar otomatis aktif setelah server reboot
pm2 save
pm2 startup
```

### Langkah 4: Mengaktifkan Konfigurasi Nginx
```bash
sudo cp nginx/alloc.conf /etc/nginx/sites-available/alloc
sudo ln -s /etc/nginx/sites-available/alloc /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Uji dan reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Setup Cloudflare Tunnel (Mengatasi CGNAT & Menyediakan SSL)

### Langkah 1: Install `cloudflared` CLI
```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

### Langkah 2: Login dan Autentikasi Domain
```bash
cloudflared tunnel login
```
- Buka tautan otorisasi yang muncul di terminal pada browser.
- Pilih domain `kiraya.my.id` lalu klik **Authorize**.
- Sertifikat login otomatis tersimpan di `/root/.cloudflared/cert.pem`.

### Langkah 3: Membuat Tunnel
```bash
cloudflared tunnel create alloc-tunnel
```
Perintah ini menghasilkan Tunnel ID unik (UUID) dan file kredensial JSON di `/root/.cloudflared/<TUNNEL_ID>.json`.

### Langkah 4: Routing DNS Domain ke Tunnel
```bash
cloudflared tunnel route dns --overwrite-dns alloc-tunnel kiraya.my.id
cloudflared tunnel route dns --overwrite-dns alloc-tunnel www.kiraya.my.id
```

### Langkah 5: Membuat File Konfigurasi Tunnel (`/etc/cloudflared/config.yml`)
```yaml
tunnel: <TUNNEL_ID_ANDA>
credentials-file: /root/.cloudflared/<TUNNEL_ID_ANDA>.json

ingress:
  - hostname: kiraya.my.id
    service: http://localhost:80
  - hostname: www.kiraya.my.id
    service: http://localhost:80
  - service: http_status:404
```

### Langkah 6: Mengaktifkan Tunnel sebagai Layanan Background (Systemd)
```bash
cloudflared service install
systemctl enable --now cloudflared
systemctl status cloudflared
```
*Layanan `cloudflared` sekarang berjalan otomatis 24/7 dan hidup otomatis setiap kali server reboot.*

---

## 5. Konfigurasi Nameserver di Registrar Domain (IDWebHost)

Agar seluruh traffic internet diarahkan ke Cloudflare:
1. Login ke panel **IDWebHost** -> buka menu kelola domain **`kiraya.my.id`**.
2. Masuk ke menu **Name Servers** -> pilih **Gunakan nameserver lain (Custom)**.
3. Masukkan 2 Nameserver resmi Cloudflare akun Anda:
   - **Nameserver 1:** `porter.ns.cloudflare.com`
   - **Nameserver 2:** `rose.ns.cloudflare.com`
   *(Kosongkan Nameserver 3, 4, 5)*.
4. Klik **Ganti Name Server**.
5. Tunggu proses propagasi DNS (5–30 menit).

---

## 6. Prosedur Update Kode di Masa Depan

Setiap kali Anda memperbarui kode di repository Git:

```bash
cd /var/www/alloc
git pull origin main
npm install --omit=dev
pm2 reload alloc-app
```
*Nginx dan Cloudflare Tunnel tidak perlu di-restart saat ada update file web/JS.*

---

## 7. Perintah Maintenance & Troubleshooting

- **Cek Status Node.js App:** `pm2 status`
- **Cek Log Realtime Node.js:** `pm2 logs alloc-app`
- **Restart Aplikasi Node.js:** `pm2 restart alloc-app`
- **Cek Status Tunnel:** `systemctl status cloudflared`
- **Cek Log Tunnel:** `journalctl -u cloudflared -f`
- **Cek Status Nginx:** `systemctl status nginx`
- **Cek Error Log Nginx:** `sudo tail -f /var/log/nginx/error.log`
