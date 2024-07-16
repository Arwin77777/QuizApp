import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';
import Charts from './charts'; // Assuming you have a Charts component
import BarChartComponent from '../components/barchart';

export default function Quizzes() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const columns = ['Quiz Name', 'Category', 'Questions', 'Score', 'Rating', 'Attempted Questions'];
    const token = localStorage.getItem('token');
    const [quizzes, setQuizzes] = useState([]);
    const [scores, setScores] = useState([]);
    const [mergedData, setMergedData] = useState([]);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const res = await axios.get('http://localhost:3000/scores', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setScores(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchScores();
    }, [token]);
    const handleMergeData = ()=>{
        console.log(mergedData);
    }

    useEffect(() => {
        const fetchQuizDetails = async () => {
            try {
                const quizIds = scores.map(score => score.quizId);
                const uniqueQuizIds = [...new Set(quizIds)];
                const quizDetails = await Promise.all(uniqueQuizIds.map(async (quizId) => {
                    const response = await axios.get('http://localhost:3000/quiz', {
                        params: { quizId },
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    return response.data;
                }));
                setQuizzes(quizDetails);
            } catch (error) {
                console.error(error);
            }
        };
        if (scores.length > 0) {
            fetchQuizDetails();
        }
    }, [scores, token]);

    useEffect(() => {
        const merged = scores.map(score => {
            const quizDetail = quizzes.find(quiz => quiz.quizId === score.quizId) || {};
            return { ...score, ...quizDetail };
        });
        setMergedData(merged);
    }, [scores, quizzes]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableCell key={index} style={{ minWidth: 100 }}>
                                    {column}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mergedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((data) => (
                            <TableRow hover role="checkbox" tabIndex={-1} key={data.quizId}>
                                <TableCell>{data.quizName}</TableCell>
                                <TableCell>{data.category}</TableCell>
                                <TableCell>{data.totalQuestions}</TableCell>
                                <TableCell>{data.score}</TableCell>
                                <TableCell>{data.rating}</TableCell>
                                <TableCell>{data.attemptedQuestions}</TableCell>
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
            <BarChartComponent data={mergedData}></BarChartComponent>
        </Paper>
    );
}
