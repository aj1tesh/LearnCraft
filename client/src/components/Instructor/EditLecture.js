import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EditLecture = () => {
  const { courseId, lectureId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    type: 'reading',
    content: '',
    order: 0
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lecture, setLecture] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchLecture();
  }, [lectureId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLecture = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${courseId}`);
      const course = response.data.data.course;
      const lectureData = course.lectures.find(l => l.id === parseInt(lectureId));
      
      if (!lectureData) {
        setError('Lecture not found');
        return;
      }
      
      setLecture(lectureData);
      setFormData({
        title: lectureData.title,
        type: lectureData.type,
        content: lectureData.content || '',
        order: lectureData.order
      });
      
      // If it's a quiz, load questions
      if (lectureData.type === 'quiz' && lectureData.questions) {
        setQuestions(lectureData.questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer
        })));
      }
    } catch (error) {
      setError('Failed to fetch lecture');
      console.error('Error fetching lecture:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      options: ['', ''],
      correctAnswer: 0
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    if (newQuestions[questionIndex].correctAnswer >= optionIndex) {
      newQuestions[questionIndex].correctAnswer = Math.max(0, newQuestions[questionIndex].correctAnswer - 1);
    }
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update lecture basic info
      await api.put(`/lectures/${lectureId}`, {
        title: formData.title,
        content: formData.content
      });

      // If it's a quiz, update questions
      if (formData.type === 'quiz' && questions.length > 0) {
        await api.put(`/lectures/${lectureId}/questions`, {
          questions: questions
        });
      }

      // Show success message and navigate back
      alert('Lecture updated successfully!');
      navigate(`/courses/${courseId}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update lecture');
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Lecture</h1>
          <p className="text-gray-600">Modify your lecture content</p>
        </div>

        <div className="card">
          {error && (
            <div className="alert alert-error mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Lecture Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter lecture title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type" className="form-label">
                  Lecture Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled
                >
                  <option value="reading">Reading</option>
                  <option value="quiz">Quiz</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">Lecture type cannot be changed after creation</p>
              </div>
            </div>

            {formData.type === 'reading' && (
              <div className="form-group">
                <label htmlFor="content" className="form-label">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Enter the lecture content"
                  rows="10"
                  required
                />
              </div>
            )}

            {formData.type === 'quiz' && (
              <div className="form-group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Quiz Questions</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="btn btn-primary btn-sm"
                  >
                    Add Question
                  </button>
                </div>

                {questions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No questions added yet. Click "Add Question" to get started.</p>
                  </div>
                )}

                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Question {questionIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="btn btn-danger btn-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Question Text</label>
                      <input
                        type="text"
                        value={question.questionText}
                        onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                        className="form-input"
                        placeholder="Enter the question"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Options</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            name={`correct-${questionIndex}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                            className="form-input flex-1"
                            placeholder={`Option ${optionIndex + 1}`}
                            required
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              className="btn btn-danger btn-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(questionIndex)}
                        className="btn btn-secondary btn-sm"
                      >
                        Add Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/courses/${courseId}`)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Lecture'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLecture;
