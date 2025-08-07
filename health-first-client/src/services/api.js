// API Configuration and Service Functions
const API_BASE_URL = 'http://192.168.0.201:8000'; // Backend API URL

// Common headers for API requests
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Provider Registration API
export const registerProvider = async (providerData) => {
  // Convert the data to match the API specification
  const requestData = {
    first_name: providerData.first_name,
    last_name: providerData.last_name,
    email: providerData.email,
    phone_number: providerData.phone_number,
    password: providerData.password,
    confirm_password: providerData.confirm_password,
    specialization: providerData.specialization,
    license_number: providerData.license_number,
    years_of_experience: providerData.years_of_experience,
    qualifications: providerData.qualifications,
    clinic_name: providerData.clinic_name,
    clinic_address: providerData.clinic_address,
    practice_type: providerData.practice_type
  };

  // If there's a profile photo, use FormData
  if (providerData.profilePhoto) {
    const formData = new FormData();
    
    // Add all data fields
    Object.keys(requestData).forEach(key => {
      if (key === 'clinic_address') {
        formData.append(key, JSON.stringify(requestData[key]));
      } else {
        formData.append(key, requestData[key]);
      }
    });
    
    // Add profile photo
    formData.append('profile_photo', providerData.profilePhoto);

    const response = await fetch(`${API_BASE_URL}/api/v1/providers/register`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle validation errors from the API
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map(error => {
          const field = error.field.replace('body -> ', '').replace(' -> ', '.');
          return `${field}: ${error.message}`;
        });
        throw new Error(errorMessages.join(', '));
      }
      
      throw new Error(errorData.message || `Registration failed! status: ${response.status}`);
    }

    return await response.json();
  } else {
    // No profile photo, send as JSON
    const response = await fetch(`${API_BASE_URL}/api/v1/providers/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle validation errors from the API
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map(error => {
          const field = error.field.replace('body -> ', '').replace(' -> ', '.');
          return `${field}: ${error.message}`;
        });
        throw new Error(errorMessages.join(', '));
      }
      
      throw new Error(errorData.message || `Registration failed! status: ${response.status}`);
    }

    return await response.json();
  }
};

// Provider Login API
export const loginProvider = async (credentials) => {
  return apiRequest('/api/v1/providers/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// Patient Registration API
export const registerPatient = async (patientData) => {
  const formData = new FormData();
  
  Object.keys(patientData).forEach(key => {
    if (key === 'profilePhoto' && patientData[key]) {
      formData.append('profile_photo', patientData[key]);
    } else if (patientData[key] !== null && patientData[key] !== undefined) {
      formData.append(key, patientData[key]);
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/patients/register`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Registration failed! status: ${response.status}`);
  }

  return await response.json();
};

// Patient Login API
export const loginPatient = async (credentials) => {
  return apiRequest('/api/v1/patients/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// Get Providers List API
export const getProviders = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = `/api/providers${queryParams ? `?${queryParams}` : ''}`;
  return apiRequest(endpoint);
};

// Get Provider Availability API
export const getProviderAvailability = async (providerId, date) => {
  const endpoint = `/api/providers/${providerId}/availability?date=${date}`;
  return apiRequest(endpoint);
};

// Create Provider Availability API
export const createProviderAvailability = async (availabilityData, token) => {
  return apiRequest('/api/providers/availability', {
    method: 'POST',
    body: JSON.stringify(availabilityData),
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Book Appointment API
export const bookAppointment = async (appointmentData, token) => {
  return apiRequest('/api/appointments/book', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Get Appointments API
export const getAppointments = async (token, filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = `/api/appointments${queryParams ? `?${queryParams}` : ''}`;
  return apiRequest(endpoint, {
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`,
    },
  });
};

const apiService = {
  registerProvider,
  loginProvider,
  registerPatient,
  loginPatient,
  getProviders,
  getProviderAvailability,
  createProviderAvailability,
  bookAppointment,
  getAppointments,
};

export default apiService; 