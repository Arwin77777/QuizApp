import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Grid, Paper, Typography, Skeleton, Badge, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import StatCard from '../../components/statCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import dayjs from 'dayjs';
import { useUsers } from '../../components/userscontext';

const Dashboard = () => {
  const { users, setUsers } = useUsers();
  const [quizzes, setQuizzes] = useState([]);
  const [scores, setScores] = useState([]);
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(true);
  const [highlightedDays, setHighlightedDays] = useState({});
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const adminUserId = decoded.userId;
  const [timePeriod, setTimePeriod] = useState('thisMonth');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, quizzesRes, scoresRes] = await Promise.all([
          axios.get('http://localhost:3000/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/quizzes', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/allScores', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
        ]);


        const adminQuizzes = quizzesRes.data.filter(quiz => quiz.createdBy === adminUserId);


        const adminScores = scoresRes.data.filter(score => adminQuizzes.some(quiz => quiz.quizId === score.quizId));

        const userIds = [...new Set(adminScores.map(score => score.userId))];
        const usersResDetails = await Promise.all(userIds.map(userId =>
          axios.get(`http://localhost:3000/user`, {
            params: { userId },
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ));

        const userDetails = usersResDetails.map(res => res.data);
        setUsers(userDetails);
        setQuizzes(adminQuizzes);
        setScores(adminScores);
        localStorage.setItem('users', JSON.stringify(userDetails));

        computeInsights(userDetails, adminQuizzes, adminScores);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, adminUserId]);

  useEffect(() => {
    computeInsights(users, quizzes, scores);
  }, [timePeriod, scores]);

  const filterDataByTimePeriod = (data, period) => {
    const now = dayjs();
    let start;
    let end = now;

    switch (period) {
      case 'thisWeek':
        start = now.startOf('week');
        break;
      case 'lastWeek':
        start = now.subtract(1, 'week').startOf('week');
        end = start.add(6, 'day').endOf('day');
        break;
      case 'thisMonth':
        start = now.startOf('month');
        break;
      case 'lastMonth':
        start = now.subtract(1, 'month').startOf('month');
        end = start.endOf('month');
        break;
      case 'thisYear':
        start = now.startOf('year');
        break;
      case 'lastYear':
        start = now.subtract(1, 'year').startOf('year');
        end = start.endOf('year');
        break;
      default:
        return data;
    }

    return data.filter(item => {
      const itemDate = dayjs.unix(item.submittedAt);
      return itemDate.isAfter(start) && itemDate.isBefore(end);
    });
  };

  const computeInsights = (users, quizzes, scores) => {
    const filteredScores = filterDataByTimePeriod(scores, timePeriod);

    const totalUsers = users.length;
    const activeUsers = filteredScores.reduce((acc, score) => acc.add(score.userId), new Set()).size;

    const totalQuizzes = quizzes.length;
    const mostPopularQuiz = quizzes.sort((a, b) => (
      filteredScores.filter(score => score.quizId === b.quizId).length -
      filteredScores.filter(score => score.quizId === a.quizId).length
    ))[0];

    const averageScores = filteredScores.reduce((acc, score) => {
      if (!acc[score.quizId]) {
        acc[score.quizId] = { totalScore: 0, count: 0 };
      }
      acc[score.quizId].totalScore += score.score;
      acc[score.quizId].count += 1;
      return acc;
    }, {});

    for (const quizId in averageScores) {
      averageScores[quizId] = averageScores[quizId].totalScore / averageScores[quizId].count;
    }

    const quizTakes = quizzes.reduce((acc, quiz) => {
      acc[quiz.quizId] = filteredScores.filter(score => score.quizId === quiz.quizId).length;
      return acc;
    }, {});

    const attemptsPerDay = scores.reduce((acc, score) => {
      const date = dayjs.unix(score.submittedAt).format('YYYY-MM-DD');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += 1;
      return acc;
    }, {});

    setHighlightedDays(attemptsPerDay);

    setInsights({
      totalUsers,
      activeUsers,
      totalQuizzes,
      mostPopularQuiz,
      averageScores,
      quizTakes
    });
  };

  const averageScoresData = Object.entries(insights.averageScores || {}).map(([quizId, avgScore]) => {
    const quiz = quizzes.find(q => q.quizId === quizId);
    return { quizName: quiz?.quizName || quizId, score: avgScore };
  });

  const quizTakesData = Object.entries(insights.quizTakes || {}).map(([quizId, takes]) => {
    const quiz = quizzes.find(q => q.quizId === quizId);
    return { quizName: quiz?.quizName || quizId, takes: takes };
  });

  const totalTakes = quizTakesData.reduce((sum, quiz) => sum + quiz.takes, 0);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const COLORS = quizTakesData.map(() => getRandomColor());

  function ServerDay(props) {
    const { day, outsideCurrentMonth, ...other } = props;
    const date = day.format('YYYY-MM-DD');
    const attempts = highlightedDays[date] || 0;

    return (
      <Badge
        key={props.day.toString()}
        overlap="circular"
        badgeContent={attempts > 0 ? attempts : undefined}
        color="primary"
      >
        <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
      </Badge>
    );
  }

  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
  };

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {loading ? (
            <Skeleton variant="rectangular" height={100} />
          ) : (
            <StatCard title="Total Users" value={users.length} description="Total no of users" />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {loading ? (
            <Skeleton variant="rectangular" height={100} />
          ) : (
            <StatCard title="Total Quizzes" value={quizzes.length} description="Total no of quizzes" />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {loading ? (
            <Skeleton variant="rectangular" height={100} />
          ) : (
            <StatCard title="Popular Quiz" value={insights.mostPopularQuiz?.quizName || 'Your Popular Quiz'} description="Popular among users" />
          )}
        </Grid>

        <Grid item xs={12} md={12}>
          <Paper elevation={3} style={{ padding: '16px', position: 'relative' }}>
            <Grid container justifyContent="flex-end">
              <FormControl style={{ marginBottom: '16px' }}>
                <InputLabel id="time-period-label">Time Period</InputLabel>
                <Select
                  labelId="time-period-label"
                  value={timePeriod}
                  label="Time Period"
                  onChange={handleTimePeriodChange}
                >
                  <MenuItem value="thisWeek">This Week</MenuItem>
                  <MenuItem value="lastWeek">Last Week</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="thisYear">This Year</MenuItem>
                  <MenuItem value="lastYear">Last Year</MenuItem>
                  <MenuItem value="lifetime">Lifetime</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <hr />
            {loading ? (
              <Skeleton variant="rectangular" height={600} />
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom align="center" style={{ color: '#6f86d6' }}>
                    Average Scores Per Quiz
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    {averageScoresData.length > 0 ? (
                      <BarChart data={averageScoresData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quizName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#6f86d6" />
                      </BarChart>
                    ) : (
                      <div style={{ marginTop: '150px', textAlign: 'center' }}>
                        {quizzes.length > 0 ? (
                          <h3 style={{ color: 'gray' }}>No user attempted any of your quizzes</h3>
                        ) : (
                          <p>No quizzes found</p>
                        )}
                      </div>
                    )}
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom align="center" style={{ color: '#6f86d6', marginTop: '0px' }}>
                    Number of Takes Per Quiz
                  </Typography>
                  Total Takes : {totalTakes}
                  <ResponsiveContainer width="100%" height={250}>
                    {totalTakes > 0 ? (
                      <PieChart>
                        <Pie
                          data={quizTakesData}
                          dataKey="takes"
                          nameKey="quizName"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                        >
                          {quizTakesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    ) : (
                      <div style={{ marginTop: '100px', textAlign: 'center' }}>
                        {quizzes.length > 0 ? (
                          <h3 style={{ color: 'gray' }}>No takes recorded</h3>
                        ) : (
                          <p style={{ color: 'gray' }}>No quizzes found</p>
                        )}
                      </div>
                    )}
                  </ResponsiveContainer>
                  <Typography style={{ color: 'gray', fontSize: '12px' }} gutterBottom align="center">
                    *Hover to view the Quiz details
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>


        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            {loading ? (
              <Skeleton variant="rectangular" height={400} />
            ) : (
              <>
                <Typography variant="h6" gutterBottom align="center" style={{ color: '#6f86d6' }}>
                  Quiz Attempts Calendar
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    loading={loading}
                    renderLoading={() => <DayCalendarSkeleton />}
                    slots={{
                      day: ServerDay,
                    }}
                    slotProps={{
                      day: {
                        highlightedDays,
                      },
                    }}
                  />
                </LocalizationProvider>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
