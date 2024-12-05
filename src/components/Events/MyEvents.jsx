import React, { useState, useEffect } from 'react';
import { getRegisteredEvents } from '../../services/api';
import EventCard from './EventCard';
import { CircularProgress } from '@mui/material';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const data = await getRegisteredEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch registered events:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12 text-indigo-900">
          My Registered Events
        </h1>
        
        {events.length === 0 ? (
          <div className="text-center text-gray-600">
            <p className="text-xl mb-4">You haven't registered for any events yet.</p>
            <a 
              href="/events" 
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              Browse available events
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard 
                key={event._id}
                event={event} 
                onRegister={fetchEvents}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents; 