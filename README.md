# customehr

A clean, focused healthcare user management system with role-based authentication and REST API endpoints.

## 🏥 Healthcare User Management System

This application provides a streamlined healthcare user management system with role-based access control for patients, healthcare providers, and administrative staff. Built with Django and Django REST Framework, it offers a clean, maintainable codebase focused on essential healthcare functionality.

---

## 🤖 AI Development Prompt

This section provides the prompt used to design and develop this healthcare management system using AI tools. Future developers can use this as a reference to understand the development approach and methodology.

### **Initial System Design Prompt**

I need to design a comprehensive healthcare user management system with the following requirements:

### **System Overview:**

- A Python-based healthcare management system
- Role-based authentication for patients, healthcare providers, and administrative staff
- REST API with JWT authentication
- Appointment scheduling and management
- Patient and provider data management

#### **User Types & Permissions:**
1. Staff Users (user_type: "staff")

- Full administrative access
- Can manage all users, patients, and clinicians
- Can create, read, update, delete all records

2. Provider Users (user_type: "provider")

- Healthcare professionals (Physicians, Nurses, Surgical Assistants)
- Can view all patient records (read-only)
- Can manage their own appointment slots
- Cannot modify patient data

3. Patient Users (user_type: "patient")

- Can only access their own patient record
- Can view and book appointments
- Read-only access to personal data

#### **Data Models Required:**

1. User Model (extends AbstractUser)
- Email-based authentication
- Role management (staff/provider/patient)
- Links to Patient or ClinicianUser models

2. ClinicianUser Model
- Healthcare provider information
- Roles: Physicians, Nurses, Surgical Assistants
- NPI number, location, language, supervising clinician
- Supervision levels

3. Patient Model
- Complete patient demographics
- Contact information
- Address details
- Medical identity information

4. AppointmentSlot Model
- Available time slots for providers
- Date, time, availability status
- Provider association

5. Appointment Model
- Booked appointments
- Patient-provider relationships
- Appointment types and modes
- Status tracking

#### **API Requirements:**

- JWT authentication
- Role-based access control
- CRUD operations for all models
- Appointment booking workflow
- Available slots querying
- User-specific data filtering

#### **Security Requirements:**

- HIPAA-compliant data access
- Secure authentication
- Role-based permissions
- Data isolation between user types

Please help me design the Django models, API endpoints, and permission system for this healthcare management system.


### **Model Design Prompt**

Based on the healthcare system requirements, I need to design Django models with the following specifications:

#### **User Model Requirements:**

- Extend AbstractUser with email as username
- Add user_type field (staff/provider/patient)
- Add contact number and role fields
- Add foreign key relationships to Patient and ClinicianUser models
- Implement proper validation and constraints

#### **ClinicianUser Model Requirements:**

- Healthcare provider information
- Roles: Physicians, Nurses, Surgical Assistants
- Fields: firstname, lastname, role, email, contact, NPI, location, language
- Supervision levels: None, Senior Clinician, Chief Clinician
- Proper validation for NPI numbers and email addresses

#### **Patient Model Requirements:**

- Complete patient demographics
- Fields: first_name, middle_name, last_name, preferred_name, date_of_birth
- Identity: sex, gender_identity, ethnicity, race, language
- Contact: email, phone_number
- Address: address_line1, address_line2, city, state, zip_code
- HIPAA-compliant data structure

#### **AppointmentSlot Model Requirements:**

- Provider association
- Date and time fields
- Availability status
- Timezone support
- Day of week tracking
- Unique constraints for provider and datetime

#### **Appointment Model Requirements:**

- Patient and provider relationships
- Appointment slot association
- Appointment types: consultation, follow_up, emergency, routine_checkup, specialist_visit, procedure
- Appointment modes: in_person, virtual, phone
- Status tracking: scheduled, confirmed, in_progress, completed, cancelled, no_show, rescheduled
- Estimated amount and reason for visit
- Notes and timestamps


Please provide the Django model definitions with proper field types, constraints, and relationships.


### **API Design Prompt**

I need to design REST API endpoints for the healthcare management system with the following requirements

#### **Authentication:**

- JWT-based authentication
- Login endpoint that returns user info and tokens
- Token lifetime: Access (1 hour), Refresh (1 day)

### 🌐 API Endpoints Required:


1. Authentication Endpoints:
- `POST /api/login/` - User login with JWT response

2. User Management (Staff Only):

- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user
- `GET /api/users/me/` - Get current user info

3. Clinician Management (Staff Only):

- `GET /api/clinician-users/` - List all clinicians
- `POST /api/clinician-users/` - Create new clinician
- `GET /api/clinician-users/{id}/` - Get clinician details
- `PUT /api/clinician-users/{id}/` - Update clinician
- `DELETE /api/clinician-users/{id}/` - Delete clinician

4. Patient Management (Role-based Access):
- `GET /api/patients/` - List patients (filtered by user role)
- `POST /api/patients/` - Create patient (Staff only)
- `GET /api/patients/{id}/` - Get patient details
- `PUT /api/patients/{id}/` - Update patient (Staff only)
- `DELETE /api/patients/{id}/` - Delete patient (Staff only)

5. Appointment Slots (Provider/Staff Only):
- `GET /api/appointment-slots/` - List slots (filtered by user role)
- `POST /api/appointment-slots/` - Create new slot
- `GET /api/appointment-slots/{id}/` - Get slot details
- `PUT /api/appointment-slots/{id}/` - Update slot
- `DELETE /api/appointment-slots/{id}/` - Delete slot

6. Appointment Booking (Role-based Access):
- `GET /api/appointments/` - List appointments (filtered by user role)
- `POST /api/appointments/` - Book new appointment
- `GET /api/appointments/{id}/` - Get appointment details
- `PUT /api/appointments/{id}/` - Update appointment
- `DELETE /api/appointments/{id}/` - Cancel appointment
- `GET /api/appointments/my_appointments/` - Get user's appointments
- `GET /api/appointments/available_slots/?provider_id={id} - Get available slots

### Permission Requirements:
- Custom permission classes for role-based access
- Data filtering based on user type
- Secure data access patterns
- JSON responses with proper serialization
- Error handling with appropriate HTTP status codes
- Pagination for list endpoints
- Proper validation and error messages


Please help me design the Django REST Framework viewsets, serializers, and permission classes for these endpoints.

### **Permission System Prompt**

I need to implement a comprehensive permission system for the healthcare management system with the following requirements:

### Permission Classes Required:

#### **Custom Permission Classes**

1. IsStaff - Staff users only
- Full administrative access
- Can access all data and perform all operations

2. IsProviderOrStaff - Providers and staff
- Can access provider-related functionality
- Can manage appointment slots and appointments
3. IsPatientOrProviderOrStaff - All authenticated users
- Basic access for all user types
- Used for read-only operations

### Data Access Rules:
1. Patient Data Access:
- Patients: Can only see their own record
- Providers: Can see all patient records (read-only)
- Staff: Can access and modify all patient data

2. Provider Data Access:
- Providers: Can see their own data and manage their slots
- Staff: Can access and modify all provider data
- Patients: No access to provider data

3. Appointment Data Access:
- Patients: Can see their own appointments
- Providers: Can see appointments they're involved in
- Staff: Can see and manage all appointments

4. Appointment Slot Access:
- Providers: Can manage their own slots
- Staff: Can manage all slots
- Patients: Can view available slots for booking


### Implementation Requirements:
- Custom permission classes
- Viewset-level permissions
- Object-level permissions where needed
- Proper error handling for unauthorized access
- Audit trail considerations