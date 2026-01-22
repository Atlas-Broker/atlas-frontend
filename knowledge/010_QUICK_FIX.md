# 🚨 Quick Fix: "Unexpected token '<'" Error

## What's Happening

You're seeing this error because **MongoDB is not configured yet**. The agent needs MongoDB to store its "thoughts" (execution traces).

## ⚡ 5-Minute Fix

### Step 1: Get MongoDB URI (2 minutes)

1. Go to: **https://cloud.mongodb.com**
2. Sign in (or create free account)
3. Click **"Create"** → **"Shared"** (Free M0 cluster)
4. Choose **AWS** and any region
5. Click **"Create Cluster"** (wait 1-3 minutes)
6. Click **"Connect"** → **"Drivers"**
7. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Replace `<password>` with your actual database password

### Step 2: Get Google AI API Key (1 minute)

1. Go to: **https://aistudio.google.com/app/apikey**
2. Click **"Create API Key"**
3. Copy the key (starts with `AIzaSy...`)

### Step 3: Add to `.env.local` (1 minute)

Open your `.env.local` file and add these 3 lines at the bottom:

```bash
# MongoDB (for agent traces)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=atlas_production

# Google AI (for agent reasoning)
GOOGLE_AI_API_KEY=AIzaSy...
```

### Step 4: Initialize MongoDB (1 minute)

```bash
npm run setup:mongo
```

### Step 5: Run Migration (30 seconds)

```bash
cd supabase
npx supabase db push
cd ..
```

### Step 6: Restart Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## ✅ Test It

1. Go to: **http://localhost:3000/dashboard**
2. Type: **"Should I buy NVDA?"**
3. Press **Enter**
4. Watch the magic happen! ✨

---

## 🎯 What You'll See

- **Agent Status**: Changes to "ANALYZING" (blue, pulsing)
- **Real Data**: Fetches from Yahoo Finance
- **Proposal Card**: Shows BUY/SELL recommendation with:
  - Confidence score (e.g., 75%)
  - Technical signals (RSI, MACD, MAs)
  - Risk factors
  - Evidence links
- **Approve Button**: Large, orange, glowing button
- **Recent Decisions**: Timeline of past proposals

---

## 🐛 Still Getting Errors?

### "Invalid MongoDB URI"
- Make sure URI starts with `mongodb+srv://`
- Check you replaced `<password>` with actual password
- No spaces in the URI

### "Google AI API Error"
- Make sure key starts with `AIzaSy`
- Check for typos
- Verify key is active in Google AI Studio

### "Module not found"
- Restart dev server: `Ctrl+C` then `npm run dev`
- Clear cache: `rm -rf .next` then `npm run dev`

---

## 📚 Need More Help?

See full documentation:
- **`SETUP_NEXT_STEPS.md`** - Detailed setup guide
- **`Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md`** - Complete implementation guide

---

**You're literally 3 environment variables away from seeing the agent work!** 🚀

The error you're seeing is **expected** - it's just telling you to configure MongoDB. Once you add those 3 lines to `.env.local`, everything will work perfectly!

