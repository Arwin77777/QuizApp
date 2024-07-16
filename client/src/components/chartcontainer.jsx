import React from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, RadarChart, Radar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';
import { Typography, Box } from '@mui/material';

const ChartComponent = ({ data, type,title }) => {
    let chart;
    switch (type) {
        case 'Bar':
            chart = (
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quizName"/>
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
            );
            break;
        case 'Line':
            chart = (
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quizName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" />
                </LineChart>
            );
            break;
        case 'Pie':
            chart = (
                <PieChart>
                    <Pie data={data} dataKey="score" nameKey="quizName" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label />
                    <Tooltip />
                </PieChart>
            );
            break;
        case 'Radar':
            chart = (
                <RadarChart data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis />
                    <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                    <Legend />
                </RadarChart>
            );
            break;
        default:
            chart = null;
    }

    return (
        <Box  height={400} boxShadow={3} borderRadius={10} p={3} mb={4}>
            <Typography variant="h6" gutterBottom align="center">{title} </Typography>
            <ResponsiveContainer width="100%" height="80%">
                {chart}
            </ResponsiveContainer>
        </Box>
    );
};

export default ChartComponent;
