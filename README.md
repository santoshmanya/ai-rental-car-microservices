# Rental Car System

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-18+-green)
![React](https://img.shields.io/badge/react-18-blue)
![AI Assisted](https://img.shields.io/badge/AI-Assisted-purple)
![Development Time](https://img.shields.io/badge/built%20in-3.5%20hours-orange)

> **⚡ Built in 3.5 hours using AI-assisted development (Google Antigravity IDE)**

A production-ready, full-stack rental car management system built with microservices architecture, featuring React frontend, Node.js backend services, PostgreSQL database, and Stripe payment integration.

## 🌟 Highlights

- **🤖 AI-Powered Development**: Built using specification-driven development with Google Antigravity IDE (Agentic AI)
- **⚡ Rapid Development**: Complete system delivered in 3.5 hours (vs traditional 2-3 weeks)
- **🏗️ Enterprise Architecture**: Microservices design with 5 independent services
- **✨ Production-Ready**: Enterprise-grade code with design patterns and best practices
- **📦 Complete Package**: Full documentation, demo videos, and deployment guides

## ⏱️ Development Timeline

**Total Time:** 3.5 hours (single session)

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Planning & Architecture | 30 min | SDD review, implementation plan, tech stack selection |
| Backend Development | 90 min | 5 microservices, API Gateway, database schema, Redis integration |
| Frontend Development | 60 min | React app, UI/UX design, components, routing |
| Infrastructure & DevOps | 20 min | Docker config, environment setup, database seeding |
| Documentation & Demo | 40 min | 8 guides, 11 screenshots, 8 videos |

**Result:** 5,200+ lines of production code + comprehensive documentation

**Traditional Development:** 2-3 weeks (240-480 hours)  
**Productivity Gain:** ~100x faster

<img width="1249" height="1277" alt="image" src="https://github.com/user-attachments/assets/5ff03df1-5b69-4ee7-a3f9-d7582dbb8ea2" />


## 🚀 Features

### Customer Features
- **Vehicle Search & Filtering** - Browse available vehicles by category, location, and dates
- **Real-time Availability** - Check vehicle availability before booking
- **Instant Reservations** - Book vehicles with a streamlined reservation flow
- **Secure Payments** - Stripe integration for safe payment processing
- **Reservation Management** - View, modify, and cancel reservations
- **User Dashboard** - Track all bookings and payment history

### Admin Features
- **Fleet Management** - Add, edit, and remove vehicles from the fleet
- **Reservation Overview** - View and manage all customer reservations
- **Analytics Dashboard** - Revenue reports, utilization metrics, and trends
- **User Management** - Manage customer accounts and permissions
- **Real-time Statistics** - Monitor business performance

## 🏗️ Architecture

### Microservices
- **Auth Service** (Port 3001) - User authentication with JWT
- **Fleet Service** (Port 3004) - Vehicle and category management
- **Reservation Service** (Port 3002) - Booking and reservation logic
- **Payment Service** (Port 3003) - Stripe payment processing
- **Reporting Service** (Port 3005) - Analytics and business intelligence
- **API Gateway** (Port 3000) - Unified API facade with routing

### Technology Stack
- **Frontend**: React 18 + Vite, React Router, Axios
- **Backend**: Node.js + Express
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Payments**: Stripe API
- **Containerization**: Docker + Docker Compose

### Design Patterns Implemented
- **Singleton** - Database connection pooling
- **Factory Method** - Service instantiation in API gateway
- **Observer** - Event-driven reservation status updates
- **Strategy** - Payment processing (extensible for multiple providers)
- **Facade** - API Gateway unifying microservices

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 15 (if running locally without Docker)
- Redis 7 (if running locally without Docker)
- Stripe account (for payment processing)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd rental-car-system
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your configuration:
- Database credentials
- JWT secret key
- Stripe API keys
- Service ports

### 3. Run with Docker Compose

```bash
docker-compose up
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- All microservices (ports 3001-3005)
- API Gateway (port 3000)
- React frontend (port 5173)

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/health

## 🛠️ Development Setup

### Backend Services

Each service can be run independently:

```bash
cd backend

# Install dependencies
npm install

# Run all services
npm run dev

# Run individual service
npm run dev:auth
npm run dev:fleet
npm run dev:reservation
npm run dev:payment
npm run dev:reporting
npm run dev:gateway
```

### Frontend

```bash
cd frontend/web

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Database Setup

```bash
cd backend

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed

# Reset database
npm run db:reset
```

## 📊 Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - Customer and admin accounts
- `vehicles` - Fleet inventory
- `vehicle_categories` - Car types and pricing
- `locations` - Rental locations
- `reservations` - Booking records
- `payments` - Payment transactions
- `maintenance_records` - Vehicle maintenance history
- `reviews` - Customer reviews

## 🔐 Authentication

The system uses JWT-based authentication:

1. **Register/Login** - Obtain access and refresh tokens
2. **Access Token** - Valid for 24 hours
3. **Refresh Token** - Valid for 7 days, stored in Redis
4. **Role-Based Access** - Customer and Admin roles

### API Authentication

Include the JWT token in requests:

```javascript
headers: {
  'Authorization': 'Bearer <your-token>'
}
```

## 💳 Payment Integration

Stripe is integrated for payment processing:

1. **Test Mode** - Use Stripe test keys for development
2. **Payment Intent** - Created when booking a vehicle
3. **Webhooks** - Handle payment success/failure events
4. **Refunds** - Automated refund processing for cancellations

### Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/:id` - Get vehicle details
- `GET /api/vehicles/:id/availability` - Check availability
- `POST /api/vehicles` - Create vehicle (admin)
- `PUT /api/vehicles/:id` - Update vehicle (admin)
- `DELETE /api/vehicles/:id` - Delete vehicle (admin)

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations` - List reservations
- `GET /api/reservations/:id` - Get reservation details
- `PATCH /api/reservations/:id/status` - Update status
- `POST /api/reservations/:id/cancel` - Cancel reservation

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments/:id/refund` - Process refund

### Reports (Admin Only)
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/utilization` - Vehicle utilization
- `GET /api/reports/popular-categories` - Popular categories
- `GET /api/reports/dashboard` - Dashboard summary

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific service tests
cd backend/services/auth-service
npm test
```

## 🚢 Deployment

### Cloud Deployment Options

The system is ready for deployment to:
- **AWS**: ECS, RDS, ElastiCache, S3
- **GCP**: GKE, Cloud SQL, Cloud Storage
- **Azure**: AKS, Azure SQL, Blob Storage

### Environment Variables

Ensure all environment variables are properly configured:
- Database connection strings
- Redis connection
- JWT secrets
- Stripe API keys
- CORS origins
- Service URLs

## 📖 Documentation

- [API Documentation](./docs/api/) - Detailed API reference
- [Architecture Diagrams](./docs/diagrams/) - System architecture
- [Database Schema](./backend/database/schema.sql) - Complete schema

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built as part of the Rental Car System project.

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ using modern web technologies**
