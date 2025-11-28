1. Introduction
- Purpose, scope, stakeholders, definitions (as outlined earlier).

2. System Overview
- High-Level Description: Rental Car System with web/mobile frontends and backend microservices.
- Architecture Style: Microservices with REST APIs.
- Technology Stack (Required):
- Frontend: React (Web), Flutter (Mobile)
- Backend: Node.js + Express
- Database: PostgreSQL (relational), Redis (caching)
- Authentication: OAuth2 / JWT
- Payment Integration: Stripe API
- Dev Tools: GitHub Copilot, Cursor IDE, Agenti IDE for prototyping

3. Functional Requirements
- Customer and admin features (search, reserve, pay, fleet management, reporting).
- 📌 Deliverable: UML Use Case Diagram

4. Non-Functional Requirements
- Performance, scalability, security, compliance, maintainability.

5. System Architecture
- C4 Container Diagram: Web App, Mobile App, Reservation Service, Payment Service, Fleet Service, Reporting Service.
- Sequence Diagram: Reservation flow.

6. Data Design
- Schema: Customers, Vehicles, Reservations, Payments.
- 📌 Deliverables: UML Class Diagram, State Chart Diagram.

7. Interface Design
- UI/UX Mockups: Customer dashboard, Admin dashboard.
- 📌 Deliverable: Activity Diagram / Flow Chart.

8. Deployment & Cloud Environment
- Cloud Environment (Required):
- AWS: ECS (containers), RDS (database), S3 (storage), CloudWatch (monitoring)
- GCP: GKE (Kubernetes), Cloud SQL, Cloud Storage, Stackdriver
- Azure: AKS (Kubernetes), Azure SQL, Blob Storage, Application Insights
- Docker: Containerization for portability across environments
- CI/CD Pipeline:
- GitHub Actions → Cloud Provider (AWS/GCP/Azure) → Auto-deploy containers
- Infrastructure as Code (Terraform or CloudFormation)
📌 Deliverable: Optional C4 Deployment Diagram

9. Testing Strategy
- Unit, integration, acceptance tests.
- Mock fleet data for validation.

10. Risks & Mitigation
- Payment downtime, fleet data inconsistency, seasonal demand spikes.

11. Design Patterns Applied
- Singleton, Factory Method, Observer, Strategy, Facade.
