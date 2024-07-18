import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/navbar.css'; // Import your custom CSS file for Navbar styling
import { jwtDecode } from 'jwt-decode'; // Corrected import statement
import { Link, useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';

function NavbarComponent() {
    const token = localStorage.getItem('token');
    let role = '';
    let userId = '';
    let type = '';
    const decoded = jwtDecode(token);
    if (token) {
        role = decoded.role;
        userId = decoded.userId;
    }
    if(role==='user')
    {
        type = 'self';
    }
    else
    {
        type = 'noSelf';
    }
    // const role = decoded.role;
    const [isAdmin, setIsAdmin] = React.useState(role === 'admin');
    const navigate = useNavigate();
    React.useEffect(() => {
        setIsAdmin(role === 'admin');
    }, [role, isAdmin, navigate]);
    const [openConfirmation, setOpenConfirmation] = useState(false);

    const handleLogout = () => {
        setOpenConfirmation(true);
    };

    const handleCancelUpdate = () => {
        setOpenConfirmation(false);
    };

    const handleConfirmUpdate = async () => {
        localStorage.removeItem('token');
        setOpenConfirmation(false);
        navigate('/');
    };

    return (
        <Navbar className="sticky-navbar" bg="light" expand="lg">
            <Container>
                <Link to='/home' style={{ textDecoration: 'none' }}>
                    <Navbar.Brand style={{ color: 'rgb(9, 89, 170)' }}>Quiz App</Navbar.Brand>
                </Link>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        {isAdmin && <Link style={{ textDecoration: 'none' }} to='/dashboard'>Dashboard</Link>}

                        <Link to={`/profile/${userId}`} style={{ textDecoration: 'none' }} state={{role:role,type:type}}> <IconButton
                            size="large"
                            color="inherit"
                            onClick={handleLogout}>
                            <AccountCircleIcon /></IconButton> </Link>
                        <IconButton
                            size="large"
                            color="inherit"
                            onClick={handleLogout}>
                            <LogoutIcon />
                        </IconButton>
                    </Navbar.Text>
                </Navbar.Collapse>
                <Dialog open={openConfirmation} onClose={() => setOpenConfirmation(false)}>
                    <DialogTitle>Confirm Logout</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to Logout from your profile?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelUpdate} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmUpdate} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }} variant="contained">
                            Logout
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Navbar>
    );
}

export default NavbarComponent;
