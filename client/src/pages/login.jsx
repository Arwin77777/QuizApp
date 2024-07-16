import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
  Link,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrected import statement

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:3000/login', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);

      // Decode token to get the role
      const decodedToken = jwtDecode(token);
      if (decodedToken.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        switch (err.response.data.message) {
          case 'Invalid email or password':
            setError('Invalid email or password.');
            break;
          case 'Table not found':
            setError('Internal server error. Please try again later.');
            break;
          case 'Throughput limit exceeded, please try again later':
            setError('Service is currently overloaded. Please try again later.');
            break;
          case 'Internal server error, please try again later':
            setError('Internal server error. Please try again later.');
            break;
          case 'Service is currently unavailable, please try again later':
            setError('Service is currently unavailable. Please try again later.');
            break;
          default:
            setError('An unknown error occurred. Please try again.');
        }
      } else {
        setError('Failed to login. Please try again.');
      }
    }
  };

  return (
    <div style={{ background: 'linear-gradient(#89b5fe80, white)' }}>
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Card sx={{ width: '100%', borderRadius: 2, padding: '10px 20px' }}>
          <CardContent>
            <Typography variant="h4" component="h2" align="center" sx={{ color: '#1769aa', mb: 2 }}>
              LOG IN
            </Typography>
            {error && <Typography variant="body1" color="error" align="center">{error}</Typography>}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    onChange={(e) => setEmail(e.target.value)}
                    label="Email address"
                    type="email"
                    variant="outlined"
                    value={email}
                    error={Boolean(error)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    onChange={(e) => setPassword(e.target.value)}
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={password}
                    error={Boolean(error)}
                  />
                </Grid>
                <Grid item xs={12} textAlign="center">
                  <Link href="/signup">Sign Up?</Link>
                </Grid>
                <Grid item xs={12} textAlign="center">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Login
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}

export default Login;
