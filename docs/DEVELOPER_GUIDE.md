# Rental Car System - Complete Developer Guide

**Version:** 1.0  
**Last Updated:** November 27, 2024  
**Author:** AI-Assisted Development

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Documentation Files](#documentation-files)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Installation Guide](#installation-guide)
6. [Configuration](#configuration)
7. [Running the System](#running-the-system)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)
10. [Deployment](#deployment)
11. [API Documentation](#api-documentation)
12. [Contributing](#contributing)

---

## Overview

This is a **production-ready rental car management system** built with modern microservices architecture. The system features:

- **5 Independent Microservices** (Auth, Fleet, Reservation, Payment, Reporting)
- **API Gateway** with unified facade pattern
- **React Frontend** with premium dark theme UI
- **PostgreSQL Database** with comprehensive schema
- **Redis Caching** for performance optimization
- **Stripe Payment Integration** (test mode)
- **Docker Support** for containerization

### Technology Stack

**Backend:**
- Node.js 18+
- Express.js
- PostgreSQL 15
- Redis 7
- JWT Authentication
- Stripe API

**Frontend:**
- React 18
- Vite
- React Router v6
- Axios
- date-fns

**DevOps:**
- Docker & Docker Compose
- npm workspaces (monorepo)
- nodemon (development)

---

## Documentation Files

### Project Documentation

All documentation is located in the project root:

1. **[README.md](file:///c:/Users/santo/OneDrive/Architecture/pennstate/rewrite/Rental_Car_SDD/rental-car-system/README.md)**
   - Main project README
   - Quick start guide
   - API endpoints reference
   - Technology stack overview

2. **[LOGIN_FIX.md](file:///c:/Users/santo/OneDrive/Architecture/pennstate/rewrite/Rental_Car_SDD/rental-car-system/LOGIN_FIX.md)**
   - Known issues and fixes
   - Login troubleshooting
   - Quick reference guide

### Artifact Documentation

Located in `.gemini/antigravity/brain/` directory:

3. **[implementation_plan.md](file:///C:/Users/santo/.gemini/antigravity/brain/8806fba4-1839-4a6d-a518-3692b64b31a1/implementation_plan.md)**
   - Detailed technical implementation plan
   - Architecture decisions
   - Component breakdown

4. **[walkthrough.md](file:///C:/Users/santo/.gemini/antigravity/brain/8806fba4-1839-4a6d-a518-3692b64b31a1/walkthrough.md)**
   - Complete system walkthrough
   - Feature documentation
   - Design patterns implemented
   - Screenshots and demos

5. **[demo_presentation.md](file:///C:/Users/santo/.gemini/antigravity/brain/8806fba4-1839-4a6d-a518-3692b64b31a1/demo_presentation.md)**
   - Professional demo presentation
   - Sample data overview
   - Test credentials
   - Screenshots of all pages

6. **[task.md](file:///C:/Users/santo/.gemini/antigravity/brain/8806fba4-1839-4a6d-a518-3692b64b31a1/task.md)**
   - Development task checklist
   - Progress tracking
   - Implementation status

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (v9 or higher)
   - Comes with Node.js
   - Verify: `npm --version`

3. **Docker Desktop** (recommended)
   - Download: https://www.docker.com/products/docker-desktop
   - Verify: `docker --version` and `docker-compose --version`

### Optional (if not using Docker)

4. **PostgreSQL 15**
   - Download: https://www.postgresql.org/download/
   - Create database: `rental_car_db`

5. **Redis 7**
   - Download: https://redis.io/download
   - Default port: 6379

### Development Tools (Recommended)

- **VS Code** or **Cursor IDE**
- **Postman** or **Thunder Client** (API testing)
- **Git** (version control)

---

## Project Structure

```
rental-car-system/
├── backend/
│   ├── services/
│   │   ├── auth-service/          # JWT authentication
│   │   ├── fleet-service/         # Vehicle management
│   │   ├── reservation-service/   # Booking logic
│   │   ├── payment-service/       # Stripe integration
│   │   └── reporting-service/     # Analytics
│   ├── api-gateway/               # Unified API facade
│   ├── database/
│   │   ├── schema.sql            # Database schema
│   │   ├── seed.js               # Sample data
│   │   ├── db.js                 # Database connection
│   │   └── redis.js              # Redis client
│   ├── package.json              # Monorepo config
│   ├── .env.example              # Environment template
│   └── Dockerfile
├── frontend/
│   └── web/
│       ├── src/
│       │   ├── components/       # React components
│       │   ├── pages/            # Page components
│       │   ├── services/         # API client
│       │   ├── App.jsx           # Main app
│       │   └── index.css         # Design system
│       ├── package.json
│       └── Dockerfile.dev
├── infrastructure/               # Cloud configs (future)
├── docs/                        # Additional docs
├── docker-compose.yml           # Docker orchestration
├── README.md                    # Main README
└── .gitignore
```

---

## Installation Guide

### Step 1: Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd rental-car-system

# Or download and extract the ZIP file
```

### Step 2: Install Backend Dependencies

```bash
cd backend

# Install root dependencies
npm install

# Install service dependencies (handled by workspaces)
# This installs all microservice dependencies automatically
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend/web
npm install
```

### Step 4: Set Up Environment Variables

```bash
cd ../../backend

# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Use any text editor (VS Code, Notepad, etc.)
```

**Required Environment Variables:**

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=rental_car_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_test_your_webhook_secret

# Service Ports
AUTH_SERVICE_PORT=3001
RESERVATION_SERVICE_PORT=3002
PAYMENT_SERVICE_PORT=3003
FLEET_SERVICE_PORT=3004
REPORTING_SERVICE_PORT=3005
API_GATEWAY_PORT=3000

# Environment
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Step 5: Set Up Database

**Option A: Using Docker (Recommended)**

```bash
# From project root
docker-compose up -d

# This starts PostgreSQL and Redis
```

**Option B: Manual Setup**

1. Install PostgreSQL 15
2. Create database:
   ```sql
   CREATE DATABASE rental_car_db;
   ```
3. Run schema:
   ```bash
   psql -U postgres -d rental_car_db -f backend/database/schema.sql
   ```
4. Install and start Redis

### Step 6: Seed Sample Data

```bash
cd backend
node database/seed.js
```

**Sample Data Created:**
- 3 Locations
- 5 Vehicle Categories
- 13 Vehicles
- 4 Users (1 Admin + 3 Customers)

---

## Configuration

### Frontend Configuration

Edit `frontend/web/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### Stripe Configuration

1. Create a Stripe account: https://stripe.com
2. Get your test API keys from the Dashboard
3. Add keys to `backend/.env`

### Database Configuration

If using custom database settings, update `backend/.env`:

```env
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=your-db-name
DATABASE_USER=your-username
DATABASE_PASSWORD=your-password
```

---

## Running the System

### Development Mode (Recommended)

**Terminal 1: Start Databases (if using Docker)**
```bash
docker-compose up
```

**Terminal 2: Start Backend Services**
```bash
cd backend
npm run dev
```

This starts all 5 microservices + API Gateway concurrently.

**Terminal 3: Start Frontend**
```bash
cd frontend/web
npm run dev
```

### Individual Service Mode

Start services separately for debugging:

```bash
cd backend

# Start individual services
npm run dev:gateway    # API Gateway (Port 3000)
npm run dev:auth       # Auth Service (Port 3001)
npm run dev:fleet      # Fleet Service (Port 3004)
npm run dev:reservation # Reservation Service (Port 3002)
npm run dev:payment    # Payment Service (Port 3003)
npm run dev:reporting  # Reporting Service (Port 3005)
```

### Access Points

Once running:

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## Testing & Verification

### Test Credentials

**Admin Account:**
- Email: `admin@rentalcar.com`
- Password: `admin123`

**Customer Accounts:**
- Email: `john.doe@email.com` | Password: `customer123`
- Email: `jane.smith@email.com` | Password: `customer123`
- Email: `mike.johnson@email.com` | Password: `customer123`

### Manual Testing Steps

1. **Homepage**
   - Navigate to http://localhost:5173
   - Verify hero section loads
   - Check navigation links

2. **Vehicle Search**
   - Click "Search Vehicles"
   - Verify 13 vehicles are displayed
   - Test category filter
   - Test availability filter

3. **Vehicle Details**
   - Click on any vehicle
   - Verify specifications display
   - Check pricing information
   - Test booking form

4. **User Registration**
   - Click "Sign Up"
   - Fill in registration form
   - Submit and verify account creation

5. **User Login**
   - Click "Login"
   - Use test credentials
   - Verify redirect to dashboard

6. **Customer Dashboard**
   - View reservations
   - Test cancellation (if reservations exist)

7. **Admin Dashboard** (admin account only)
   - View statistics
   - Check recent reservations
   - Test quick actions

### API Testing

Use Postman or curl to test endpoints:

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "555-1234"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@email.com",
    "password": "customer123"
  }'
```

**Get Vehicles:**
```bash
curl http://localhost:3000/api/vehicles
```

---

## Troubleshooting

### Common Issues

#### 1. Login Fails

**Symptom:** "Login failed" message appears

**Solution:**
```bash
# Restart API Gateway
# Stop the gateway (Ctrl+C)
cd backend
npm run dev:gateway
```

**Root Cause:** API Gateway body parsing issue (fixed in latest version)

#### 2. Database Connection Error

**Symptom:** `ECONNREFUSED` or database errors

**Solutions:**
- Verify PostgreSQL is running: `docker ps` or check service status
- Check database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

#### 3. Redis Connection Error

**Symptom:** Redis connection refused

**Solutions:**
- Verify Redis is running: `docker ps` or `redis-cli ping`
- Check Redis host/port in `.env`
- Start Redis: `docker-compose up redis -d`

#### 4. Port Already in Use

**Symptom:** `EADDRINUSE` error

**Solutions:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

#### 5. Frontend Not Loading

**Symptom:** Blank page or build errors

**Solutions:**
```bash
cd frontend/web
rm -rf node_modules
npm install
npm run dev
```

#### 6. CORS Errors

**Symptom:** CORS policy errors in browser console

**Solution:**
- Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL
- Default should be: `http://localhost:5173`

---

## Deployment

### Production Build

**Backend:**
```bash
cd backend
NODE_ENV=production npm start
```

**Frontend:**
```bash
cd frontend/web
npm run build
# Serve the dist/ folder with nginx or similar
```

### Docker Deployment

**Build Images:**
```bash
# Backend
cd backend
docker build -t rental-car-backend .

# Frontend
cd ../frontend/web
docker build -f Dockerfile.prod -t rental-car-frontend .
```

**Run with Docker Compose:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment

The system is ready for deployment to:

- **AWS**: ECS, RDS, ElastiCache
- **GCP**: GKE, Cloud SQL, Memorystore
- **Azure**: AKS, Azure SQL, Azure Cache for Redis

**Environment Variables for Production:**
- Generate strong `JWT_SECRET`
- Use production Stripe keys
- Configure production database
- Set up SSL/TLS certificates
- Configure domain names
- Enable monitoring and logging

---

## API Documentation

### Authentication Endpoints

**POST** `/api/auth/register`
- Register new user
- Body: `{ email, password, firstName, lastName, phone }`

**POST** `/api/auth/login`
- Login user
- Body: `{ email, password }`
- Returns: `{ user, accessToken, refreshToken }`

**POST** `/api/auth/refresh`
- Refresh access token
- Body: `{ refreshToken }`

**POST** `/api/auth/logout`
- Logout user (requires auth)

**GET** `/api/auth/me`
- Get current user (requires auth)

### Vehicle Endpoints

**GET** `/api/vehicles`
- List all vehicles
- Query params: `categoryId`, `available`, `locationId`

**GET** `/api/vehicles/:id`
- Get vehicle details

**GET** `/api/vehicles/:id/availability`
- Check vehicle availability
- Query params: `startDate`, `endDate`

**POST** `/api/vehicles` (Admin only)
- Create new vehicle

**PUT** `/api/vehicles/:id` (Admin only)
- Update vehicle

**DELETE** `/api/vehicles/:id` (Admin only)
- Delete vehicle

### Reservation Endpoints

**POST** `/api/reservations`
- Create reservation (requires auth)
- Body: `{ userId, vehicleId, pickupDate, dropoffDate, pickupLocationId, dropoffLocationId }`

**GET** `/api/reservations`
- List reservations (requires auth)
- Query params: `userId`, `status`

**GET** `/api/reservations/:id`
- Get reservation details (requires auth)

**PATCH** `/api/reservations/:id/status`
- Update reservation status (Admin only)

**POST** `/api/reservations/:id/cancel`
- Cancel reservation (requires auth)

### Payment Endpoints

**POST** `/api/payments/create-intent`
- Create payment intent (requires auth)
- Body: `{ amount, reservationId }`

**GET** `/api/payments/:id`
- Get payment details (requires auth)

**POST** `/api/payments/:id/refund`
- Process refund (Admin only)

### Reporting Endpoints (Admin Only)

**GET** `/api/reports/revenue`
- Revenue report
- Query params: `startDate`, `endDate`

**GET** `/api/reports/utilization`
- Vehicle utilization report

**GET** `/api/reports/popular-categories`
- Popular categories report

**GET** `/api/reports/dashboard`
- Dashboard summary

---

## Contributing

### Development Workflow

1. Create a feature branch
2. Make changes
3. Test locally
4. Run linting: `npm run lint`
5. Run tests: `npm test`
6. Submit pull request

### Code Style

- Use ESLint configuration
- Format with Prettier
- Follow existing patterns
- Add comments for complex logic

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific service tests
cd backend/services/auth-service
npm test
```

---

## Additional Resources

### Design Patterns Used

1. **Singleton** - Database and Redis connections
2. **Factory Method** - Service creation in API Gateway
3. **Observer** - Event-driven reservation updates
4. **Strategy** - Payment processing (extensible)
5. **Facade** - API Gateway for microservices

### Performance Optimization

- Redis caching for frequently accessed data
- Database indexes on foreign keys
- Connection pooling for PostgreSQL
- Lazy loading in React components

### Security Best Practices

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API Gateway
- CORS configuration
- Helmet.js security headers
- Input validation with Joi

---

## Support & Contact

For issues, questions, or contributions:

1. Check this documentation
2. Review troubleshooting section
3. Check existing issues
4. Create new issue with details

---

## License

This project is licensed under the MIT License.

---

## Changelog

### Version 1.0 (November 2024)
- Initial release
- 5 microservices implemented
- React frontend with premium UI
- PostgreSQL database with sample data
- Docker support
- Complete documentation

---

**Built with ❤️ for Penn State Rental Car System Project**

*Last Updated: November 27, 2024*
