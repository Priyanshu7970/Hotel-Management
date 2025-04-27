'use client'
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    Grid,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Box,
    createTheme,
} from '@mui/material';
import { FaSearch } from "react-icons/fa";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { LoaderContext } from '../context/loaderProvider';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { ThemeProvider } from '@emotion/react';
import Image from 'next/image';

interface HomeData {
    id: number;
    title: string;
    images: string[];
    description: string;
    rent: string;
    location: string;
    startDate:string;
    endDate:string;
}

interface payload{
    id:string;
}
const theme = createTheme({
  palette: {
    mode:'dark',
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


const HomeBooking: React.FC = () => {
    const [selectedHome, setSelectedHome] = useState<HomeData | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [openSnackbar, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [searchLocation, setSearchLocation] = useState<string>('');
    const [allHomes, setAllHomes] = useState<HomeData[]>([]); // Keep a copy of all homes
    const [filteredHomes, setFilteredHomes] = useState<HomeData[]>([]); // The homes to display
    const [touched,settouched] = useState<boolean>(false);
    const [userid,setuserId] = useState<string>('');

    const {toggleLoading} = useContext(LoaderContext)!;
    const router = useRouter();

    const fetchAllhomes = async()=>{
        const fetchData = await fetch('/api/homes');
        let data = await fetchData.json();
        console.log(data?.homes[0]?.images[0]);
        if(data.homes && data.homes.length > 0){
            setAllHomes(data.homes);
            setFilteredHomes(data.homes); 
        } else {
            setAllHomes([]);
            setFilteredHomes([]);
        }
    }
    useEffect(()=>{
        fetchAllhomes();
        toggleLoading();
        const token = localStorage.getItem('token');
        if(token){
         const decoded = jwtDecode<payload>(token);
         setuserId(decoded.id);
        }else{
            router.replace('/authentication/login');
        }
    },[])

    useEffect(() => {
        const filtered = allHomes.filter((home) =>
            home.location.toLowerCase().includes(searchLocation.toLowerCase())
        );
        setFilteredHomes(filtered);
        if (searchLocation) {
            settouched(true);
        } else {
            settouched(false); // Reset touched when search is cleared
        }
    }, [searchLocation, allHomes]); // Now also depends on allHomes

    const handleBook = (home: HomeData) => {
        setSelectedHome(home);
        setOpenDialog(true);
    };
    const handleOpenDialog = ()=>{
        setOpenDialog(true);
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setStartDate(null);
        setEndDate(null);
    };

    const handleConfirmBooking = async() => {
        if (!startDate || !endDate) {
            setSnackbarMessage('Please select both start and end dates.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (startDate.isAfter(endDate)) {
            setSnackbarMessage('Start date cannot be after end date.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        let fetchData =  await fetch(`/api/booking/[${userid}]`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify(selectedHome)
        });
        let data = await fetchData.json();
        if(data.success){
        setSnackbarMessage('Booking successful!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleCloseDialog();
        }
    };

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} dateFormats={{dayOfMonth: 'DD', month: 'MM', year: 'YYYY' }}>
            <Box sx={{ padding: 2, display: 'flex', justifyContent: 'center' }}>
                <div className="flex items-center gap-3 ">
                    <FaSearch className='text-[#6366f1]  text-3xl'/>
                    <TextField
        label="Search Location"
        variant="outlined"
        value={searchLocation}
        onChange={(e) => {setSearchLocation(e.target.value)
        }}
        sx={{
            width: '40vw',
            borderRadius: '50px',
            input: { color: 'white' },
            label: { color: '#6366f1' }, // Initial label color
            '& .MuiInputLabel-root': {
                color: '#6366f1', // Initial label color
            },
            '& .MuiInputLabel-root.Mui-focused': {
                color: '#6366f1 !important', // Force focused color
            },
            '& .MuiInputLabel-root.Mui-focused.MuiInputLabel-shrink': {
                color: '#6366f1 !important', // Force focused and shrink color
            },
            '& .MuiOutlinedInput-root': {
                '& fieldset': {
                    borderColor: '#6366f1',
                },
                '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                },
            }
        }}
        margin="normal"
    />
                </div>
            </Box>

            <div className='container mx-auto'>
            <section className="text-gray-400 bg-gray-900 body-font">
        <div className="container px-5 py-24 mx-auto">
            <div className="flex flex-wrap -m-4">

                {
                filteredHomes.length > 0 ? filteredHomes.map((home)=>{
                    return (
                        <div key={home.id} className="p-4 md:w-1/3">
                        <div className="h-full border-2 border-gray-800 rounded-lg overflow-hidden">
                            <Image src={`/assets/img/${home.images[0]}`} width={200} height={600} className="lg:h-48 md:h-36 w-full object-cover object-center" alt="blog"/>
                            <div className="p-6">
                                <h2 className="tracking-widest text-xs title-font font-medium text-gray-500 mb-1">Location: {home.location}</h2>
                                <h1 className="title-font text-lg font-medium text-white mb-3">{home.title}</h1>
                                <p className="leading-relaxed mb-3">{home.description}</p>
                                <div className="flex items-center flex-wrap ">
                                    <button onClick={()=>{handleBook(home)}} className='bg-indigo-400 text-white font-bold p-2 rounded-md cursor-pointer'>Book Now: &#8377;{home.rent}/-Only</button>

                                </div>
                            </div>
                        </div>
                    </div>
                    )
                }):<div className='text-white mx-auto text-2xl my-[20vh]'>{touched?'Result Not Found':"Search for the Results"}</div>
                }


            </div>
        </div>
    </section>
            </div>



            <ThemeProvider theme={theme} >
            <Dialog open={openDialog} onClose={handleCloseDialog} slotProps={{
                paper:{
                    style:{
                        backgroundColor:'#0d131e'
                    }
                }
            }}>
                <DialogTitle>Book {selectedHome?.title}</DialogTitle>
                <DialogContent >
                    <Grid container spacing={2}>
                        <Grid>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                format='DD/MM/YYYY'
                                sx={{ input: { color: 'white' }, label: { color: '#6366f1' } }}
                            />
                        </Grid>
                        <Grid>
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                format='DD/MM/YYYY'
                                sx={{ input: { color: 'white' }, label: { color: '#6366f1' } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleConfirmBooking} variant="contained">
                        Confirm Booking
                    </Button>
                </DialogActions>
            </Dialog>
            </ThemeProvider>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </LocalizationProvider>
    );
};

export default HomeBooking;