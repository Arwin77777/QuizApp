import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Grid, Paper, Typography, Skeleton } from '@mui/material';
import StatCard from '../components/statCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [scores, setScores] = useState([]);
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const adminUserId = decoded.userId;

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

        setUsers(usersRes.data);
        setQuizzes(adminQuizzes);
        const sco = scoresRes.data.filter(score => adminQuizzes.some(quiz => quiz.quizId === score.quizId))
        setScores(scoresRes.data.filter(score => adminQuizzes.some(quiz => quiz.quizId === score.quizId)));

        computeInsights(usersRes.data, adminQuizzes,sco );
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, adminUserId]);

  const computeInsights = (users, quizzes, scores) => {
    const totalUsers = users.length;
    const activeUsers = scores.reduce((acc, score) => acc.add(score.userId), new Set()).size;

    const totalQuizzes = quizzes.length;
    const mostPopularQuiz = quizzes.sort((a, b) => (
      scores.filter(score => score.quizId === b.quizId).length -
      scores.filter(score => score.quizId === a.quizId).length
    ))[0];

    // Compute average scores
    const averageScores = scores.reduce((acc, score) => {
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

    // Compute quiz takes
    const quizTakes = quizzes.reduce((acc, quiz) => {
      acc[quiz.quizId] = scores.filter(score => score.quizId === quiz.quizId).length;
      return acc;
    }, {});

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

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const COLORS = quizTakesData.map(() => getRandomColor());

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
            <StatCard title="Popular Quiz" value={insights.mostPopularQuiz?.quizName} description="Popular among users" />
          )}
        </Grid>
        <Grid item xs={12} md={12}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            {loading ? (
              <Skeleton variant="rectangular" height={300} />
            ) : (
              <>
                <Typography variant="h6" gutterBottom align="center">
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
                        <h2>Users are yet to attend any of your quizzes</h2>
                      ) : (
                        <p>No quizzes found</p>
                      )}
                    </div>
                  )}
                </ResponsiveContainer>
              </>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper elevation={3} style={{ padding: '16px' }}>
            {loading ? (
              <Skeleton variant="rectangular" height={250} />
            ) : (
              <>
                <Typography variant="h6" gutterBottom align="center">
                  Number of Takes Per Quiz
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  {quizTakesData.length > 0 ? (
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
                        <h2>No takes recorded for your quizzes yet</h2>
                      ) : (
                        <p>No quizzes found</p>
                      )}
                    </div>
                  )}
                </ResponsiveContainer>
                <Typography style={{ color: 'gray', fontSize: '12px' }} gutterBottom align="center">
                  *Hover to view the Quiz details
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
