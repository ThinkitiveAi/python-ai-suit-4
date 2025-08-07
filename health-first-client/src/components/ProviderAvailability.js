import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Filter,
  Download,
  Users,
  Stethoscope,
  Phone,
  Video,
  DollarSign,
  FileText
} from 'lucide-react';
import './ProviderAvailability.css';

const ProviderAvailability = () => {
  const [currentView, setCurrentView] = useState('month'); // month, week, day
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityData, setAvailabilityData] = useState([]);

  // Sample availability data
  const sampleAvailability = [
    {
      id: 1,
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '10:00',
      type: 'consultation',
      status: 'available',
      duration: 60,
      notes: 'General consultation'
    },
    {
      id: 2,
      date: '2024-01-15',
      startTime: '10:30',
      endTime: '11:00',
      type: 'follow-up',
      status: 'booked',
      duration: 30,
      notes: 'Follow-up appointment'
    },
    {
      id: 3,
      date: '2024-01-16',
      startTime: '14:00',
      endTime: '15:00',
      type: 'consultation',
      status: 'available',
      duration: 60,
      notes: 'New patient consultation'
    }
  ];

  useEffect(() => {
    setAvailabilityData(sampleAvailability);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'booked': return '#3b82f6';
      case 'blocked': return '#ef4444';
      case 'tentative': return '#f59e0b';
      case 'break': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} />;
      case 'booked': return <Users size={16} />;
      case 'blocked': return <X size={16} />;
      case 'tentative': return <AlertCircle size={16} />;
      case 'break': return <Clock size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'consultation': return <Stethoscope size={16} />;
      case 'follow-up': return <Users size={16} />;
      case 'video': return <Video size={16} />;
      case 'phone': return <Phone size={16} />;
      case 'billing': return <DollarSign size={16} />;
      case 'documentation': return <FileText size={16} />;
      default: return <Stethoscope size={16} />;
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDateNavigation = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      if (currentView === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (currentView === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() - 1);
      }
    } else {
      if (currentView === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (currentView === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
    }
    setCurrentDate(newDate);
  };

  const handleSlotClick = (slot) => {
    setEditingSlot(slot);
    setShowEditModal(true);
  };

  const handleAddAvailability = () => {
    setShowAddModal(true);
  };

  const handleBulkAction = (action) => {
    if (selectedSlots.length === 0) {
      alert('Please select slots to perform bulk action');
      return;
    }
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedSlots.length} slots?`)) {
          setAvailabilityData(prev => prev.filter(slot => !selectedSlots.includes(slot.id)));
          setSelectedSlots([]);
        }
        break;
      case 'copy':
        // Handle copy logic
        break;
      default:
        break;
    }
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return (
      <div className="calendar-grid month-view">
        <div className="calendar-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
        </div>
        <div className="calendar-body">
          {days.map((date, index) => {
            const dateString = date.toISOString().split('T')[0];
            const daySlots = availabilityData.filter(slot => slot.date === dateString);
            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div 
                key={index} 
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => {
                  setCurrentDate(date);
                  setCurrentView('day');
                }}
              >
                <div className="day-number">{date.getDate()}</div>
                <div className="day-slots">
                  {daySlots.slice(0, 3).map(slot => (
                    <div 
                      key={slot.id}
                      className="slot-indicator"
                      style={{ backgroundColor: getStatusColor(slot.status) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlotClick(slot);
                      }}
                    >
                      {getStatusIcon(slot.status)}
                      <span>{formatTime(slot.startTime)}</span>
                    </div>
                  ))}
                  {daySlots.length > 3 && (
                    <div className="more-slots">+{daySlots.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }

    const timeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    return (
      <div className="calendar-grid week-view">
        <div className="week-header">
          <div className="time-column-header">Time</div>
          {days.map(day => (
            <div key={day.toDateString()} className="day-column-header">
              <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="day-date">{day.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="week-body">
          {timeSlots.map(time => (
            <div key={time} className="time-row">
              <div className="time-label">{formatTime(time)}</div>
              {days.map(day => {
                const dateString = day.toISOString().split('T')[0];
                const slot = availabilityData.find(s => 
                  s.date === dateString && s.startTime === time
                );

                return (
                  <div 
                    key={`${dateString}-${time}`} 
                    className="time-slot"
                    onClick={() => {
                      if (slot) {
                        handleSlotClick(slot);
                      } else {
                        // Add new slot
                        setShowAddModal(true);
                      }
                    }}
                  >
                    {slot && (
                      <div 
                        className="slot-content"
                        style={{ backgroundColor: getStatusColor(slot.status) }}
                      >
                        {getTypeIcon(slot.type)}
                        <span>{slot.notes}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dateString = currentDate.toISOString().split('T')[0];
    const daySlots = availabilityData.filter(slot => slot.date === dateString);
    
    const timeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }

    return (
      <div className="calendar-grid day-view">
        <div className="day-header">
          <h3>{formatDate(dateString)}</h3>
          <button className="add-slot-btn" onClick={handleAddAvailability}>
            <Plus size={16} />
            Add Slot
          </button>
        </div>
        <div className="day-timeline">
          {timeSlots.map(time => {
            const slot = daySlots.find(s => s.startTime === time);

            return (
              <div key={time} className="timeline-slot">
                <div className="time-label">{formatTime(time)}</div>
                <div 
                  className="slot-area"
                  onClick={() => {
                    if (slot) {
                      handleSlotClick(slot);
                    } else {
                      setShowAddModal(true);
                    }
                  }}
                >
                  {slot && (
                    <div 
                      className="slot-detail"
                      style={{ backgroundColor: getStatusColor(slot.status) }}
                    >
                      <div className="slot-header">
                        {getTypeIcon(slot.type)}
                        <span className="slot-time">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                        <span className="slot-status">{slot.status}</span>
                      </div>
                      <div className="slot-notes">{slot.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const [formData, setFormData] = useState({
    date: currentDate.toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'consultation',
    status: 'available',
    duration: 60,
    notes: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    recurrence: 'none',
    recurrenceEndDate: '',
    maxAppointments: 1,
    location: {
      type: 'in-person',
      address: '',
      room: ''
    },
    pricing: {
      fee: 0,
      currency: 'USD',
      acceptsInsurance: true
    },
    tags: []
  });

  // Update form data when editing slot changes
  useEffect(() => {
    if (editingSlot) {
      setFormData({
        date: editingSlot.date,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        type: editingSlot.type,
        status: editingSlot.status,
        duration: editingSlot.duration,
        notes: editingSlot.notes,
        timezone: editingSlot.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        recurrence: editingSlot.recurrence || 'none',
        recurrenceEndDate: editingSlot.recurrenceEndDate || '',
        maxAppointments: editingSlot.maxAppointments || 1,
        location: editingSlot.location || {
          type: 'in-person',
          address: '',
          room: ''
        },
        pricing: editingSlot.pricing || {
          fee: 0,
          currency: 'USD',
          acceptsInsurance: true
        },
        tags: editingSlot.tags || []
      });
    } else {
      setFormData({
        date: currentDate.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        type: 'consultation',
        status: 'available',
        duration: 60,
        notes: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        recurrence: 'none',
        recurrenceEndDate: '',
        maxAppointments: 1,
        location: {
          type: 'in-person',
          address: '',
          room: ''
        },
        pricing: {
          fee: 0,
          currency: 'USD',
          acceptsInsurance: true
        },
        tags: []
      });
    }
  }, [editingSlot, currentDate]);

  const renderAddEditModal = () => {
    const isEdit = !!editingSlot;

      const validateForm = () => {
    const errors = [];

    // Start time must be before end time
    if (formData.startTime >= formData.endTime) {
      errors.push('Start time must be before end time');
    }

    // Slot duration validation (15-60 minutes)
    const startMinutes = parseInt(formData.startTime.split(':')[0]) * 60 + parseInt(formData.startTime.split(':')[1]);
    const endMinutes = parseInt(formData.endTime.split(':')[0]) * 60 + parseInt(formData.endTime.split(':')[1]);
    const duration = endMinutes - startMinutes;
    
    if (duration < 15 || duration > 240) {
      errors.push('Slot duration must be between 15 minutes and 4 hours');
    }

    // Recurring slots must include valid end date
    if (formData.recurrence !== 'none' && !formData.recurrenceEndDate) {
      errors.push('Recurring slots must include an end date');
    }

    // Location required for physical visit types
    if (formData.location.type === 'in-person' && !formData.location.address) {
      errors.push('Address is required for in-person appointments');
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (isEdit) {
        setAvailabilityData(prev => 
          prev.map(slot => 
            slot.id === editingSlot.id 
              ? { ...slot, ...formData }
              : slot
          )
        );
      } else {
        const newSlot = {
          id: Date.now(),
          ...formData
        };
        setAvailabilityData(prev => [...prev, newSlot]);
      }
      
      setIsLoading(false);
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingSlot(null);
    }, 1000);
  };

    return (
      <div className="modal-overlay" onClick={() => {
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingSlot(null);
      }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{isEdit ? 'Edit Availability' : 'Add Availability'}</h3>
            <button 
              className="modal-close"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setEditingSlot(null);
              }}
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Appointment Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="billing">Billing</option>
                  <option value="documentation">Documentation</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="blocked">Blocked</option>
                  <option value="tentative">Tentative</option>
                  <option value="break">Break</option>
                </select>
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Max Appointments</label>
                <input
                  type="number"
                  value={formData.maxAppointments}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAppointments: parseInt(e.target.value) }))}
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Recurrence</label>
                <select
                  value={formData.recurrence}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurrence: e.target.value }))}
                >
                  <option value="none">No Recurrence</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              {formData.recurrence !== 'none' && (
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.recurrenceEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                    min={formData.date}
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location Type</label>
                <select
                  value={formData.location.type}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, type: e.target.value }
                  }))}
                >
                  <option value="in-person">In-Person</option>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>
              {formData.location.type === 'in-person' && (
                <>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={formData.location.address}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, address: e.target.value }
                      }))}
                      placeholder="Enter clinic address"
                    />
                  </div>
                  <div className="form-group">
                    <label>Room</label>
                    <input
                      type="text"
                      value={formData.location.room}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, room: e.target.value }
                      }))}
                      placeholder="Room number"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fee ($)</label>
                <input
                  type="number"
                  value={formData.pricing.fee}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    pricing: { ...prev.pricing, fee: parseFloat(e.target.value) || 0 }
                  }))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select
                  value={formData.pricing.currency}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    pricing: { ...prev.pricing, currency: e.target.value }
                  }))}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Accepts Insurance</label>
                <select
                  value={formData.pricing.acceptsInsurance}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    pricing: { ...prev.pricing, acceptsInsurance: e.target.value === 'true' }
                  }))}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                }))}
                placeholder="Enter tags separated by commas (e.g., new patients, urgent, follow-up)"
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes about this availability slot..."
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingSlot(null);
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (isEdit ? 'Update' : 'Add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="provider-availability">
      {/* Header */}
      <div className="availability-header">
        <div className="header-left">
          <h1>Provider Availability</h1>
          <p>Manage your appointment schedule and availability</p>
        </div>
        <div className="header-right">
          <button className="btn-primary" onClick={handleAddAvailability}>
            <Plus size={16} />
            Add Availability
          </button>
        </div>
      </div>

      {/* Navigation and Controls */}
      <div className="availability-controls">
        <div className="view-controls">
          <button 
            className={`view-btn ${currentView === 'month' ? 'active' : ''}`}
            onClick={() => setCurrentView('month')}
          >
            <Calendar size={16} />
            Month
          </button>
          <button 
            className={`view-btn ${currentView === 'week' ? 'active' : ''}`}
            onClick={() => setCurrentView('week')}
          >
            <Calendar size={16} />
            Week
          </button>
          <button 
            className={`view-btn ${currentView === 'day' ? 'active' : ''}`}
            onClick={() => setCurrentView('day')}
          >
            <Calendar size={16} />
            Day
          </button>
        </div>

        <div className="date-navigation">
          <button onClick={() => handleDateNavigation('prev')}>
            <ChevronLeft size={20} />
          </button>
          <div className="current-date">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
          <button onClick={() => handleDateNavigation('next')}>
            <ChevronRight size={20} />
          </button>
          <button 
            className="today-btn"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
        </div>

        <div className="action-controls">
          <button className="btn-secondary" onClick={() => handleBulkAction('delete')}>
            <Trash2 size={16} />
            Delete Selected
          </button>
          <button className="btn-secondary" onClick={() => handleBulkAction('copy')}>
            <Copy size={16} />
            Copy Selected
          </button>
          <button className="btn-secondary">
            <Filter size={16} />
            Filter
          </button>
          <button className="btn-secondary">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="status-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Blocked</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
          <span>Tentative</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#6b7280' }}></div>
          <span>Break</span>
        </div>
      </div>

      {/* Calendar View */}
      <div className="calendar-container">
        {currentView === 'month' && renderMonthView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'day' && renderDayView()}
      </div>

      {/* Modals */}
      {showAddModal && renderAddEditModal()}
      {showEditModal && renderAddEditModal()}
    </div>
  );
};

export default ProviderAvailability;
