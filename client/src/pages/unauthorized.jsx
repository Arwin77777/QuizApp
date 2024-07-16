import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';

const Unauthorized = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prevTime => prevTime - 1);
    }, 1000);

    const timer = setTimeout(() => {
      navigate('/home');
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Paper elevation={3} sx={{ padding: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Unauthorized
        </Typography>
        <Typography variant="body1" gutterBottom>
          You do not have permission to access this page.
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Redirecting to home in {time} seconds...
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/home')} sx={{ marginTop: 2 }}>
          Go to Home Now
        </Button>
      </Paper>
    </Container>
  );
}

export default Unauthorized;
