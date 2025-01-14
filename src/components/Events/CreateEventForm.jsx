import React, { useState, useEffect, useRef } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createEvent } from '../../services/api';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import { TextField } from '@mui/material';
import useRotatingMessage from '../../hooks/useRotatingMessage';

const CreateEventForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: new Date(),
    duration_days: 0,
    duration_hours: 0,
    duration_minutes: 0,
    max_participants: '',
    venue: '',
    description: '',
    prizes: '',
    allow_external: false,
    use_existing_code: false,
    existing_event_code: '',
    image: null
  });
  const [touched, setTouched] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const maxParticipantsRef = useRef(null);
  const durationDaysRef = useRef(null);
  const durationHoursRef = useRef(null);
  const durationMinutesRef = useRef(null);

  const rotatingMessage = useRotatingMessage('createEvent');

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
    };

    const inputElements = [maxParticipantsRef.current, durationDaysRef.current, durationHoursRef.current, durationMinutesRef.current];
    inputElements.forEach(inputElement => {
      if (inputElement) {
        inputElement.addEventListener('wheel', handleWheel, { passive: false });
      }
    });

    return () => {
      inputElements.forEach(inputElement => {
        if (inputElement) {
          inputElement.removeEventListener('wheel', handleWheel);
        }
      });
    };
  }, []);

  const validateForm = () => {
    const errors = {};
    
    // Required field validations
    if (!formData.name?.trim()) {
      errors.name = 'Event name is required';
    }
    
    if (!formData.venue?.trim()) {
      errors.venue = 'Venue is required';
    }
    
    if (!formData.max_participants) {
      errors.max_participants = 'Maximum participants is required';
    } else if (parseInt(formData.max_participants) <= 0) {
      errors.max_participants = 'Maximum participants must be greater than 0';
    }
    
    // Date validation
    const selectedDate = new Date(formData.date);
    const now = new Date();
    if (selectedDate < now) {
      errors.date = 'Event date cannot be in the past';
    }
    
    // Duration validation
    const totalDuration = (parseInt(formData.duration_days) || 0) * 24 * 60 +
                         (parseInt(formData.duration_hours) || 0) * 60 +
                         (parseInt(formData.duration_minutes) || 0);
    if (totalDuration <= 0) {
      errors.duration = 'Event must have a duration';
    }
    
    // Event code validation for external events
    if (formData.allow_external && formData.use_existing_code && !formData.existing_event_code) {
      errors.existing_event_code = 'Event code is required when using existing code';
    }
    
    return errors;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errors = validateForm();
    setValidationErrors(errors);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      
      const errors = validateForm();
      setValidationErrors(errors);
      
      if (Object.keys(errors).length > 0) {
        setError('Please fix the validation errors');
        setIsCreating(false);
        return;
      }

      const form = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'prizes') {
          form.append(key, formData[key].split(',').map(prize => prize.trim()).filter(Boolean));
        } else if (key === 'date') {
          form.append(key, formData[key].toISOString());
        } else if (key === 'allow_external') {
          form.append(key, formData[key].toString());
        } else {
          form.append(key, formData[key]);
        }
      });

      if (image) {
        form.append('image', image);
      }

      await createEvent(form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses = "mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200";
    const validClasses = "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500";
    const errorClasses = "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50";
    
    return `${baseClasses} ${
      touched[fieldName] && validationErrors[fieldName] ? errorClasses : validClasses
    }`;
  };

  // Add these theme overrides if needed
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#6366f1', // indigo-500
      },
      '&.Mui-focused fieldset': {
        borderColor: '#4f46e5', // indigo-600
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#4f46e5', // indigo-600
    },
  };

  return (
    <div className="relative bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="p-8 border-b bg-white/50 backdrop-blur-sm rounded-t-2xl relative">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Create Event
          </h2>
        </div>
        <p className="mt-2 text-gray-600">Fill in the details to create a new event</p>
      </div>

      {/* Form Content */}
      <div className="p-8 overflow-y-auto relative">
        <p className="text-gray-400/60 text-sm italic text-center mb-4">
          {rotatingMessage}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Image Section */}
            <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                <h3 className="text-lg font-semibold text-gray-900">Event Image</h3>
              </div>

              {/* Image Upload */}
              <div className="space-y-2 bg-white/70 p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <label className="block text-sm font-medium text-gray-700">
                  Event Image
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-lg transition-all duration-200"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById('image-upload').click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer 
                      hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors duration-200"
                  >
                    <PhotoCamera className="mx-auto h-12 w-12 text-gray-400" />
                    <span className="mt-2 block text-sm text-gray-600">
                      Click to upload event image
                    </span>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Basic Details Section */}
            <div className="bg-white/70 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Details</h3>
              </div>

              <TextField
                label="Event Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => handleBlur('name')}
                required
                variant="outlined"
                fullWidth
                className={getInputClassName('name')}
                sx={{
                  ...textFieldStyle,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }
                }}
                error={touched.name && !!validationErrors.name}
                helperText={touched.name && validationErrors.name}
              />

              {/* Date and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-r from-indigo-50/30 to-blue-50/30 p-4 rounded-xl">
                <TextField
                  label="Date"
                  type="datetime-local"
                  value={new Date(formData.date.getTime() - formData.date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                  onBlur={() => handleBlur('date')}
                  required
                  variant="outlined"
                  className="bg-white/50 rounded-xl shadow-sm"
                  sx={textFieldStyle}
                  error={touched.date && !!validationErrors.date}
                  helperText={touched.date && validationErrors.date}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TextField
                    type="number"
                    label="Days"
                    inputRef={durationDaysRef}
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    required
                    slotProps={{ htmlInput: { min: 0 } }}
                    variant="outlined"
                    fullWidth
                    sx={textFieldStyle}
                  />
                  <TextField
                    type="number"
                    label="Hours"
                    inputRef={durationHoursRef}
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    required
                    slotProps={{ htmlInput: { min: 0, max: 23 } }}
                    variant="outlined"
                    fullWidth
                    sx={textFieldStyle}
                  />
                  <TextField
                    type="number"
                    label="Minutes"
                    inputRef={durationMinutesRef}
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    required
                    slotProps={{ htmlInput: { min: 0, max: 59 } }}
                    variant="outlined"
                    fullWidth
                    sx={textFieldStyle}
                  />
                </div>
              </div>

              {/* Venue and Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="Venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  onBlur={() => handleBlur('venue')}
                  required
                  variant="outlined"
                  fullWidth
                  sx={textFieldStyle}
                  error={touched.venue && !!validationErrors.venue}
                  helperText={touched.venue && validationErrors.venue}
                />

                <TextField
                  type="number"
                  label="Maximum Participants"
                  inputRef={maxParticipantsRef}
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  onBlur={() => handleBlur('max_participants')}
                  required
                  slotProps={{ htmlInput: { min: 0, max: 100000 } }}
                  variant="outlined"
                  fullWidth
                  sx={textFieldStyle}
                  error={touched.max_participants && !!validationErrors.max_participants}
                  helperText={touched.max_participants && validationErrors.max_participants}
                />
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="bg-white/70 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
              </div>

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                onBlur={() => handleBlur('description')}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                className="bg-white/50"
                sx={textFieldStyle}
                error={touched.description && !!validationErrors.description}
                helperText={touched.description && validationErrors.description}
              />

              <TextField
                label="Prizes (comma-separated)"
                value={formData.prizes}
                onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                onBlur={() => handleBlur('prizes')}
                variant="outlined"
                fullWidth
                placeholder="First Prize, Second Prize, Third Prize"
                className="bg-white/50"
                sx={textFieldStyle}
                error={touched.prizes && !!validationErrors.prizes}
                helperText={touched.prizes && validationErrors.prizes}
              />
            </div>

            {/* External Event Options Section */}
            <div className="bg-white/70 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                <h3 className="text-lg font-semibold text-gray-900">External Registration</h3>
              </div>

              {/* External Event Option */}
              <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-xl border border-indigo-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <input
                  type="checkbox"
                  id="allow_external"
                  checked={formData.allow_external}
                  onChange={(e) => setFormData({ ...formData, allow_external: e.target.checked })}
                  onBlur={() => handleBlur('allow_external')}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div>
                  <label htmlFor="allow_external" className="font-medium text-gray-700 block">
                    Allow External Participants
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Enable this to allow non-Amity participants to register
                  </p>
                </div>
              </div>

              {formData.allow_external && (
                <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 rounded-xl border border-blue-100/50 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="use_existing_code"
                      checked={formData.use_existing_code}
                      onChange={(e) => setFormData({ ...formData, use_existing_code: e.target.checked })}
                      onBlur={() => handleBlur('use_existing_code')}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="use_existing_code" className="font-medium text-gray-700">
                      Use Existing Event Code
                    </label>
                  </div>
                  
                  {formData.use_existing_code ? (
                    <div>
                      <label htmlFor="existing_event_code" className="block text-sm font-medium text-gray-700">
                        Enter Existing Event Code
                      </label>
                      <input
                        type="text"
                        id="existing_event_code"
                        value={formData.existing_event_code}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          existing_event_code: e.target.value.toUpperCase() 
                        })}
                        onBlur={() => handleBlur('existing_event_code')}
                        className={getInputClassName('existing_event_code')}
                        placeholder="Enter event code"
                        maxLength={6}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-blue-800">
                      A new event code will be generated automatically
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-4 p-6 border-t bg-white/50 backdrop-blur-sm rounded-b-2xl relative">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="px-6 py-2.5 text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 
            hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl
            transform hover:-translate-y-0.5
            transition-all duration-200 font-medium shadow-lg hover:shadow-xl 
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating...</span>
            </>
          ) : 'Create Event'}
        </button>
      </div>
    </div>
  );
};

export default CreateEventForm; 