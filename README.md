
# 🌐 TinyLink — URL Shortener (Next.js + Prisma + Neon)

TinyLink is a lightweight, fast, and clean URL shortener built using **Next.js App Router**, **Prisma ORM**, and **Neon PostgreSQL**.  
This project was built as part of a **take-home assignment**, following all required backend + frontend specifications.

---

## 🚀 Features

### ✅ Core Requirements
- Create short URLs (auto-generated or custom codes)
- Reject duplicate custom codes (409 Conflict)
- Idempotent link creation (same URL → return same record)
- Redirect via `/[code]` with click tracking
- Delete links (removes redirect)
- Health check endpoint `/api/healthz`

### 📊 Dashboard
- List all links
- Search / filter links
- Copy short link button
- Click count tracking
- Created & last clicked timestamps

### 🖥️ UI/UX Requirements
- Clean layout using TailwindCSS
- Loading, empty, success & error states  
- Form validation + friendly messages  
- Buttons, table, spacing, responsive layout  
- Truncated long URLs with ellipsis  
- Consistent UI across pages  

---

## 📁 Folder Structure

```
app/
  api/
    healthz/route.ts
    links/
      route.ts
      [code]/route.ts
  [code]/route.ts
  page.tsx
  code/[code]/page.tsx

lib/
  prisma.ts
  generateCode.ts

prisma/
  schema.prisma

public/
  favicon.ico

globals.css
postcss.config.js
tailwind.config.js
tsconfig.json
package.json
```

---

## 🛠️ Tech Stack

- Next.js 14 (App Router)
- Prisma ORM
- Neon PostgreSQL
- TypeScript
- TailwindCSS
- Vercel

---

## ⚙️ Environment Variables

Create a `.env` file:

```
DATABASE_URL="your-neon-connection-string"
```

Create `.env.example` for repository:

```
DATABASE_URL=""
```

---

## 🧱 Prisma Setup

```bash
npm install
npx prisma generate
npx prisma db push
```

---

## ▶️ Run Locally

```bash
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## 🔍 API Endpoints

### Health Check
```
GET /api/healthz
```

### Create Link
```
POST /api/links
{
  "target_url": "https://google.com",
  "code": "custom123"
}
```

### Get All Links
```
GET /api/links
```

### Get/Delete One Link
```
GET /api/links/:code
DELETE /api/links/:code
```

### Redirect
```
GET /:code
```

---

## 🧪 Assignment Auto‑Check Requirements

✔ `/api/healthz` returns 200  
✔ Duplicate custom code returns 409  
✔ Redirect increments click count  
✔ Deleting link returns 404 on redirect  
✔ UI meets layout & UX expectations  

---

## 📦 Deployment (Vercel)

```bash
npm run build
vercel deploy
```

Set environment variable:

- `DATABASE_URL`

---

## 👩‍💻 Author

**Manisha Pogul**  
GitHub: https://github.com/manisha-55

---

