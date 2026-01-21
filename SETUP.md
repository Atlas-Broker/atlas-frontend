# Atlas Setup Guide

Follow these steps in order to get your Atlas trading platform running.

## ✅ Pre-Flight Checklist

Before starting, make sure you have:
- [ ] Node.js 18+ installed
- [ ] A Clerk account (free tier is fine)
- [ ] A Supabase account (free tier is fine)
- [ ] Git installed

## 📋 Setup Steps

### Step 1: Install Dependencies (2 minutes)

```bash
cd atlas
npm install
```

**Expected output**: Should install ~387 packages with no errors.

---

### Step 2: Set Up Clerk (5 minutes)

1. Go to [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Click **"+ Create Application"**
3. Name it "Atlas" and click **Create Application**
4. **Enable Google OAuth**:
   - Click **User & Authentication** in sidebar
   - Click **Social Connections**
   - Toggle **Google** to ON
   - Follow Google setup wizard if needed
5. Go to **API Keys** in sidebar
6. Copy the keys (you'll need them in Step 4)

**✅ Checkpoint**: You should have publishable key and secret key ready to copy.

---

### Step 3: Set Up Supabase (5 minutes)

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: atlas-trading
   - **Database Password**: Save this somewhere secure!
   - **Region**: Choose closest to you
4. Click **Create New Project**
5. ⏳ Wait 2 minutes for provisioning
6. When ready, go to **Settings** (gear icon) > **API**
7. Copy these three values:
   - **Project URL**
   - **anon/public key** (from "Project API keys" section)
   - **service_role key** (click "Reveal" first - ⚠️ keep secret!)

**✅ Checkpoint**: You should have URL and two API keys ready.

---

### Step 4: Configure Environment Variables (3 minutes)

1. **Copy the template**:
   ```bash
   cp env.template .env.local
   ```

2. **Open `.env.local` in your editor**

3. **Fill in Clerk keys** (from Step 2):
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

4. **Fill in Supabase keys** (from Step 3):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   ```

5. **Leave Clerk webhook secret empty for now** (we'll do this in Step 6)

6. **Save the file**

**✅ Checkpoint**: Your `.env.local` has all keys except CLERK_WEBHOOK_SECRET.

---

### Step 5: Set Up Database (5 minutes)

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **"+ New Query"**
4. Open `supabase/migrations/001_initial_schema.sql` in your code editor
5. **Copy the ENTIRE file** (Cmd/Ctrl + A, then Cmd/Ctrl + C)
6. **Paste into the Supabase SQL editor**
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for "Success. No rows returned" message

**✅ Checkpoint**: You should see success message and no errors.

**Verify it worked**:
1. Click **Table Editor** in left sidebar
2. You should see tables: `profiles`, `orders`, `positions`, `watchlists`, etc.

---

### Step 6: Set Up Clerk Webhook (10 minutes)

**Why?** This syncs users from Clerk to your Supabase database automatically.

#### Option A: Local Development with ngrok (Recommended for testing)

1. **Install ngrok**:
   ```bash
   # Mac
   brew install ngrok
   
   # Windows
   choco install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your Next.js app**:
   ```bash
   npm run dev
   ```

3. **In a new terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (looks like `https://abc123.ngrok-free.app`)

5. **Set up webhook in Clerk**:
   - Go to Clerk Dashboard > **Webhooks**
   - Click **"+ Add Endpoint"**
   - **Endpoint URL**: `https://abc123.ngrok-free.app/api/webhooks/clerk`
   - **Subscribe to events**: Check these three:
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
   - Click **Create**
   - **Copy the Signing Secret** that appears

6. **Add to .env.local**:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

7. **Restart your Next.js app** (stop and run `npm run dev` again)

**✅ Checkpoint**: Webhook should show "Message delivered" when you test it.

#### Option B: Skip for Now (Test Later)

If you just want to get started quickly:
1. Leave `CLERK_WEBHOOK_SECRET` empty
2. After first sign-in, manually create your profile in Supabase (see Step 8)
3. Set up webhook later when deploying to production

---

### Step 7: Start the App (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see:
- Beautiful landing page with "Atlas" logo
- "Get Started" and "Sign In" buttons
- Gradient background

**✅ Checkpoint**: Landing page loads without errors.

---

### Step 8: First Sign-In and Testing (5 minutes)

1. **Click "Get Started"**
2. **Sign in with Google**
3. **After sign-in, you should see**:
   - Redirect to `/dashboard`
   - Welcome message with your name
   - Empty state messages (no watchlists, orders, positions yet)

4. **Verify your profile was created**:
   - Go to Supabase Dashboard
   - Click **Table Editor** > **profiles**
   - You should see your email and name
   - Role should be `trader`

**✅ Checkpoint**: You can sign in and see your dashboard!

---

### Step 9: Promote Yourself to Admin (2 minutes)

To access admin features:

1. **Get your Clerk ID**:
   - In Supabase, go to **Table Editor** > **profiles**
   - Find your row and copy the `clerk_id` (looks like `user_2a1b3c4d...`)

2. **Run SQL to promote yourself**:
   - Go to Supabase **SQL Editor**
   - Run this (replace with your actual clerk_id):
   ```sql
   UPDATE profiles 
   SET role = 'superadmin' 
   WHERE clerk_id = 'user_xxxxxxxxxxxxx';
   ```

3. **Refresh your browser**

4. **Test admin access**:
   - Visit [http://localhost:3000/admin](http://localhost:3000/admin)
   - Should see Admin Dashboard
   - Visit [http://localhost:3000/superadmin](http://localhost:3000/superadmin)
   - Should see SuperAdmin Dashboard with view toggle buttons

**✅ Checkpoint**: You can access all three views: Trader, Admin, SuperAdmin.

---

## 🎉 You're Done!

Your Atlas trading platform is now running! Here's what you can do:

### As a Trader:
- ✅ Create watchlists at `/dashboard/watchlist`
- ✅ View orders at `/dashboard/orders`
- ✅ Check positions at `/dashboard/positions`
- ✅ Adjust settings at `/dashboard/settings`

### As an Admin:
- ✅ View all users at `/admin/users`
- ✅ Monitor all orders at `/admin/orders`
- ✅ See analytics at `/admin/analytics`

### As a SuperAdmin:
- ✅ Toggle between all views at `/superadmin`
- ✅ Manage admin users
- ✅ Full system access

---

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Check all three Supabase keys in `.env.local`
- Verify project URL has no trailing slash
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### "Clerk redirects not working"
- Clear browser cookies
- Make sure all `NEXT_PUBLIC_CLERK_*` variables are set
- Sign out completely and try again

### "Profile not created after sign-in"
- Check webhook is set up correctly
- Look at Clerk Dashboard > Webhooks > your endpoint for errors
- Verify `CLERK_WEBHOOK_SECRET` is in `.env.local`
- Check terminal for any errors

### "Permission denied" when accessing data
- Make sure the database migration ran successfully
- Check that RLS policies are enabled
- Try signing out and back in

### Database migration fails
- Check for typos in the SQL
- Make sure you copied the ENTIRE file
- Try running it again (it should be idempotent)

---

## 📚 Next Steps

1. **Read the README.md** for full documentation
2. **Check supabase/README.md** for database details
3. **Explore the code structure** - it's well organized!
4. **Start building Phase 2 features**:
   - AI agent integration
   - Real market data
   - MooMoo broker connection

---

## 🆘 Still Stuck?

1. Check the main **README.md** file
2. Look at **supabase/README.md** for database help
3. Review error logs in:
   - Browser console (F12)
   - Terminal running `npm run dev`
   - Clerk Dashboard > Webhooks
   - Supabase Dashboard > Logs

---

**Good luck with your Phase 1 prototype! 🚀**

