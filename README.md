# customehr

A clean, focused healthcare user management system with role-based authentication and REST API endpoints.


## 🏥 Healthcare User Management System

This application provides a streamlined healthcare user management system with role-based access control for patients, healthcare providers, and administrative staff. Built with Django and Django REST Framework, it offers a clean, maintainable codebase focused on essential healthcare functionality.

### 🏗️ System Architecture

#### **User Types & Permissions**

1. **Staff Users** (`user_type: "staff"`)
   - Full administrative access
   - Can manage all users, patients, and clinicians
   - Can create, read, update, delete all records
   - Access to admin dashboard

2. **Provider Users** (`user_type: "provider"`)
   - Healthcare professionals (Physicians, Nurses, Surgical Assistants)
   - Can view all patient records (read-only)
   - Linked to ClinicianUser model
   - Cannot modify patient data

3. **Patient Users** (`user_type: "patient"`)
   - Can only access their own patient record
   - Read-only access to personal data
   - Linked to Patient model
   - Secure data isolation

### 📊 Data Models

#### **User Model** (`customehr/users/models.py`)
- **Base User**: Email-based authentication with role management
- **Fields**: name, email, password, contactnumber, role, status, user_type
- **Links**: linked_patient, linked_clinician (foreign keys)

#### **ClinicianUser Model**
- **Roles**: Physicians, Nurses, Surgical Assistants
- **Fields**: firstname, lastname, role, emailid, contactnumber, npi, location, language, supervising_clinician
- **Supervision Levels**: None, Senior Clinician, Chief Clinician

#### **Patient Model**
- **Demographics**: first_name, middle_name, last_name, preferred_name, date_of_birth
- **Identity**: sex, gender_identity, ethnicity, race, language
- **Contact**: email, phone_number
- **Address**: address_line1, address_line2, city, state, zip_code

#### **Appointment Models**
- **AppointmentSlot**: Available time slots for providers
- **Appointment**: Booked appointments with patients and providers

### 🔐 Authentication System

#### **JWT Authentication**
- **Login Endpoint**: `POST /api/login/`
- **Token Lifetime**: Access (1 hour), Refresh (1 day)
- **Security**: Bearer token authentication

#### **API Authentication Flow**
```bash
# 1. Login to get JWT tokens
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# 2. Use access token for API calls
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:8000/api/patients/
```

### 🌐 API Endpoints

#### **Authentication**
- `POST /api/login/` - User login with JWT token response

#### **User Management** (Staff Only)
- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user
- `GET /api/users/me/` - Get current user info

#### **Clinician Management** (Staff Only)
- `GET /api/clinician-users/` - List all clinicians
- `POST /api/clinician-users/` - Create new clinician
- `GET /api/clinician-users/{id}/` - Get clinician details
- `PUT /api/clinician-users/{id}/` - Update clinician
- `DELETE /api/clinician-users/{id}/` - Delete clinician

#### **Patient Management** (Role-based Access)
- `GET /api/patients/` - List patients (filtered by user role)
- `POST /api/patients/` - Create patient (Staff only)
- `GET /api/patients/{id}/` - Get patient details
- `PUT /api/patients/{id}/` - Update patient (Staff only)
- `DELETE /api/patients/{id}/` - Delete patient (Staff only)

#### **Appointment Slots** (Provider/Staff Only)
- `GET /api/appointment-slots/` - List slots (filtered by user role)
- `POST /api/appointment-slots/` - Create new slot
- `GET /api/appointment-slots/{id}/` - Get slot details
- `PUT /api/appointment-slots/{id}/` - Update slot
- `DELETE /api/appointment-slots/{id}/` - Delete slot

#### **Appointment Booking** (Role-based Access)
- `GET /api/appointments/` - List appointments (filtered by user role)
- `POST /api/appointments/` - Book new appointment
- `GET /api/appointments/{id}/` - Get appointment details
- `PUT /api/appointments/{id}/` - Update appointment
- `DELETE /api/appointments/{id}/` - Cancel appointment
- `GET /api/appointments/my_appointments/` - Get user's appointments
- `GET /api/appointments/available_slots/?provider_id={id}` - Get available slots for provider

### 🔒 Permission System

#### **Custom Permission Classes**
- `IsStaff` - Staff users only
- `IsProviderOrStaff` - Providers and staff
- `IsPatientOrProviderOrStaff` - All authenticated users

#### **Data Access Rules**
- **Patients**: Can only see their own record
- **Providers**: Can see all patient records (read-only)
- **Staff**: Can access and modify all data

### 🚀 Quick Start

#### **1. Install Dependencies**
```bash
pip install -r requirements/local.txt
```

#### **2. Run Migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

#### **3. Create Superuser**
```bash
python manage.py createsuperuser
```

#### **4. Start Development Server**
```bash
python manage.py runserver
```

#### **5. Setup Test Data**
1. Access admin dashboard: `http://localhost:8000/admin/`
2. Create Patient records
3. Create ClinicianUser records
4. Create User accounts with appropriate `user_type` and links

#### **6. Test API Endpoints**
```bash
# Test login
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```


### 🔧 Development Notes

#### **Adding New User Types**
1. Update `USER_TYPE_CHOICES` in User model
2. Create custom permission class
3. Update viewset permissions
4. Test access control

#### **Extending Patient Data**
1. Add fields to Patient model
2. Update PatientSerializer
3. Update admin interface
4. Run migrations

#### **API Documentation**
- Swagger UI available at: `http://localhost:8000/api/docs/`
- API Schema at: `http://localhost:8000/api/schema/`
