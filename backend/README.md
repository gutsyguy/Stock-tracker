# Stock Tracker Backend

A RESTful API backend for the Stock Tracker application built with Go, Gin, PostgreSQL, and Supabase integration.

## Features

- **RESTful API** with Gin framework
- **PostgreSQL** database integration with connection pooling
- **Supabase** authentication and authorization
- **JWT** token validation
- **Docker** containerization
- **CI/CD** pipeline with GitHub Actions
- **Health checks** for monitoring and deployment
- **CORS** support for frontend integration
- **Comprehensive logging** and error handling

## API Endpoints

### Health Checks
- `GET /health` - Health check with database connectivity
- `GET /ready` - Readiness check
- `GET /live` - Liveness check

### Authentication (Supabase)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile (protected)

### Users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:userId/transactions` - Get user transactions (protected)
- `GET /api/users/:userId/portfolio` - Get user portfolio (protected)

### Stocks
- `GET /api/stocks` - List all stocks (with pagination)
- `GET /api/stocks/:id` - Get stock by ID
- `GET /api/stocks/symbol/:symbol` - Get stock by symbol
- `POST /api/stocks` - Create stock (protected)
- `PUT /api/stocks/:id` - Update stock (protected)
- `DELETE /api/stocks/:id` - Delete stock (protected)
- `GET /api/stocks/:stockId/transactions` - Get stock transactions

### Transactions
- `POST /api/transactions` - Create transaction (protected)
- `GET /api/transactions/:id` - Get transaction by ID (protected)

## Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Database
DATABASE_URL=postgres://username:password@localhost:5432/stock_tracker?sslmode=disable

# Supabase (optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
PORT=8080
GIN_MODE=debug  # or "release" for production

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com

# JWT
JWT_SECRET=your-jwt-secret-key
```

## Getting Started

### Prerequisites
- Go 1.24.2 or later
- PostgreSQL 12 or later
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock-tracker/backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up the database**
   ```bash
   # Create database
   createdb stock_tracker
   
   # Run migrations
   psql -d stock_tracker -f migrations/001_create_tables.sql
   ```

4. **Set environment variables**
   ```bash
   export DATABASE_URL="postgres://username:password@localhost:5432/stock_tracker?sslmode=disable"
   export PORT=8080
   ```

5. **Run the application**
   ```bash
   go run cmd/server/main.go
   ```

The server will start on `http://localhost:8080`

### Docker Development

1. **Build the Docker image**
   ```bash
   docker build -t stock-tracker-backend .
   ```

2. **Run with Docker Compose** (recommended)
   ```bash
   # Create docker-compose.yml with PostgreSQL and your app
   docker-compose up
   ```

### Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run only unit tests (skip integration tests)
go test -short ./...
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Stocks Table
```sql
CREATE TABLE stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### User Stock Transactions Table
```sql
CREATE TABLE user_stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    transaction_type VARCHAR(4) NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
    quantity NUMERIC(20,4) NOT NULL CHECK (quantity > 0),
    price NUMERIC(20,4) NOT NULL CHECK (price > 0),
    transaction_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment

### Using Docker

The application includes a multi-stage Dockerfile for efficient production builds:

```bash
docker build -t stock-tracker-backend .
docker run -p 8080:8080 -e DATABASE_URL="your-db-url" stock-tracker-backend
```

### CI/CD Pipeline

The project includes a GitHub Actions workflow that:
- Runs tests on Go 1.24.2
- Performs security scanning
- Builds and tests Docker images
- Runs linting and formatting checks

## Architecture

```
backend/
├── cmd/server/          # Application entry point
├── config/              # Configuration management
├── core/model/          # Data models
├── db/                  # Database connection
├── handler/             # HTTP handlers
├── middleware/          # HTTP middleware
├── migrations/          # Database migrations
├── service/             # Business logic services
├── Dockerfile           # Container definition
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.
