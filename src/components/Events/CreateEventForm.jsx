import React, { useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createEvent } from '../../services/api';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import { TextField } from '@mui/material';

const CreateEventForm = ({ onSuccess, onCancel }) => {
  const [eventData, setEventData] = useState({
    name: '',
    date: new Date(),
    duration_days: '',
    duration_hours: '',
    duration_minutes: '',
    max_participants: '',
    venue: '',
    description: '',
    prizes: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');

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
      const formData = new FormData();
      
      Object.keys(eventData).forEach(key => {
        if (key === 'prizes') {
          formData.append(key, eventData[key].split(',').map(prize => prize.trim()).filter(Boolean));
        } else if (key === 'date') {
          formData.append(key, eventData[key].toISOString());
        } else {
          formData.append(key, eventData[key]);
        }
      });

      if (image) {
        formData.append('image', image);
      }

      await createEvent(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
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
    <div className="relative bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-800">Create New Event</h2>
        <button 
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <CloseIcon className="text-gray-500" />
        </button>
      </div>

      {/* Form */}
      <div className="overflow-y-auto flex-1">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Image Upload Section */}
          <div className="space-y-4">
            {imagePreview && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <CloseIcon className="text-gray-600" />
                </button>
              </div>
            )}
            
            <div className="flex justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border-2 border-dashed border-gray-300">
                  <PhotoCamera className="text-gray-500" />
                  <span>Upload Event Image</span>
                </div>
              </label>
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-md">{error}</div>
          )}
          {/* Event Details */}
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Event Name"
              value={eventData.name}
              onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
              required
              variant="outlined"
              sx={textFieldStyle}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Event Date & Time"
                value={eventData.date}
                onChange={(newValue) => setEventData({ ...eventData, date: newValue })}
                className="w-full"
                renderInput={(params) => <TextField {...params} fullWidth required sx={textFieldStyle} />}
              />
            </LocalizationProvider>

            <div className="grid grid-cols-3 gap-4">
              <TextField
                type="number"
                label="Days"
                value={eventData.duration_days}
                onChange={(e) => setEventData({ ...eventData, duration_days: e.target.value })}
                slotProps={{ htmlInput: { min: 0, max: 365 } }}
                variant="outlined"
                fullWidth
                sx={textFieldStyle}
              />
              <TextField
                type="number"
                label="Hours"
                value={eventData.duration_hours}
                onChange={(e) => setEventData({ ...eventData, duration_hours: e.target.value })}
                slotProps={{ htmlInput: { min: 0, max: 23 } }}
                variant="outlined"
                fullWidth
                sx={textFieldStyle}
              />
              <TextField
                type="number"
                label="Minutes"
                value={eventData.duration_minutes}
                onChange={(e) => setEventData({ ...eventData, duration_minutes: e.target.value })}
                slotProps={{ htmlInput: { min: 0, max: 59 } }}
                variant="outlined"
                fullWidth
                sx={textFieldStyle}
              />
            </div>

            <TextField
              type="number"
              label="Maximum Participants"
              value={eventData.max_participants}
              onChange={(e) => setEventData({ ...eventData, max_participants: e.target.value })}
              required
              slotProps={{ htmlInput: { min: 0, max: 100000 } }}
              variant="outlined"
              fullWidth
              sx={textFieldStyle}
            />

            <TextField
              label="Venue"
              value={eventData.venue}
              onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
              required
              variant="outlined"
              fullWidth
              sx={textFieldStyle}
            />

            <TextField
              label="Description"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              sx={textFieldStyle}
            />

            <TextField
              label="Prizes (comma-separated)"
              value={eventData.prizes}
              onChange={(e) => setEventData({ ...eventData, prizes: e.target.value })}
              variant="outlined"
              fullWidth
              placeholder="First Prize, Second Prize, Third Prize"
              sx={textFieldStyle}
            />
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Create Event
        </button>
      </div>
    </div>
  );
};

export default CreateEventForm; 