# 🚀 Quick Start Guide

**Get the app running in 2 minutes!**

---

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **GitHub Token** ([Get one here](https://github.com/settings/tokens))

---

## ⚡ Super Quick Start

### **Mac/Linux:**

```bash
# 1. Clone/navigate to project
cd AI_for_Bharat-Kiro-submission

# 2. Setup environment
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN

# 3. Run everything!
./start.sh
```

### **Windows:**

```cmd
# 1. Clone/navigate to project
cd AI_for_Bharat-Kiro-submission

# 2. Setup environment
copy .env.example .env
# Edit .env and add your GITHUB_TOKEN

# 3. Run everything!
start.bat
```

**That's it!** 🎉

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

---

## 🔧 Manual Setup (If scripts don't work)

### **Step 1: Environment Setup**

```bash
# Copy environment file
cp .env.example .env

# Edit .env and add:
GITHUB_TOKEN=ghp_your_token_here
```

**Get GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: **repo**
4. Copy token

### **Step 2: Install Dependencies**

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### **Step 3: Start Servers**

**Terminal 1 (Backend):**
```bash
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 🌐 Access the App

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

---

## 🧪 Run Tests

```bash
# Backend tests
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🐳 Docker (Alternative)

```bash
# Build and run with Docker
docker-compose up

# Access at http://localhost:3000
```

---

## 🚨 Troubleshooting

### **Port already in use:**

```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### **Module not found:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

cd frontend
rm -rf node_modules package-lock.json
npm install
```

### **GitHub Token not working:**

1. Check token is in `.env` file
2. Token should start with `ghp_`
3. Make sure you selected **repo** scope
4. Try generating a new token

---

## 📁 Project Structure

```
AI_for_Bharat-Kiro-submission/
├── start.sh              ← Mac/Linux startup
├── start.bat             ← Windows startup
├── .env                  ← Your config (create this!)
├── .env.example          ← Template
│
├── src/                  ← Backend code
│   ├── routes/           ← API endpoints
│   ├── services/         ← Business logic
│   └── __tests__/        ← Tests
│
├── frontend/             ← Frontend code
│   ├── src/app/          ← Pages
│   ├── src/components/   ← Components
│   └── src/lib/          ← Utilities
│
└── scripts/              ← Helper scripts
```

---

## 🎯 What to Do After Starting

1. **Register:** Go to http://localhost:3000/register
2. **Login:** Use your credentials
3. **Upload:** Upload a video/audio/text file
4. **Analyze:** See AI analysis results
5. **Generate:** Create content for multiple platforms
6. **Export:** Download as PDF/JSON/CSV

---

## 💡 Tips

- **First time?** Use the startup scripts (`start.sh` or `start.bat`)
- **Development?** Run backend and frontend in separate terminals
- **Testing?** Run `npm test` before committing
- **Deploying?** Check `DEPLOYMENT.md`

---

## 🆘 Need Help?

- **Documentation:** Check `docs/` folder
- **API Guide:** See `API_USAGE.md`
- **Features:** See `FEATURES.md`
- **Issues?** Check `TROUBLESHOOTING.md`

---

## ✅ Checklist

Before you start:
- [ ] Node.js 18+ installed
- [ ] GitHub token generated
- [ ] `.env` file created with token
- [ ] Dependencies installed
- [ ] Ports 3000 and 3001 available

---

**🚀 Ready to go! Run `./start.sh` (Mac) or `start.bat` (Windows)**
