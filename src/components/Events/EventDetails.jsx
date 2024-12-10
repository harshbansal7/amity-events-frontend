import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { updateEvent } from '../../services/api';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { XMarkIcon, PencilIcon, CalendarIcon, MapPinIcon, ClockIcon, UsersIcon, TrophyIcon } from '@heroicons/react/24/outline';
import EditEventForm from './EditEventForm';
import Dialog from '@mui/material/Dialog';

const EventDetails = ({ event, open, onClose, isCreator, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) {
      setEditedEvent({
        name: event.name,
        date: new Date(event.date),
        duration_days: event.duration?.days || 0,
        duration_hours: event.duration?.hours || 0,
        duration_minutes: event.duration?.minutes || 0,
        max_participants: event.max_participants,
        venue: event.venue,
        description: event.description,
        prizes: Array.isArray(event.prizes) ? event.prizes.join(', ') : ''
      });
    }
  }, [event]);

  if (!open || !event || !editedEvent) return null;

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.keys(editedEvent).forEach(key => {
        if (key === 'prizes') {
          formData.append(key, editedEvent[key].split(',').map(prize => prize.trim()).filter(Boolean));
        } else if (key === 'date') {
          formData.append(key, editedEvent[key].toISOString());
        } else {
          formData.append(key, editedEvent[key]);
        }
      });

      await updateEvent(event._id, formData);
      setIsEditing(false);
      setError('');
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 flex justify-between items-center">
        {isEditing ? (
          <input
            type="text"
            value={editedEvent.name}
            onChange={(e) => setEditedEvent({ ...editedEvent, name: e.target.value })}
            className="text-2xl font-bold bg-transparent text-white border-b border-white/50 focus:border-white outline-none w-full"
            placeholder="Event Name"
          />
        ) : (
          <h2 className="text-2xl font-bold text-white">{event.name}</h2>
        )}
        <div className="flex items-center space-x-2">
          {isCreator && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {isEditing ? (
          <EditEventForm 
            editedEvent={editedEvent}
            setEditedEvent={setEditedEvent}
            event={event}
            error={error}
          />
        ) : (
          <div className="space-y-6">
            {/* Event Image */}
            {event.image_url && (
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <img
                  src={event.image_url}
                  alt={event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://next-images.123rf.com/index/_next/image/?url=https://assets-cdn.123rf.com/index/static/assets/top-section-bg.jpeg&w=3840&q=75';
                  }}
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <CalendarIcon className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium">{format(new Date(event.date), 'PPP p')}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <ClockIcon className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">
                    {event.duration.days > 0 && `${event.duration.days}d `}
                    {event.duration.hours}h {event.duration.minutes}m
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <MapPinIcon className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-600">Venue</p>
                  <p className="font-medium">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <UsersIcon className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="font-medium">{event.participants.length} / {event.max_participants}</p>
                </div>
              </div>

              {/* External Event Code - Only visible to creator */}
              {isCreator && event.allow_external && event.event_code && (
                <div className="col-span-full">
                  <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div>
                      <p className="text-sm text-blue-800 font-medium">External Registration Code</p>
                      <p className="text-2xl font-mono font-bold text-blue-900 mt-1">
                        {event.event_code}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Share this code with external participants to allow them to register
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prizes */}
            {event.prizes && event.prizes.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <TrophyIcon className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Prizes</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.prizes.map((prize, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {prize}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-500">
                Created by: {event.creator_id}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="border-t p-4 bg-gray-50 rounded-b-xl flex justify-end space-x-4">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      )}
    </Dialog>
  );
};

export default EventDetails; 