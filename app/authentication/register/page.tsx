'use client';

import React, { useState, useEffect, useContext } from 'react';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Alert,
    ThemeProvider,
    createTheme,
    Link, // Import Link from MUI
} from '@mui/material';
import { grey, red } from '@mui/material/colors';
import { z } from 'zod';
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

const registerSchema = z.object({
    username: z.string().min(3, { message: 'Username must have minimum 3 length' }),
    phone:z.string(),
    email: z.string().email({ message: 'Invalid email format.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.Password must include alphabets in lowercases and uppercases, number, @, and no spaces.' }).refine(
        (password) => /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@])(?!.*\s).{6,}$/.test(password),
        { message: 'Password must be at least 8 characters.Password must include alphabets in lowercases and uppercases, number, @, and no spaces.' }
    ),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {

    const [formData, setFormData] = useState<RegisterForm>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone:''
    });

    const [errors, setErrors] = useState<z.ZodError<RegisterForm> | null>(null);
    const [touched, setTouched] = useState<{ [key in keyof RegisterForm]?: boolean }>({});
    const [success, setSuccess] = useState<boolean>(false);
    const [failed, setFailed] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [usernameExistsError, setUsernameExistsError] = useState<string | null>(null);
    const [Severity, setSevertiy] = useState<'error' | 'success' | null>(null);
    const [SeverityMessage, setSevertiyMessage] = useState<string>('');
    const router = useRouter();
     const {toggleLoading} = useContext(LoaderContext)!;
    useEffect(() => {
        if (Object.keys(touched).length > 0) {
            const result = registerSchema.safeParse(formData);
            if (!result.success) {
                setErrors(result.error);
                setIsFormValid(false);
            } else {
                setErrors(null);
                setIsFormValid(true);
            }
        }
    }, [formData, touched]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setTouched((prevTouched) => ({
            ...prevTouched,
            [name]: true,
        }));
        if (name === "username") {
            setUsernameExistsError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = registerSchema.safeParse(formData);

        if (result.success) {
            setErrors(null);
            setLoading(true);
            setUsernameExistsError(null);

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
                const data = await response.json();
                console.log(data);
                if (data.sucess) {
                    console.log(data);
                    setSuccess(true);
                    setFormData({
                        username: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        phone:''
                    });
                    setTouched({});
                    setSevertiy('success');
                    setSevertiyMessage(data.message);


                } else {
                    setSevertiy('error');
                    setSevertiyMessage(data.message);
                }
            } catch (error) {
                console.error('Error during registration:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(result.error);
            const newTouched: { [key in keyof RegisterForm]?: boolean } = {};
            Object.keys(formData).forEach((key) => {
                newTouched[key as keyof RegisterForm] = true;
            });
            setTouched(newTouched);
        }
    };
    useEffect(()=>{
      toggleLoading();
    },[])
    useEffect(() => {
        if (success) {
            setTimeout(() => {
                router.replace('/authentication/login');
            }, 2000);
        }
       
    })

    return (
        <ThemeProvider theme={theme}>
            <Container
                maxWidth="xs"
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        border: '2px solid white',
                        maxHeight: '900px',
                        paddingY: '40px',
                        paddingX: '40px'
                    }}
                >
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-20 h-20 mb-5 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <Typography component="h1" variant="h5" sx={{ color: 'white' }}>
                        Register
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        {Object.keys(formData).map((key) => (
                            <TextField
                                key={key}
                                margin="normal"
                                required
                                fullWidth
                                id={key}
                                label={key.charAt(0).toUpperCase() + key.slice(1)}
                                name={key}
                                autoComplete={key === 'email' ? 'email' : 'new-password'}
                                type={key.includes('password') || key.includes('confirmPassword') ? 'password' : 'text'}
                                value={formData[key as keyof RegisterForm]}
                                onChange={handleChange}
                                error={!!(errors?.issues.find((issue) => issue.path.includes(key)) && touched[key as keyof RegisterForm]) || (key === "username" && !!usernameExistsError)}
                                helperText={(errors?.issues.find((issue) => issue.path.includes(key)) && touched[key as keyof RegisterForm]) ? errors?.issues.find((issue) => issue.path.includes(key))?.message : (key === "username" && usernameExistsError) ? usernameExistsError : ''}
                            />
                        ))}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, backgroundColor: '#6366f1' }}
                            disabled={loading || !isFormValid}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </Button>
                        {Severity === null ? '' : <Alert severity={Severity}>{SeverityMessage}</Alert>}

                    </Box>
                    <Link href="/authentication/login" variant="body2" sx={{ mt: 2, color: 'white', textAlign: 'center' }}>
                        Already have an account? Login
                    </Link>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default Register;