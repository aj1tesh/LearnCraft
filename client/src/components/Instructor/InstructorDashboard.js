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
    <div className="container">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Instructor Dashboard</h1>
            <p className="text-gray-600">Manage your courses and lectures</p>
          </div>
          <Link to="/instructor/courses/new" className="btn btn-primary">
            Create New Course
          </Link>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            No courses yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first course to start teaching students
          </p>
          <Link to="/instructor/courses/new" className="btn btn-primary">
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-header">
                <h3 className="card-title">{course.title}</h3>
                <p className="text-sm text-gray-500">
                  Created {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {course.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                  {course.lectures.length} lecture{course.lectures.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link
                  to={`/courses/${course.id}`}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  View
                </Link>
                <Link
                  to={`/instructor/courses/${course.id}/lectures/new`}
                  className="btn btn-primary btn-sm flex-1"
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
