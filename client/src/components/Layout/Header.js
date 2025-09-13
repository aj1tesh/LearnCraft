import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            LearnCraft
          </Link>
          
          <nav className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/courses" className="text-gray-700 hover:text-blue-600">
                  Courses
                </Link>
                {user?.role === 'instructor' && (
                  <Link to="/instructor" className="text-gray-700 hover:text-blue-600">
                    Instructor Dashboard
                  </Link>
                )}
                {user?.role === 'student' && (
                  <Link to="/progress" className="text-gray-700 hover:text-blue-600">
                    My Progress
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.firstName} ({user?.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline btn-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
