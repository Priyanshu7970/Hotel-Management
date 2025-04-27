'use client';
import React, { useState, useRef,useEffect, useContext } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  Grid,
  styled,
  Link,
  Alert
} from '@mui/material';
import { z } from 'zod';
import { grey, red } from '@mui/material/colors';
import { Router } from 'next/router';
import { useRouter } from 'next/navigation';
import { LoaderContext } from '@/app/context/loaderProvider';


const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: grey[900],
        },
        background: {
            default: '#6366f1',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#fff',
        },
        error: {
            main: red.A400,
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                        },
                        '&.Mui-error fieldset': {
                            borderColor: red.A400,
                        },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: '#6366f1',
                    },
                    '& .MuiInputLabel-root.Mui-error': {
                        color: red.A400,
                    },
                },
            },
        },
    },
});

const CenteredContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
}));

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password is not valid'),
});

interface LoginPageDarkProps { }

const LoginPageDark: React.FC<LoginPageDarkProps> = () => {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const {toggleLoading} = useContext(LoaderContext)!;

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setEmail(newValue);
    validateEmail(newValue, password);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setPassword(newValue);
    validatePassword(email, newValue);
  };

  const validateEmail = (emailValue: string, passwordValue: string) => {
    try {
      loginSchema.parse({ email: emailValue, password: passwordValue });
      setEmailError(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const emailValidation = error.errors.find((err) => err.path.includes('email'))?.message;
        setEmailError(emailValidation || null);
      }
    }
  };

  const validatePassword = (emailValue: string, passwordValue: string) => {
    try {
      loginSchema.parse({ email: emailValue, password: passwordValue });
      setPasswordError(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const passwordValidation = error.errors.find((err) => err.path.includes('password'))?.message;
        setPasswordError(passwordValidation || null);
      }
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
     setLoading(true);
    try {
      loginSchema.parse({ email, password });
      let data = loginSchema.parse({ email, password });
      const fetchdata = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const response = await fetchdata.json();
console.log(response);
      if (response.token) {
        localStorage.setItem('token', response.token);
        setAlertSeverity('success');
        setAlertMessage('Login successful');
        setLoading(false);
        router.replace('/');
      } else {
        setAlertSeverity('error');
        setAlertMessage('Invalid credentail. Try again');
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const emailValidation = error.errors.find((err) => err.path.includes('email'))?.message;
        const passwordValidation = error.errors.find((err) => err.path.includes('password'))?.message;
        setEmailError(emailValidation || null);
        setPasswordError(passwordValidation || null);
        setAlertSeverity('error');
        setAlertMessage('Internal Server Error');
      }
    }
  };
  useEffect(()=>{
    toggleLoading();
  },[])

  return (
    <ThemeProvider theme={theme}>
      <CenteredContainer container>
        <Grid>
          <Container
            component="main"
            sx={{
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: 'white',
              paddingY: 10,
              borderRadius: '10px',
            }}
          >
            <Box
              sx={{
                marginTop: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
             <div>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-20 h-20 mb-5 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
             </div>
              <Typography component="h5" variant="h5" sx={{ color: 'white' }}>
                Log in
              </Typography>
              <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={handleEmailChange}
                  error={!!emailError}
                  helperText={emailError}
                  inputRef={emailInputRef}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  error={!!passwordError}
                  helperText={passwordError}
                  inputRef={passwordInputRef}
                />
               <Button
                                           type="submit"
                                           fullWidth
                                           variant="contained"
                                           sx={{ mt: 3, mb: 2 ,backgroundColor:'#6366f1'}}
                                           disabled={loading}
                                       >
                                           {loading ? 'LogIn...' : 'LogIn'}
                                       </Button>
                {alertMessage && alertSeverity && (
                <Alert severity={alertSeverity} sx={{ mt: 2, width: '100%' }}>
                  {alertMessage}
                </Alert>
              )}
               
              </Box>
              <Link href="/authentication/register" variant="body2" sx={{ mt: 2, color: 'white', textAlign: 'center' }}>
                 Don't have account?Register here
                </Link>
            </Box>
          </Container>
        </Grid>
      </CenteredContainer>
    </ThemeProvider>
  );
};

export default LoginPageDark;