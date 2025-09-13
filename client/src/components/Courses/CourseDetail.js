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
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container">
        <div className="alert alert-error">
          {error || 'Course not found'}
        </div>
      </div>
    );
  }

  const isInstructor = user?.role === 'instructor' && user?.id === course.instructorId;

  return (
    <div className="container">
      <div className="max-w-4xl mx-auto">
        {/* Course Header */}
        <div className="card mb-6">
          <div className="card-header">
            <h1 className="card-title text-3xl">{course.title}</h1>
            <p className="text-gray-600 mt-2">
              by {course.instructor.firstName} {course.instructor.lastName}
            </p>
          </div>
          
          <p className="text-gray-700 mb-4">{course.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {course.lectures.length} lecture{course.lectures.length !== 1 ? 's' : ''}
            </div>
            
            {isInstructor && (
              <Link
                to={`/instructor/courses/${course.id}/lectures/new`}
                className="btn btn-primary"
              >
                Add Lecture
              </Link>
            )}
          </div>
        </div>

        {/* Lectures List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Course Lectures</h2>
          </div>
          
          {course.lectures.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No lectures available yet.</p>
              {isInstructor && (
                <Link
                  to={`/instructor/courses/${course.id}/lectures/new`}
                  className="btn btn-primary mt-4"
                >
                  Add First Lecture
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {course.lectures.map((lecture, index) => (
                <div
                  key={lecture.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {lecture.title}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {lecture.type} Lecture
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {lecture.type === 'quiz' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {lecture.questions?.length || 0} questions
                        </span>
                      )}
                      
                      {user?.role === 'student' ? (
                        <Link
                          to={`/courses/${course.id}/lectures/${lecture.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Start Lecture
                        </Link>
                      ) : isInstructor ? (
                        <Link
                          to={`/instructor/courses/${course.id}/lectures/${lecture.id}/edit`}
                          className="btn btn-secondary btn-sm"
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
