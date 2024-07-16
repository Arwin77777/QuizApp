import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddQuiz = () => {
    const [quizName, setQuizName] = useState('');
    const [category, setCategory] = useState('');
    const [quizImage, setQuizImage] = useState('');
    const [questions, setQuestions] = useState([]);
    const [errors, setErrors] = useState({});
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    const userId = decoded.userId;
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const navigate = useNavigate();

    const handleDialog = () => {
        const newErrors = {};

        if (!quizName) newErrors.quizName = 'Quiz Title is required';
        if (!category) newErrors.category = 'Quiz Category is required';
        if (!quizImage) newErrors.quizImage = 'Quiz Image is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            setOpenConfirmation(true);
        }
    };

    const handleCancelUpdate = () => {
        setOpenConfirmation(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:3000/quiz", { quizName, quizImage, category, userId, questions }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            console.log(res);
            navigate(`/quiz/${res.data}`);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Grid container spacing={2} style={{ justifyContent: 'center', alignContent: 'center', background: 'white', padding: '20px' }}>
            <Grid item xs={12}>
                <Typography variant="h6" style={{ color: '#1769aa' }}>CREATE QUIZ</Typography>
            </Grid>
            <Grid item xs={7}>
                <TextField
                    label="Quiz Title"
                    value={quizName}
                    onChange={(event) => setQuizName(event.target.value)}
                    fullWidth
                    error={!!errors.quizName}
                    helperText={errors.quizName}
                />
            </Grid>
            <Grid item xs={7}>
                <TextField
                    label="Quiz Category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    fullWidth
                    error={!!errors.category}
                    helperText={errors.category}
                />
            </Grid>
            <Grid item xs={7}>
                <TextField
                    label="Quiz Image"
                    value={quizImage}
                    onChange={(event) => setQuizImage(event.target.value)}
                    fullWidth
                    error={!!errors.quizImage}
                    helperText={errors.quizImage}
                />
            </Grid>
            <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handleDialog}>
                    Create Quiz
                </Button>
            </Grid>
            <Dialog open={openConfirmation} onClose={() => setOpenConfirmation(false)}>
                <DialogTitle>Confirm Update</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to add the quiz?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelUpdate} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }} variant="contained">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default AddQuiz;
