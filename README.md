# Pulse CRM

AI-powered sales workspace built with Next.js 14, React, Tailwind CSS, and Claude.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Set up your environment
cp .env.local.example .env.local
# → Open .env.local and add your Anthropic API key

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Contacts** — add, edit, filter, search, tag, and assign contacts
- **Pipeline** — drag-and-drop deal board across Lead → Qualified → Proposal → Negotiation
- **AI email drafting** — tone and type controls, powered by Claude via a secure API route
- **AI contact insight** — one-click contextual sales insight per contact
- **Deal history** — every stage move and edit is logged with timestamps
- **CSV import/export** — bulk import contacts, export contacts and deals
- **Team management** — assign contacts and deals to team members
- **Activity feed** — live log of all workspace actions
- **Onboarding** — guided setup checklist for new workspaces

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| UI | React + Tailwind CSS |
| Drag & Drop | @dnd-kit |
| State | Zustand (persisted to localStorage) |
| AI | Claude API via `/api/ai` route |
| Deploy | Vercel (recommended) |

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add `ANTHROPIC_API_KEY` in Vercel → Project → Settings → Environment Variables.
