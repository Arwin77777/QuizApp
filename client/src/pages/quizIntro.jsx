import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { Box, Container, Button, Grid, Paper } from '@mui/material';

const QuizIntro = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [timer, setTimer] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { quizId, quizName, category, quizImage,noQuestions } = location.state || {};

  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    let timeout;
    if (timer && countdown > 0) {
      timeout = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      navigate(`/takeQuiz/${quizId}`);
    }
    return () => clearTimeout(timeout);
  }, [timer, countdown, navigate, quizId]);

  const startQuiz = () => {
    setTimer(true);
  };

  const cancelTimer = () => {
    setTimer(false);
    setCountdown(5);
  };

  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: { xs: 'auto', md: '400px' },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <img src={quizImage} alt={quizName} style={{ width: '100%', height: 'auto' }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ padding: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {quizName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Category: {category}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Number of Questions: {noQuestions}
              </Typography>
              <Typography variant="body1" paragraph>
                Get ready to test your knowledge with this exciting quiz. Make sure you are prepared, as the quiz will start as soon as you click the "Start Quiz" button.
              </Typography>
              {!timer ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startQuiz}
                  sx={{
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                    marginTop: 2,
                  }}
                >
                  Start Quiz
                </Button>
              ) : (
                <Box sx={{ marginTop: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Quiz starts in: {countdown} seconds
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={cancelTimer}
                    sx={{
                      backgroundColor: '#d32f2f',
                      '&:hover': {
                        backgroundColor: '#c62828',
                      },
                      marginTop: 1,
                    }}
                  >
                    Cancel 
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default QuizIntro;
