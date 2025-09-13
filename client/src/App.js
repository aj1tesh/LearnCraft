import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Course Components
import CourseList from './components/Courses/CourseList';
import CourseDetail from './components/Courses/CourseDetail';

// Lecture Components
import LectureViewer from './components/Lectures/LectureViewer';

// Instructor Components
import InstructorDashboard from './components/Instructor/InstructorDashboard';
import CreateCourse from './components/Instructor/CreateCourse';
import CreateLecture from './components/Instructor/CreateLecture';
import EditLecture from './components/Instructor/EditLecture';

// Progress Components
import ProgressView from './components/Progress/ProgressView';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.role === 'instructor') {
      return <Navigate to="/instructor" replace />;
    } else {
      return <Navigate to="/courses" replace />;
    }
  }

  return children;
};

// Home Component
const Home = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="text-center py-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to LearnCraft
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            An online learning platform where instructors can create courses and students can learn at their own pace.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/register" className="btn btn-primary btn-lg">
              Get Started
            </a>
            <a href="/login" className="btn btn-outline btn-lg">
              Login
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-4">For Students</h3>
            <p className="text-gray-600 mb-4">
              Browse courses, complete lectures, and track your learning progress.
            </p>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• Access to all available courses</li>
              <li>• Interactive reading and quiz lectures</li>
              <li>• Progress tracking and completion certificates</li>
              <li>• Real-time quiz grading</li>
            </ul>
          </div>

          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-4">For Instructors</h3>
            <p className="text-gray-600 mb-4">
              Create and manage courses with reading materials and interactive quizzes.
            </p>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• Create and manage courses</li>
              <li>• Add reading and quiz lectures</li>
              <li>• Design multiple-choice questions</li>
              <li>• Track student progress</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to appropriate dashboard
  if (user?.role === 'instructor') {
    return <Navigate to="/instructor" replace />;
  } else {
    return <Navigate to="/courses" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Protected Routes - Students */}
            <Route 
              path="/courses" 
              element={
                <ProtectedRoute>
                  <CourseList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:id" 
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:courseId/lectures/:lectureId" 
              element={
                <ProtectedRoute requiredRole="student">
                  <LectureViewer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/progress" 
              element={
                <ProtectedRoute requiredRole="student">
                  <ProgressView />
                </ProtectedRoute>
              } 
            />

            {/* Protected Routes - Instructors */}
            <Route 
              path="/instructor" 
              element={
                <ProtectedRoute requiredRole="instructor">
                  <InstructorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/courses/new" 
              element={
                <ProtectedRoute requiredRole="instructor">
                  <CreateCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/courses/:courseId/lectures/new" 
              element={
                <ProtectedRoute requiredRole="instructor">
                  <CreateLecture />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/courses/:courseId/lectures/:lectureId/edit" 
              element={
                <ProtectedRoute requiredRole="instructor">
                  <EditLecture />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
