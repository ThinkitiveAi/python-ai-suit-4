import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Heart, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Camera, 
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './PatientRegistration.css';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  phone: yup.string()
    .matches(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  dateOfBirth: yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),
  gender: yup.string().required('Please select your gender'),
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup.string()
    .matches(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code')
    .required('ZIP code is required'),
  emergencyName: yup.string().required('Emergency contact name is required'),
  emergencyRelationship: yup.string().required('Please select relationship'),
  emergencyPhone: yup.string()
    .matches(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Emergency contact phone is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  termsAccepted: yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
  privacyAccepted: yup.boolean()
    .oneOf([true], 'You must accept the privacy policy'),
  hipaaAccepted: yup.boolean()
    .oneOf([true], 'You must accept the HIPAA consent')
});

const genderOptions = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say'
];

const relationshipOptions = [
  'Spouse',
  'Parent',
  'Sibling',
  'Child',
  'Friend',
  'Other'
];

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const PatientRegistration = ({ onSwitchToLogin, onBackToSelector, onRegistrationSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null); // eslint-disable-line no-unused-vars
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHipaaModal, setShowHipaaModal] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    trigger,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const watchedPassword = watch('password', '');

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[@$!%*?&]/.test(password)) strength += 1;
    return strength;
  };

  React.useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(watchedPassword));
  }, [watchedPassword]);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('phone', formatted);
  };

  const handleEmergencyPhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('emergencyPhone', formatted);
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'];
      case 2:
        return ['street', 'city', 'state', 'zipCode'];
      case 3:
        return ['emergencyName', 'emergencyRelationship', 'emergencyPhone'];
      case 4:
        return ['password', 'confirmPassword', 'termsAccepted', 'privacyAccepted', 'hipaaAccepted'];
      default:
        return [];
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitSuccess(true);
      
      // Call the registration success callback with user data
      if (onRegistrationSuccess) {
        setTimeout(() => {
          onRegistrationSuccess({
            id: 'patient-new',
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            type: 'patient',
            dateOfBirth: data.dateOfBirth
          });
        }, 3000); // Give user time to see success message
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Personal Information';
      case 2: return 'Address Information';
      case 3: return 'Emergency Contact';
      case 4: return 'Account Security';
      default: return '';
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 1: return <User size={20} />;
      case 2: return <MapPin size={20} />;
      case 3: return <Phone size={20} />;
      case 4: return <Shield size={20} />;
      default: return null;
    }
  };

  if (submitSuccess) {
    return (
      <div className="registration-success">
        <div className="success-content">
          <CheckCircle size={64} className="success-icon" />
          <h2>Welcome to Health First!</h2>
          <p>Your account has been created successfully.</p>
          <div className="next-steps">
            <h3>Next Steps:</h3>
            <ul>
              <li>Check your email for verification link</li>
              <li>Complete your health profile</li>
              <li>Schedule your first appointment</li>
              <li>Explore your patient dashboard</li>
            </ul>
          </div>
          <button 
            className="btn-primary"
            onClick={() => {
              if (onRegistrationSuccess) {
                onRegistrationSuccess({
                  id: 'patient-new',
                  name: 'New Patient',
                  email: 'patient@example.com',
                  type: 'patient',
                  dateOfBirth: '1990-01-01'
                });
              }
            }}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-registration">
      <div className="registration-container">
        <header className="registration-header">
          <div className="header-content">
            <Heart size={32} className="header-icon" />
            <h1>Join Health First</h1>
            <p>Create your account to access personalized healthcare</p>
          </div>
        </header>

        <div className="progress-bar">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''}`}>
              <div className="step-number">{step}</div>
              <span className="step-label">{getStepTitle(step)}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="registration-form">
          {currentStep === 1 && (
            <div className="form-step">
              <div className="step-header">
                {getStepIcon(1)}
                <h2>{getStepTitle(1)}</h2>
              </div>
              
              <div className="photo-upload-section">
                <label className="photo-upload-label">Profile Photo (Optional)</label>
                <div className="photo-upload-area">
                  {photoPreview ? (
                    <div className="photo-preview">
                      <img src={photoPreview} alt="Profile preview" />
                      <button 
                        type="button" 
                        className="remove-photo"
                        onClick={removePhoto}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="upload-placeholder"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={32} />
                      <p>Add a profile photo</p>
                      <span>JPG, PNG up to 5MB</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <div className="input-wrapper">
                    <User size={20} className="input-icon" />
                    <input
                      id="firstName"
                      type="text"
                      {...register('firstName')}
                      placeholder="Enter your first name"
                    />
                  </div>
                  {errors.firstName && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {errors.firstName.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <div className="input-wrapper">
                    <User size={20} className="input-icon" />
                    <input
                      id="lastName"
                      type="text"
                      {...register('lastName')}
                      placeholder="Enter your last name"
                    />
                  </div>
                  {errors.lastName && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {errors.lastName.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <div className="input-wrapper">
                  <Mail size={20} className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <div className="input-wrapper">
                  <Phone size={20} className="input-icon" />
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.phone.message}
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <div className="input-wrapper">
                    <Calendar size={20} className="input-icon" />
                    <input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {errors.dateOfBirth.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
                  <div className="input-wrapper">
                    <User size={20} className="input-icon" />
                    <select id="gender" {...register('gender')}>
                      <option value="">Select your gender</option>
                      {genderOptions.map((gender) => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>
                  {errors.gender && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {errors.gender.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-step">
              <div className="step-header">
                {getStepIcon(2)}
                <h2>{getStepTitle(2)}</h2>
              </div>

              <div className="form-group">
                <label htmlFor="street">Street Address *</label>
                <div className="input-wrapper">
                  <MapPin size={20} className="input-icon" />
                  <input
                    id="street"
                    type="text"
                    {...register('street')}
                    placeholder="Enter your street address"
                  />
                </div>
                {errors.street && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.street.message}
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <div className="input-wrapper">
                    <MapPin size={20} className="input-icon" />
                    <input
                      id="city"
                      type="text"
                      {...register('city')}
                      placeholder="Enter your city"
                    />
                  </div>
                  {errors.city && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {errors.city.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <div className="input-wrapper">
                    <MapPin size={20} className="input-icon" />
                    <select id="state" {...register('state')}>
                      <option value="">Select your state</option>
                      {states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  {errors.state && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {errors.state.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code *</label>
                <div className="input-wrapper">
                  <MapPin size={20} className="input-icon" />
                  <input
                    id="zipCode"
                    type="text"
                    {...register('zipCode')}
                    placeholder="Enter your ZIP code"
                  />
                </div>
                {errors.zipCode && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.zipCode.message}
                  </span>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="form-step">
              <div className="step-header">
                {getStepIcon(3)}
                <h2>{getStepTitle(3)}</h2>
              </div>

              <div className="form-group">
                <label htmlFor="emergencyName">Emergency Contact Name *</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input
                    id="emergencyName"
                    type="text"
                    {...register('emergencyName')}
                    placeholder="Enter emergency contact name"
                  />
                </div>
                {errors.emergencyName && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.emergencyName.message}
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emergencyRelationship">Relationship *</label>
                  <div className="input-wrapper">
                    <User size={20} className="input-icon" />
                    <select id="emergencyRelationship" {...register('emergencyRelationship')}>
                      <option value="">Select relationship</option>
                      {relationshipOptions.map((relationship) => (
                        <option key={relationship} value={relationship}>{relationship}</option>
                      ))}
                    </select>
                  </div>
                  {errors.emergencyRelationship && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {errors.emergencyRelationship.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyPhone">Emergency Contact Phone *</label>
                  <div className="input-wrapper">
                    <Phone size={20} className="input-icon" />
                    <input
                      id="emergencyPhone"
                      type="tel"
                      {...register('emergencyPhone')}
                      onChange={handleEmergencyPhoneChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  {errors.emergencyPhone && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {errors.emergencyPhone.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="form-step">
              <div className="step-header">
                {getStepIcon(4)}
                <h2>{getStepTitle(4)}</h2>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="input-wrapper">
                  <Shield size={20} className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill strength-${passwordStrength}`}
                    ></div>
                  </div>
                  <span className="strength-text">
                    {passwordStrength === 0 && 'Very Weak'}
                    {passwordStrength === 1 && 'Weak'}
                    {passwordStrength === 2 && 'Fair'}
                    {passwordStrength === 3 && 'Good'}
                    {passwordStrength === 4 && 'Strong'}
                    {passwordStrength === 5 && 'Very Strong'}
                  </span>
                </div>
                {errors.password && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.password.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="input-wrapper">
                  <Shield size={20} className="input-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              <div className="consent-section">
                <h3>Consent & Agreements</h3>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...register('termsAccepted')}
                    />
                    <span className="checkmark"></span>
                    I agree to the{' '}
                    <button
                      type="button"
                      className="terms-link"
                      onClick={() => setShowTermsModal(true)}
                    >
                      Terms and Conditions
                    </button>
                  </label>
                  {errors.termsAccepted && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {errors.termsAccepted.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...register('privacyAccepted')}
                    />
                    <span className="checkmark"></span>
                    I agree to the{' '}
                    <button
                      type="button"
                      className="terms-link"
                      onClick={() => setShowPrivacyModal(true)}
                    >
                      Privacy Policy
                    </button>
                  </label>
                  {errors.privacyAccepted && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {errors.privacyAccepted.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...register('hipaaAccepted')}
                    />
                    <span className="checkmark"></span>
                    I consent to{' '}
                    <button
                      type="button"
                      className="terms-link"
                      onClick={() => setShowHipaaModal(true)}
                    >
                      HIPAA Privacy Practices
                    </button>
                  </label>
                  {errors.hipaaAccepted && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {errors.hipaaAccepted.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={prevStep}
              >
                <ChevronLeft size={20} />
                Previous
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={nextStep}
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            )}
          </div>
        </form>

        <footer className="registration-footer">
          <p>Already have an account? <button type="button" className="footer-link" onClick={onSwitchToLogin}>Sign in here</button></p>
          <p><button type="button" className="footer-link" onClick={onBackToSelector}>Back to Menu</button> • Need help? Contact support at <a href="mailto:support@healthfirst.com">support@healthfirst.com</a></p>
        </footer>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Terms and Conditions</h3>
              <button 
                className="modal-close"
                onClick={() => setShowTermsModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <h4>Patient Registration Terms</h4>
              <p>By creating an account with Health First, you agree to:</p>
              <ul>
                <li>Provide accurate and truthful information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the platform in accordance with our policies</li>
                <li>Notify us of any changes to your information</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
              <h4>Service Terms</h4>
              <p>Health First provides:</p>
              <ul>
                <li>Secure access to your health information</li>
                <li>Appointment scheduling and management</li>
                <li>Communication with your healthcare providers</li>
                <li>Access to educational health resources</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Privacy Policy</h3>
              <button 
                className="modal-close"
                onClick={() => setShowPrivacyModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <h4>How We Use Your Information</h4>
              <p>We collect and use your information to:</p>
              <ul>
                <li>Provide healthcare services and support</li>
                <li>Communicate with you about your care</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
              <h4>Information Security</h4>
              <p>We protect your information through:</p>
              <ul>
                <li>Encryption of sensitive data</li>
                <li>Secure data transmission</li>
                <li>Regular security audits</li>
                <li>Access controls and monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* HIPAA Modal */}
      {showHipaaModal && (
        <div className="modal-overlay" onClick={() => setShowHipaaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>HIPAA Privacy Practices</h3>
              <button 
                className="modal-close"
                onClick={() => setShowHipaaModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <h4>Your Health Information Rights</h4>
              <p>Under HIPAA, you have the right to:</p>
              <ul>
                <li>Access and receive copies of your health records</li>
                <li>Request corrections to your health information</li>
                <li>Receive a notice of privacy practices</li>
                <li>File a complaint if you believe your rights have been violated</li>
              </ul>
              <h4>How We May Use Your Information</h4>
              <p>We may use your health information for:</p>
              <ul>
                <li>Treatment, payment, and healthcare operations</li>
                <li>Appointment reminders and follow-up care</li>
                <li>Quality improvement and patient safety</li>
                <li>Required public health reporting</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRegistration; 