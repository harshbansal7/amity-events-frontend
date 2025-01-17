import React, { useState, useEffect } from 'react';
import { getEvents, getEventParticipants, removeParticipant, getCurrentUserId } from '../../services/api';
import { format } from 'date-fns';
import { 
  Search,
  Filter,
  UserMinus,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Toast from '../UI/Toast';

const Participants = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAttendance, setFilterAttendance] = useState('all'); // all, present, absent
  const currentUserId = getCurrentUserId();
  const [apiError, setApiError] = useState(''); // Separate state for API errors

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      const userEvents = data.filter(event => event.creator_id === currentUserId);
      setEvents(userEvents);
      if (userEvents.length > 0) {
        setSelectedEvent(userEvents[0]);
        await fetchParticipants(userEvents[0]._id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setError('Failed to fetch events');
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId) => {
    try {
      const event = events.find(e => e._id === eventId);
      if (!event || event.creator_id !== currentUserId) {
        setApiError('Unauthorized to view these participants');
        return;
      }

      setApiError(''); // Clear any existing error
      setLoading(true);
      const data = await getEventParticipants(eventId);
      setParticipants(data);
    } catch (error) {
      setApiError('Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchParticipants(selectedEvent._id);
    }
  }, [selectedEvent]);

  const handleRemoveParticipant = async (eventId, enrollmentNumber) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      try {
        await removeParticipant(eventId, enrollmentNumber);
        await fetchParticipants(eventId);
      } catch (error) {
        setError('Failed to remove participant');
      }
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase());

    switch (filterAttendance) {
      case 'present':
        return matchesSearch && participant.attendance;
      case 'absent':
        return matchesSearch && !participant.attendance;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Participants Management</h1>
        <p className="text-gray-500">Manage event participants and attendance</p>
      </div>

      {/* Event Selector */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <select
          value={selectedEvent?._id || ''}
          onChange={(e) => {
            const event = events.find(evt => evt._id === e.target.value);
            setSelectedEvent(event);
          }}
          className="w-full max-w-2xl border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 
                   focus:ring-indigo-500 focus:border-indigo-500"
        >
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.name} - {format(new Date(event.date), 'MMM d, yyyy')}
            </option>
          ))}
        </select>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2 min-w-[200px]">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={filterAttendance}
            onChange={(e) => setFilterAttendance(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 
                     focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Participants</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="sticky right-0 bg-gray-50 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredParticipants.map((participant) => (
                <tr key={participant.enrollment_number} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {participant.name}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {participant.enrollment_number}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {participant.amity_email}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {participant.branch}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {participant.year}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {participant.attendance ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle className="w-4 h-4 mr-1" />
                        Absent
                      </span>
                    )}
                  </td>
                  <td className="sticky right-0 bg-white px-4 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleRemoveParticipant(selectedEvent._id, participant.enrollment_number)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => {/* Handle PDF export */}}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg
                    hover:bg-gray-50 transition-colors duration-200"
        >
          <FileText className="w-5 h-5 text-gray-600" />
          <span>Export PDF</span>
        </button>
        <button
          onClick={() => {/* Handle Excel export */}}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg
                    hover:bg-gray-50 transition-colors duration-200"
        >
          <FileSpreadsheet className="w-5 h-5 text-gray-600" />
          <span>Export Excel</span>
        </button>
      </div>

      {apiError && (
        <Toast 
          message={apiError} 
          type="error" 
          onClose={() => setApiError('')} 
        />
      )}
    </div>
  );
};

export default Participants; 