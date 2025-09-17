import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ProgressView = () => {
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/progress');
      setProgressData(response.data.data.progressByCourse);
    } catch (error) {
      setError('Failed to fetch progress');
      console.error('Error fetching progress:', error);
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

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fca5a5',
          borderRadius: '0.5rem'
        }}>
          {error}
        </div>
      </div>
    );
  }

  const courses = progressData && typeof progressData === 'object' ? Object.values(progressData) : [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'black', marginBottom: '0.5rem' }}>
          My Learning Progress
        </h1>
        <p style={{ color: '#6b7280' }}>Track your progress across all courses</p>
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
            No progress yet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Start learning by enrolling in courses
          </p>
          <Link 
            to="/courses" 
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
            Browse Courses
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {courses.map((courseData) => {
            // Add safety checks for course data
            if (!courseData || !courseData.course || !Array.isArray(courseData.lectures)) {
              return null;
            }
            
            const { course, lectures, completedCount = 0, totalCount = 0 } = courseData;
            const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            
            return (
              <div key={course.id} style={{ 
                backgroundColor: 'white', 
                borderRadius: '0.5rem', 
                padding: '1.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'black', marginBottom: '0.25rem' }}>
                        {course.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {completedCount} of {totalCount} lectures completed
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'black' }}>
                        {percentage}%
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Complete</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.5rem' }}>
                    <div
                      style={{ 
                        backgroundColor: 'black', 
                        height: '0.5rem', 
                        borderRadius: '9999px',
                        width: `${percentage}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Lectures Progress */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {lectures.map((lecture) => {
                    // Add safety checks
                    if (!lecture || !lecture.progress) {
                      return null;
                    }
                    
                    const progress = lecture.progress;
                    
                    // Ensure progress has required properties with defaults
                    const isCompleted = progress.isCompleted || false;
                    const quizScore = progress.quizScore || null;
                    
                    return (
                      <div
                        key={lecture.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '1.5rem',
                            height: '1.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            backgroundColor: isCompleted ? '#f3f4f6' : '#f3f4f6',
                            color: isCompleted ? 'black' : '#6b7280'
                          }}>
                            {isCompleted ? '✓' : '○'}
                          </div>
                          <div>
                            <h4 style={{ fontWeight: '500', color: 'black', marginBottom: '0.125rem' }}>
                              {lecture.title}
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize' }}>
                              {lecture.type} Lecture
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {lecture.type === 'quiz' && quizScore !== null && (
                            <span style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              backgroundColor: quizScore >= 70 ? '#f3f4f6' : '#fee2e2',
                              color: quizScore >= 70 ? 'black' : '#991b1b'
                            }}>
                              {quizScore.toFixed(1)}%
                            </span>
                          )}
                          
                          {isCompleted ? (
                            <span style={{ fontSize: '0.875rem', color: 'black', fontWeight: '500' }}>
                              Completed
                            </span>
                          ) : (
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
                              Continue
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <Link
                    to={`/courses/${course.id}`}
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
                    View Course
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressView;
