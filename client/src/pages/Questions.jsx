import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Typography, List, ListItem, ListItemButton, ListItemText, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Timer from '../components/timer';

const Questions = () => {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/quiz', {
      params: { quizId },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      setQuestions(res.data.questions);
    })
    .catch(err => console.log('Error:', err));
  }, [quizId, token]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isSubmitted) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSubmitted]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && openFeedbackDialog) {
        event.preventDefault();
        setOpenFeedbackDialog(true);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [openFeedbackDialog]);

  const handleOptionChange = (questionId, optionId) => {
    setAnswers(prevAnswers => {
      const questionAnswers = prevAnswers[questionId] || [];
      if (questionAnswers.includes(optionId)) {
        return {
          ...prevAnswers,
          [questionId]: questionAnswers.filter(id => id !== optionId)
        };
      } else {
        return {
          ...prevAnswers,
          [questionId]: [...questionAnswers, optionId]
        };
      }
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    setOpenConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    setOpenConfirmation(false);
    setOpenFeedbackDialog(true);
    setIsSubmitted(true);
  };

  const handleCancelSubmit = () => {
    setOpenConfirmation(false);
  };

  const handleSubmitFeedback = () => {
    const quizData = {
      quizId,
      questions
    };

    const userAnswers = Object.keys(answers).map(questionId => ({
      questionId,
      selectedOptionIds: answers[questionId]
    }));

    axios.post('http://localhost:3000/score', {
      quizData,
      answers: userAnswers,
      feedback,
      rating
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      console.log('Score and feedback submitted successfully:', res.data);
      console.log(quizData,userAnswers);
      navigate(`/thankyou/${quizId}`, { state: { scoreData: res.data } });
    })
    .catch(err => console.log('Error submitting score and feedback:', err));
  };

  const handleTimeUp = () => {
    setOpenConfirmation(false);
    setOpenFeedbackDialog(true);
    setIsSubmitted(true);
  };

  const isQuestionAnswered = (questionId) => {
    return answers[questionId] && answers[questionId].length > 0;
  };
  const handleTime = ()=>{
    const totalQuestions = questions.length;
    if(totalQuestions<=0)
    {
      console.log(totalQuestions);
      return 1;
    }
    return totalQuestions;
  } 

  return (
    <div style={{ width: '100%', padding: 0 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 2,
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
        }}
      >
        {questions.length > 0 && (
          <Timer initialMinutes={handleTime} onTimeUp={handleTimeUp} />
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitted}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          Submit Quiz
        </Button>
      </Box>
      <Container maxWidth="xl" sx={{ mt: 4, width: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={3}>
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                padding: 2,
                borderRadius: 2,
                boxShadow: 1,
                height: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Questions
              </Typography>
              <List>
                {questions.map((question, index) => (
                  <ListItem
                    key={index}
                    disablePadding
                    sx={{
                      border: currentQuestionIndex === index ? '2px solid #1976d2' : '1px solid #ddd',
                      backgroundColor: isQuestionAnswered(question.questionId) ? 'lightgreen' : 'white',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleJumpToQuestion(index)}
                      sx={{
                        backgroundColor: currentQuestionIndex === index ? '#e3f2fd' : 'transparent',
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                        },
                      }}
                    >
                      <ListItemText primary={`Question ${index + 1}`} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
          <Grid item xs={12} sm={8} md={9}>
            {questions.length > 0 && (
              <Box
                sx={{
                  padding: 2,
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  boxShadow: 1,
                  height: '100%',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Question {currentQuestionIndex + 1}:
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {questions[currentQuestionIndex].question}
                </Typography>
                <Box
                  sx={{
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  {questions[currentQuestionIndex].options.map(option => (
                    <Box
                      key={option.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Checkbox
                        checked={answers[questions[currentQuestionIndex].questionId]?.includes(option.id) || false}
                        onChange={() => !isSubmitted && handleOptionChange(questions[currentQuestionIndex].questionId, option.id)}
                        disabled={isSubmitted}
                      />
                      <Typography variant="body1">{option.value}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 || isSubmitted}
                    sx={{
                      backgroundColor: '#1976d2',
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      },
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1 || isSubmitted}
                    sx={{
                      backgroundColor: '#1976d2',
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      },
                    }}
                  >
                    Next
                  </Button>
                </Box>
                {currentQuestionIndex === questions.length - 1 && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
        <Dialog open={openConfirmation} onClose={() => setOpenConfirmation(false)}>
          <DialogTitle>Confirm Submission</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to submit your answers? Once Submitted you can't change the answers</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelSubmit} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }} variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={openFeedbackDialog} onClose={() => setOpenFeedbackDialog(true)}>
          <DialogTitle>Submit Your Feedback</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>How would you rate this quiz?</Typography>
            <Box sx={{ mb: 2 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    color: star <= rating ? 'gold' : 'gray',
                    fontSize: '24px',
                    marginRight: '5px'
                  }}
                >
                  ★
                </Button>
              ))}
            </Box>
            <Typography gutterBottom>Your Feedback:</Typography>
            <textarea
              rows="4"
              style={{ width: '100%', padding: '10px' }}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFeedbackDialog(true)} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }} variant="contained">
              Submit Feedback
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default Questions;
