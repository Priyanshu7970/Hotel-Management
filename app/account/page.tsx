'use client'
import React, { useState, useEffect, useContext } from 'react';
import {
  ThemeProvider,
  createTheme,
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { LoaderContext } from '../context/loaderProvider';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface JWTPayload {
    username?: string;
    email?: string;
    password?:string;
    phone?:string;
    iat?: number;
    exp?: number;
    id?: string;
  }

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#111827',
    },
    primary: {
      main: '#6366f1',
    },
    text: {
      primary: '#ffffff',
    },
  },
});

interface UserDetails {
  id:string;
  username: string;
  gmail: string;
  phoneNumber: string;
}

const AccountPage: React.FC = () => {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    id:'',
    username: '',
    gmail: '',
    phoneNumber: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  );
  const router = useRouter();
  const {toggleLoading} = useContext(LoaderContext)!;
  function getUserFromToken(token: string | null): { username?: string; email?: string; id?: string;phone?:string,password?:string } | null {
      if (!token) {
        return null;
      }
      try {
        const decodedToken: JWTPayload = jwtDecode(token);
        return { username: decodedToken.username, email: decodedToken.email, id: decodedToken.id,phone:decodedToken.phone, password:decodedToken.password };
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }

  // Simulate fetching user data on component mount
  useEffect(() => {
    // In a real application, you'd fetch this data from your backend
    const token = localStorage.getItem('token');
    const userData = getUserFromToken(token);
    console.log(userData);
     if(userData){
        setUserDetails({
          id:userData?.id || '',
           username:userData?.username || '',
           gmail:userData?.email || '',
           phoneNumber:userData?.phone || ''
            });
     }
     else{
      setSnackbarMessage('Account Not Found');
      setSnackbarSeverity('error');
     }
    
    
   
    toggleLoading();
    
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async() => {
     let data = await fetch(`/api/edit/${userDetails.id}`);
     let response = await data.json();
     if(response.success){
      setIsEditing(false);
      setSnackbarMessage('Account details updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
     if(typeof(window) !== undefined){
      localStorage.removeItem('token'); 
      localStorage.setItem('token',response.token);
     }
      
     
     }
     else{
      setSnackbarMessage(response.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      }

 
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="sm"
        sx={{
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      > 
        <Typography variant="h4" sx={{color:'white'}} component="h1" gutterBottom>
          Account Details
        </Typography>

        <Box sx={{ width: '100%', mt: 2 }}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={userDetails.username}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Gmail"
            name="gmail"
            value={userDetails.gmail}
            onChange={handleInputChange}
            margin="normal"
           
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={userDetails.phoneNumber}
            onChange={handleInputChange}
            margin="normal"
          
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          {!isEditing ? (
            <Button variant="contained" color="primary" onClick={handleEditClick}>
              Edit Details
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveClick}
                sx={{ mr: 2 }}
              >
                Save
              </Button>
              <Button variant="outlined" onClick={handleCancelClick}>
                Cancel
              </Button>
            </>
          )}
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default AccountPage;