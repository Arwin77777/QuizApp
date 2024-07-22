import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
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
  const [isAdmin, setIsAdmin] = useState(role === 'admin');
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const quizContainerRef = useRef(null);

  useEffect(() => {
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
    // Validation check for empty fields
    for (const question of quiz.questions) {
      if (!question.question.trim()) {
        setErrorMessage('Question cannot be empty.');
        setErrorOpen(true);
        return;
      }
      if (question.correctOptionIds.length === 0) {
        setErrorMessage('Select at least one correct option.');
        setErrorOpen(true);
        return;
      }
      for (const option of question.options) {
        if (!option.value.trim()) {
          setErrorMessage('Option cannot be empty.');
          setErrorOpen(true);
          return;
        }
      }
    }

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
      navigate('/quizzes');
    } catch (err) {
      console.error('Error saving quiz:', err);
    }
  };

  const handleAddQuestion = () => {
    newQuestion.questionId = uuidv4();
    const updatedQuestions = [...quiz.questions, newQuestion];
    setQuiz({ ...quiz, questions: updatedQuestions });

    const newTotalPages = Math.ceil(updatedQuestions.length / questionsPerPage);

    setCurrentPage(newTotalPages);

    setNewQuestion({
      question: '',
      options: [{ id: uuidv4(), value: '' }],
      correctOptionIds: []
    });

    if (quizContainerRef.current) {
      quizContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const handleDeleteQuestion = (index) => {
    if (index % 10 === 5 | index % 10 === 0) {
      setCurrentPage(currentPage - 1);
    }
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

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  return (
    <div>

      {quiz && (
        <div style={{ background: 'radial-gradient(#89b5fe80,white)', padding: '0px' }}>

          <div>
            <AppBar style={{ background: 'white' }}>
              <Toolbar>
                <Grid container>
                  <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '5px' }}>
                    <Typography color={'black'} ><Link style={{ textDecoration: 'none' }} to='/quizzes'>Quizzes</Link> / {quiz.quizName}</Typography>
                  </div>
                </Grid>
                <Grid container gap={1} justifyContent={'flex-end'} padding={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddQuestion}
                  // style={{ width: '50px' }}
                  >
                    Add Question
                  </Button>
                  {currentQuestions.length > 0 &&
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleSaveQuiz}
                    >
                      Save Quiz
                    </Button>
                  }
                </Grid>
              </Toolbar>
            </AppBar>

            <Container style={{ padding: '20px' }} >
              <Card style={{ marginTop: 70 }}>
                <CardContent>
                  {currentQuestions.map((question, qIndex) => (
                    <Box key={question.questionId} mb={3}>
                      <b style={{ marginTop: 20 }}>Question {indexOfFirstQuestion + qIndex + 1}</b>
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
            </Container>
            <div ref={quizContainerRef} style={{ marginTop: 20, background: 'white', color: 'gray' }}>
              <p >
                @Quiz App By Arwin
              </p>
            </div>
          </div>

          <Snackbar open={errorOpen} autoHideDuration={6000} onClose={handleErrorClose}>
            <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
              {errorMessage}
            </Alert>
          </Snackbar>
        </div>
      )}
    </div>
  );
};

export default EditQuiz;
