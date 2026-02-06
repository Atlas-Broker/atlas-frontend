# 📚 Atlas Frontend - Documentation Index

**Next.js 14+ React Frontend with Competition Landing Page**

---

## 📖 Documentation Structure

### **01. [INDEX.md](./01_INDEX.md)** 📍
Navigation hub for all frontend documentation.

### **02. [SETUP.md](./02_SETUP.md)** ⚙️
Complete setup instructions:
- Node.js and npm installation
- Environment configuration
- Running dev server
- Building for production

### **03. [DESIGN_SYSTEM.md](./03_DESIGN_SYSTEM.md)** 🎨
UI/UX design system:
- Color palette and theming
- Component library (shadcn/ui)
- Typography and spacing
- Dark mode support

### **04. [AGENT_COMPETITION.md](./04_AGENT_COMPETITION.md)** 🏆
AI Agent Competition landing page:
- Performance chart component
- Leaderboard component
- Agent cards with portfolio
- Explainable AI reasoning panel
- Mock data for development

---

## 🎯 Quick Navigation

| I want to... | Document |
|--------------|----------|
| **Set up from scratch** | [02_SETUP.md](./02_SETUP.md) |
| **Understand UI design** | [03_DESIGN_SYSTEM.md](./03_DESIGN_SYSTEM.md) |
| **Competition components** | [04_AGENT_COMPETITION.md](./04_AGENT_COMPETITION.md) |

---

## 📁 Project Structure

```
atlas-frontend/
├── doc/                              # Documentation (you are here)
│   ├── 01_INDEX.md                  # This file
│   ├── 02_SETUP.md                  # Setup guide
│   ├── 03_DESIGN_SYSTEM.md          # Design system
│   └── 04_AGENT_COMPETITION.md      # Competition page
├── app/
│   ├── page.tsx                      # Homepage (Competition!)
│   ├── about/page.tsx                # About platform
│   ├── dashboard/                    # User dashboard
│   ├── admin/                        # Admin panels
│   ├── api/                          # API routes
│   └── globals.css
├── src/
│   ├── components/
│   │   ├── competition/              # Competition components
│   │   │   ├── PerformanceChart.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── AgentCard.tsx
│   │   │   └── ReasoningPanel.tsx
│   │   └── ui/                       # shadcn/ui components
│   └── lib/
│       ├── api/
│       │   └── competition.ts        # Competition API client
│       ├── supabase/
│       └── gemini/
├── env.template
└── package.json
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp env.template .env.local
# Edit .env.local with your credentials

# 3. Enable mock data (optional, if backend not running)
# In .env.local:
NEXT_PUBLIC_USE_MOCK_DATA=true

# 4. Start dev server
npm run dev

# 5. Visit
http://localhost:3000  # Competition homepage!
```

**Full guide:** [02_SETUP.md](./02_SETUP.md)

---

## 🏆 Homepage: AI Competition

**The competition page IS the homepage!**

Visitors immediately see:
- 📈 Live performance charts (log scale)
- 🏆 Real-time leaderboard with rankings
- 🤖 Agent cards with expandable portfolios
- 🧠 Explainable AI reasoning panel

**No sign-up required** - Full public access for maximum WOW factor!

**Technical details:** [04_AGENT_COMPETITION.md](./04_AGENT_COMPETITION.md)

---

## 🎨 Key Features

✅ **Competition Homepage** - Public landing page with charts  
✅ **Mock Data Support** - Works without backend  
✅ **User Dashboard** - Authenticated user area  
✅ **Admin Panels** - User management, analytics  
✅ **Dark Mode** - Full theme support  
✅ **Responsive Design** - Mobile & desktop optimized  

---

## 📚 Related Documentation

- **Organization Docs:** [.github/doc/](../../.github/doc/) - System architecture
- **Database Docs:** [atlas-database/doc/](../../atlas-database/doc/) - Schema reference
- **Backend Docs:** [atlas-backend/doc/](../../atlas-backend/doc/) - API documentation

---

## 🔧 Development Tips

### Mock Data Mode
Set `NEXT_PUBLIC_USE_MOCK_DATA=true` to develop frontend without backend running.

### Build Validation
Always run `npm run build` before committing to ensure production readiness.

### Hot Reload
Dev server (`npm run dev`) auto-reloads on file changes.

---

**Ready to build beautiful UIs? Let's go! 🎨**
