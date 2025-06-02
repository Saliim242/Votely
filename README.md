### Project Overview

Votely Backend is a robust backend system designed for a voting platform. Built with Node.js, Express, and MongoDB, it offers secure user authentication, role-based access control, and real-time vote updates using Socket.IO. The system supports OTP verification for secure actions and audit logging for critical operations. File uploads are managed for user profiles and candidate information.

## Features

- User authentication and authorization with JWT
- Role-based access control
- Election management
- Candidate registration
- Secure voting system
- Real-time vote updates with Socket.IO
- OTP verification for secure actions
- Audit logging for all critical operations
- File uploads for user profiles and candidate information

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Socket.IO** - Real-time updates
- **Multer** - File uploads
- **Nodemailer** - Email notifications
- **Express Validator** - Input validation

## Project Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── controller.js
│   │   ├── model.js
│   │   └── route.js
│   ├── users/
│   │   ├── controller.js
│   │   ├── model.js
│   │   └── route.js
│   ├── elections/
│   │   ├── controller.js
│   │   ├── model.js
│   │   └── route.js
│   ├── candidates/
│   │   ├── controller.js
│   │   ├── model.js
│   │   └── route.js
│   ├── votes/
│   │   ├── controller.js
│   │   ├── model.js
│   │   └── route.js
│   ├── auditLogs/
│   │   ├── controller.js
│   │   ├── model.js
│   │   └── route.js
│   ├── otps/
│   │   ├── controller.js
│   │   ├── model.js
│   │   └── route.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── errorHandler.js
│   │   └── uploadMiddleware.js
│   ├── utils/
│   │   ├── otpGenerator.js
│   │   ├── emailService.js
│   │   └── fileHelper.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   ├── electionValidator.js
│   │   ├── candidateValidator.js
│   │   └── voteValidator.js
│   ├── config/
│   │   └── db.js
│   └── server.js
├── uploads/
│   ├── users/
│   ├── elections/
│   └── candidates/
├── .env
├── .gitignore
├── README.md
├── package.json
└── pnpm-lock.yaml
```

## Endpoints

### Auth Endpoints

- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/verify-email` - Verify email with OTP
- **POST** `/api/auth/resend-otp` - Resend OTP
- **POST** `/api/auth/forgot-password` - Send OTP for password reset
- **POST** `/api/auth/reset-password` - Reset password with OTP
- **POST** `/api/auth/change-password` - Change password
- **POST** `/api/auth/logout` - Logout user

### User Endpoints

- **GET** `/api/users/me` - Get current user profile
- **GET** `/api/users` - Get all users (Admin only)
- **GET** `/api/users/:id` - Get user by ID (Admin only)
- **PUT** `/api/users/:id` - Update user (Admin only)
- **DELETE** `/api/users/:id` - Delete user (Admin only)

### OTP Endpoints

- **POST** `/api/otps/generate` - Generate new OTP
- **POST** `/api/otps/verify` - Verify OTP

### Audit Log Endpoints

- **GET** `/api/audit-logs` - Get all audit logs (Admin only)
- **GET** `/api/audit-logs/user/:userId` - Get audit logs for a specific user (Admin only)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- pnpm (recommended) or npm

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/Saliim242/Votely.git
   cd votely
   ```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- pnpm (recommended) or npm

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/Saliim242/Votely.git
   cd votely
   ```

2. Install dependencies

   ```bash
   pnpm install
   # or
   npm install
   ```

3. Configure environment variables

   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

4. Start the development server
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

### API Documentation

API documentation will be available at `/api-docs` when the server is running.

## License

This project is licensed under the ISC License.
