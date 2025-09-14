import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses/instructor/my-courses');
      setCourses(response.data.data.courses);
    } catch (error) {
      setError('Failed to fetch your courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'black', marginBottom: '0.5rem' }}>
              Instructor Dashboard
            </h1>
            <p style={{ color: '#6b7280' }}>Manage your courses and lectures</p>
          </div>
          <Link 
            to="/instructor/courses/new" 
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'black',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Create New Course
          </Link>
        </div>
      </div>

      {courses.length === 0 ? (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          padding: '3rem', 
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: 'black', marginBottom: '1rem' }}>
            No courses yet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Create your first course to start teaching students
          </p>
          <Link 
            to="/instructor/courses/new" 
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'black',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {courses.map((course) => (
            <div key={course.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '0.5rem', 
              padding: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'black', marginBottom: '0.5rem' }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Created {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {course.description}
              </p>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {course.lectures.length} lecture{course.lectures.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  to={`/courses/${course.id}`}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    color: 'black',
                    border: '1px solid black',
                    borderRadius: '0.25rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textAlign: 'center'
                  }}
                >
                  View
                </Link>
                <Link
                  to={`/instructor/courses/${course.id}/lectures/new`}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    backgroundColor: 'black',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textAlign: 'center'
                  }}
                >
                  Add Lecture
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
