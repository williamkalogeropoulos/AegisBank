# Aegis Bank - Setup Guide

This guide will help you set up and run the Aegis Bank application locally.

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Quick Start with Docker

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd HellenicBank

# Start all services
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080/api
# MySQL: localhost:3307
```

## Manual Setup

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE hellenic_bank;
CREATE USER 'hellenic'@'localhost' IDENTIFIED BY 'hellenic123';
GRANT ALL PRIVILEGES ON hellenic_bank.* TO 'hellenic'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

The backend will start on port 8080.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on port 5173.

## Default Credentials

### Admin Account
- Email: `admin@hellenicbank.com`
- Password: `admin123`
- Role: ADMIN

### Demo User Account
You can create a new user account through the registration page.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token

### Accounts
- `GET /api/accounts` - Get user's accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/{id}` - Get account details
- `PUT /api/accounts/{id}` - Update account
- `GET /api/accounts/admin/all` - Get all accounts (Admin only)

### Transfers
- `GET /api/transfers` - Get user's transfers
- `POST /api/transfers` - Create new transfer
- `GET /api/transfers/{id}` - Get transfer details
- `POST /api/transfers/{id}/process` - Process transfer (Admin only)
- `PUT /api/transfers/{id}/status` - Update transfer status (Admin only)

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/{id}` - Get user by ID (Admin only)
- `PUT /api/users/{id}` - Update user (Admin only)
- `DELETE /api/users/{id}` - Delete user (Admin only)

## Features

### User Features
- ✅ User registration and authentication
- ✅ Account management (create, view accounts)
- ✅ Money transfers between accounts
- ✅ Dashboard with account overview
- ✅ Profile management
- 🚧 Card management (coming soon)
- 🚧 Loan applications (coming soon)
- 🚧 Budgeting dashboard (coming soon)

### Admin Features
- ✅ Admin dashboard with system metrics
- ✅ User management
- ✅ Account oversight
- ✅ Transfer processing
- 🚧 Loan approval workflow (coming soon)
- 🚧 System configuration (coming soon)

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Security with JWT
- Spring Data JPA
- MySQL 8.0
- Maven

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Query
- React Router
- Axios

## Development

### Backend Development
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Migrations
The application uses JPA with `ddl-auto: update`, so database schema changes are automatically applied.

## Security

- JWT-based authentication
- BCrypt password hashing
- Role-based access control (RBAC)
- CORS configuration
- Input validation
- SQL injection protection

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `application.yml`
   - Verify database exists

2. **Port Already in Use**
   - Backend: Change port in `application.yml`
   - Frontend: Change port in `vite.config.ts`

3. **CORS Issues**
   - Check CORS configuration in `SecurityConfig.java`
   - Ensure frontend URL is in allowed origins

4. **JWT Token Issues**
   - Check JWT secret in `application.yml`
   - Verify token expiration settings

### Logs

Backend logs are available in the console. For more detailed logging, check the application logs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational purposes only.
