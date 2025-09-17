import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LectureViewer = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lecture, setLecture] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLecture = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/lectures/${lectureId}`);
      const { lecture: lectureData, progress: progressData } = response.data.data;
      
      setLecture(lectureData);
      setProgress(progressData);
      
      if (lectureData.type === 'quiz' && lectureData.questions) {
        setQuizAnswers(new Array(lectureData.questions.length).fill(null));
      }
    } catch (error) {
      setError('Failed to fetch lecture');
      console.error('Error fetching lecture:', error);
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  useEffect(() => {
    fetchLecture();
  }, [fetchLecture]);

  const handleReadingComplete = async () => {
    try {
      const response = await api.post(`/api/lectures/${lectureId}/complete`);
      setProgress(response.data.data.progress);
    } catch (error) {
      console.error('Error completing lecture:', error);
    }
  };

  const handleQuizAnswerChange = (questionIndex, answerIndex) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    if (quizAnswers.some(answer => answer === null)) {
      alert('Please answer all questions before submitting.');
      return;
    }

    try {
      setSubmittingQuiz(true);
      const response = await api.post(`/api/lectures/${lectureId}/quiz/submit`, {
        answers: quizAnswers
      });
      
      const result = response.data.data;
      setQuizResult(result);
      setProgress(result.progress);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleDeleteLecture = async () => {
    if (!window.confirm('Are you sure you want to delete this lecture? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/api/lectures/${lectureId}`);
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Error deleting lecture:', error);
      alert('Failed to delete lecture. Please try again.');
    } finally {
      setDeleting(false);
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

  if (error || !lecture) {
    return (
      <div className="container">
        <div className="alert alert-error">
          {error || 'Lecture not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to={`/courses/${courseId}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#e5e7eb';
            }}
          >
            <span>←</span>
            Back to Course
          </Link>
        </div>

        {/* Lecture Header */}
        <div className="card mb-6">
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="card-title text-2xl">{lecture.title}</h1>
                <p className="text-gray-600 capitalize">
                  {lecture.type} Lecture
                  {user?.role === 'instructor' && (
                    <span style={{ 
                      marginLeft: '0.5rem', 
                      padding: '0.25rem 0.5rem', 
                      backgroundColor: '#fef3c7', 
                      color: '#92400e', 
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      Instructor View
                    </span>
                  )}
                </p>
              </div>
              {user?.role === 'instructor' && (
                <button
                  onClick={handleDeleteLecture}
                  disabled={deleting}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'white',
                    color: '#dc2626',
                    border: '1px solid #dc2626',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    opacity: deleting ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    if (!deleting) {
                      e.target.style.backgroundColor = '#fef2f2';
                      e.target.style.borderColor = '#b91c1c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!deleting) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#dc2626';
                    }
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete Lecture'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reading Lecture */}
        {lecture.type === 'reading' && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem'
          }}>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {lecture.content}
            </div>
            
            {user?.role === 'student' && !progress?.isCompleted && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button
                  onClick={handleReadingComplete}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'black',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Mark as Complete
                </button>
              </div>
            )}
            
            {user?.role === 'student' && progress?.isCompleted && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  borderRadius: '0.5rem'
                }}>
                  ✓ This lecture has been completed!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Document Lecture */}
        {lecture.type === 'text-document' && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem'
          }}>
            {lecture.description && (
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'black', marginBottom: '0.5rem' }}>
                  Description
                </h3>
                <p style={{ color: '#6b7280' }}>{lecture.description}</p>
              </div>
            )}
            
            {lecture.content && (
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'black', marginBottom: '0.5rem' }}>
                  Content
                </h3>
                <div style={{ whiteSpace: 'pre-wrap', color: '#374151' }}>
                  {lecture.content}
                </div>
              </div>
            )}

            {/* File Attachments */}
            {lecture.attachments && lecture.attachments.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'black', marginBottom: '0.5rem' }}>
                  Attachments
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {lecture.attachments.map((file, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.25rem',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1rem' }}>
                          {file.mimetype === 'application/pdf' ? '📄' : '🖼️'}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: 'black' }}>
                          {file.originalName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <a
                        href={`http://localhost:5000/uploads/${file.mimetype === 'application/pdf' ? 'pdfs' : 'images'}/${file.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'black',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        {file.mimetype === 'application/pdf' ? 'View PDF' : 'View Image'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {user?.role === 'student' && !progress?.isCompleted && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button
                  onClick={handleReadingComplete}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'black',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Mark as Complete
                </button>
              </div>
            )}
            
            {user?.role === 'student' && progress?.isCompleted && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  borderRadius: '0.5rem'
                }}>
                  ✓ This lecture has been completed!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Lecture */}
        {lecture.type === 'quiz' && (
          <div className="card mb-6">
            {user?.role === 'student' && !quizResult ? (
              <>
                <div className="space-y-6">
                  {lecture.questions?.map((question, questionIndex) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6">
                      <h3 className="font-medium text-gray-900 mb-4">
                        {questionIndex + 1}. {question.questionText}
                      </h3>
                      
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question-${questionIndex}`}
                              value={optionIndex}
                              checked={quizAnswers[questionIndex] === optionIndex}
                              onChange={() => handleQuizAnswerChange(questionIndex, optionIndex)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={handleQuizSubmit}
                    disabled={submittingQuiz || quizAnswers.some(answer => answer === null)}
                    className="btn btn-primary"
                  >
                    {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                </div>
              </>
            ) : user?.role === 'student' ? (
              <div className="text-center">
                <div className={`alert ${quizResult.passed ? 'alert-success' : 'alert-error'} mb-4`}>
                  <h3 className="font-bold text-lg">
                    {quizResult.passed ? 'Congratulations!' : 'Quiz Failed'}
                  </h3>
                  <p>
                    You scored {quizResult.score.toFixed(1)}% 
                    ({quizResult.correctAnswers}/{quizResult.totalQuestions} correct)
                  </p>
                  {quizResult.passed && (
                    <p className="mt-2">You passed! This lecture is now complete.</p>
                  )}
                  {!quizResult.passed && (
                    <p className="mt-2">You need at least 70% to pass. Try again!</p>
                  )}
                </div>
                
                {!quizResult.passed && (
                  <button
                    onClick={() => {
                      setQuizResult(null);
                      setQuizAnswers(new Array(lecture.questions.length).fill(null));
                    }}
                    className="btn btn-primary"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">Quiz questions for instructor review</p>
                <div className="space-y-4 mt-4">
                  {lecture.questions?.map((question, questionIndex) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {questionIndex + 1}. {question.questionText}
                      </h4>
                      <div className="space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                              optionIndex === question.correctAnswer 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {optionIndex === question.correctAnswer ? '✓' : '○'}
                            </span>
                            <span className={optionIndex === question.correctAnswer ? 'text-green-800 font-medium' : 'text-gray-700'}>
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Info */}
        {user?.role === 'student' && progress && (
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-2">Progress</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${progress.isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                  {progress.isCompleted ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              {lecture.type === 'quiz' && progress.quizScore !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Score:</span>
                  <span className="text-sm font-medium">{progress.quizScore.toFixed(1)}%</span>
                </div>
              )}
              
              {lecture.type === 'quiz' && progress.quizAttempts > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Attempts:</span>
                  <span className="text-sm font-medium">{progress.quizAttempts}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureViewer;
