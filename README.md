# PaisaTrack 💰
> Track every rupee, without the friction.

A full-stack AI-powered personal expense tracker that lets you log expenses in natural language — type "zepto 320" or "onion 50" and AI automatically categorizes it for you.

🔗 **Live Demo:** https://paisatrack-trackeveryrupee.vercel.app  
📦 **GitHub:** https://github.com/Sakshi1127/paisatrack

---

## 🎯 Problem I Solved

By mid-month I had no idea where my money went — Zepto orders, auto rides, rent, random shopping. Every expense tracker I tried was too complex with too many forms and dropdowns. I wanted something that felt as easy as texting.

PaisaTrack solves this with one input box: type it like you'd say it, AI sorts the rest.

---

## ✨ Features

- **Natural Language Input** — Type "chole bhature 120" and AI parses item, amount and category automatically
- **Hinglish Support** — Handles mixed Hindi-English input naturally
- **Smart Categorization** — 8 default categories with AI confidence scoring
- **Color-coded Categories** — Custom color picker for each category
- **Collapsible Expense Groups** — Expenses grouped by date with expand/collapse
- **Inline Edit** — Click pencil icon to edit any expense directly
- **Monthly Analytics** — Donut chart breakdown, daily spending pattern, top 3 purchases
- **Month Comparison** — Compare spending across months with ↑↓ trend indicators
- **AI Summary** — Plain English insights about your spending patterns
- **Mobile Responsive** — Works on all screen sizes with bottom navigation on mobile

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework with type safety |
| Vite | Fast build tool and dev server |
| Tailwind CSS | Utility-first styling |
| Recharts | Charts and data visualization |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| PostgreSQL | Relational database |
| JWT | Stateless authentication |
| bcryptjs | Password hashing |
| Anthropic Claude API | AI expense categorization |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Railway | Backend + PostgreSQL hosting |

---

## 🏗 Project Structure

```
paisatrack/
├── client/                      # React frontend
│   └── src/
│       ├── pages/               # Home, ThisMonth, History, Login
│       │   ├── Home.tsx         # Expense input + recent activity + analytics
│       │   ├── ThisMonth.tsx    # Monthly breakdown + daily pattern + insights
│       │   ├── History.tsx      # Month navigator + comparison view
│       │   └── Login.tsx        # Auth — register and login
│       ├── components/          # Reusable UI components
│       │   ├── ExpenseInput.tsx # Natural language input field
│       │   ├── ConfirmCard.tsx  # AI parse result confirmation
│       │   ├── ColorPicker.tsx  # Category color selector
│       │   ├── EditExpenseRow.tsx # Inline expense editor
│       │   └── Sidebar.tsx      # Navigation sidebar
│       ├── api/                 # Axios API layer
│       │   ├── auth.ts          # Login, register + token interceptor
│       │   ├── expenses.ts      # Expense CRUD
│       │   ├── analytics.ts     # Summary, comparison, today total
│       │   └── categories.ts    # Category management
│       ├── context/
│       │   └── AuthContext.tsx  # Global auth state + JWT storage
│       └── types/
│           └── index.ts         # TypeScript interfaces
│
└── server/                      # Node.js backend
    └── src/
        ├── routes/              # API route definitions
        │   ├── auth.routes.js
        │   ├── expense.routes.js
        │   ├── category.routes.js
        │   └── analytics.routes.js
        ├── controllers/         # Request handlers
        │   ├── auth.controller.js
        │   ├── expense.controller.js
        │   ├── category.controller.js
        │   └── analytics.controller.js
        ├── services/
        │   └── ai.service.js    # Claude API + mock fallback
        ├── middleware/
        │   ├── auth.middleware.js   # JWT verification
        │   └── error.middleware.js  # Global error handler
        ├── config/
        │   └── db.js            # PostgreSQL connection pool
        └── db/
            ├── migrations.js    # Table creation scripts
            └── seed.js          # Default categories seed
```

---

## 🤖 AI Integration

Uses Anthropic Claude API (`claude-haiku`) for:

### 1. Expense Parsing
Converts raw natural language to structured JSON:

```
Input:  "zepto order 320"
Output: {
  "item": "Zepto order",
  "amount": 320,
  "category": "Grocery",
  "confidence": "high",
  "suggested_new_category": null
}
```

### 2. Monthly Summary
Generates plain English spending insights:
```
"Your biggest expense this month was Rent at ₹8,000, which accounts 
for 75% of your total spending. You logged expenses across 7 categories. 
Consider reviewing your discretionary spending on Entertainment."
```

### Graceful Fallback
Built-in mock parser handles cases when API is unavailable:
- Keyword-based categorization (zepto/blinkit → Grocery, uber/auto → Travel)
- Regex amount extraction
- Same response shape as real API — controllers never know the difference

---

## 📊 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(50) NOT NULL,
  color      VARCHAR(7) NOT NULL,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id            SERIAL PRIMARY KEY,
  raw_input     TEXT NOT NULL,
  item          VARCHAR(100) NOT NULL,
  amount        NUMERIC(10,2) NOT NULL,
  category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ai_confidence VARCHAR(10) DEFAULT 'high',
  date          DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

---

## 🔑 API Endpoints

### Auth
```
POST /api/auth/register   — Create account
POST /api/auth/login      — Login, returns JWT token
```

### Expenses
```
POST   /api/expenses/parse    — AI parse raw input
POST   /api/expenses          — Save confirmed expense
GET    /api/expenses?month=   — Fetch by month
PUT    /api/expenses/:id      — Edit expense
DELETE /api/expenses/:id      — Delete expense
```

### Categories
```
GET    /api/categories        — Fetch all categories
POST   /api/categories        — Create category
PUT    /api/categories/:id    — Update category
DELETE /api/categories/:id    — Delete category
```

### Analytics
```
GET /api/analytics/summary?month=   — Monthly total + category breakdown + AI summary
GET /api/analytics/compare?month=   — Current vs previous month comparison
GET /api/analytics/today            — Today's total
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+
- PostgreSQL 17

### 1. Clone the repo
```bash
git clone https://github.com/Sakshi1127/paisatrack.git
cd paisatrack
```

### 2. Backend setup
```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/paisatrack
JWT_SECRET=your_super_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your-key-here
NODE_ENV=development
```

Run database setup:
```bash
npm run migrate    # Creates tables
npm run seed       # Adds default categories
npm run dev        # Start server on port 5000
```

### 3. Frontend setup
```bash
cd client
npm install
npm run dev        # Start on port 5173
```

Open `http://localhost:5173` — register and start tracking!

---

## 🧠 Key Technical Decisions

### Why PostgreSQL over MongoDB?
Expense data is perfectly relational. SQL aggregations like `GROUP BY category, SUM(amount)` make analytics trivial. The monthly comparison feature requires window functions and `EXTRACT(MONTH FROM date)` — these are natural in SQL and painful in MongoDB aggregation pipelines.

### Why Service Layer pattern?
The AI service (`ai.service.js`) is completely isolated from controllers. Swap Claude for any other AI provider without touching a single controller. The mock fallback is built into the same service — controllers always call `parseExpense()` and get the same response shape regardless of source.

### Why JWT over sessions?
Stateless auth scales better and works perfectly for a React SPA consuming a REST API. No session storage needed on the server — every request is self-contained.

### Business logic in custom hooks
All data fetching and state management lives in hooks, not components. This decision was made with future React Native migration in mind — hooks are portable, JSX is not.

### Optimistic UI + refetch pattern
After saving an expense, we immediately call `fetchData()` to refetch all analytics. This keeps the dashboard always in sync without complex state management.

---

## 🐛 Interesting Bugs I Fixed

**1. PostgreSQL date timezone shift**
Dates stored as `2026-06-10` were returning as `2026-06-09T18:30:00.000Z` due to UTC conversion. Fixed by using `types.setTypeParser(1082, val => val)` to return dates as plain strings.

**2. Double response bug**
Express controllers were sending two responses because `res.json()` calls weren't wrapped in `return`. Fixed by adding `return` before every response.

**3. Category colors showing grey**
New categories created via AI suggestions were defaulting to `#868E96`. Fixed by passing the user-selected color from frontend and updating the category color on every expense save.

---

## 📈 What I Learned Building This

- Designing a full-stack app architecture from scratch — folder structure, separation of concerns, service layer pattern
- PostgreSQL analytics with `GROUP BY`, `EXTRACT`, `SUM`, `COALESCE` and `LEFT JOIN`
- JWT authentication end to end — hashing, signing, verifying, interceptors
- Integrating LLM APIs with structured output + graceful fallback design
- Debugging production issues (CORS, environment variables, Railway deployment)
- Monorepo deployment — frontend on Vercel, backend on Railway

---

## 🔮 Future Plans

- [ ] React Native mobile app (architecture already prepared — logic in hooks)
- [ ] Budget limits with overspending alerts
- [ ] UPI / bank statement CSV import
- [ ] Recurring expense tracking
- [ ] Spending streak and savings goals
- [ ] Multi-currency support

---

## 👩‍💻 Author

**Sakshi** — Full Stack Developer (3 years experience)  
React · Node.js · TypeScript · PostgreSQL

- 🔗 LinkedIn: [your-linkedin-url]
- 🐙 GitHub: [Sakshi1127](https://github.com/Sakshi1127)
- 📝 LinkedIn Series: Running a public Backend Engineering learning series

---

## 📄 License

MIT License — feel free to use this project as inspiration for your own expense tracker!