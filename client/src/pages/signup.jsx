import React, { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Typography,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Signup() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    userName: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [inputErrors, setInputErrors] = useState({});


  useEffect(() => {
    const { authenticated, role } = isAuthenticated();
    if (authenticated) {
      if (role === 'admin') {
        console.log("Into the check",role);
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [navigate]);
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      return { authenticated: true, role: decoded.role };
    }
    return { authenticated: false, role: null };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? (checked ? 'admin' : 'user') : value
    }));
  };

  const validateInputs = () => {
    const errors = {};
    if (!user.userName) errors.name = 'Name is required';
    if (!user.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      errors.email = 'Email is invalid';
    }
    if (!user.password) {
      errors.password = 'Password is required';
    } else if (user.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateInputs();
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return;
    }
    try {
      const res = await axios.post('http://localhost:3000/user', user);
      const { token } = res.data;
      localStorage.setItem('token', token);
      navigate('/home');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to sign up due to an unexpected error.');
      }
    }
  };

  return (
    <div style={{ background: 'linear-gradient(#89b5fe80, white)'}}>
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
      <Card sx={{ width: '100%', borderRadius: 2 ,padding:'10px 20px'}}>
        <CardContent>
          <Typography variant="h4" component="h2" align="center" sx={{ color: '#1769aa', mb: 2 }}>
            SIGN UP
          </Typography>
          {error && <Typography variant="body1" color="error" align="center">{error}</Typography>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="userName"
                  onChange={handleChange}
                  label="Name"
                  type="text"
                  variant="outlined"
                  value={user.userName}
                  error={Boolean(inputErrors.name)}
                  helperText={inputErrors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="email"
                  onChange={handleChange}
                  label="Email"
                  type="email"
                  variant="outlined"
                  value={user.email}
                  error={Boolean(inputErrors.email)}
                  helperText={inputErrors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="password"
                  onChange={handleChange}
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={user.password}
                  error={Boolean(inputErrors.password)}
                  helperText={inputErrors.password}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={handleChange}
                      name="role"
                      checked={user.role === 'admin'}
                      size="small" 
                    />
                  }
                  label="Admin"
                />
              </Grid>
              <Grid item xs={12} textAlign="center">
                <Link href="/" >Login?</Link>
              </Grid>
              <Grid item xs={12} textAlign="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  // sx={{ mt: 2 }}
                >
                  Signup
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

export default Signup;
