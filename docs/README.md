# Maison Slimani: Engineering Documentation

Welcome to the Maison Slimani engineering hub. This repository contains the Next.js e-commerce application, an overarching administration portal, and the shared proprietary domain logic that powers both.

This documentation serves as the central guide for all developers and contributors joining the project.

## Table of Contents

1. [Getting Started](./getting-started.md) - Environment requirements, local Turborepo initialization, and basic commands.
2. [Architecture & Topology](./architecture.md) - Monorepo architecture, Domain-Driven Design (Clean Architecture), and module boundary constraints.
3. [Development Workflow](./development-workflow.md) - Coding standards, state management, and testing strategy.

## Tech Stack Overview

- **Monorepo Engine**: Turborepo / pnpm workspace
- **Framework**: Next.js 15 (App Router natively)
- **Language**: TypeScript (Strict Mode)
- **Database**: Supabase (PostgreSQL) + Prisma/Typed Clients
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
- **State**: React Query (Server/Client caching) + Zustand (Local state)
- **Deployment**: Vercel
