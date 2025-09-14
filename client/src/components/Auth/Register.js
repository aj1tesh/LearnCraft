import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  
  const { register, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const role = searchParams.get('role');
    if (role && (role === 'student' || role === 'instructor')) {
      setSelectedRole(role);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const { confirmPassword, ...userData } = formData;
    const userDataWithRole = { ...userData, role: selectedRole };
    const result = await register(userDataWithRole);
    
    if (result.success) {
      // The AuthContext will handle the redirect based on user role
      // No need to navigate manually here
    }
    
    setLoading(false);
  };

  // Show role selection if no role is selected
  if (!selectedRole) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        backgroundColor: 'white',
        overflow: 'hidden'
      }}>
        {/* Student Half */}
        <div className="register-half">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: 'black', 
              marginBottom: '2rem' 
            }}>
              Student
            </h2>
            <button
              onClick={() => handleRoleSelect('student')}
              style={{
                width: '200px',
                backgroundColor: 'black',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Join as Student
            </button>
          </div>
        </div>

        {/* Instructor Half */}
        <div className="register-half">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: 'black', 
              marginBottom: '2rem' 
            }}>
              Instructor
            </h2>
            <button
              onClick={() => handleRoleSelect('instructor')}
              style={{
                width: '200px',
                backgroundColor: 'black',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Join as Instructor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Join LearnCraft</h1>
          <p className="text-gray-600 mt-2">Create your account as {selectedRole === 'student' ? 'Student' : 'Instructor'}</p>
          <button
            onClick={() => setSelectedRole(null)}
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            ← Choose different role
          </button>
        </div>
        
        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.password}
              </p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              required
            />
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full py-3 text-lg font-semibold"
            disabled={loading}
            style={{ backgroundColor: 'black', color: 'white', border: 'none' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
