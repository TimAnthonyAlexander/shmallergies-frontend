import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Box,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Upload,
  Person,
  ExitToApp,
  Home,
  Inventory,
  QrCodeScanner
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    handleUserMenuClose();
    navigate('/');
  };

  const navigationItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Products', path: '/products', icon: <Inventory /> },
  ];

  const userMenuItems = user ? [
    { label: 'Upload Product', path: '/upload', icon: <Upload /> },
    { label: 'Profile', path: '/profile', icon: <Person /> },
  ] : [];

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'text.primary', boxShadow: 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo and Menu Icon for Mobile */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              mr: 4,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img 
              src="/logo.png" 
              alt="Shmallergies" 
              style={{ 
                height: '40px', 
                width: 'auto'
              }} 
            />
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', ml: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    mr: 2,
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
        </Box>

        {/* Center area - Scanner Button */}
        {user && (
          <Box sx={{ 
            position: isMobile ? 'absolute' : 'static',
            left: '50%',
            transform: isMobile ? 'translateX(-50%)' : 'none'
          }}>
            <Tooltip title="Scan Products">
              <IconButton
                component={Link}
                to="/scanner"
                size="large"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  ...(isMobile ? {
                    height: 48,
                    width: 48
                  } : {})
                }}
              >
                <QrCodeScanner />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        
        {/* Right area - User menu or auth buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Desktop Scanner Button */}
          {!isMobile && user && (
            <Button
              component={Link}
              to="/scanner"
              startIcon={<QrCodeScanner />}
              sx={{
                mr: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              Scanner
            </Button>
          )}
          
          {/* User Menu */}
          {user ? (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="user-menu"
                aria-haspopup="true"
                onClick={handleUserMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={userMenuAnchor}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" color="text.primary">
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                {userMenuItems.map((item) => (
                  <MenuItem 
                    key={item.path}
                    component={Link} 
                    to={item.path}
                    onClick={handleUserMenuClose}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1.2,
                      color: 'text.primary',
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ py: 1.2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ExitToApp />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} to="/login" color="inherit">
                Login
              </Button>
              <Button component={Link} to="/signup" variant="contained">
                Sign Up
              </Button>
            </Box>
          )}
        </Box>

        {/* Mobile Menu */}
        <Menu
          id="mobile-menu"
          anchorEl={mobileMenuAnchor}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
        >
          {navigationItems.map((item) => (
            <MenuItem 
              key={item.path}
              component={Link} 
              to={item.path}
              onClick={handleMobileMenuClose}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2 }}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
          
          {user && <Divider />}
          
          {userMenuItems.map((item) => (
            <MenuItem 
              key={item.path}
              component={Link} 
              to={item.path}
              onClick={handleMobileMenuClose}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2 }}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 