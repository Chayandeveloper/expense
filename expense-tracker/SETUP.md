# 💰 ExpenseTrack — Full Stack Setup Guide

A full-stack expense tracker with **React** frontend, **Laravel** API backend, and **MySQL** database.

---

## 📁 Project Structure

```
expense-tracker/
├── backend/          ← Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── ExpenseController.php
│   │   │   └── CategoryController.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Expense.php
│   │       └── Category.php
│   ├── database/migrations/
│   ├── routes/api.php
│   ├── config/cors.php
│   └── .env.example
└── frontend/         ← React + Vite
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Expenses.jsx
    │   │   └── Categories.jsx
    │   ├── components/Layout.jsx
    │   ├── App.jsx
    │   └── index.css
    └── vite.config.js
```

---

## ✅ Prerequisites

Make sure you have the following installed:

| Tool       | Version   | Download |
|------------|-----------|----------|
| PHP        | >= 8.1    | https://www.php.net/downloads |
| Composer   | >= 2.x    | https://getcomposer.org |
| Node.js    | >= 18.x   | https://nodejs.org |
| MySQL      | >= 8.0    | https://dev.mysql.com/downloads |
| Git        | any       | https://git-scm.com |

---

## 🗄️ Step 1 — MySQL Database Setup

Open your MySQL client (CLI or MySQL Workbench) and run:

```sql
CREATE DATABASE expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'expense_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🐘 Step 2 — Laravel Backend Setup

### 2.1 Install Laravel (fresh project)

```bash
composer create-project laravel/laravel backend
cd backend
```

### 2.2 Install Laravel Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 2.3 Copy project files

Copy all files from the provided `backend/` folder into your Laravel project, **replacing** existing files where prompted:

- `app/Models/User.php`
- `app/Models/Expense.php`
- `app/Models/Category.php`
- `app/Http/Controllers/Api/AuthController.php`
- `app/Http/Controllers/Api/ExpenseController.php`
- `app/Http/Controllers/Api/CategoryController.php`
- `routes/api.php`
- `config/cors.php`
- `database/migrations/` (all 3 migration files)

### 2.4 Configure environment

```bash
cp .env.example .env
```

Edit `.env` and update these values:

```env
APP_NAME="Expense Tracker"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=expense_tracker
DB_USERNAME=expense_user
DB_PASSWORD=yourpassword

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 2.5 Generate app key

```bash
php artisan key:generate
```

### 2.6 Update bootstrap/app.php (Laravel 10+)

Make sure `api.php` routes are loaded. Open `bootstrap/app.php` and confirm or add:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

### 2.7 Configure Sanctum in bootstrap/app.php

Add Sanctum middleware for API:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(prepend: [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);
    // ...
})
```

### 2.8 Run migrations

```bash
php artisan migrate
```

### 2.9 Start Laravel server

```bash
php artisan serve
# Runs on http://localhost:8000
```

---

## ⚛️ Step 3 — React Frontend Setup

### 3.1 Navigate to frontend folder

```bash
cd ../frontend
```

### 3.2 Install dependencies

```bash
npm install
```

### 3.3 Start development server

```bash
npm run dev
# Runs on http://localhost:5173
```

The Vite dev server is pre-configured to proxy `/api/*` requests to `http://localhost:8000`.

---

## 🚀 Step 4 — Open the App

Visit: **http://localhost:5173**

1. Click **"Create one"** to register a new account
2. Default expense/income categories are automatically created on signup
3. Navigate to **Transactions** to add expenses and income
4. Visit **Dashboard** to see monthly charts and summaries
5. Manage **Categories** to customize your tracking

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | No | Register new user |
| POST | `/api/login` | No | Login, returns token |
| POST | `/api/logout` | Yes | Invalidate token |
| GET | `/api/me` | Yes | Current user info |
| GET | `/api/expenses` | Yes | List expenses (filterable by month/year/type) |
| POST | `/api/expenses` | Yes | Create expense |
| PUT | `/api/expenses/{id}` | Yes | Update expense |
| DELETE | `/api/expenses/{id}` | Yes | Delete expense |
| GET | `/api/summary` | Yes | Monthly chart + category breakdown |
| GET | `/api/categories` | Yes | List categories |
| POST | `/api/categories` | Yes | Create category |
| PUT | `/api/categories/{id}` | Yes | Update category |
| DELETE | `/api/categories/{id}` | Yes | Delete category |

### Query Parameters for `/api/expenses`
- `month` — filter by month (1–12)
- `year` — filter by year (e.g. 2025)
- `type` — `income` or `expense`
- `category_id` — filter by category

### Query Parameters for `/api/summary`
- `month` — month for category breakdown
- `year` — year for full 12-month bar chart

---

## 🏗️ Production Deployment

### Backend (Laravel)
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`.

### Frontend (React)
```bash
npm run build
# Output goes to dist/ — deploy to any static host or serve via Nginx
```

---

## 🛠️ Common Issues

### CORS errors
Ensure `CORS_ALLOWED_ORIGINS=http://localhost:5173` is set in `.env` and you've run `php artisan config:cache`.

### 401 Unauthorized
Check that the `Authorization: Bearer <token>` header is being sent. The Axios instance in `src/api/axios.js` handles this automatically using `localStorage`.

### Migration errors
If you get duplicate migration errors, run `php artisan migrate:fresh` (⚠️ drops all tables).

### Sanctum not working
Make sure `EnsureFrontendRequestsAreStateful` middleware is added to the `api` middleware group in `bootstrap/app.php`.

---

## 🎨 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, Axios, Vite |
| Backend | Laravel 10, Laravel Sanctum (API tokens) |
| Database | MySQL 8 |
| Styling | Custom CSS design system (no UI framework) |
| Auth | Token-based (Sanctum Personal Access Tokens) |

---

Built with ❤️ — ExpenseTrack
