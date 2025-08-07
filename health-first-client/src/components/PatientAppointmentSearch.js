import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Calendar,
  Phone,
  Video,
  User,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Shield
} from 'lucide-react';
import './PatientAppointmentSearch.css';

const PatientAppointmentSearch = ({ user, onBackToDashboard }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    specialization: 'all',
    location: 'all',
    appointmentType: 'all',
    insurance: 'all',
    maxPrice: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    slotId: '',
    appointmentType: '',
    notes: '',
    insuranceInfo: '',
    emergencyContact: ''
  });

  // Sample providers data
  const sampleProviders = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      rating: 4.8,
      experience: '15 years',
      clinic: 'HeartCare Medical Center',
      location: 'New York, NY',
      address: '123 Medical Plaza, Suite 200',
      phone: '+1 (555) 123-4567',
      acceptsInsurance: true,
      pricing: {
        consultation: 150,
        followUp: 100,
        videoCall: 120,
        phoneCall: 80
      },
      availableSlots: [
        {
          id: 1,
          date: '2024-01-20',
          startTime: '09:00',
          endTime: '10:00',
          type: 'consultation',
          price: 150,
          timezone: 'America/New_York'
        },
        {
          id: 2,
          date: '2024-01-20',
          startTime: '14:00',
          endTime: '14:30',
          type: 'follow-up',
          price: 100,
          timezone: 'America/New_York'
        }
      ]
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'Dermatology',
      rating: 4.9,
      experience: '12 years',
      clinic: 'SkinCare Specialists',
      location: 'Los Angeles, CA',
      address: '456 Health Ave, Floor 3',
      phone: '+1 (555) 987-6543',
      acceptsInsurance: true,
      pricing: {
        consultation: 180,
        followUp: 120,
        videoCall: 150,
        phoneCall: 90
      },
      availableSlots: [
        {
          id: 3,
          date: '2024-01-21',
          startTime: '10:00',
          endTime: '11:00',
          type: 'consultation',
          price: 180,
          timezone: 'America/Los_Angeles'
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setSearchResults(sampleProviders);
      setIsLoading(false);
    }, 1000);
  }, [searchQuery, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Trigger search with current filters
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBookAppointment = (provider, slot) => {
    setSelectedProvider(provider);
    setBookingData(prev => ({
      ...prev,
      slotId: slot.id,
      appointmentType: slot.type
    }));
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate booking API call
    setTimeout(() => {
      setIsLoading(false);
      setShowBookingModal(false);
      setSelectedProvider(null);
      // Show success message
      alert('Appointment booked successfully!');
    }, 1500);
  };

  // Timezone conversion would be implemented with a library like date-fns-tz
  // const convertTimezone = (time, fromTimezone, toTimezone) => {
  //   return time;
  // };

  const formatPrice = (price) => {
    return `$${price}`;
  };

  const renderSearchFilters = () => (
    <div className="search-filters">
      <div className="filter-row">
        <div className="filter-group">
          <label>Date Range</label>
          <div className="date-inputs">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              placeholder="Start date"
            />
            <span>to</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              placeholder="End date"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Specialization</label>
          <select
            value={filters.specialization}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
          >
            <option value="all">All Specializations</option>
            <option value="cardiology">Cardiology</option>
            <option value="dermatology">Dermatology</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="neurology">Neurology</option>
            <option value="pediatrics">Pediatrics</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Appointment Type</label>
          <select
            value={filters.appointmentType}
            onChange={(e) => handleFilterChange('appointmentType', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="follow-up">Follow-up</option>
            <option value="video">Video Call</option>
            <option value="phone">Phone Call</option>
          </select>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>Location</label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          >
            <option value="all">All Locations</option>
            <option value="new-york">New York</option>
            <option value="los-angeles">Los Angeles</option>
            <option value="chicago">Chicago</option>
            <option value="remote">Remote Only</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Insurance</label>
          <select
            value={filters.insurance}
            onChange={(e) => handleFilterChange('insurance', e.target.value)}
          >
            <option value="all">All Insurance</option>
            <option value="blue-cross">Blue Cross</option>
            <option value="aetna">Aetna</option>
            <option value="cigna">Cigna</option>
            <option value="self-pay">Self Pay</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Max Price</label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="Enter max price"
            min="0"
          />
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>Your Timezone</label>
          <select
            value={filters.timezone}
            onChange={(e) => handleFilterChange('timezone', e.target.value)}
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderProviderCard = (provider) => (
    <div key={provider.id} className="provider-card">
      <div className="provider-header">
        <div className="provider-info">
          <h3>{provider.name}</h3>
          <p className="specialization">{provider.specialization}</p>
          <div className="rating">
            <Star size={16} fill="#FFD700" />
            <span>{provider.rating}</span>
            <span className="experience">({provider.experience} experience)</span>
          </div>
        </div>
        <div className="provider-actions">
          <button className="btn-secondary">
            <Phone size={16} />
            Call
          </button>
        </div>
      </div>

      <div className="provider-details">
        <div className="detail-item">
          <MapPin size={16} />
          <span>{provider.clinic}</span>
        </div>
        <div className="detail-item">
          <MapPin size={16} />
          <span>{provider.address}</span>
        </div>
        <div className="detail-item">
          <Shield size={16} />
          <span>{provider.acceptsInsurance ? 'Accepts Insurance' : 'Self Pay Only'}</span>
        </div>
      </div>

      <div className="pricing-info">
        <h4>Pricing</h4>
        <div className="pricing-grid">
          <div className="price-item">
            <span>Consultation</span>
            <span>{formatPrice(provider.pricing.consultation)}</span>
          </div>
          <div className="price-item">
            <span>Follow-up</span>
            <span>{formatPrice(provider.pricing.followUp)}</span>
          </div>
          <div className="price-item">
            <span>Video Call</span>
            <span>{formatPrice(provider.pricing.videoCall)}</span>
          </div>
        </div>
      </div>

      <div className="available-slots">
        <h4>Available Slots</h4>
        <div className="slots-grid">
          {provider.availableSlots.map(slot => (
            <div key={slot.id} className="slot-card">
              <div className="slot-header">
                <Calendar size={16} />
                <span>{new Date(slot.date).toLocaleDateString()}</span>
              </div>
              <div className="slot-time">
                <Clock size={16} />
                <span>{slot.startTime} - {slot.endTime}</span>
                <span className="timezone">({slot.timezone})</span>
              </div>
              <div className="slot-type">
                {slot.type === 'video' ? <Video size={16} /> : <User size={16} />}
                <span>{slot.type.replace('-', ' ')}</span>
              </div>
              <div className="slot-price">
                <DollarSign size={16} />
                <span>{formatPrice(slot.price)}</span>
              </div>
              <button 
                className="btn-primary book-btn"
                onClick={() => handleBookAppointment(provider, slot)}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBookingModal = () => (
    <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
      <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Book Appointment</h3>
          <button 
            className="modal-close"
            onClick={() => setShowBookingModal(false)}
          >
            <X size={20} />
          </button>
        </div>

        {selectedProvider && (
          <div className="booking-provider-info">
            <h4>{selectedProvider.name}</h4>
            <p>{selectedProvider.specialization} • {selectedProvider.clinic}</p>
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="booking-form">
          <div className="form-group">
            <label>Appointment Type</label>
            <select
              value={bookingData.appointmentType}
              onChange={(e) => setBookingData(prev => ({ ...prev, appointmentType: e.target.value }))}
              required
            >
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
            </select>
          </div>

          <div className="form-group">
            <label>Insurance Information</label>
            <input
              type="text"
              value={bookingData.insuranceInfo}
              onChange={(e) => setBookingData(prev => ({ ...prev, insuranceInfo: e.target.value }))}
              placeholder="Enter your insurance details"
            />
          </div>

          <div className="form-group">
            <label>Emergency Contact</label>
            <input
              type="text"
              value={bookingData.emergencyContact}
              onChange={(e) => setBookingData(prev => ({ ...prev, emergencyContact: e.target.value }))}
              placeholder="Name and phone number"
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={bookingData.notes}
              onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special requirements or notes..."
              rows={3}
            />
          </div>

          <div className="booking-summary">
            <h4>Booking Summary</h4>
            <div className="summary-item">
              <span>Provider:</span>
              <span>{selectedProvider?.name}</span>
            </div>
            <div className="summary-item">
              <span>Date:</span>
              <span>{selectedProvider?.availableSlots.find(s => s.id === bookingData.slotId)?.date}</span>
            </div>
            <div className="summary-item">
              <span>Time:</span>
              <span>{selectedProvider?.availableSlots.find(s => s.id === bookingData.slotId)?.startTime}</span>
            </div>
            <div className="summary-item">
              <span>Price:</span>
              <span>{formatPrice(selectedProvider?.availableSlots.find(s => s.id === bookingData.slotId)?.price || 0)}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="patient-appointment-search">
      {/* Header */}
      <div className="search-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBackToDashboard}>
            ← Back to Dashboard
          </button>
          <h1>Find Appointments</h1>
          <p>Search for available appointments with healthcare providers</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <Search size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by provider name, specialization, or location..."
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </div>
          
          <button 
            type="button" 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </form>

        {showFilters && renderSearchFilters()}
      </div>

      {/* Search Results */}
      <div className="search-results">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching for available appointments...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="results-grid">
            {searchResults.map(renderProviderCard)}
          </div>
        ) : (
          <div className="no-results">
            <AlertCircle size={48} />
            <h3>No appointments found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && renderBookingModal()}
    </div>
  );
};

export default PatientAppointmentSearch; 