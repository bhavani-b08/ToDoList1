# To-Do List Management Web Application

This project is a part of a hackathon run by https://www.katomaran.com

## 🎯 Overview

A full-stack To-Do List Management Web Application built for Katomaran Software Company's hackathon. Features real-time task management, Google OAuth authentication, task sharing, and responsive design.

## 🔧 Tech Stack

- **Frontend**: React.js (responsive for desktop + mobile)
- **Backend**: Node.js with Express (RESTful API)
- **Database**: MongoDB Atlas (cloud)
- **Authentication**: Google OAuth 2.0
- **Real-time Updates**: WebSockets
- **Deployment**: Vercel (frontend), Render (backend), MongoDB Atlas (database)

## ✨ Features

- 🔐 Social login with Google OAuth 2.0
- 📋 Task dashboard with filtering and sorting
- ✏️ Create, edit, and delete tasks
- ✅ Mark tasks as complete or in progress
- 👥 Share tasks with other users by email
- 🔄 Real-time updates across all connected clients
- 📱 Mobile-responsive design
- 🚨 Toast notifications for all actions
- 🔒 Input validation and error handling
- 📄 Pagination support
- ⚡ Rate limiting on APIs

## 🏗️ Architecture

```
├── client/          # React frontend (port 3000)
├── server/          # Express backend (port 5000)
├── shared/          # Common utilities and types
└── docs/           # Documentation and diagrams
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in both client and server directories:
   
   **client/.env**
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```
   
   **server/.env**
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   # Start backend server (port 5000)
   cd server
   npm run dev
   
   # Start frontend (port 3000) - in new terminal
   cd client
   npm start
   ```

## 📁 Project Structure

```
client/
├── public/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API service functions
│   ├── utils/         # Helper functions
│   └── App.js         # Main app component
└── package.json

server/
├── controllers/       # Request handlers
├── middleware/        # Express middleware
├── models/           # MongoDB schemas
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Helper functions
├── config/           # Configuration files
└── package.json

shared/
└── types/            # TypeScript type definitions
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get user tasks (with pagination)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/share` - Share task with users

### Users
- `GET /api/users/search` - Search users by email

## 🎥 Demo

[Loom Video Link] - Coming soon

## 🌐 Live Links

- **Frontend**: [Vercel Deployment] - Coming soon
- **Backend**: [Render Deployment] - Coming soon

## 🤝 Contributing

This project was built for the Katomaran Software Company hackathon. For contribution guidelines, please refer to the hackathon documentation.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for Katomaran Software Company Hackathon