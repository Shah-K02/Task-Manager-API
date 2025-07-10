# 🚀 Task Manager API

A **scalable REST API** for managing tasks, with secure JWT authentication, user-specific data, role-based access for admins, and cloud deployment.

Built with **Node.js**, **Express**, and **MongoDB**.

---

## 📌 **Features**

- ✅ **User Registration & Login** with password hashing (bcrypt)
- ✅ **JWT Authentication** and protected routes
- ✅ **CRUD Operations** for tasks
- ✅ **User Ownership** — each user manages their own tasks
- ✅ **Admin Role** — view all tasks
- ✅ **Error Handling** and basic logging
- ✅ **Cloud Deployment** (AWS EC2 / Heroku)
- ✅ **API Documentation** with example requests

---

## ⚙️ **Tech Stack**

| Layer           | Tech                        |
|-----------------|----------------------------|
| **Backend**     | Node.js, Express           |
| **Database**    | MongoDB, Mongoose          |
| **Auth**        | JWT, bcrypt                |
| **Deployment**  | AWS EC2, Heroku            |
| **Testing**     | Postman                    |
| **Version Control** | Git, GitHub             |

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/task-manager-api.git
   cd task-manager-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

4. **Start MongoDB**
   - **Local**: Make sure MongoDB is running on your machine
   - **Atlas**: Use the connection string from MongoDB Atlas

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🌐 API Endpoints

### 🔑 Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### 🗃️  Tasks
- `GET /api/tasks` - Get all tasks for authenticated user
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats/summary` - Get task statistics

### 👑 Admin (Admin Only)
- `GET /api/admin/tasks` - Get all tasks (all users)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system statistics
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `DELETE /api/admin/tasks/:id` - Delete any task

## 📝 API Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project",
    "description": "Finish the task manager API",
    "priority": "high",
    "dueDate": "2024-12-31"
  }'
```

### Get Tasks
```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 API Documentation with Swagger UI
The API is fully documented using Swagger (OpenAPI) annotations directly in the route files.

You can access the interactive API docs at:

```bash
Copy
Edit
http://localhost:3000/api-docs
```
This documentation provides detailed information on all endpoints, including request bodies, parameters, and response formats.

Use the Swagger UI to explore and test the API interactively.

To add or update the documentation, modify the JSDoc-style Swagger annotations in the respective route files (for example: `routes/tasks.js`, `routes/auth.js`).

## 🗂️ Project Structure

```
task-manager-api/
├── controllers/          # Route handlers (future expansion)
├── models/              # Database models
│   ├── User.js         # User model
│   └── Task.js         # Task model
├── routes/              # API routes
│   ├── auth.js         # Authentication routes
│   ├── tasks.js        # Task routes
│   └── admin.js        # Admin routes
├── middleware/          # Custom middleware
│   ├── auth.js         # Authentication middleware
│   └── errorHandler.js # Error handling middleware
├── config/              # Configuration files
│   └── database.js     # Database configuration
├── .env                 # Environment variables
├── .gitignore          # Git ignore file
├── server.js           # Application entry point
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🎭 User Roles

- **User**: Can manage their own tasks
- **Admin**: Can view all tasks and manage users

## 📊 Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  title: String (required),
  description: String,
  status: String (enum: ['pending', 'in-progress', 'completed', 'cancelled']),
  priority: String (enum: ['low', 'medium', 'high']),
  dueDate: Date,
  owner: ObjectId (ref: User),
  tags: [String],
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

Test the API using Postman, curl, or any HTTP client:

1. **Health Check**: `GET /health`
2. **Register a user**: `POST /api/auth/register`
3. **Login**: `POST /api/auth/login`
4. **Create tasks**: `POST /api/tasks`
5. **Get tasks**: `GET /api/tasks`

## 🚀 Deployment

### Using Heroku
1. Create a Heroku app
2. Set environment variables in Heroku
3. Deploy using Git:
   ```bash
   git push heroku main
   ```

### Using AWS EC2
1. Launch an EC2 instance
2. Install Node.js and MongoDB
3. Clone your repository
4. Set up environment variables
5. Use PM2 for process management
6. Configure nginx as reverse proxy

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Error handling without exposing sensitive data
- Security headers with Helmet
- CORS configuration

## 🌟 Future Enhancements

| Feature                        | Status   |
|---------------------------------|----------|
|Email Verification          | Planned  |
|Password Reset              | Planned  |
|Task Categories & Labels    | Planned  |
|File Attachments            | Planned  |
|Task Sharing                | Planned  |
|Real-Time Notifications     | Planned  |
|Comments & Activity Log     | Planned  |
|Advanced Search & Filtering | Planned  |
|API Rate Limiting           | Planned  |
|Comprehensive Unit Tests    | Planned  |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Node.js and Express
