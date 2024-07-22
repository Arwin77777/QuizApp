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
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useUsers } from '../../components/userscontext';

export default function Users() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const columns = ['Name', 'Email', 'Role'];
    const token = localStorage.getItem('token');
    const users = JSON.parse(localStorage.getItem('users'))
    console.log(users);

    const decoded = jwtDecode(token);
    const role = decoded.role;
    const navigate = useNavigate();

    const [isAdmin, setIsAdmin] = React.useState(role === 'admin');

    useEffect(() => {
        setIsAdmin(role === 'admin');
        if (!isAdmin) {
            navigate('/unauthorized');
        }
    }, [role, isAdmin, navigate]);




    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };


    return (
        <div >
            {users.length > 0 ? (
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
                                {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                                    // <Link>
                                    <TableRow style={{ cursor: 'pointer' }} hover role="checkbox" tabIndex={-1} key={user.userId}>
                                        <TableCell>{user.userName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <Link style={{ textDecoration: 'none' }} to={`/profile/${user.userId}`} state={{ role: user.role, type: 'notSelf' }}>
                                            <TableCell style={{ color: 'blue' }}>More</TableCell></Link>
                                    </TableRow>
                                    // </Link>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 20]}
                        component="div"
                        count={users.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            ) : (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>No Users Found</div>
            )}
        </div>
    );
}
