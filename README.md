<h1 align="center">🛒 POS System</h1>

<p align="center">
  A full-featured, open-source Point of Sale & Retail ERP system built for small to mid-sized stores.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## ✨ Overview

**POS System** is a modern, monorepo-based retail management platform that combines a fast Vue 3 single-page frontend with a robust Node.js/Express REST API. It covers the entire retail lifecycle — from purchasing stock from suppliers, managing inventory, processing in-store sales at the point of sale, tracking customers & loyalty, recording expenses, and generating insightful business reports.

It ships with role-based access control, a seeded demo dataset, and is ready to deploy to Vercel with a single config.

---

## 🚀 Features

### 💼 Sales & Point of Sale
- Intuitive **POS interface** for quick checkout with barcode/SKU lookup
- Multiple payment methods, discounts, and tax handling
- Sale history, detailed receipts, and **returns / refunds**
- Customer linkage and loyalty points accrual

### 📦 Inventory Management
- Real-time stock levels per product with min/max thresholds
- Automatic **stock movement tracking** (sales, purchases, adjustments)
- Manual stock adjustments with reasons and audit trail
- Low-stock awareness and movement history logs

### 🏭 Purchasing
- Create purchase orders from suppliers
- Track invoice numbers, payment status, and partial payments
- Items automatically update inventory on receipt

### 👥 People
- **Customers** with contact info, loyalty points, and lifetime spend
- **Suppliers** with tax numbers and contact details
- **Users & Roles** — Admin, Manager, Cashier, Inventory Staff

### 💰 Finance
- **Expenses** categorized (rent, salaries, utilities, etc.)
- Profit & loss visibility through reports

### 📊 Reporting & Dashboard
- Interactive **dashboard** with key metrics (Chart.js)
- Sales reports, profit reports, and inventory reports
- Configurable store settings (currency, tax rate, low-stock threshold, loyalty)

### 🔐 Security & Administration
- JWT authentication with hashed passwords (bcrypt)
- Role-based route & API authorization
- Rate limiting, Helmet security headers, CORS, request validation
- **Audit logs** and user **notifications**

---

## 🧱 Tech Stack

| Layer        | Technology                                                                |
|--------------|---------------------------------------------------------------------------|
| **Frontend** | Vue 3, Vite, Pinia, Vue Router 4, Bootstrap 5, Bootstrap Icons, Chart.js |
| **Backend**  | Node.js, Express 5, JWT, bcryptjs, Helmet, express-rate-limit, Multer     |
| **Database** | PostgreSQL via Prisma ORM 7 (hosted on Supabase)                          |
| **Deploy**   | Vercel (monorepo services + rewrites)                                     |

---

## 📁 Project Structure

```text
POS SYSTEM/
├── backend/                 # Express REST API
│   ├── prisma/
│   │   ├── schema.prisma    # Database models
│   │   └── seed.js          # Demo data seeder
│   ├── src/
│   │   ├── config/          # App configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, errors, RBAC
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── validators/      # Input validation
│   │   ├── utils/           # Helpers
│   │   ├── app.js           # Express app
│   │   └── server.js        # Entry point
│   └── .env.example
├── frontend/                # Vue 3 SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── composables/     # Vue composables
│   │   ├── layouts/         # App layouts
│   │   ├── router/          # Vue Router + guards
│   │   ├── services/        # API client (axios)
│   │   ├── stores/          # Pinia stores
│   │   ├── views/           # Page views
│   │   └── utils/
│   └── .env / .env.production
├── package.json             # Root scripts
└── vercel.json              # Vercel monorepo deployment config
```

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
- **Node.js** `24.x`
- A **PostgreSQL** database (a free [Supabase](https://supabase.com) project works great)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd "POS SYSTEM"
```

### 2. Install dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

**Backend** — create `backend/.env` from the example:
```bash
cp backend/.env.example backend/.env
```
Then fill in your Supabase/Postgres credentials:
```env
# Pooled connection (port 6543) — for app queries
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
# Direct connection (port 5432) — for migrations
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

PORT=3000
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

**Frontend** — `frontend/.env` already defaults to the local API:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Set up the database
```bash
npm run db:push     # Push Prisma schema to the database
npm run db:seed     # Seed demo data (roles, users, products, etc.)
```

### 5. Run the dev servers
In two terminals (or use the root scripts):
```bash
npm run dev:backend    # API on http://localhost:3000
npm run dev:frontend   # App on http://localhost:5173
```

Open **http://localhost:5173** and log in with a demo account.

---

## 👤 Demo Accounts

The seed script creates four roles with ready-to-use credentials:

| Role               | Email                     | Password       |
|--------------------|---------------------------|----------------|
| Admin              | `admin@example.com`       | `admin123`     |
| Manager            | `manager@example.com`     | `manager123`   |
| Cashier            | `cashier@example.com`     | `cashier123`   |
| Inventory Staff    | `inventory@example.com`   | `inventory123` |

> ⚠️ Change these passwords and the `JWT_SECRET` before deploying to production.

---

## 📜 Available Scripts

| Script                  | Description                                          |
|-------------------------|------------------------------------------------------|
| `npm run dev:backend`   | Start the API with nodemon (hot reload)              |
| `npm run dev:frontend`  | Start the Vite dev server                            |
| `npm run build`         | Build the frontend for production                    |
| `npm run db:push`       | Push the Prisma schema to the database               |
| `npm run db:seed`       | Seed the database with demo data                     |
| `npm run db:migrate`    | Run Prisma migrations                                |
| `npm run db:studio`     | Open Prisma Studio to inspect the database           |

---

## ☁️ Deployment (Vercel)

This repo is configured as a Vercel monorepo via `vercel.json`:

- **`frontend`** → deployed as a Vite static SPA
- **`backend`** → deployed as a serverless Node.js API (entry `api/index.js`)
- Requests to `/api/*` are rewritten to the backend service

### Steps
1. Import the repository into Vercel.
2. Set the backend environment variables (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, etc.) in the Vercel project settings.
3. Set `VITE_API_URL=/api` for the frontend production build (already in `frontend/.env.production`).
4. Deploy — Vercel will run `vercel-build` automatically.

---

## 🔌 API Reference

The REST API is mounted under `/api`. Main resource groups:

`/auth` · `/products` · `/categories` · `/brands` · `/units` · `/suppliers` ·
`/customers` · `/inventory` · `/purchases` · `/sales` · `/expenses` ·
`/expense-categories` · `/reports` · `/dashboard` · `/settings` ·
`/notifications` · `/users`

A health check is available at `GET /api/health`.

All protected routes require a Bearer JWT token and enforce role-based authorization on the server.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or pull requests to improve the system.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push to the branch and open a Pull Request

---

## 📄 License

This project is licensed under the **ISC** License.

---

<p align="center">Made with ☕ and Vue + Express</p>
