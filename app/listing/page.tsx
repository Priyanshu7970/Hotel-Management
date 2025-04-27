'use client';
import React, { useState, useRef, useEffect, useContext, FormEvent } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  IconButton,
  ImageList,
  ImageListItem,
  styled,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { any } from 'zod';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { listFormData } from '../api/listing/[id]/route';
import { LoaderContext } from '../context/loaderProvider';
import Image from 'next/image';

interface HomeListingFormProps {
  onSubmit: (formData: listFormData) => void;
}
interface JWTPayload {
  username?: string;
  email?: string;
  iat?: number;
  exp?: number;
  id?: string;
}

const StyledGridItem = styled(Grid)({
  xs: 12,
  sm: 6,
});
const DateTime = styled(DatePicker)({
  renderInput: () => any,
});

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

const HomeListingForm: React.FC<HomeListingFormProps> = () => {
  const [formData, setFormData] = useState<listFormData>({
    location: '',
    startDate: new Date().toString(),
    endDate: new Date().toString(),
    propertyType: '',
    requirements: [],
    additionalNotes: '',
    images: [],
    title: '',
    description: '',
    rent: '',
    contact: '', // Initialize contact field
  });
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>();
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [userData, setUserData] = useState<object | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rentError, setrentError] = useState<boolean>(false);
  const [loading ,setloading] = useState<boolean>(false);
  const [Token, setToken] = useState<string>('');
  const router = useRouter();

  const { toggleLoading } = useContext(LoaderContext)!;

  function getUsernameAndEmailFromToken(token: string | null): { username?: string; email?: string; id?: string } | null {
    if (!token) {
      return null;
    }
    try {
      const decodedToken: JWTPayload = jwtDecode(token);
      return { username: decodedToken.username, email: decodedToken.email, id: decodedToken.id };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'rent') {
      setrentError(Number(value) < 100);
    }
  };

  const handleDateChange = (date: Dayjs | null, name: 'startDate' | 'endDate') => {
    setFormData({ ...formData, [name]: date?.toDate() }); // Store as Date object
  };

  const handlePropertyTypeChange = (event: SelectChangeEvent<string>) => {
    setFormData({ ...formData, propertyType: event.target.value });
  };

  const handleRequirementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const currentRequirements = formData.requirements as string[];
    const requirements = checked
      ? [...currentRequirements, name]
      : currentRequirements.filter((item) => item !== name);
    setFormData({ ...formData, requirements });
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFormData({
        ...formData,
        images: [
          ...(formData.images || []),
          ...Array.from(files),
        ],
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData?.images?.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e:FormEvent) => {
    e.preventDefault();
        
    if (Number(formData.rent) < 100) {
      setrentError(true);
      return;
    }

    try {
      const userData = getUsernameAndEmailFromToken(Token);
      if (userData?.id !== undefined) {
        toggleLoading(); // Start loading

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('location', formData.location);
        formDataToSend.append('startDate', dayjs(formData.startDate).toISOString());
        formDataToSend.append('endDate', dayjs(formData.endDate).toISOString());
        formDataToSend.append('propertyType', formData.propertyType);
        formDataToSend.append('requirements', JSON.stringify(formData.requirements));
        formDataToSend.append('additionalNotes', formData?.additionalNotes || ''); // Use empty string as fallback
        formDataToSend.append('description', formData.description);
        formDataToSend.append('rent', String(formData.rent));
        formDataToSend.append('contact', formData.contact);

        formData?.images?.forEach((image) => {
          formDataToSend.append('images', image);
        });
        setloading(true);

        const response = await fetch(`/api/listing/${userData?.id}`, {
          method: 'POST',
          body: formDataToSend, 
        });

        if (response.ok) {
          setSnackbarMessage('Listing created successfully!');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
           setFormData({
            location: '',
            startDate: new Date().toString(),
            endDate: new Date().toString(),
            propertyType: '',
            requirements: [],
            additionalNotes: '',
            images: [],
            title: '',
            description: '',
            rent: '',
            contact: '', 
          });
          setloading(false);
        } else {
          const errorData = await response.json();
          setSnackbarMessage(`Error creating listing: ${errorData?.message || 'Something went wrong'}`);
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
          setloading(false);
        }
      } else if (userData?.id == undefined) {
        setSnackbarMessage('Login atleast one time to list the homes.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        setloading(false)
      }
    } catch (error: any) {
      setSnackbarMessage(`Error connecting to server: ${error.message}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      setloading(false);
    } finally {
      toggleLoading();
      setloading(false);
    }
  };

  const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        setToken(token);
      } else {
        router.replace('/authentication/login');
      }
    }
    toggleLoading();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Container maxWidth="md">
          <Typography sx={{ color: 'white' }} variant="h4" gutterBottom>
            List Your Home
          </Typography>
          <form method='POST' onSubmit={(e)=>handleSubmit(e)}>
            <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'column' }}>
              <StyledGridItem>
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                  Title
                </Typography>
                <TextField
                  fullWidth
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter a title for your listing"
                />
              </StyledGridItem>
              <StyledGridItem>
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                  Location
                </Typography>
                <TextField
                  fullWidth
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder='Enter in "Street, District, State, Country" format.'
                />
              </StyledGridItem>
              <Grid spacing={2} sx={{ display: 'flex', gap: 2 }}>
                <StyledGridItem>
                  <Typography variant="subtitle1" sx={{ color: 'white' }}>
                    Start Date
                  </Typography>
                  <DateTime
                    value={dayjs(formData.startDate)}
                    onChange={(date) => handleDateChange(date, 'startDate')}
                    sx={{ input: { color: 'white' }, label: { color: 'white' } }}
                  />
                </StyledGridItem>
                <StyledGridItem>
                  <Typography variant="subtitle1" sx={{ color: 'white' }}>
                    End Date
                  </Typography>
                  <DateTime
                    value={dayjs(formData.endDate)}
                    onChange={(date) => handleDateChange(date, 'endDate')}
                    sx={{ input: { color: 'white' }, label: { color: 'white' } }}
                  />
                </StyledGridItem>
              </Grid>
              <StyledGridItem>
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                  Property Type
                </Typography>
                <FormControl fullWidth required>
                  <Select
                    value={formData.propertyType}
                    label="Property Type"
                    inputProps={{ style: { color: 'white' } }}
                    sx={{ color: 'white' }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: '#111827',
                          color: 'white',
                        },
                      },
                    }}
                    defaultValue="apartment"
                    onChange={handlePropertyTypeChange}
                  >
                    <MenuItem value="apartment" sx={{ color: 'white' }}>Apartment</MenuItem>
                    <MenuItem value="house" sx={{ color: 'white' }}>House</MenuItem>
                    <MenuItem value="condo" sx={{ color: 'white' }}>Condo</MenuItem>
                    <MenuItem value="other" sx={{ color: 'white' }}>Other</MenuItem>
                  </Select>
                </FormControl>
              </StyledGridItem>
              <StyledGridItem>
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                  Requirements
                </Typography>
                <FormControl component="fieldset">
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData?.requirements?.includes('petsAllowed')}
                          onChange={handleRequirementChange}
                          name="petsAllowed"
                          sx={{ color: 'white' }}
                        />
                      }
                      label="Pets Allowed"
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData?.requirements?.includes('smokingAllowed')}
                          onChange={handleRequirementChange}
                          name="smokingAllowed"
                          sx={{ color: 'white' }}
                        />
                      }
                      label="Smoking Allowed"
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData?.requirements?.includes('wifi')}
                          onChange={handleRequirementChange}
                          name="wifi"
                          sx={{ color: 'white' }}
                        />
                      }
                      label="Wifi"
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData?.requirements?.includes('parking')}
                          onChange={handleRequirementChange}
                          name="parking"
                          sx={{ color: 'white' }}
                        />
                      }
                      label="Parking"
                      sx={{ color: 'white' }}
                    />
                  </FormGroup>
                </FormControl>
                <div>
                  {formData?.requirements?.map((requirement) => (
                    <Chip key={requirement} label={requirement} sx={{ margin: '2px', color: 'white' }} />
                  ))}
                </div>
              </StyledGridItem>
              <StyledGridItem>
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                  rent
                </Typography>
                <TextField
                  fullWidth
                  name="rent"
                  type="number"
                  value={formData.rent}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter the rent"
                  error={rentError}
                  helperText={rentError ? 'rent must be greater than 100' : ''}
                />
              </StyledGridItem>
              {/* Added Contact Field */}
              <StyledGridItem>
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                  Contact Information
                </Typography>
                <TextField
                  fullWidth
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your contact details (e.g., phone number or email)"
                />
              </StyledGridItem>
              <StyledGridItem>
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                  Additional Notes
                </Typography>
                <TextField
                  fullWidth
                  name="additionalNotes"
                  multiline
                  rows={4}
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                />
              </StyledGridItem>
              <StyledGridItem>
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </StyledGridItem>
              <StyledGridItem>
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                  Upload Images
                </Typography>
                <input
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="contained-button-file"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />

                <StyledGridItem spacing={2} sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
                  <label htmlFor="contained-button-file">
                    <Button variant="contained" component="span" startIcon={<PhotoCamera />} >
                      Upload Images
                    </Button>
                  </label>
                  <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ marginLeft: 2 }}>
                
                       {loading ? 'Submit...' : 'Submit'}
                  </Button>
                </StyledGridItem>
                <ImageList>
                  {formData.images ? formData.images.map((image, index) => (

                    <ImageListItem key={index} sx={{width:300}}>

                      <Image src={URL.createObjectURL(image)} width={300} height={300} alt={`property-${index}`} loading="lazy" />

                      <IconButton

                        onClick={() => removeImage(index)}

                        style={{ position: 'absolute', top: '5px', right: '5px', color: 'white' }}

                      >

                        <DeleteIcon />

                      </IconButton>

                    </ImageListItem>

                  )):''}
                </ImageList>
              </StyledGridItem>
            </Grid>
          </form>
        </Container>
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default HomeListingForm;