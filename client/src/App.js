import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CourseList from './components/Courses/CourseList';
import CourseDetail from './components/Courses/CourseDetail';
import LectureViewer from './components/Lectures/LectureViewer';
import InstructorDashboard from './components/Instructor/InstructorDashboard';
import CreateCourse from './components/Instructor/CreateCourse';
import CreateLecture from './components/Instructor/CreateLecture';
import ProgressView from './components/Progress/ProgressView';

// Route protection wrapper
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

// Redirect authenticated users away from auth pages
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
    // Role-based redirect
    if (user?.role === 'instructor') {
      return <Navigate to="/instructor" replace />;
    } else {
      return <Navigate to="/courses" replace />;
    }
  }

  return children;
};

// Landing page component
const Home = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="landing-page">
        <div className="landing-content">
          <h1 className="landing-title">
            Welcome to LearnCraft
          </h1>
          <p className="landing-subtitle">
            Your gateway to online learning
          </p>
          
          <div className="landing-buttons">
            <a 
              href="/register" 
              className="btn btn-primary px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ backgroundColor: 'black', color: 'white', border: 'none', width: '200px' }}
            >
              Start Learning
            </a>
            <a 
              href="/login" 
              className="btn btn-outline px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ backgroundColor: 'white', color: 'black', borderColor: 'black', width: '200px' }}
            >
              Sign In
            </a>
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
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                <ProtectedRoute>
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

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
