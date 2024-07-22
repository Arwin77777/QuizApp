import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import QuizCard from '../../components/quizCard';
import '../../css/home.css';
import { Button, MenuItem, Select, Pagination, TextField, Box, Grid, InputAdornment } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [quizzesPerPage] = useState(12);
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const adminId = decoded.userId;
  const quizContainerRef = useRef(null);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/quizzes", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        const relevantQuizzes = res.data.filter(quiz => quiz.createdBy === adminId)
        setQuizzes(relevantQuizzes);
        setFilteredQuizzes(relevantQuizzes);
        extractCategories(relevantQuizzes);
      })
      .catch(err => console.log('error:', err));
  }, [token]);

  const extractCategories = (quizzes) => {
    const allCategories = quizzes.map(quiz => quiz.category);
    const uniqueCategories = [...new Set(allCategories)];
    setCategories(uniqueCategories);
  };



  const handleQuizButtonClick = () => {
    if (quizContainerRef.current) {
      quizContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = event.target.elements.search.value;
    setSearchQuery(query.toLowerCase());
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category === '') {
      setFilteredQuizzes(quizzes);
    } else {
      const filtered = quizzes.filter((quiz) => quiz.category === category);
      setFilteredQuizzes(filtered);
    }
  };

  const displayQuizzes = filteredQuizzes.filter((quiz) =>
    quiz.quizName.toLowerCase().includes(searchQuery) ||
    quiz.category.toLowerCase().includes(searchQuery)
  );

  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = displayQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDeleteQuiz = (quizId) => {
    setQuizzes(currentQuizzes => currentQuizzes.filter(quiz => quiz.quizId !== quizId));
    setFilteredQuizzes(currentQuizzes => currentQuizzes.filter(quiz => quiz.quizId !== quizId));
    // console.log("------------------->",quizzes);
  };

  return (
    <div>

      {quizzes.length > 0 &&
        <div style={{ background: 'white', padding: 5 }}>


          <Box display="flex" margin="10px 0" >
            <Grid width={'90%'}>
              <form onSubmit={handleSearch} >
                {/* <SearchIcon></SearchIcon> */}
                <TextField
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  name="search"
                  variant="outlined"
                  size="small"
                  style={{ width: '90%' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </form>
            </Grid>

            <Grid style={{ width: '50%' }}>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                displayEmpty
                variant="outlined"
                size="small"
                style={{ marginLeft: '0px', maxWidth: '100%' }}
              >
                <MenuItem value=""><em>All Categories</em></MenuItem>
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid container justifyContent={'flex-end'} >
              {quizzes.length > 0 &&
                <Link to='/addQuiz'><Button variant='contained' style={{ borderRadius: '10px', marginLeft: '10px' }}>Add Quiz</Button></Link>
              }
            </Grid>

          </Box>
        </div>
      }


      <div ref={quizContainerRef}   >
        <div style={{ padding: '20px' }} className="quiz-container">
          {quizzes.length === 0 ? (
            <div>
              <p>No quiz to display</p>
              <Link to='/addQuiz'><Button>Add Quiz</Button></Link>
            </div>
          ) : (
            currentQuizzes.length > 0 ? (
              currentQuizzes.map((quiz) => (
                <div key={quiz.quizId} className="quiz-card">
                  <QuizCard onDelete={handleDeleteQuiz} quiz={{ quizId: quiz.quizId, quizName: quiz.quizName, category: quiz.category, quizImage: quiz.quizImage, questions: quiz.questions, type: "edit" }} />
                </div>
              ))) : (
              <p>No Quiz match your search</p>
            ))}

        </div>
        {displayQuizzes.length > quizzesPerPage &&
          <Pagination
            count={Math.ceil(displayQuizzes.length / quizzesPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
          />
        }
      </div>
    </div>
  );
};

export default AdminQuizzes;
