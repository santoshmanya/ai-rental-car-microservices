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
    - Tighter coupling between auth, reservations, payments, reporting.

- **Option B – Modular Monolith**
  - Pros:
    - Some separation of modules within a single codebase.
    - Easier to refactor into microservices later.
  - Cons:
    - Still shares a single deployment unit and runtime.
    - Less clear boundaries for independent scaling and ownership.

- **Option C – Microservices with API Gateway (Chosen)**
  - Pros:
    - Clear separation of business capabilities (auth, fleet, reservation, payment, reporting).
    - Enables independent scaling and deployments.
    - Matches course learning goals (distributed systems, API gateway, patterns).
  - Cons:
    - More operational complexity (multiple services, ports, env variables).
    - Requires careful handling of cross-service communication and consistency.

### 3.2 Tech Stack

- **Option A – Java + Spring Boot, Angular, MySQL**
  - Pros:
    - Enterprise-grade ecosystem, widely used in industry.
  - Cons:
    - Heavier stack, slower to iterate for a student project.
    - More boilerplate and steeper learning curve.

- **Option B – .NET Core, React, SQL Server**
  - Pros:
    - Strong framework support, good on Azure.
  - Cons:
    - Heavier toolchain and platform assumptions.

- **Option C – Node.js + Express, React, PostgreSQL (Chosen)**
  - Pros:
    - Same language (JavaScript/TypeScript) on front and back end.
    - Easy local dev tooling and quick feedback loop.
    - Rich ecosystem (Express, pg, Stripe SDK, etc.).
  - Cons:
    - Requires discipline around error handling and type safety.
    - Single-threaded runtime can be misused if CPU-heavy workloads are added.

### 3.3 Payment Provider

- **Option A – PayPal / Venmo**
  - Pros:
    - Strong consumer recognition.
    - Easy one-off payments.
  - Cons:
    - More “consumer-to-consumer” oriented; less streamlined for card-on-file B2C rentals.
    - Integrations and docs somewhat more fragmented vs Stripe.

- **Option B – Custom Payments (direct card handling)**
  - Pros:
    - Full control over payment flows.
  - Cons:
    - Must handle PCI compliance, card storage, security – not realistic for course project.

- **Option C – Stripe (Chosen)**
  - Pros:
    - Excellent developer experience and documentation.
    - Built-in support for Payment Intents, webhooks, refunds.
    - Test cards and dashboard simplify student demos.
  - Cons:
    - Ties us to a specific provider (vendor lock-in).
    - Some advanced features are paid.

### 3.4 Database / Data Warehouse

- **Option A – PostgreSQL only (Chosen for MVP)**
  - Pros:
    - Strong relational engine, good for transactional data.
    - Single source of truth; simpler setup for students.
  - Cons:
    - Analytics queries share same DB as OLTP; may impact performance at large scale.

- **Option B – PostgreSQL + Redshift**
  - Pros:
    - Dedicated warehouse for analytics at scale.
  - Cons:
    - Overkill for MVP; more services, more cost.

- **Option C – PostgreSQL + Snowflake / Iceberg Lakehouse**
  - Pros:
    - Modern warehouse/lakehouse architecture.
  - Cons:
    - Too heavy for a course project; additional tools & complexity.

Decision: **Use PostgreSQL for both OLTP and initial reporting/analytics**, with a future ADR to introduce a dedicated warehouse if needed.

---

## 4. Business Architecture Aspects

**Impacted Business Capabilities**

- Customer booking (search, availability, reservation).
- Payments and refunds.
- Fleet and pricing management.
- Reporting (revenue, utilization, popular categories).

**Payment Service Choice – Stripe**

- **Why Stripe for rental car payments?**
  - Supports card payments and refunds needed for deposits and cancellations.
  - Easily integrates with a Node.js backend using official SDKs.
  - Webhooks simplify payment status updates and reconciliation.
  - Test mode and test cards are ideal for students and demos.

**Constraints**

- Focus on card-based payments for MVP (no Pay-Later, BNPL, or multi-provider routing).
- One primary provider (Stripe) to keep complexity manageable.

---

## 5. Data Architecture Aspects

**Operational Database (OLTP)**

- **Chosen:** PostgreSQL 15
- **Reasoning:**
  - Strong support for relational modeling of users, vehicles, reservations, payments, locations.
  - Mature ecosystem (migrations, ORM/query builders, connection pooling).
  - Works well with Docker and local dev; widely supported in cloud providers.

**Core Tables**

- `users` – Customers and admins (roles, auth metadata).
- `vehicles`, `vehicle_categories`, `locations` – Fleet inventory and pricing.
- `reservations` – Booking records with status and timestamps.
- `payments` – Payment transactions with Stripe intent IDs, status.
- `maintenance_records`, `reviews` – Operational data for fleet and feedback.

**Analytics / Reporting**

- For MVP, reporting queries read from PostgreSQL directly (via Reporting service).
- Future ADR may introduce:
  - ETL into a warehouse (Redshift or Snowflake) OR
  - Lakehouse (Iceberg tables on object storage) for advanced analytics.

**Data Governance & Multi-Tenancy**

- MVP assumes a **single-tenant** system (one rental company).  
- A future ADR will define multi-tenant strategy if needed (e.g., row-level security by `tenant_id`).

---

## 6. API Decisions

**APIs Produced (by this system)**

- Exposed via **API Gateway** (`/api/...`):
  - Auth: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
  - Vehicles: `GET /api/vehicles`, `GET /api/vehicles/:id`, `POST/PUT/DELETE` for admin CRUD
  - Reservations: `POST /api/reservations`, `GET /api/reservations`, `PATCH /api/reservations/:id/status`, `POST /api/reservations/:id/cancel`
  - Payments: `POST /api/payments/create-intent`, `GET /api/payments/:id`, `POST /api/payments/:id/refund`
  - Reports: `GET /api/reports/revenue`, `.../utilization`, `.../dashboard`

**API Style**

- RESTful JSON APIs using **Express**.
- JWT-based AuthN; role-based AuthZ (customer vs admin).

**Versioning Strategy**

- MVP: Implicit `v1` in path (`/api/...`) without explicit version number.
- Future ADR: Add explicit `/api/v1/` and deprecation strategy when breaking changes arise.

**APIs Consumed**

- **Stripe API**:
  - Payment Intent creation.
  - Webhook callbacks for payment success/failure.
  - Refund operations.

---

## 7. Event Decisions

**Events Produced**

- Internal domain events (within the backend):
  - `ReservationCreated`
  - `ReservationCancelled`
  - `PaymentSucceeded`
  - `PaymentFailed`
- Used by:
  - Reporting service to update metrics.
  - Notification or future “Customer Communication” service.

**Events Consumed**

- Payment service consumes Stripe webhook events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- Reservation service may consume payment events to update reservation status.

**Event Processing Considerations**

- MVP implementation:
  - Internal events via in-process pub/sub or simple message broker abstraction.
  - Stripe webhooks received on a dedicated endpoint in Payment service.
- Future ADR:
  - Introduce a message broker (e.g., Kafka, SNS/SQS, or RabbitMQ) if we need durable, cross-service event streams and replay.

---

## 8. Rationale

The chosen architecture and tech stack:

- Align with **course goals**:
  - Microservices architecture, API Gateway, payment integration.
  - Clear service boundaries for threat modeling, Zero Trust, and STRIDE.
- Support **rapid development**:
  - Node + React are familiar and fast for students.
  - PostgreSQL and Redis are easy to run locally and in containers.
- Provide a **realistic production pattern**:
  - Many real-world SaaS products are built with these technologies.
  - Stripe integration is industry-standard for card payments.
- Keep **complexity just high enough**:
  - Microservices to show patterns, but limited to a handful of well-defined services.
  - Single primary payment provider and single DB engine for MVP.

Trade-offs:

- Added operational complexity vs a monolith.
- Vendor dependencies (Stripe, Postgres) vs pure in-house implementations.
- Future scaling and analytics will require additional ADRs (warehouse, queues, etc.).

---

## 9. Consequences

### Positive

- Students get exposure to a **realistic microservice system** (auth, fleet, reservation, payment, reporting).
- The tech stack is **modern and employable** (React, Node, PostgreSQL, Stripe, Docker).
- Clear separation of concerns makes it easier to:
  - Assign ownership of services.
  - Apply security patterns and STRIDE threat modeling per service.
- Stripe and Postgres simplify **reliability and security** concerns for payments and data.

### Negative / Risks

- Microservices increase cognitive load and deployment complexity compared to a monolith.
- Stripe lock-in: migrating to another payment provider later will require additional work.
- Single relational DB for both OLTP and analytics may become a bottleneck in a real high-scale scenario.

### Follow-Up Actions

- ADR-002 – Detailed API Gateway routing and edge security decisions.
- ADR-003 – Logging, monitoring, and observability stack.
- ADR-004 – Threat Modeling and Security Controls per service (STRIDE & Zero Trust).
- ADR-005 – Future data warehouse / analytics architecture (if needed).

---

## 10. Related Decisions

- ADR-000 – Project Introduction and Non-Functional Requirements (to be created).
- ADR-002 – API Gateway & Edge Security.
- ADR-003 – Observability and Operational Excellence.

---

## 11. References

- Project README – AI Rental Car Microservices
- Stripe API Docs – https://stripe.com/docs/api
- PostgreSQL – https://www.postgresql.org/docs/
- Redis – https://redis.io/docs/latest/
- React – https://react.dev/
- Node.js – https://nodejs.org/en/docs
