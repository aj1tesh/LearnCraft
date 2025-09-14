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
    <header style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb', 
      position: 'sticky', 
      top: 0, 
      zIndex: 50 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: 'black' 
              }}>
                LearnCraft
              </span>
            </Link>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/courses" 
                  style={{ 
                    color: 'black', 
                    textDecoration: 'none', 
                    fontWeight: '500',
                    padding: '0.5rem 1rem'
                  }}
                >
                  Courses
                </Link>
                {user?.role === 'instructor' && (
                  <Link 
                    to="/instructor" 
                    style={{ 
                      color: 'black', 
                      textDecoration: 'none', 
                      fontWeight: '500',
                      padding: '0.5rem 1rem'
                    }}
                  >
                    Dashboard
                  </Link>
                )}
                {user?.role === 'student' && (
                  <Link 
                    to="/progress" 
                    style={{ 
                      color: 'black', 
                      textDecoration: 'none', 
                      fontWeight: '500',
                      padding: '0.5rem 1rem'
                    }}
                  >
                    Progress
                  </Link>
                )}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  marginLeft: '1rem', 
                  paddingLeft: '1rem', 
                  borderLeft: '1px solid #e5e7eb' 
                }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    fontWeight: '500' 
                  }}>
                    {user?.firstName}
                  </span>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'transparent',
                      color: 'black',
                      border: '1px solid black',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link 
                  to="/login" 
                  style={{
                    padding: '0.5rem 1.5rem',
                    backgroundColor: 'white',
                    color: 'black',
                    border: '1px solid black',
                    borderRadius: '0.25rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  style={{
                    padding: '0.5rem 1.5rem',
                    backgroundColor: 'black',
                    color: 'white',
                    border: '1px solid black',
                    borderRadius: '0.25rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
