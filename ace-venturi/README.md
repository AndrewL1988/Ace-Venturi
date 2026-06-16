# 🕵️ Ace Venturi: Controls Detective

A complete Phoenix Controls HVAC field toolkit — AI chat, valve sizer, FV calculator, wiring guide generator, commissioning checklists, alarm log, BACnet network calculator, model decoder, and equipment registry.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ — https://nodejs.org
- An Anthropic API key — https://console.anthropic.com

### 2. Install dependencies

```bash
# Install React frontend dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### 3. Configure your API key

```bash
cp .env.example .env
```

Open `.env` and replace `sk-ant-your-key-here` with your actual Anthropic API key.

### 4. Run locally

```bash
# Run both the React app AND the proxy server together
npm run dev
```

- React app → http://localhost:3000
- Proxy server → http://localhost:3001

---

## Deploying to the Web

### Option A — Railway (Easiest, ~2 minutes)

1. Push this folder to a GitHub repo
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select your repo
4. Add environment variable: `ANTHROPIC_API_KEY` = your key
5. Add `NODE_ENV=production` and `PORT=3001`
6. Railway auto-detects and deploys. Done.

### Option B — Render (Free tier available)

1. Push to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo
4. Set:
   - Build Command: `npm install && cd server && npm install && cd .. && npm run build`
   - Start Command: `NODE_ENV=production node server/index.js`
5. Add environment variables: `ANTHROPIC_API_KEY`, `NODE_ENV=production`, `ALLOWED_ORIGIN=https://your-render-url.onrender.com`
6. Deploy

### Option C — Vercel (Frontend) + Railway (Backend)

**Backend on Railway:**
1. Deploy just the `/server` folder to Railway
2. Set `ANTHROPIC_API_KEY`, `NODE_ENV=production`, `ALLOWED_ORIGIN=https://your-vercel-app.vercel.app`
3. Note your Railway URL (e.g. `https://ace-venturi.up.railway.app`)

**Frontend on Vercel:**
1. In `src/App.js`, change the fetch URL from `/api/chat` to your Railway URL + `/api/chat`
2. Deploy the root folder to Vercel
3. Done — unlimited scaling

### Option D — VPS / Your Own Server (Ubuntu/Debian)

```bash
# On your server:
git clone your-repo
cd ace-venturi
npm install
cd server && npm install && cd ..
npm run build

# Copy .env.example to .env and add your API key
cp .env.example .env
nano .env

# Run with PM2 (keeps it alive after logout)
npm install -g pm2
NODE_ENV=production pm2 start server/index.js --name ace-venturi
pm2 save
pm2 startup

# Set up Nginx reverse proxy (optional, for custom domain + SSL)
# Point your domain to the server IP, then:
sudo apt install nginx certbot python3-certbot-nginx
# Configure Nginx to proxy port 3001
```

**Nginx config example** (`/etc/nginx/sites-available/ace-venturi`):
```nginx
server {
    server_name ace-venturi.yourcompany.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then run: `sudo certbot --nginx -d ace-venturi.yourcompany.com`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | **Yes** | Your Anthropic API key from console.anthropic.com |
| `PORT` | No | Server port (default: 3001) |
| `ALLOWED_ORIGIN` | No | Your frontend URL for CORS (default: localhost:3000) |
| `NODE_ENV` | No | Set to `production` when deploying |

---

## Security Notes

- **Never commit `.env`** — it's in `.gitignore` for this reason
- The API key lives only on the server — users never see it
- Rate limiting is enabled: 30 requests/minute per IP
- CORS is restricted to `ALLOWED_ORIGIN` in production

---

## Project Structure

```
ace-venturi/
├── public/
│   └── index.html          # React HTML shell
├── src/
│   ├── index.js            # React entry point
│   └── App.js              # Full Ace Venturi application
├── server/
│   ├── index.js            # Express proxy server
│   └── package.json        # Server dependencies
├── .env.example            # Environment variable template
├── .env                    # Your actual config (DO NOT COMMIT)
├── .gitignore
├── package.json
└── README.md
```

---

## Support

Phoenix Controls: (800) 340-0007 | www.phoenixcontrols.com
