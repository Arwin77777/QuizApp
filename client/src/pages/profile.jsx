import React, { useEffect, useState } from 'react';
import { Paper, Typography, Avatar, Box, TextField, Button, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Grid, Snackbar, Alert, Tooltip } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import NavbarComponent from '../components/navbar';
import StatCard from '../components/statCard';
import ChartContainer from '../components/chartcontainer';
import { useLocation, useParams } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const Profile = () => {
    const { userId } = useParams();
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    const [userData, setUserData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [editedData, setEditedData] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [quizzes, setQuizzes] = useState([]);
    const [scores, setScores] = useState([]);
    const [mergedData, setMergedData] = useState([]);
    const [totalQuizTaken, setTotalQuizTaken] = useState(0);
    const [averageScore, setAverageScore] = useState(0);
    const [topScore, setTopScore] = useState(0);
    const [isUser, setIsUser] = useState(false);
    const location = useLocation();
    const [adminQuizData, setAdminQuizData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const { role, type } = location.state || {};
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [submittedData, setSubmittedData] = useState([]);

    const columns = ['Quiz Name', 'Category', 'Questions', 'Score', 'Rating', 'Attempted Questions'];

    useEffect(() => {
        if (!token) return;

        const fetchUserData = async () => {
            try {
                const res = await axios.get('http://localhost:3000/user', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { userId }
                });
                setUserData(res.data);
                setEditedData({ userName: res.data?.userName, email: res.data?.email });
                console.log(editedData);
                setIsUser(res.data.userId === decoded.userId);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };



        const fetchScores = async () => {
            try {
                const res = await axios.get('http://localhost:3000/scores', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { userId }
                });
                setScores(res.data);
            } catch (err) {
                console.error("Error fetching scores:", err);
            }
        };

        fetchUserData();
        fetchScores();
    }, [token, userId, decoded.userId]);



    useEffect(() => {
        const fetchQuizDetails = async () => {
            try {
                const uniqueQuizIds = [...new Set(scores.map(score => score.quizId))];
                const quizDetails = await Promise.all(uniqueQuizIds.map(async (quizId) => {
                    const response = await axios.get('http://localhost:3000/quiz', {
                        params: { quizId },
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    return response.data;
                }));
                setQuizzes(quizDetails);
            } catch (error) {
                console.error("Error fetching quiz details:", error);
            }
        };

        if (scores.length > 0) fetchQuizDetails();
    }, [scores, token]);

    useEffect(() => {
        const merged = scores.map(score => {
            const quizDetail = quizzes.find(quiz => quiz.quizId === score.quizId) || {};
            return { ...score, ...quizDetail };
        });
        setMergedData(merged);
    }, [scores, quizzes]);

    useEffect(() => {
        const adminData = mergedData.filter(data => data.createdBy === decoded.userId);
        if (decoded.role === 'admin') {
            setHistoryData(adminData);
        }
        else {
            setHistoryData(mergedData);
        }
        setAdminQuizData(adminData);
        setChartData(mergedData);
    }, [mergedData, decoded.userId]);

    useEffect(() => {
        const handleInsights = () => {
            const totalQuizzes = chartData.length;
            const totalScore = chartData.reduce((acc, data) => acc + data.score, 0);
            const topScore = chartData.reduce((acc, data) => (data.score > acc ? data.score : acc), 0);
            const averageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;
            const submissions = chartData.reduce((acc, data) => {
                const date = new Date(data.submittedAt * 1000).toLocaleDateString('en-US');
                if (!acc[date]) {
                    acc[date] = { date, count: 0 };
                }
                acc[date].count += 1;
                return acc;
            }, {});

            const cd = Object.values(submissions);
            setSubmittedData(cd);
            // setSubmittedData(submissions);
            setTotalQuizTaken(totalQuizzes);
            setAverageScore(averageScore);
            setTopScore(topScore);
        };

        handleInsights();
    }, [chartData]);

    const updateUser = async () => {
        if (editedData.userName.length === 0 & editedData.email.length === 0) {
            setErrorMessage('Name and email should not be empty');
            setErrorOpen(true);
            return;
        }
        if (editedData.userName.length === 0) {
            setErrorMessage('Name should not be empty');
            setErrorOpen(true);
            return;
        }
        if (editedData.email.length === 0) {
            setErrorMessage('Email should not be empty');
            setErrorOpen(true);
            return;
        }
        try {
            await axios.put('http://localhost:3000/user', editedData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(editedData);
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    };
    const handleErrorClose = () => {
        setErrorOpen(false);
    };

    const handleEditClick = () => {
        setEditMode(true);
        setEditedData({ userName: userData?.userName, email: userData?.email });
    };

    const handleSaveClick = () => {
        setOpenConfirmation(true);
    };

    const handleConfirmUpdate = () => {
        updateUser();
        // setEditMode(false);
        setOpenConfirmation(false);
    };

    const handleCancelUpdate = () => {
        setEditMode(false);
        setEditedData({ userName: userData?.userName, email: userData?.email });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData({ ...editedData, [name]: value });
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <div>
            <div className='home-nav'>
                <NavbarComponent />
            </div>
            <div style={{ padding: '0 50px 50px 50px' }}>
                <Paper elevation={3} style={{ padding: 20 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar alt={userData?.userName} src={userData?.avatar} style={{ width: 100, height: 100 }} />
                        {isUser ? (
                            <>
                                <TextField
                                    name="userName"
                                    label="Name"
                                    value={editedData.userName || ''}
                                    onChange={handleChange}
                                    margin="normal"
                                />
                                <TextField
                                    name="email"
                                    label="Email"
                                    value={editedData.email || ''}
                                    onChange={handleChange}
                                    margin="normal"
                                />
                                <Box mt={2}>
                                    <Button variant="contained" style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white', marginRight: '10px' }} onClick={handleSaveClick}>
                                        Save
                                    </Button>
                                    <Button variant="contained" style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }} onClick={handleCancelUpdate}>
                                        Cancel
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Typography variant="h5" style={{ marginTop: 20 }}>{userData?.userName}</Typography>
                                <Typography variant="body1" color="textSecondary">{userData?.email}</Typography>
                                {isUser && <Button variant="contained" onClick={handleEditClick} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white', marginTop: '10px' }}>
                                    Edit
                                </Button>}
                            </>
                        )}
                    </Box>
                    {(type === 'self' || role === 'user') && (
                        <div>
                            <Tabs value={tabIndex} onChange={handleTabChange} style={{ marginTop: '15px' }} centered>
                                <Tab label="History" />
                                <Tab label="Charts" />
                                <Tab label="Insights" />
                            </Tabs>
                            <Box p={3} style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                                {tabIndex === 0 && (
                                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                                        <TableContainer sx={{ maxHeight: 440 }}>
                                            <Table stickyHeader aria-label="sticky table">
                                                <TableHead>
                                                    <TableRow>
                                                        {columns.map((column, index) => (
                                                            <TableCell key={index} style={{ minWidth: 100 }}>
                                                                <b> {column} </b>
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {historyData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((data) => (
                                                        <TableRow hover role="checkbox" tabIndex={-1} key={data.quizId}>
                                                            <TableCell>{data.quizName}</TableCell>
                                                            <TableCell>{data.category}</TableCell>
                                                            <TableCell>{data.totalQuestions}</TableCell>
                                                            <TableCell>{data.score}</TableCell>
                                                            <TableCell>{data.rating}</TableCell>
                                                            <TableCell>{data.attemptedQuestions}</TableCell>
                                                            {/* {data.createdBy === decoded.userId && <TableCell>Your Quiz</TableCell>} */}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <TablePagination
                                            rowsPerPageOptions={[10, 25, 100]}
                                            component="div"
                                            count={mergedData.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                        />
                                    </Paper>
                                )}
                                {tabIndex === 1 && (
                                    <div>
                                        {decoded.role === 'admin' &&
                                            <div style={{ gap: 20 }}>
                                                <Button variant={chartData === adminQuizData ? 'contained' : 'text'} onClick={() => (setChartData(adminQuizData))}>Your Quiz alone</Button>
                                                <Button variant={chartData === mergedData ? 'contained' : 'text'} onClick={() => (setChartData(mergedData))}>All Quizzes</Button>
                                            </div>
                                        }
                                        <br />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    {/* <h2>Quiz Scores</h2> */}
                                                    <ChartContainer data={chartData} type="Bar" title="Scores" />
                                                </Grid>
                                                {/* <Grid item xs={12} sm={6}> */}
                                                {/* <ChartContainer data={chartData} type="Line" /> */}
                                                <Grid item xs={12} sm={6}>
                                                    <Box height={400} boxShadow={3} borderRadius={10} p={3} mb={4}>
                                                        <Typography variant="h6" gutterBottom align="center">Submissions Over Time</Typography>
                                                        <ResponsiveContainer width="100%" height="80%">
                                                            <LineChart data={submittedData}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="date" />
                                                                <YAxis />
                                                                <Tooltip />
                                                                <Legend />
                                                                <Line type="monotone" dataKey="count" stroke="#" />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </Box>
                                                    {/* </Box> */}

                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <ChartContainer data={chartData} type="Pie" />
                                                </Grid>
                                                {/* </Grid> */}
                                            </Grid>
                                        </div>
                                    </div>
                                )}
                                {tabIndex === 2 && (
                                    <div>
                                        {decoded.role === 'admin' &&
                                            <div style={{ gap: 20 }}>
                                                <Button variant={chartData === adminQuizData ? 'contained' : 'text'} onClick={() => (setChartData(adminQuizData))}>Your Quiz alone</Button>
                                                <Button variant={chartData === mergedData ? 'contained' : 'text'} onClick={() => (setChartData(mergedData))}>All Quizzes</Button>
                                            </div>
                                        }
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <StatCard title="Total Quizzes" value={totalQuizTaken} description="Number of Quizzes taken" />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <StatCard title="Average Score" value={averageScore.toFixed(2)} description="Average score across quizzes" />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <StatCard title="Top Score" value={topScore.toFixed(2)} description="Top score across quizzes" />
                                            </Grid>
                                        </Grid>
                                    </div>
                                )}
                            </Box>
                        </div>
                    )}
                </Paper>
            </div>

            <Dialog open={openConfirmation} onClose={() => setOpenConfirmation(false)}>
                <DialogTitle>Confirm Update</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to update your profile?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelUpdate} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmUpdate} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }} variant="contained">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={errorOpen} autoHideDuration={6000} onClose={handleErrorClose}>
                <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Profile;