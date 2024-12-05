import React from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { TextField } from '@mui/material';

const EditEventForm = ({ editedEvent, setEditedEvent, event, error }) => {
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

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-4">
        {(event.image_url || editedEvent.image) && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <img
              src={editedEvent.image ? URL.createObjectURL(editedEvent.image) : event.image_url}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
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
            <div className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors">
              <CameraIcon className="h-5 w-5 text-gray-500" />
              <span>Upload Event Image</span>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-md">{error}</div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        <TextField
          fullWidth
          label="Event Name"
          value={editedEvent.name}
          onChange={(e) => setEditedEvent({ ...editedEvent, name: e.target.value })}
          required
          variant="outlined"
          sx={textFieldStyle}
        />

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

        <TextField
          type="number"
          label="Maximum Participants"
          value={editedEvent.max_participants}
          onChange={(e) => setEditedEvent({ ...editedEvent, max_participants: e.target.value })}
          required
          slotProps={{ htmlInput: { min: 0, max: 100000 } }}
          variant="outlined"
          fullWidth
          sx={textFieldStyle}
        />

        <TextField
          label="Venue"
          value={editedEvent.venue}
          onChange={(e) => setEditedEvent({ ...editedEvent, venue: e.target.value })}
          required
          variant="outlined"
          fullWidth
          sx={textFieldStyle}
        />

        <TextField
          label="Description"
          value={editedEvent.description}
          onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          sx={textFieldStyle}
        />

        <TextField
          label="Prizes (comma-separated)"
          value={editedEvent.prizes}
          onChange={(e) => setEditedEvent({ ...editedEvent, prizes: e.target.value })}
          variant="outlined"
          fullWidth
          placeholder="First Prize, Second Prize, Third Prize"
          sx={textFieldStyle}
        />
      </div>
    </div>
  );
};

export default EditEventForm; 