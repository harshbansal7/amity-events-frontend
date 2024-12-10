import React, { useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { TextField } from '@mui/material';
import { updateEvent } from '../../services/api';

const EditEventForm = ({ initialEvent, event, onSuccess, onCancel }) => {
  const [editedEvent, setEditedEvent] = useState({
    name: initialEvent.name,
    date: new Date(initialEvent.date),
    duration_days: initialEvent.duration?.days || 0,
    duration_hours: initialEvent.duration?.hours || 0,
    duration_minutes: initialEvent.duration?.minutes || 0,
    max_participants: initialEvent.max_participants,
    venue: initialEvent.venue,
    description: initialEvent.description || '',
    prizes: Array.isArray(initialEvent.prizes) ? initialEvent.prizes.join(', ') : initialEvent.prizes || '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRemoveImage = () => {
    setEditedEvent({ 
      ...editedEvent, 
      image: null,
      image_url: null
    });
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#6366f1',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#4f46e5',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#4f46e5',
    },
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      if (!editedEvent.name || !editedEvent.venue || !editedEvent.max_participants) {
        setError('Please fill in all required fields');
        return;
      }

      Object.keys(editedEvent).forEach(key => {
        if (key === 'prizes') {
          formData.append(key, editedEvent[key].split(',').map(prize => prize.trim()).filter(Boolean));
        } else if (key === 'date') {
          formData.append(key, editedEvent[key].toISOString());
        } else {
          formData.append(key, editedEvent[key]);
        }
      });

      formData.append('duration', JSON.stringify({
        days: parseInt(editedEvent.duration_days) || 0,
        hours: parseInt(editedEvent.duration_hours) || 0,
        minutes: parseInt(editedEvent.duration_minutes) || 0
      }));

      await updateEvent(event._id, formData);
      onSuccess();
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Sections */}
      <div className="space-y-6">
        {/* Image Section */}
        <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            <h3 className="text-lg font-semibold text-gray-900">Event Image</h3>
          </div>

          {(event.image_url || editedEvent.image) && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <img
                src={editedEvent.image ? URL.createObjectURL(editedEvent.image) : event.image_url}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}
          
          <div className="flex justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setEditedEvent({ 
                      ...editedEvent, 
                      image: e.target.files[0],
                      image_url: null
                    });
                  }
                }}
                className="hidden"
              />
              <div className="flex items-center space-x-2 px-6 py-3 border-2 border-dashed border-gray-300 
                           rounded-xl hover:border-indigo-500 hover:bg-white/50 
                           transition-all duration-200 group">
                <CameraIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-500 transition-colors" />
                <span>Upload Event Image</span>
              </div>
            </label>
          </div>
        </div>

        {/* Basic Details Section */}
        <div className="bg-white/70 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            <h3 className="text-lg font-semibold text-gray-900">Basic Details</h3>
          </div>

          <TextField
            fullWidth
            label="Event Name"
            value={editedEvent.name}
            onChange={(e) => setEditedEvent({ ...editedEvent, name: e.target.value })}
            required
            variant="outlined"
            className="bg-white/50"
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
          />

          {/* Date and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-r from-indigo-50/30 to-blue-50/30 p-4 rounded-xl">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Event Date & Time"
                value={editedEvent.date}
                onChange={(newValue) => setEditedEvent({ ...editedEvent, date: newValue })}
                className="w-full"
                renderInput={(params) => <TextField {...params} fullWidth required sx={textFieldStyle} />}
              />
            </LocalizationProvider>

            <div className="grid grid-cols-3 gap-4">
              <TextField
                type="number"
                label="Days"
                value={editedEvent.duration_days}
                onChange={(e) => setEditedEvent({ ...editedEvent, duration_days: e.target.value })}
                slotProps={{ htmlInput: { min: 0, max: 365 } }}
                variant="outlined"
                fullWidth
                sx={textFieldStyle}
              />
              <TextField
                type="number"
                label="Hours"
                value={editedEvent.duration_hours}
                onChange={(e) => setEditedEvent({ ...editedEvent, duration_hours: e.target.value })}
                slotProps={{ htmlInput: { min: 0, max: 23 } }}
                variant="outlined"
                fullWidth
                sx={textFieldStyle}
              />
              <TextField
                type="number"
                label="Minutes"
                value={editedEvent.duration_minutes}
                onChange={(e) => setEditedEvent({ ...editedEvent, duration_minutes: e.target.value })}
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
              value={editedEvent.venue}
              onChange={(e) => setEditedEvent({ ...editedEvent, venue: e.target.value })}
              required
              variant="outlined"
              className="bg-white/50"
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
            />
            <TextField
              type="number"
              label="Maximum Participants"
              value={editedEvent.max_participants}
              onChange={(e) => setEditedEvent({ ...editedEvent, max_participants: e.target.value })}
              required
              variant="outlined"
              className="bg-white/50"
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
            value={editedEvent.description}
            onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            className="bg-white/50"
            sx={textFieldStyle}
          />

          <TextField
            label="Prizes (comma-separated)"
            value={editedEvent.prizes}
            onChange={(e) => setEditedEvent({ ...editedEvent, prizes: e.target.value })}
            variant="outlined"
            fullWidth
            placeholder="First Prize, Second Prize, Third Prize"
            className="bg-white/50"
            sx={textFieldStyle}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2.5 text-gray-700 bg-white hover:bg-gray-50 rounded-xl 
                   transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 
                    hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl
                    transform hover:-translate-y-0.5
                    transition-all duration-200 font-medium shadow-lg hover:shadow-xl 
                    disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditEventForm; 