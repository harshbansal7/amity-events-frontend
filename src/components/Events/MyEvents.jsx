import React, { useState, useEffect } from 'react';
import { getRegisteredEvents } from '../../services/api';
import EventCard from './EventCard';
import { CircularProgress } from '@mui/material';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('upcoming'); // 'upcoming' or 'past'

  const fetchEvents = async () => {
    try {
      const data = await getRegisteredEvents();
      const sortedEvents = data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
      setEvents(sortedEvents);
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

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const upcomingEvents = events.filter(event => new Date(event.date) >= currentDate);
  const pastEvents = events.filter(event => new Date(event.date) < currentDate);
  const displayEvents = sortOrder === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            My Registered Events
          </h2>
          <p className="mt-2 text-gray-600">
            Track and manage your event registrations
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
            <h3 className="text-2xl font-semibold text-gray-800">
              {sortOrder === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
            </h3>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSortOrder('upcoming')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                sortOrder === 'upcoming'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-indigo-50'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setSortOrder('past')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                sortOrder === 'past'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-indigo-50'
              }`}
            >
              Past
            </button>
          </div>
        </div>
        
        {displayEvents.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={sortOrder === 'upcoming' 
                    ? "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} 
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">
              {sortOrder === 'upcoming' 
                ? "No upcoming registered events" 
                : "No past registered events"}
            </p>
            <a 
              href="/events" 
              className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block
                       transition-colors duration-200 font-medium"
            >
              <span className="flex items-center space-x-1">
                <span>Browse available events</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-300">
            {displayEvents.map((event) => (
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