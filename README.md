# LearnCraft - Learning Platform

A full-stack online learning platform built with Node.js, Express, React, and SQLite. This application allows instructors to create courses with reading materials and interactive quizzes, while students can browse courses, complete lectures, and track their learning progress.

## 🚀 Features

### For Instructors
- **User Registration & Authentication** - Secure JWT-based authentication
- **Course Management** - Create and manage courses with titles and descriptions
- **Lecture Creation** - Add two types of lectures:
  - **Reading Lectures** - Text-based content for learning materials
  - **Quiz Lectures** - Interactive multiple-choice questions with automatic grading
- **Question Management** - Create multiple-choice questions with correct answers
- **Student Progress Tracking** - View student completion and quiz scores

### For Students
- **Course Browsing** - View all available courses with descriptions
- **Sequential Learning** - Complete lectures in order
- **Interactive Quizzes** - Take quizzes with real-time grading (70% passing grade)
- **Progress Tracking** - Monitor completion status and quiz scores
- **Reading Materials** - Access text-based learning content

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **SQLite** - Lightweight, file-based database
- **Sequelize** - SQL ORM for database operations
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

### Frontend
- **React.js** - User interface library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Context API** - State management
- **CSS3** - Custom styling with utility classes

### Development Tools
- **Nodemon** - Auto-restart server during development
- **Concurrently** - Run multiple npm scripts simultaneously

## 📁 Project Structure

```
LearnCraft/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Auth/       # Authentication components
│   │   │   ├── Courses/    # Course-related components
│   │   │   ├── Lectures/   # Lecture viewing components
│   │   │   ├── Instructor/ # Instructor dashboard components
│   │   │   ├── Progress/   # Student progress components
│   │   │   └── Layout/     # Layout components
│   │   ├── context/        # React Context for state management
│   │   ├── services/       # API service layer
│   │   └── App.js         # Main application component
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── index.js          # Server entry point
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `firstName` - User's first name
- `lastName` - User's last name
- `role` - 'instructor' or 'student'

### Courses Table
- `id` - Primary key
- `title` - Course title
- `description` - Course description
- `instructorId` - Foreign key to Users table

### Lectures Table
- `id` - Primary key
- `title` - Lecture title
- `type` - 'reading' or 'quiz'
- `content` - Text content (for reading lectures)
- `order` - Lecture sequence number
- `courseId` - Foreign key to Courses table

### Quiz Questions Table
- `id` - Primary key
- `questionText` - The question text
- `options` - JSON array of answer options
- `correctAnswer` - Index of correct answer
- `lectureId` - Foreign key to Lectures table

### Student Progress Table
- `id` - Primary key
- `studentId` - Foreign key to Users table
- `lectureId` - Foreign key to Lectures table
- `isCompleted` - Boolean completion status
- `completedAt` - Timestamp of completion
- `quizScore` - Quiz score percentage
- `quizAttempts` - Number of quiz attempts

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LearnCraft
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp server/env.example server/.env
   
   # Edit server/.env with your configuration
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

### Running the Application

#### Development Mode (Recommended)
```bash
# Run both backend and frontend simultaneously
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

#### Manual Mode
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### Production Build
```bash
# Build the React app
npm run build

# Start production server
npm start
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Courses
- `GET /api/courses` - Get all courses (students)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create new course (instructors)
- `GET /api/courses/instructor/my-courses` - Get instructor's courses

### Lectures
- `GET /api/lectures/:lectureId` - Get lecture details (students)
- `PUT /api/lectures/:lectureId` - Update lecture (instructors)
- `PUT /api/lectures/:lectureId/questions` - Update quiz questions (instructors)
- `POST /api/lectures/:lectureId/complete` - Mark reading lecture complete (students)
- `POST /api/lectures/:lectureId/quiz/submit` - Submit quiz (students)

### Progress
- `GET /api/progress` - Get student progress (students)
- `GET /api/progress/course/:courseId` - Get course progress (students)

## 🎯 Usage Guide

### For Instructors

1. **Register** as an instructor
2. **Create a course** with title and description
3. **Add lectures** to your course:
   - **Reading lectures**: Add text content for learning materials
   - **Quiz lectures**: Create multiple-choice questions with correct answers
4. **Manage your courses** from the instructor dashboard

### For Students

1. **Register** as a student
2. **Browse available courses** on the courses page
3. **View course details** and lecture list
4. **Complete lectures** in sequence:
   - **Reading lectures**: Mark as complete after reading
   - **Quiz lectures**: Answer questions and get immediate feedback
5. **Track your progress** on the progress page

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - express-validator for request validation
- **Rate Limiting** - Protection against brute force attacks
- **CORS Configuration** - Secure cross-origin requests
- **Helmet** - Security headers middleware
- **Role-based Authorization** - Different access levels for instructors and students

## 🧪 Testing

The application includes comprehensive error handling and validation:

- **Frontend validation** for forms and user input
- **Backend validation** for all API endpoints
- **Database constraints** for data integrity
- **Authentication checks** for protected routes
- **Role-based access control** for different user types

## 📊 Database Management

### Viewing Data
- **SQLite Browser**: Download from https://sqlitebrowser.org/
- **DBeaver**: Download from https://dbeaver.io/download/ (Recommended)
- **VS Code Extension**: Install "SQLite Viewer" extension

### Database File Location
The SQLite database file is located at: `server/database.sqlite`

## 🚀 Deployment

### Environment Variables for Production
```bash
PORT=5000
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=production
```

### Build for Production
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🎉 Features Implemented

✅ **User Management & Authentication**
- User registration with role selection (Instructor/Student)
- Secure login with JWT tokens
- Role-based authorization and access control

✅ **Instructor Functionality**
- Course creation with title and description
- Lecture management (Reading and Quiz types)
- Quiz creation with multiple-choice questions
- Real-time quiz grading system

✅ **Student Functionality**
- Course browsing and enrollment
- Sequential lecture viewing
- Progress tracking with completion status
- Interactive quiz taking with immediate feedback

✅ **Technical Requirements**
- RESTful API design with proper HTTP methods
- Well-designed database schema with relationships
- Secure authentication and authorization
- Clean, maintainable code with error handling
- Responsive user interface
- State management with React Context
- API integration with proper error handling

## 🔮 Future Enhancements

- File upload for lecture content (images, PDFs)
- Course search and filtering
- Email notifications
- Course categories and tags
- Student enrollment system
- Discussion forums
- Mobile app development
- Advanced analytics and reporting

---

**Built with ❤️ for LearnCraft - Craft Your Learning Journey**
