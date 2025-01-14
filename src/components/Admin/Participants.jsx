import React, { useState, useEffect } from 'react';
import { getEvents, getEventParticipants, removeParticipant } from '../../services/api';
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

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
      if (data.length > 0) {
        setSelectedEvent(data[0]);
        await fetchParticipants(data[0]._id);
      }
    } catch (error) {
      setError('Failed to fetch events');
    }
  };

  const fetchParticipants = async (eventId) => {
    try {
      setLoading(true);
      const data = await getEventParticipants(eventId);
      setParticipants(data);
    } catch (error) {
      setError('Failed to fetch participants');
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

      {/* Event Selection */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <select
          value={selectedEvent?._id || ''}
          onChange={(e) => {
            const event = events.find(evt => evt._id === e.target.value);
            setSelectedEvent(event);
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 
                   focus:ring-indigo-500 focus:border-indigo-500"
        >
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.name} - {format(new Date(event.date), 'MMM d, yyyy')}
            </option>
          ))}
        </select>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
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
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={filterAttendance}
            onChange={(e) => setFilterAttendance(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 
                     focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Participants</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex gap-4">
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

      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParticipants.map((participant) => (
                <tr key={participant.enrollment_number} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {participant.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {participant.enrollment_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {participant.amity_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {participant.branch}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {participant.year}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

      {error && (
        <Toast 
          message={error} 
          type="error" 
          onClose={() => setError('')} 
        />
      )}
    </div>
  );
};

export default Participants; 