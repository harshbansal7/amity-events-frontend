import React, { useState, useEffect } from 'react';
import { getEvents } from '../../services/api';
import EventCard from './EventCard';
import CreateEventForm from './CreateEventForm';
import { CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      const sortedEvents = data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <CircularProgress />
      </div>
    );
  }

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set to beginning of the day (12 AM)
  const upcomingEvents = events.filter(event => new Date(event.date) >= currentDate);
  const pastEvents = events.filter(event => new Date(event.date) < currentDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-indigo-900">
          Campus Events
        </h2>
        
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-indigo-800">
            Upcoming Events
          </h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-center text-gray-600">No upcoming events</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  onRegister={fetchEvents} 
                  onDelete={fetchEvents}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-6 text-indigo-800">
            Past Events
          </h3>
          {pastEvents.length === 0 ? (
            <p className="text-center text-gray-600">No past events</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75">
              {pastEvents.map((event) => (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  onRegister={fetchEvents} 
                  onDelete={fetchEvents}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setOpenCreateDialog(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <AddIcon />
        </button>

        {openCreateDialog && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                 onClick={() => setOpenCreateDialog(false)} />
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="relative bg-white w-full max-w-2xl mx-auto rounded-lg shadow-xl">
                <CreateEventForm 
                  onSuccess={() => {
                    setOpenCreateDialog(false);
                    fetchEvents();
                  }}
                  onCancel={() => setOpenCreateDialog(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList; 