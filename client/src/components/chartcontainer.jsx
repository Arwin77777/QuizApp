import React from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell,
} from 'recharts';
import { Typography, Box } from '@mui/material';

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#d45087', '#2a9d8f'];

const ChartComponent = ({ data, type, title }) => {
    const gradientOffset = () => {
        const dataMax = Math.max(...data.map((i) => i.score));
        const dataMin = Math.min(...data.map((i) => i.score));

        if (dataMax <= 0) {
            return 0;
        }
        if (dataMin >= 0) {
            return 1;
        }

        return dataMax / (dataMax - dataMin);
    };

    const off = gradientOffset();

    let chart;
    switch (type) {
        case 'Bar':
            chart = (
                <BarChart data={data}>
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#136eff80" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quizName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="url(#colorUv)" />
                </BarChart>
            );
            break;
        case 'Line':
            chart = (
                <LineChart data={data}>
                    <defs>
                        <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quizName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="url(#colorLine)" />
                </LineChart>
            );
            break;
        case 'Pie':
            chart = (
                <PieChart>
                    <defs>
                        <linearGradient id="colorPie" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="5%" stopColor="#136eff80" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                    <Pie data={data} dataKey="score" nameKey="quizName" cx="50%" cy="50%" outerRadius={80} label>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            );
            break;
        default:
            chart = null;
    }

    return (
        <Box height={400} boxShadow={3} borderRadius={10} p={3} mb={4}>
            <Typography variant="h6" gutterBottom align="center">{title}</Typography>
            <ResponsiveContainer width="100%" height="80%">
                {chart}
            </ResponsiveContainer>
        </Box>
    );
};

export default ChartComponent;
