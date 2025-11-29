# ADR-001: Core Architecture, Tech Stack, and Payment Service Choice

- **Project:** AI Rental Car – Microservices Rental Car System
- **Decision Category:** Business | Data | API | Events | Tech Stack
- **Status:** Accepted
- **Date:** 2025-02-01
- **Authors:** Project Team – AI Rental Car

---

## 1. Context / Problem

The AI Rental Car project is a cloud-ready, full-stack rental car management system that:

- Lets customers search vehicles, check availability, and make reservations.
- Lets admins manage fleet, pricing, locations, and see business analytics.
- Processes secure online payments for reservations.
- Uses microservices to demonstrate modern architecture patterns.

We need to define the **core architecture and tech stack** so that:

- The system is realistic for production (microservices, APIs, payments).
- The complexity is still manageable for a small team and course timelines.
- We can support future extension (more payment providers, loyalty, AI features).

**Key requirements**

- Support basic **customer flows**:
  - Search vehicles by category, location, and dates.
  - Make and cancel reservations.
  - Pay for reservations online.
- Support **admin flows**:
  - Manage fleet inventory and categories.
  - View revenue and utilization analytics.
- Non-functional:
  - Clear service boundaries and loose coupling.
  - Reasonable performance and scalability.
  - Developer-friendly stack with strong ecosystem support.
  - Easy local/dev setup (Docker + compose).

---

## 2. Decision (Summary)

> We decided to implement AI Rental Car as a **Node.js + React microservices system on PostgreSQL**, with **Stripe** as the primary payment provider, using **Redis** for caching and **Docker** for containerization.

In concrete terms:

- Architecture: Microservices with an API Gateway fronting:
  - Auth, Fleet, Reservation, Payment, and Reporting services.
- Tech Stack:
  - Frontend: React 18 + Vite.
  - Backend: Node.js + Express microservices.
  - Database: PostgreSQL 15 for all core transactional data.
  - Cache/Session: Redis 7.
  - Payments: Stripe Payment Intent API + webhooks.
  - Infra: Docker + Docker Compose for local/dev; cloud-agnostic deployment.
- Integration style:
  - RESTful HTTP APIs via API Gateway.
  - Internal events for reservation/payment updates (Observer-style pattern).

---

## 3. Options Considered

### 3.1 Architecture Style

- **Option A – Monolith (single Node.js/Express app)**
  - Pros:
    - Simple to deploy and reason about.
    - Fewer moving parts for a student team.
  - Cons:
    - Harder to demonstrate microservice patterns (bounded contexts, scaling).
    - Tighter coupling between auth, reservations, payments, report
