import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const LectureViewer = () => {
  const { courseId, lectureId } = useParams();
  const { user } = useAuth();
  const [lecture, setLecture] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    fetchLecture();
  }, [lectureId]);

  const fetchLecture = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lectures/${lectureId}`);
      const { lecture: lectureData, progress: progressData } = response.data.data;
      
      setLecture(lectureData);
      setProgress(progressData);
      
      // Initialize quiz answers if it's a quiz
      if (lectureData.type === 'quiz' && lectureData.questions) {
        setQuizAnswers(new Array(lectureData.questions.length).fill(null));
      }
    } catch (error) {
      setError('Failed to fetch lecture');
      console.error('Error fetching lecture:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadingComplete = async () => {
    try {
      const response = await api.post(`/lectures/${lectureId}/complete`);
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
      const response = await api.post(`/lectures/${lectureId}/quiz/submit`, {
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
            className="text-blue-600 hover:underline"
          >
            ← Back to Course
          </Link>
        </div>

        {/* Lecture Header */}
        <div className="card mb-6">
          <div className="card-header">
            <h1 className="card-title text-2xl">{lecture.title}</h1>
            <p className="text-gray-600 capitalize">
              {lecture.type} Lecture
            </p>
          </div>
        </div>

        {/* Reading Lecture */}
        {lecture.type === 'reading' && (
          <div className="card mb-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">
                {lecture.content}
              </div>
            </div>
            
            {!progress?.isCompleted && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleReadingComplete}
                  className="btn btn-success"
                >
                  Mark as Complete
                </button>
              </div>
            )}
            
            {progress?.isCompleted && (
              <div className="mt-6 text-center">
                <div className="alert alert-success">
                  ✓ This lecture has been completed!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Lecture */}
        {lecture.type === 'quiz' && (
          <div className="card mb-6">
            {!quizResult ? (
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
            ) : (
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
            )}
          </div>
        )}

        {/* Progress Info */}
        {progress && (
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
