import React, { useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createEvent } from '../../services/api';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import { TextField } from '@mui/material';

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
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              variant="outlined"
              sx={textFieldStyle}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Event Date & Time"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                className="w-full"
                renderInput={(params) => <TextField {...params} fullWidth required sx={textFieldStyle} />}
              />
            </LocalizationProvider>

            <div className="grid grid-cols-3 gap-4">
              <TextField
                type="number"
                label="Days"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                slotProps={{ htmlInput: { min: 0, max: 365 } }}
                variant="outlined"
                fullWidth
                sx={textFieldStyle}
              />
              <TextField
                type="number"
                label="Hours"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                slotProps={{ htmlInput: { min: 0, max: 23 } }}
                variant="outlined"
                fullWidth
                sx={textFieldStyle}
              />
              <TextField
                type="number"
                label="Minutes"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                slotProps={{ htmlInput: { min: 0, max: 59 } }}
                variant="outlined"
                fullWidth
                sx={textFieldStyle}
              />
            </div>

            <TextField
              type="number"
              label="Maximum Participants"
              value={formData.max_participants}
              onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
              required
              slotProps={{ htmlInput: { min: 0, max: 100000 } }}
              variant="outlined"
              fullWidth
              sx={textFieldStyle}
            />

            <TextField
              label="Venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              required
              variant="outlined"
              fullWidth
              sx={textFieldStyle}
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              sx={textFieldStyle}
            />

            <TextField
              label="Prizes (comma-separated)"
              value={formData.prizes}
              onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
              variant="outlined"
              fullWidth
              placeholder="First Prize, Second Prize, Third Prize"
              sx={textFieldStyle}
            />

            {/* External Event Option */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="allow_external"
                checked={formData.allow_external}
                onChange={(e) => setFormData({ ...formData, allow_external: e.target.checked })}
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
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="use_existing_code"
                    checked={formData.use_existing_code}
                    onChange={(e) => setFormData({ ...formData, use_existing_code: e.target.checked })}
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
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
        </form>
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isCreating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating Event...</span>
            </>
          ) : 'Create Event'}
        </button>
      </div>
    </div>
  );
};

export default CreateEventForm; 