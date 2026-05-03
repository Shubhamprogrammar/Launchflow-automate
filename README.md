# 🚀 LaunchFlow

LaunchFlow is the client application for the LaunchFlow SaaS platform — a modern multi-tenant business automation system.

It provides:
- Authentication
- Workspace management
- Team collaboration
- Invite system
- Notifications
- Billing & subscriptions
- Analytics dashboards
- API key management
- File uploads
- Real-time activity feeds

Built using modern production-grade technologies.

---

# 🧱 Tech Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- React Query / TanStack Query
- Fetch
- Zod
- Lucide Icons

---

# 🌐 Backend

Connected with LaunchFlow Backend API:

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Better Auth
- Redis + BullMQ
- Stripe

---

# ✨ Features

## 🔐 Authentication

- Sign Up
- Sign In
- Session Management
- Protected Routes
- Device Tracking

---

## 🏢 Workspaces

- Create Workspace
- Multi-tenant Architecture
- Workspace Switching
- Role-based Access Control

Roles:

- OWNER
- ADMIN
- MANAGER
- MEMBER

---

## 👥 Team Collaboration

- Invite Members
- Accept Invites
- Manage Members
- Role Management

---

## 🔔 Notifications

- Real-time Notifications
- Invite Notifications
- Billing Notifications
- Activity Feed
- Mark as Read

---

## 💳 Billing

- Stripe Subscription Checkout
- Plan Management
- Current Subscription Info
- Cancel Subscription

Plans:

- FREE
- PRO
- TEAM
- ENTERPRISE

---

## 📊 Analytics

- Workspace Stats
- Members Count
- Invite Stats
- Activity Tracking

---

## 🔑 API Keys

- Create API Keys
- Revoke API Keys
- Secure Key Storage
- External API Access

---

## 📁 File Uploads

- Upload Files
- S3-ready Architecture
- File Metadata Tracking

---

# 📁 Project Structure

```bash
src/
│
├── app/
│   ├── auth/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── register/
│   │   ├── reset-password/
│   │   ├── verify-email/
│   │   ├── layout.tsx
│   │
│   ├── dashboard/
│   │   ├── apikeys/
│   │   ├── billing/
│   │   ├── files/
│   │   ├── settings/
│   │   ├── team/
│   │   ├── workspaces/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── dashboard/
│   └── ui/
│
├── contexts/
│
├── lib/
│   ├── api.ts
│   ├── auth-client.ts
│   └── date-utils.ts
│
├── .env
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
└── tsconfig.json