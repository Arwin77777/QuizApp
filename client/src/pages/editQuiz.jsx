import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Grid,
  IconButton,
  Pagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from 'jwt-decode';

const EditQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: [{ id: uuidv4(), value: '' }],
    correctOptionIds: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const token = localStorage.getItem('token');

  const decoded = jwtDecode(token);
  const role = decoded.role;

  const [isAdmin, setIsAdmin] = React.useState(role === 'admin');

  React.useEffect(() => {
    setIsAdmin(role === 'admin');
    if (!isAdmin) {
      navigate('/unauthorized');
    }
  }, [role, isAdmin, navigate]);

  useEffect(() => {
    axios.get(`http://localhost:3000/quiz`, {
      params: { quizId },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        setQuiz(res.data);
      })
      .catch(err => console.error('Error fetching quiz:', err));
  }, [quizId, token]);

  const handleSaveQuiz = async () => {
    try {
      await axios.put(`http://localhost:3000/quiz`,
        { questions: quiz.questions },
        {
          params: { quizId },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
      navigate('/home');
    } catch (err) {
      console.error('Error saving quiz:', err);
    }
  };

  const handleAddQuestion = () => {
    // if (newQuestion.question.trim() === '' || newQuestion.options.some(option => option.value.trim() === '')) {
    //   alert('Please enter a question and at least one option.');
    //   return;
    // }
    newQuestion.questionId = uuidv4();
    const updatedQuestions = [...quiz.questions, newQuestion];
    setQuiz({ ...quiz, questions: updatedQuestions });
    setNewQuestion({
      question: '',
      options: [{ id: uuidv4(), value: '' }],
      correctOptionIds: []
    });
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = quiz.questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = quiz.questions.map((q, qi) =>
      qi === qIndex ? {
        ...q,
        options: q.options.map((o, oi) => oi === oIndex ? { ...o, value } : o)
      } : q
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleAddOption = (qIndex) => {
    const updatedQuestions = quiz.questions.map((q, qi) =>
      qi === qIndex ? {
        ...q,
        options: [...q.options, { id: uuidv4(), value: '' }]
      } : q
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleDeleteOption = (qIndex, oIndex) => {
    const updatedQuestions = quiz.questions.map((q, qi) => {
      if (qi === qIndex) {
        const updatedOptions = q.options.filter((_, oi) => oi !== oIndex);
        const optionId = q.options[oIndex].id;
        const updatedCorrectOptionIds = q.correctOptionIds.filter(id => id !== optionId);

        return {
          ...q,
          options: updatedOptions,
          correctOptionIds: updatedCorrectOptionIds,
        };
      }
      return q;
    });

    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleCorrectOptionChange = (qIndex, optionId) => {
    const updatedQuestions = quiz.questions.map((q, qi) =>
      qi === qIndex ? {
        ...q,
        correctOptionIds: q.correctOptionIds.includes(optionId)
          ? q.correctOptionIds.filter(id => id !== optionId)
          : [...q.correctOptionIds, optionId]
      } : q
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = quiz ? quiz.questions.slice(indexOfFirstQuestion, indexOfLastQuestion) : [];
  const handleBack = () => {
    navigate('/dashboard');
  }

  return (
    <div style={{ background: '#ECECEC', padding: '10px' }}>
      <Button onClick={handleBack}>Back</Button>
      <Container style={{ padding: '20px' }}>
        {quiz && (
          <Card>
            <CardContent>
              <Typography variant="h4">Editing {quiz.quizName}</Typography>
              {currentQuestions.map((question, qIndex) => (
                <Box key={question.questionId} mb={3}>
                  <p style={{ marginTop: 20 }}>Question {indexOfFirstQuestion + qIndex + 1}</p>
                  <TextField
                    label="Question"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(indexOfFirstQuestion + qIndex, 'question', e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                  />
                  {question.options.map((option, oIndex) => (
                    <Grid container spacing={1} alignItems="center" key={option.id}>
                      <Grid item xs={9}>
                        <TextField
                          label={`Option ${oIndex + 1}`}
                          value={option.value}
                          onChange={(e) => handleOptionChange(indexOfFirstQuestion + qIndex, oIndex, e.target.value)}
                          fullWidth
                          variant="outlined"
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={1}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={question.correctOptionIds.includes(option.id)}
                              onChange={() => handleCorrectOptionChange(indexOfFirstQuestion + qIndex, option.id)}
                            />
                          }
                        />
                      </Grid>
                      <Grid item xs={0}>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteOption(indexOfFirstQuestion + qIndex, oIndex)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Box mt={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddOption(indexOfFirstQuestion + qIndex)}
                    >
                      Add Option
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteQuestion(indexOfFirstQuestion + qIndex)}
                      sx={{ ml: 1 }}
                    >
                      Delete Question
                    </Button>
                  </Box>
                </Box>
              ))}
              <Grid>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddQuestion}
                >
                  +
                </Button>
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSaveQuiz}
                  style={{ marginTop: 5 }}
                >
                  Save Quiz
                </Button>
              </Grid>
              <Box mt={2} display="flex" justifyContent="center">
                {quiz.questions.length > questionsPerPage &&
                  <Pagination
                    count={Math.ceil(quiz.questions.length / questionsPerPage)}
                    page={currentPage}
                    onChange={handleChangePage}
                    color="primary"
                  />
                }
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default EditQuiz;
