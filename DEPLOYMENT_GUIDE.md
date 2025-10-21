# 🚀 DEPLOYMENT GUIDE

## **PRODUCTION DEPLOYMENT**

### **Prerequisites**
- Node.js 18+ installed
- PostgreSQL database (for production)
- SSL certificate
- Domain name
- Server with 2GB+ RAM

---

## **STEP 1: PREPARE ENVIRONMENT**

### **Backend Configuration**

Create `backend/.env.production`:
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/invoice_db
JWT_SECRET=your-super-secret-key-here
CORS_ORIGIN=https://yourdomain.com
PORT=5000
LOG_LEVEL=info
```

### **Frontend Configuration**

Create `frontend/.env.production`:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## **STEP 2: DATABASE SETUP**

### **PostgreSQL Setup**

```bash
# Create database
createdb invoice_db

# Create user
createuser invoice_user

# Set password
psql -c "ALTER USER invoice_user WITH PASSWORD 'secure_password';"

# Grant privileges
psql -c "GRANT ALL PRIVILEGES ON DATABASE invoice_db TO invoice_user;"
```

### **Run Migrations**

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

---

## **STEP 3: BUILD APPLICATION**

### **Backend Build**

```bash
cd backend
npm install --production
npm run build
```

### **Frontend Build**

```bash
cd frontend
npm install --production
npm run build
```

---

## **STEP 4: DEPLOY TO SERVER**

### **Option A: Using PM2**

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name "invoice-backend"

# Start frontend
cd frontend
pm2 start npm --name "invoice-frontend" -- start

# Save PM2 config
pm2 save

# Enable startup on reboot
pm2 startup
```

### **Option B: Using Docker**

Create `Dockerfile` for backend:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
```

Create `Dockerfile` for frontend:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t invoice-backend ./backend
docker build -t invoice-frontend ./frontend

docker run -d -p 5000:5000 --env-file backend/.env.production invoice-backend
docker run -d -p 3000:3000 --env-file frontend/.env.production invoice-frontend
```

---

## **STEP 5: NGINX CONFIGURATION**

Create `/etc/nginx/sites-available/invoice`:

```nginx
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    gzip_min_length 1000;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/invoice /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## **STEP 6: SSL CERTIFICATE**

### **Using Let's Encrypt**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## **STEP 7: MONITORING & LOGGING**

### **Setup Logging**

```bash
# Create log directory
mkdir -p /var/log/invoice

# Setup log rotation
sudo tee /etc/logrotate.d/invoice > /dev/null <<EOF
/var/log/invoice/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
EOF
```

### **Monitor with PM2**

```bash
# Install PM2 monitoring
pm2 install pm2-auto-pull

# View logs
pm2 logs

# Monitor
pm2 monit
```

---

## **STEP 8: BACKUP STRATEGY**

### **Automated Database Backups**

Create `backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/backups/invoice"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="invoice_db"
DB_USER="invoice_user"

mkdir -p $BACKUP_DIR

pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

Schedule with cron:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## **STEP 9: PERFORMANCE OPTIMIZATION**

### **Frontend Optimization**
- Enable gzip compression
- Minify CSS/JS
- Optimize images
- Use CDN for static assets

### **Backend Optimization**
- Enable database connection pooling
- Implement caching (Redis)
- Use database indexes
- Monitor query performance

---

## **STEP 10: SECURITY HARDENING**

### **Firewall Configuration**

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### **Security Headers**

Already configured in Nginx above.

### **Database Security**

```bash
# Create read-only user for backups
createuser backup_user;
GRANT CONNECT ON DATABASE invoice_db TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
```

---

## **VERIFICATION CHECKLIST**

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Nginx configured and running
- [ ] Backend API responding
- [ ] Frontend loading
- [ ] Logging working
- [ ] Backups scheduled
- [ ] Monitoring active
- [ ] Security headers present

---

## **TROUBLESHOOTING**

### **Backend not responding**
```bash
pm2 logs invoice-backend
```

### **Database connection error**
```bash
psql -U invoice_user -d invoice_db -c "SELECT 1;"
```

### **SSL certificate issues**
```bash
sudo certbot renew --dry-run
```

### **Nginx errors**
```bash
sudo nginx -t
sudo systemctl status nginx
```

---

## **ROLLBACK PROCEDURE**

```bash
# Stop services
pm2 stop all

# Restore database
psql -U invoice_user -d invoice_db < backup_YYYYMMDD_HHMMSS.sql

# Restore code
git checkout previous-tag

# Restart services
pm2 start all
```

---

**Deployment Complete! 🎉**

