# 🤖 FREE BOT BASE — WhatsApp Multi-Session Bot

> Powered by Baileys | Free Hosting Ready | Plugin System

---

## 🚀 Free Deploy (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## 📋 Deploy Steps

### 1. GitHub Repo
```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. MongoDB Atlas (Free)
- Go to [cloud.mongodb.com](https://cloud.mongodb.com)
- Create free M0 cluster
- Create database user
- Get connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/botdb
```

### 3. Deploy on Render
1. Go to [render.com](https://render.com) → Sign up
2. New → Web Service
3. Connect your GitHub repo
4. Set these:
   - **Build Command:** `npm install`
   - **Start Command:** `node pair.js`
   - **Plan:** Free

### 4. Environment Variables (Render Dashboard → Environment)
| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `NODE_ENV` | `production` |

### 5. Pair Your WhatsApp
1. Visit your Render URL: `https://your-app.onrender.com`
2. Enter your phone number
3. Get pairing code
4. WhatsApp → Settings → Linked Devices → Link with Phone Number

---

## 📁 File Structure
```
├── pair.js          # Main server file
├── config.js        # Bot configuration
├── command.js       # Command handler
├── render.yaml      # Render deployment config
├── lib/
│   ├── functions.js
│   └── msg.js
├── plugins/         # Add your plugins here
│   ├── ACD_GROUP.js
│   └── ACD_MAIN.js
└── public/
    └── index.html   # Pairing web UI
```

---

## ⚙ Config (config.js)
```js
PREFIX: "/"          // Bot command prefix
AUTO_READ_STATUS: true
AUTO_REACT: false
AUTO_TYPING: false
```

---

## 🔌 Adding Plugins
Place `.js` files in `/plugins/` folder — auto-loaded on startup.

---

## 💡 Other Free Hosting Options
- [Railway](https://railway.app) — $5/month free credit
- [Koyeb](https://koyeb.com) — 1 free instance
- [Cyclic](https://cyclic.sh) — Free Node.js hosting

---

*Powered by DINA 🤍*
