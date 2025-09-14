import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.data.course);
    } catch (error) {
      setError('Failed to fetch course details');
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid black',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fca5a5',
          borderRadius: '0.5rem'
        }}>
          {error || 'Course not found'}
        </div>
      </div>
    );
  }

  const isInstructor = user?.role === 'instructor' && user?.id === course.instructorId;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '4xl', margin: '0 auto' }}>
        {/* Course Header */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          marginBottom: '1.5rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '600', color: 'black', marginBottom: '0.5rem' }}>
              {course.title}
            </h1>
            <p style={{ color: '#6b7280' }}>
              by {course.instructor.firstName} {course.instructor.lastName}
            </p>
          </div>
          
          <p style={{ color: '#374151', marginBottom: '1rem' }}>{course.description}</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {course.lectures.length} lecture{course.lectures.length !== 1 ? 's' : ''}
            </div>
            
            {isInstructor && (
              <Link
                to={`/instructor/courses/${course.id}/lectures/new`}
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
                Add Lecture
              </Link>
            )}
          </div>
        </div>

        {/* Lectures List */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          padding: '1.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'black' }}>Course Lectures</h2>
          </div>
          
          {course.lectures.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: '#6b7280' }}>No lectures available yet.</p>
              {isInstructor && (
                <Link
                  to={`/instructor/courses/${course.id}/lectures/new`}
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
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
                  Add First Lecture
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {course.lectures.map((lecture, index) => (
                <div
                  key={lecture.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        backgroundColor: '#f3f4f6',
                        color: 'black',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 style={{ fontWeight: '500', color: 'black', marginBottom: '0.25rem' }}>
                          {lecture.title}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize' }}>
                          {lecture.type} Lecture
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {lecture.type === 'quiz' && (
                        <span style={{
                          fontSize: '0.75rem',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {lecture.questions?.length || 0} questions
                        </span>
                      )}
                      
                      {user?.role === 'student' ? (
                        <Link
                          to={`/courses/${course.id}/lectures/${lecture.id}`}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'black',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          Start Lecture
                        </Link>
                      ) : isInstructor ? (
                        <Link
                          to={`/instructor/courses/${course.id}/lectures/${lecture.id}/edit`}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'transparent',
                            color: 'black',
                            border: '1px solid black',
                            borderRadius: '0.25rem',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          Edit
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
