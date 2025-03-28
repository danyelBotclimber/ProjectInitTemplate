# ProjectInitTemplate - TypeScript Express Authentication Template

A robust TypeScript-based Express.js template with built-in authentication and authorization features. This template provides a solid foundation for building secure web applications with modern best practices.

## Features

- 🔐 Complete authentication system (JWT-based)
- 📝 TypeScript for type safety
- 🗃️ PostgreSQL with TypeORM for data persistence
- 🔍 Swagger API documentation
- 🧪 Comprehensive test suite
- 🐳 Docker support for development and testing
- 🔒 Security best practices (helmet, cors, etc.)
- 📦 Modern dependency management

## Prerequisites

- Node.js (v20 or later)
- Docker and Docker Compose
- PostgreSQL (if running without Docker)
- npm or yarn

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mommybear.git
   cd mommybear
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=mommybear
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=86400
   ```

## Development

### Running the Application

Using Docker (recommended):
```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

Without Docker:
```bash
# Start in development mode with hot reload
npm run dev

# Start in production mode
npm start
```

### Testing

Run all tests:
```bash
# Using Docker
docker-compose run --build test

# Without Docker
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Build the application
npm run build

# Build Docker image
docker build -t mommybear .
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

### Available Endpoints

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login with email and password
- GET `/api/auth/profile` - Get user profile (requires authentication)

## Project Structure

```
src/
├── __tests__/          # Test files
├── config/             # Configuration files
├── entities/           # TypeORM entities
├── middleware/         # Express middleware
├── migrations/         # Database migrations
├── routes/             # API routes
├── types/             # TypeScript type definitions
├── app.ts             # Express app setup
└── server.ts          # Application entry point
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Request validation
- CORS protection
- HTTP security headers (Helmet)
- Rate limiting
- SQL injection protection (TypeORM)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Acknowledgments

- Express.js
- TypeORM
- JWT
- TypeScript
- Jest
- Swagger
- Docker 
