import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateLecture = () => {
  const { courseId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    type: 'text-document',
    content: '',
    description: '',
    order: 0
  });
  const [questions, setQuestions] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lectureCreated, setLectureCreated] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourseInfo();
  }, [courseId]);

  const fetchCourseInfo = async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      const course = response.data.data.course;
      setFormData(prev => ({
        ...prev,
        order: course.lectures.length
      }));
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) {
      return;
    }
    
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== selectedFiles.length) {
      setError('Please select only PDF or image files under 10MB');
      return;
    }
    
    setFiles(prev => [...prev, ...validFiles]);
    
    // Reset the file input to allow selecting the same file again
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
    // Adjust correct answer if necessary
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
      // Validate form based on type
      if (formData.type === 'quiz' && questions.length === 0) {
        setError('Please add at least one question for the quiz');
        setLoading(false);
        return;
      }

      // Validate quiz questions
      if (formData.type === 'quiz' && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          if (!question.questionText.trim()) {
            setError(`Please enter a question for question ${i + 1}`);
            setLoading(false);
            return;
          }
          if (question.options.length < 2) {
            setError(`Question ${i + 1} must have at least 2 options`);
            setLoading(false);
            return;
          }
          if (question.options.some(opt => !opt.trim())) {
            setError(`Question ${i + 1} has empty options. Please fill in all options.`);
            setLoading(false);
            return;
          }
          if (question.correctAnswer === undefined || question.correctAnswer === null) {
            setError(`Please select the correct answer for question ${i + 1}`);
            setLoading(false);
            return;
          }
        }
      }

      if (formData.type === 'text-document' && !formData.content.trim() && files.length === 0) {
        setError('Please provide either text content or upload files');
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('type', formData.type);
      submitData.append('content', formData.content);
      submitData.append('description', formData.description);
      submitData.append('order', formData.order);

      // Add files if any
      files.forEach((file, index) => {
        submitData.append(`files`, file);
      });

      // Create lecture with file upload
      const lectureResponse = await api.post(`/courses/${courseId}/lectures`, submitData);
      
      const createdLecture = lectureResponse.data.data.lecture;
      setLectureCreated(true);

      // If it's a quiz, create questions
      if (formData.type === 'quiz' && questions.length > 0) {
        for (const question of questions) {
          if (question.questionText.trim() && question.options.some(opt => opt.trim())) {
            await api.post(`/courses/${courseId}/lectures/${createdLecture.id}/questions`, question);
          }
        }
      }

      // Navigate to course detail
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Lecture creation error:', error);
      setError(error.response?.data?.message || 'Failed to create lecture');
    } finally {
      setLoading(false);
    }
  };

  if (lectureCreated) {
    return (
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="alert alert-success mb-4">
              <h3 className="font-bold text-lg">Lecture Created Successfully!</h3>
              <p>Your lecture has been added to the course.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="btn btn-primary flex-1"
              >
                View Course
              </button>
              <button
                onClick={() => {
                  setLectureCreated(false);
                  setFormData({
                    title: '',
                    type: 'reading',
                    content: '',
                    order: formData.order + 1
                  });
                  setQuestions([]);
                }}
                className="btn btn-secondary flex-1"
              >
                Create Another Lecture
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '4xl', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'black', marginBottom: '0.5rem' }}>
            Create New Lecture
          </h1>
          <p style={{ color: '#6b7280' }}>Add a new lecture to your course</p>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          padding: '1.5rem',
          border: '1px solid #e5e7eb'
        }}>
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label htmlFor="title" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500', 
                  color: '#374151' 
                }}>
                  Lecture Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter lecture title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="type" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500', 
                  color: '#374151' 
                }}>
                  Lecture Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="text-document">Text Document</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
            </div>

            {/* Text Document Section */}
            {formData.type === 'text-document' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'black', marginBottom: '1rem' }}>
                  Text Document Content
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="description" style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '500', 
                    color: '#374151' 
                  }}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                    placeholder="Enter a description of the content"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="content" style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '500', 
                    color: '#374151' 
                  }}>
                    Text Content (Optional if uploading files)
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      minHeight: '150px',
                      resize: 'vertical'
                    }}
                    placeholder="Enter the lecture content or upload files below"
                  />
                </div>

                {/* File Upload Section */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '500', 
                    color: '#374151' 
                  }}>
                    Upload Files (PDF or Images)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px dashed #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: '#f9fafb',
                      cursor: 'pointer'
                    }}
                  />
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Supported formats: PDF, JPG, PNG, GIF (Max 10MB each)
                  </p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '500', color: 'black', marginBottom: '0.5rem' }}>
                      Selected Files:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {files.map((file, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '0.25rem',
                          border: '1px solid #e5e7eb'
                        }}>
                          <span style={{ fontSize: '0.875rem', color: 'black' }}>
                            {file.name} ({file.size ? (file.size / 1024).toFixed(2) : '0.00'} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: 'white',
                              color: '#ef4444',
                              border: '1px solid #ef4444',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quiz Section */}
            {formData.type === 'quiz' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '1rem' 
                }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'black' }}>
                    Quiz Questions
                  </h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'black',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Add Question
                  </button>
                </div>

                {/* Instructions */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '0.5rem' 
                  }}>
                    Quiz Creation Instructions
                  </h4>
                  <ul style={{ 
                    fontSize: '0.875rem', 
                    color: '#374151', 
                    margin: 0, 
                    paddingLeft: '1.25rem' 
                  }}>
                    <li>Enter your question text in the "Question Text" field</li>
                    <li>Add at least 2 answer options</li>
                    <li><strong>Click the radio button next to the correct answer</strong> - it will turn green</li>
                    <li>You can add more options using the "Add Option" button</li>
                    <li>Remove options using the "Remove" button (minimum 2 options required)</li>
                  </ul>
                </div>

                {questions.length === 0 && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <p>No questions added yet. Click "Add Question" to get started.</p>
                  </div>
                )}

                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: 'white'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      marginBottom: '1rem' 
                    }}>
                      <h4 style={{ fontWeight: '500', color: 'black' }}>Question {questionIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'white',
                          color: '#ef4444',
                          border: '1px solid #ef4444',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500', 
                        color: '#374151' 
                      }}>
                        Question Text
                      </label>
                      <input
                        type="text"
                        value={question.questionText}
                        onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter the question"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500', 
                        color: '#374151' 
                      }}>
                        Answer Options (Click the radio button to mark the correct answer)
                      </label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem', 
                          marginBottom: '0.5rem',
                          padding: '0.75rem',
                          border: question.correctAnswer === optionIndex ? '2px solid #10b981' : '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          backgroundColor: question.correctAnswer === optionIndex ? '#f0fdf4' : 'white',
                          transition: 'all 0.2s ease'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                              style={{ width: '1.25rem', height: '1.25rem', accentColor: '#10b981' }}
                            />
                            <span style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: '500',
                              color: question.correctAnswer === optionIndex ? '#10b981' : '#6b7280'
                            }}>
                              {question.correctAnswer === optionIndex ? 'Correct Answer' : 'Option'}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '0.75rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.5rem',
                              fontSize: '1rem',
                              backgroundColor: 'white'
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                            required
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: 'white',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '0.25rem',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(questionIndex)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'transparent',
                          color: 'black',
                          border: '1px solid black',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Add Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => navigate(`/courses/${courseId}`)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: 'black',
                  border: '1px solid black',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'black',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
                disabled={loading || (formData.type === 'quiz' && questions.length === 0)}
              >
                {loading ? 'Creating...' : 'Create Lecture'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
