import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AdminQuizzes from '../pages/adminQuizzes';
import Users from '../pages/users';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Dashboard from '../pages/dashboard';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import AddQuiz from '../pages/addQuiz';

const drawerWidth = 240;

function Sidebar(props) {
  const { window, pageName } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const userId = decoded.userId;
  const role = decoded.role;
  const [isAdmin, setIsAdmin] = React.useState(role === 'admin');
  const [openConfirmation, setOpenConfirmation] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/unauthorized');
    }
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    setOpenConfirmation(true);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (text) => {
    switch (text) {
      case 'Dashboard':
        navigate('/dashboard');
        return;
      case 'Users':
        navigate('/users');
        return;
      case 'Edit Quiz':
        navigate('/quizzes');
        return;
      default:
        return null;
    }
  };

  const drawer = (
    <div style={{ color: 'black ' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Quiz App
        </Typography>
      </Toolbar>
      <List>
        {['Dashboard', 'Users', 'Edit Quiz'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(text)}>
              <ListItemIcon>
                {text === 'Dashboard' ? <DashboardIcon /> : null}
                {text === 'Users' ? <GroupIcon /> : null}
                {text === 'Edit Quiz' ? <EditIcon /> : null}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <div>
      {isAdmin ? (
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar
            position="fixed"
            sx={{
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
            }}
          >
            <Toolbar style={{ background: 'white', color: 'black' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              Admin/{pageName}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 'auto',
                }}
              >
                <Link to={`/profile/${userId}`} style={{ textDecoration: 'none', color: 'black', marginLeft: 8 }}>
                  <IconButton size="large" color="inherit">
                    <AccountCircleIcon />
                  </IconButton>
                </Link>
                <IconButton size="large" color="inherit" onClick={handleLogout}>
                  <LogoutIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
          >
            <Drawer
              container={container}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
            >
              {drawer}
            </Drawer>
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
              open
            >
              {drawer}
            </Drawer>
          </Box>
          <Box
            component="main"
            sx={{ flexGrow: 1, p: 4, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            style={{ background: 'radial-gradient(#89b5fe80,white)' }}
          >
            <div style={{ marginTop: '70px' }}>
              {pageName === 'dashboard' && <Dashboard />}
              {pageName === 'users' && <Users />}
              {pageName === 'editQuizzes' && <AdminQuizzes />}
              {pageName === 'addQuiz' && <AddQuiz/>}
            </div>
          </Box>
          <Dialog open={openConfirmation} onClose={() => setOpenConfirmation(false)}>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to Logout from your profile?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenConfirmation(false)} style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/');
                }}
                style={{ backgroundColor: 'rgb(9, 89, 170)', color: 'white' }}
                variant="contained"
              >
                Logout
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      ) : (
        navigate('/unauthorized')
      )}
    </div>
  );
}

export default Sidebar;
