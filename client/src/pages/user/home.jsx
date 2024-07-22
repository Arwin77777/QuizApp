import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import NavbarComponent from '../../components/navbar';
import QuizCard from '../../components/quizCard';
import '../../css/home.css';
import { MenuItem, Select, Pagination, TextField, Box, Grid, InputAdornment } from '@mui/material';
import FooterComponent from '../../components/footer';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import SearchIcon from '@mui/icons-material/Search';

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [quizzesPerPage] = useState(12);
  const token = localStorage.getItem('token');
  const quizContainerRef = useRef(null);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const navigate = useNavigate();

  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token !== null;
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
    }
    const decoded = jwtDecode(token);

    if (decoded.role === 'admin') {
      navigate('/dashboard');
      return;
    }

    axios.get("http://localhost:3000/quizzes", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        setQuizzes(res.data);
        setFilteredQuizzes(res.data);
        extractCategories(res.data);
      })
      .catch(err => console.log('error:', err));
  }, [token, navigate]);

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

  return (
    <div className='home'>
      <div className='home-nav'>
        <NavbarComponent />
      </div>
      <div style={{ paddingTop: '0px' }}>
        <div style={{ marginRight: 'auto', marginLeft: 'auto', width: '50%', alignItems: 'center', textAlign: 'center', padding: '10px' }}>
          <h1>Welcome to <b style={{ color: 'rgb(9, 89, 170)' }}>Quiz App</b></h1>
          <br />
          <h6 style={{ color: 'rgb(76, 89, 103)' }}>Welcome to Quizzy, the ultimate platform to test your knowledge! Dive into a variety of quizzes, track your progress, and compete with friends. Enjoy endless learning and excitement with QuizMaster! </h6>
          {/* <br /> */}
          {/* <Button style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }} onClick={handleQuizButtonClick}>Quiz</Button>
          <p style={{ color: 'rgb(76, 89, 103)', marginTop: '10px' }}>By clicking this you will be able to view the quizzes</p> */}
        </div>
        <Box display="flex" justifyContent="center" alignItems="center" margin="10px 0" padding="10px">
          <Grid>
            <form onSubmit={handleSearch} style={{ marginRight: '10px', display: 'flex' }}>
              <TextField
                type="search"
                placeholder="Search"
                aria-label="Search"
                name="search"
                variant="outlined"
                size="small"
                style={{ minWidth: '150px' }}
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
          <Grid>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              displayEmpty
              size="small"
            >
              <MenuItem value=""><em>All Categories</em></MenuItem>
              {categories.map((category, index) => (
                <MenuItem key={index} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </Grid>
        </Box>

        <div ref={quizContainerRef}>
          {quizzes.length > 0 && currentQuizzes.length > 0 && <h4>List of Quizzes</h4>}
          <div className="quiz-container">
            {quizzes.length === 0 ? (
              <div>
                <p>No quiz to display</p>
              </div>
            ) : (
              currentQuizzes.length > 0 ? (
                currentQuizzes.map((quiz) => (
                  <div key={quiz.quizId} className="quiz-card">
                    <QuizCard
                      quiz={{
                        quizId: quiz.quizId,
                        quizName: quiz.quizName,
                        category: quiz.category,
                        quizImage: quiz.quizImage,
                        questions: quiz.questions
                      }}
                    />
                  </div>
                ))
              ) : (
                <p>No Quiz matches your search</p>
              )
            )}
          </div>
          {displayQuizzes.length > quizzesPerPage && (
            <Pagination
              count={Math.ceil(displayQuizzes.length / quizzesPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
            />
          )}
        </div>
      </div>
      <FooterComponent />
    </div>
  );
};

export default Home;
