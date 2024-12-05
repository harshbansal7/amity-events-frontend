import React from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { STATIC_URL } from '../../services/api';
const EditEventForm = ({ editedEvent, setEditedEvent, event, error }) => {
  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-4">
        {event.image_url && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <img
              src={event.image_url.startsWith('/') ? `${STATIC_URL}${event.image_url}` : event.image_url}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setEditedEvent({ ...editedEvent, image_url: null })}
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
                  setEditedEvent({ ...editedEvent, image: e.target.files[0] });
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

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Name
          </label>
          <input
            type="text"
            value={editedEvent.name}
            onChange={(e) => setEditedEvent({ ...editedEvent, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date & Time
          </label>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              value={editedEvent.date}
              onChange={(newValue) => setEditedEvent({ ...editedEvent, date: newValue })}
              renderInput={(params) => (
                <input
                  {...params}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              )}
            />
          </LocalizationProvider>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours)
            </label>
            <input
              type="number"
              value={editedEvent.duration_hours}
              onChange={(e) => setEditedEvent({ ...editedEvent, duration_hours: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={editedEvent.duration_minutes}
              onChange={(e) => setEditedEvent({ ...editedEvent, duration_minutes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Participants
          </label>
          <input
            type="number"
            value={editedEvent.max_participants}
            onChange={(e) => setEditedEvent({ ...editedEvent, max_participants: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Venue
          </label>
          <input
            type="text"
            value={editedEvent.venue}
            onChange={(e) => setEditedEvent({ ...editedEvent, venue: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={editedEvent.description}
            onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prizes (comma-separated)
          </label>
          <input
            type="text"
            value={editedEvent.prizes}
            onChange={(e) => setEditedEvent({ ...editedEvent, prizes: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="First Prize, Second Prize, Third Prize"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default EditEventForm; 