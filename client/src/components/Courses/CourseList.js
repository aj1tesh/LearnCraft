import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses');
      setCourses(response.data.data.courses);
    } catch (error) {
      setError('Failed to fetch courses');
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
    <div className="container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Courses</h1>
        <p className="text-gray-600">Browse and enroll in courses to start learning</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No courses available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-header">
                <h3 className="card-title">{course.title}</h3>
                <p className="text-sm text-gray-500">
                  by {course.instructor.firstName} {course.instructor.lastName}
                </p>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {course.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {course.lectures.length} lecture{course.lectures.length !== 1 ? 's' : ''}
                </div>
                <Link
                  to={`/courses/${course.id}`}
                  className="btn btn-primary btn-sm"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
