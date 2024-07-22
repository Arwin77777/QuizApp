import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Card, CardContent, CssBaseline, Grid, Box, Button, Paper } from '@mui/material';

const ThankYou = () => {
    const { quizId } = useParams();
    const token = localStorage.getItem('token');
    const [scoreData, setScoreData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScoreData = async () => {
            try {
                const res = await axios.get('http://localhost:3000/score', {
                    params: { quizId },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setScoreData(res.data);
            } catch (err) {
                console.log("Error fetching score data:", err);
            }
        };

        if (token && quizId) {
            fetchScoreData();
        }
    }, [token, quizId]);

    const handleHomeClick = () => {
        navigate('/home');
    };

    return (
        <React.Fragment>
            <CssBaseline />
            <Box sx={{
                bgcolor: '#f0f2f5',
                minHeight: '100vh',
                py: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Container maxWidth="lg">
                    <Paper sx={{
                        p: 4,
                        borderRadius: 3,
                        boxShadow: 5,
                        textAlign: 'center',
                        bgcolor: '#ffffff',
                        maxWidth: 'md',
                        mx: 'auto'
                    }}>
                        <Typography variant="h4" color="primary" gutterBottom>
                            Thank You!
                        </Typography>
                        <Typography variant="h6" color="textSecondary" paragraph>
                            "Thank you for participating in the quiz. Your performance insights are as follows:"
                        </Typography>
                        {scoreData.map((data, index) => (
                            <Grid container spacing={3} key={index} alignItems="center" justifyContent="center" sx={{ my: 2 }}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        bgcolor: '#e3f2fd',
                                        p: 3,
                                        borderRadius: 2,
                                        boxShadow: 3
                                    }}>
                                        <Typography variant="h6" color="textSecondary" gutterBottom>
                                            SCORE
                                        </Typography>
                                        <Typography variant="h2" color="primary" gutterBottom>
                                            {data.score.toFixed(2)}%
                                        </Typography>
                                        <Typography variant="h6" color={data.score >= 50 ? 'success.main' : 'error.main'}>
                                            {data.score >= 50 ? 'Great Job!' : 'Needs Improvement'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{
                                        p: 3,
                                        bgcolor: '#ffffff',
                                        borderRadius: 2,
                                        boxShadow: 3
                                    }}>
                                        <CardContent>
                                            <Typography variant="body1" gutterBottom>
                                                Attempted Questions: {data.attemptedQuestions}
                                            </Typography>
                                            <Typography variant="body1">
                                                Total Questions: {data.totalQuestions}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        ))}
                        <Box sx={{ mt: 4 }}>
                            <Button variant="contained" color="primary" onClick={handleHomeClick}>
                                Back to Home
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </React.Fragment>
    );
};

export default ThankYou;
