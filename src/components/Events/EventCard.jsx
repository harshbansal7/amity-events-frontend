import React, { useState } from 'react';
import { format } from 'date-fns';
import {STATIC_URL, registerForEvent, deleteEvent, getCurrentUserId, unregisterFromEvent } from '../../services/api';
import EventDetails from './EventDetails';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const EventCard = ({ event, onRegister, onDelete, onUnregister }) => {
  const [openDetails, setOpenDetails] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const currentUserId = getCurrentUserId();
  const isCreator = currentUserId === event.creator_id;

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return 'https://next-images.123rf.com/index/_next/image/?url=https://assets-cdn.123rf.com/index/static/assets/top-section-bg.jpeg&w=3840&q=75';
    }
    if (imageUrl.startsWith('/')) {
      return `${STATIC_URL}${imageUrl}`;
    }
    return imageUrl;
  };

  const handleRegister = async () => {
    try {
      await registerForEvent(event._id);
      if (onRegister) onRegister();
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  const handleUnregister = async () => {
    try {
      setIsUnregistering(true);
      await unregisterFromEvent(event._id);
      if (onUnregister) {
        onUnregister();
      } else if (onRegister) {
        onRegister();
      }
    } catch (error) {
      console.error('Failed to unregister:', error);
    } finally {
      setIsUnregistering(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(event._id);
      setOpenDeleteDialog(false);
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const isPastEvent = () => {
    const eventDate = new Date(event.date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to beginning of the day (12 AM)
    return eventDate < currentDate;
  };

  return (
    <>
      <div className="relative group">
        <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
          {isCreator && (
            <div className="absolute top-4 right-4 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={() => setOpenDetails(true)}
                className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <EditIcon className="text-indigo-600 w-5 h-5" />
              </button>
              <button 
                onClick={() => setOpenDeleteDialog(true)}
                className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <DeleteIcon className="text-red-600 w-5 h-5" />
              </button>
            </div>
          )}

          <img
            src={getImageUrl(event.image_url)}
            alt={event.name}
            className="w-full h-48 object-cover"
          />

          <div className="p-6">
            <h3 
              className="text-xl font-semibold text-indigo-900 mb-2 cursor-pointer hover:text-indigo-600"
              onClick={() => setOpenDetails(true)}
            >
              {event.name}
            </h3>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {event.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <CalendarTodayIcon className="w-5 h-5 mr-2 text-indigo-500" />
                <span>{format(new Date(event.date), 'PPP')}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <LocationOnIcon className="w-5 h-5 mr-2 text-indigo-500" />
                <span>{event.venue}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <PeopleIcon className="w-5 h-5 mr-2 text-indigo-500" />
                <span>{event.participants.length}/{event.max_participants} participants</span>
              </div>
            </div>

            <button
              onClick={event.participants.includes(currentUserId) ? handleUnregister : handleRegister}
              disabled={
                isPastEvent() ||
                (event.participants.length >= event.max_participants && 
                !event.participants.includes(currentUserId)) || 
                isUnregistering
              }
              className={`mt-6 w-full py-2 px-4 rounded-lg font-medium transition-colors duration-300
                ${
                  isPastEvent() 
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : event.participants.length >= event.max_participants && !event.participants.includes(currentUserId)
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : event.participants.includes(currentUserId)
                        ? isUnregistering
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
            >
              {
                isPastEvent()
                  ? 'Event Ended'
                  : event.participants.length >= event.max_participants && !event.participants.includes(currentUserId)
                    ? 'Full'
                    : event.participants.includes(currentUserId)
                      ? isUnregistering
                        ? 'Unregistering...'
                        : 'Unregister'
                      : 'Register'
              }
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {openDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-xl font-semibold mb-4">Delete Event</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setOpenDeleteDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <EventDetails 
        event={event}
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        isCreator={isCreator}
        onUpdate={onRegister}
      />
    </>
  );
};

export default EventCard; 