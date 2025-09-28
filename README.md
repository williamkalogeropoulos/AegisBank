# Aegis Bank - Full Stack Banking Application

A modern, fully functional banking web application built with Spring Boot backend and React frontend, featuring comprehensive user management, account operations, and admin oversight capabilities.

## 🏦 Project Overview

Aegis Bank is a complete banking application that demonstrates modern full-stack development practices with a focus on security, user experience, and administrative control. The application supports both regular users and administrators with role-based access control and comprehensive financial management features.

## 📁 Project Structure

```
AegisBank/
├── backend/                 # Spring Boot API
│   ├── src/main/java/com/aegisbank/
│   │   ├── controller/      # REST API controllers
│   │   ├── service/         # Business logic services
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Data access layer
│   │   ├── dto/             # Data transfer objects
│   │   ├── security/        # Security configuration
│   │   └── config/          # Application configuration
│   ├── src/main/resources/
│   │   ├── application.yml  # Application configuration
│   │   └── data.sql         # Initial data
│   └── pom.xml              # Maven dependencies
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── contexts/       # React contexts
│   │   ├── lib/            # Utility functions
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
├── docker-compose.yml      # Docker services configuration
└── README.md
```

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication with refresh mechanism
- **Role-based Access Control**: ADMIN and USER roles with different permissions
- **Password Security**: BCrypt hashing with secure password policies
- **Session Management**: HttpOnly cookies for secure token storage
- **Profile Management**: Users can update name, email, and change passwords

### 👤 User Features
- **Account Management**: Create and manage CHECKING, SAVINGS, and LOAN accounts
- **Money Transfers**: Send money between accounts with real-time validation
- **Card Management**: Apply for and manage DEBIT and CREDIT cards
- **Loan Applications**: Apply for loans with flexible terms and interest rates
- **Transaction History**: View detailed transfer history with filtering
- **Dashboard**: Comprehensive overview of accounts, recent activity, and quick actions
- **Budgeting Dashboard**: Financial insights with spending analytics and charts

### 🛡️ Admin Features
- **User-Centric Admin Dashboard**: Select any user to view and manage their assets
- **Comprehensive CRUD Operations**: Create, read, update, delete for all entities
- **Approval System**: Approve/reject pending account, card, and loan requests
- **User Management**: Create, edit, and delete users with role assignment
- **Asset Management**: Full control over accounts, cards, loans, and transfers
- **Outstanding Requests**: Visual indicators showing pending requests per user
- **Real-time Updates**: Live data updates with optimistic UI patterns

### 🎨 User Interface
- **Modern Design**: Clean, professional interface with Aegis Bank branding
- **Responsive Layout**: Mobile-first design that works on all devices
- **Dark/Light Mode**: Theme switching with persistent user preferences
- **Component Library**: shadcn/ui components for accessibility and consistency
- **Interactive Elements**: Smooth animations and hover effects
- **Status Indicators**: Color-coded badges for different statuses and states

## 🚀 Technology Stack

### Backend
- **Java 17**: Modern Java features and performance
- **Spring Boot 3.x**: Rapid application development framework
- **Spring Security**: Comprehensive security with JWT authentication
- **Spring Data JPA**: Data persistence with Hibernate
- **MySQL 8**: Reliable relational database
- **BCrypt**: Secure password hashing
- **Jakarta Validation**: Input validation and constraints
- **MapStruct**: Object mapping (optional)
- **Lombok**: Reduced boilerplate code

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Accessible component library built on Radix UI
- **React Query**: Server state management and caching
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Recharts**: Data visualization and charts
- **Lucide React**: Beautiful icon library

### Infrastructure
- **Docker**: Containerized development and deployment
- **Docker Compose**: Multi-container orchestration
- **MySQL**: Database service
- **Nginx**: Reverse proxy (optional)

## 🏃‍♂️ Getting Started

### Prerequisites
- **Java 17+**: For backend development
- **Node.js 18+**: For frontend development
- **MySQL 8+**: Database server
- **Docker & Docker Compose**: For containerized setup (recommended)

### Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AegisBank
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api
   - Database: localhost:3307

### Manual Setup

#### 1. Database Setup
```sql
CREATE DATABASE aegis_bank;
CREATE USER 'aegis'@'localhost' IDENTIFIED BY 'aegis123';
GRANT ALL PRIVILEGES ON aegis_bank.* TO 'aegis'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. Backend Setup
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Default Credentials
- **Admin**: admin@aegisbank.com / admin123
- **Demo User**: demo@aegisbank.com / demo123
- **Mock User**: mock@aegisbank.com / mock123

## 🎯 User Roles & Permissions

### 👤 Regular User (USER)
- Create and manage personal accounts
- Apply for cards and loans (pending admin approval)
- Make transfers between accounts
- View transaction history and analytics
- Update personal profile and password
- Access budgeting dashboard

### 🛡️ Administrator (ADMIN)
- Full access to all user data and assets
- Approve/reject pending requests
- Create, edit, and delete users
- Manage all accounts, cards, and loans
- View system-wide analytics and metrics
- Access comprehensive admin dashboard

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/{id}` - Update user (admin only)
- `DELETE /api/users/{id}` - Delete user (admin only)
- `PUT /api/users/me` - Update own profile
- `PUT /api/users/me/password` - Change password

### Account Management
- `GET /api/accounts` - Get user's accounts
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account
- `GET /api/accounts/admin/all` - Get all accounts (admin)
- `PUT /api/accounts/admin/{id}` - Admin account update
- `DELETE /api/accounts/admin/{id}` - Admin account deletion

### Card Management
- `GET /api/cards` - Get user's cards
- `POST /api/cards` - Create new card
- `PUT /api/cards/{id}` - Update card
- `DELETE /api/cards/{id}` - Delete card
- `GET /api/cards/all` - Get all cards (admin)
- `PUT /api/cards/admin/{id}` - Admin card update
- `DELETE /api/cards/{id}/admin` - Admin card deletion

### Loan Management
- `GET /api/loans` - Get user's loans
- `POST /api/loans` - Create loan application
- `PUT /api/loans/{id}` - Update loan
- `DELETE /api/loans/{id}` - Delete loan
- `GET /api/loans/admin/all` - Get all loans (admin)
- `POST /api/loans/admin` - Admin loan creation
- `PUT /api/loans/admin/{id}` - Admin loan update
- `DELETE /api/loans/admin/{id}` - Admin loan deletion

### Transfer Management
- `GET /api/transfers` - Get user's transfers
- `POST /api/transfers` - Create transfer
- `GET /api/transfers/admin/all` - Get all transfers (admin)

## 🎨 Design System

### Color Palette
- **Primary Blue**: #0A3D91 (Aegis Bank blue)
- **Accent Blue**: #1F6FEB (Interactive elements)
- **Gold Accent**: #D4AF37 (Premium features)
- **Success Green**: #22c55e (Approved/Active states)
- **Warning Yellow**: #f59e0b (Pending states)
- **Error Red**: #ef4444 (Rejected/Failed states)

### Typography
- **Font Family**: Inter (system fallback)
- **Headings**: Semi-bold weights (600)
- **Body Text**: Regular weight (400)
- **Responsive Sizing**: Fluid typography with clamp()

### Components
- **shadcn/ui**: Accessible, customizable components
- **Radix UI Primitives**: Unstyled, accessible components
- **Tailwind CSS**: Utility-first styling
- **Dark Mode**: Full theme support with system preference detection

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Refresh Tokens**: Automatic token renewal
- **Role-based Access**: Granular permission system
- **Password Hashing**: BCrypt with salt rounds
- **Session Management**: HttpOnly cookies for security

### Data Protection
- **Input Validation**: Server-side validation with Jakarta Validation
- **SQL Injection Prevention**: JPA/Hibernate parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CORS Configuration**: Controlled cross-origin requests
- **CSRF Protection**: Token-based CSRF prevention

### API Security
- **Endpoint Protection**: Role-based endpoint access
- **Request Validation**: Comprehensive input sanitization
- **Error Handling**: Secure error messages without data leakage
- **Rate Limiting**: Protection against abuse (configurable)

## 📊 Data Models

### Core Entities
- **User**: Authentication and profile information
- **Account**: Bank accounts with types (CHECKING, SAVINGS, LOAN)
- **Card**: Payment cards (DEBIT, CREDIT) with limits
- **Loan**: Loan applications with terms and status tracking
- **Transfer**: Money transfers between accounts

### Status Management
- **Account Status**: ACTIVE, FROZEN, PENDING, CANCELLED
- **Card Status**: ACTIVE, BLOCKED, PENDING, CANCELLED
- **Loan Status**: PENDING, APPROVED, REJECTED, ACTIVE, PAID, CANCELLED
- **Transfer Status**: PENDING, COMPLETED, FAILED, CANCELLED

## 🚀 Development

### Project Setup
1. **Fork and clone** the repository
2. **Set up environment** variables for database and JWT secrets
3. **Install dependencies** for both frontend and backend
4. **Run database migrations** and seed initial data
5. **Start development servers** for both frontend and backend

### Code Structure
- **Backend**: Follows Spring Boot best practices with layered architecture
- **Frontend**: Component-based architecture with custom hooks
- **Database**: Normalized schema with proper relationships
- **API**: RESTful design with consistent response formats

### Testing
- **Unit Tests**: Comprehensive test coverage for business logic
- **Integration Tests**: API endpoint testing
- **Frontend Tests**: Component and user interaction testing
- **E2E Tests**: Full application workflow testing

## 🎓 Educational Value

This project demonstrates:
- **Full-stack Development**: Modern web application architecture
- **Security Best Practices**: Authentication, authorization, and data protection
- **UI/UX Design**: Modern, accessible user interface design
- **Database Design**: Relational database modeling and optimization
- **API Design**: RESTful API development and documentation
- **DevOps**: Containerization and deployment strategies

## 📝 License

This project is created for educational purposes and demonstrates modern full-stack development practices in a banking application context.

## 🤝 Contributing

This is an educational project. For learning purposes, you can:
- Fork the repository
- Create feature branches
- Submit pull requests
- Report issues and suggestions

## 📞 Support

For questions or issues:
- Check the documentation
- Review the code comments
- Create an issue in the repository
- Contact the development team

---

**Aegis Bank** - Modern Banking, Simplified 🏦