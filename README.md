# Academy Space - Campus Facility Reservation System

A modern web application for managing campus facility reservations at Telkom University.

## 🚀 Features

### User Features
- **User Authentication** - Register/Login with username and password
- **Facility Browsing** - View all available facilities with details
- **Room Availability** - Check real-time room availability
- **Booking System** - Create reservations with document upload support
- **My Reservations** - View and manage personal reservations
- **Notifications** - Receive updates on reservation status
- **Profile Management** - Update personal information and avatar

### Admin Features
- **Dashboard** - Overview of system statistics
- **Manage Reservations** - Approve/reject reservation requests with document review
- **Manage Facilities** - CRUD operations for facilities
- **Manage Users** - View and manage user accounts
- **System Tokens** - Manage admin registration and password reset tokens

## 🛠️ Tech Stack

### Frontend (Client)
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern UI components
- **TanStack Query** - Data fetching and caching
- **NextAuth.js** - Authentication
- **React Hook Form + Zod** - Form handling and validation

### Backend (Server)
- **Node.js + Express** - REST API server
- **TypeScript** - Type-safe development
- **PostgreSQL** - Relational database
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

## 📁 Project Structure

```
academy_space/
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities and API client
│   └── public/            # Static assets
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── db/            # Database config and migrations
│   │   ├── middlewares/   # Express middlewares
│   │   ├── repositories/  # Data access layer
│   │   ├── routes/        # API routes
│   │   ├── schemas/       # Zod validation schemas
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helper functions
│   └── uploads/           # Uploaded files
└── package.json           # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/academy-space.git
   cd academy-space
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

3. **Setup environment variables**
   ```bash
   # Server
   cp server/.env.example server/.env
   # Edit server/.env with your database credentials

   # Client
   cp client/.env.example client/.env
   # Edit client/.env with your configuration
   ```

4. **Setup database**
   ```bash
   # Create database
   createdb academy_space

   # Run schema
   psql -d academy_space -f server/src/db/schema.sql

   # Seed data
   cd server && npm run seed
   ```

5. **Start development servers**
   ```bash
   # From root directory
   cd .. && npm run server  # Terminal 1
   npm run client           # Terminal 2
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | rahasia | Admin |
| john_user | user123 | User |

## 🌐 Deployment

### Backend (Railway/Render/Heroku)
1. Set environment variables
2. Deploy the `server` directory
3. Run database migrations

### Frontend (Vercel)
1. Connect GitHub repository
2. Set root directory to `client`
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend URL
   - `NEXTAUTH_URL` - Your frontend URL
   - `NEXTAUTH_SECRET` - Generate a secure secret

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Facilities
- `GET /api/facilities` - List all facilities
- `GET /api/facilities/:id` - Get facility details
- `POST /api/facilities` - Create facility (admin)
- `PUT /api/facilities/:id` - Update facility (admin)
- `DELETE /api/facilities/:id` - Delete facility (admin)

### Reservations
- `GET /api/reservations` - List reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id/status` - Update status (admin)

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributors

- Muhammad Ragil - Developer
