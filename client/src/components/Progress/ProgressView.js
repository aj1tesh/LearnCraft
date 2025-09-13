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
      const response = await api.get('/progress');
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

  const courses = Object.values(progressData);

  return (
    <div className="container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Progress</h1>
        <p className="text-gray-600">Track your progress across all courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            No progress yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start learning by enrolling in courses
          </p>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((courseData) => {
            const { course, lectures, completedCount, totalCount } = courseData;
            const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            
            return (
              <div key={course.id} className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="card-title">{course.title}</h3>
                      <p className="text-sm text-gray-500">
                        {completedCount} of {totalCount} lectures completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {percentage}%
                      </div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Lectures Progress */}
                <div className="space-y-2">
                  {lectures.map((lectureProgress) => {
                    const lecture = lectureProgress.lecture;
                    const progress = lectureProgress.progress;
                    
                    return (
                      <div
                        key={lecture.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            progress.isCompleted 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {progress.isCompleted ? '✓' : '○'}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {lecture.title}
                            </h4>
                            <p className="text-sm text-gray-500 capitalize">
                              {lecture.type} Lecture
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {lecture.type === 'quiz' && progress.quizScore !== null && (
                            <span className={`text-sm font-medium px-2 py-1 rounded ${
                              progress.quizScore >= 70 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {progress.quizScore.toFixed(1)}%
                            </span>
                          )}
                          
                          {progress.isCompleted ? (
                            <span className="text-sm text-green-600 font-medium">
                              Completed
                            </span>
                          ) : (
                            <Link
                              to={`/courses/${course.id}/lectures/${lecture.id}`}
                              className="btn btn-primary btn-sm"
                            >
                              Continue
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-center">
                  <Link
                    to={`/courses/${course.id}`}
                    className="btn btn-secondary"
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
