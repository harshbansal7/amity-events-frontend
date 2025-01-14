import React, { useState, useEffect } from 'react';
import { getEvents, deleteEvent } from '../../services/api';
import { format } from 'date-fns';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  X
} from 'lucide-react';
import CreateEventForm from '../Events/CreateEventForm';
import EditEventForm from '../Events/EditEventForm';
import Toast from '../UI/Toast';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, past

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        await fetchEvents();
      } catch (error) {
        setError('Failed to delete event');
      }
    }
  };

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
      const eventDate = new Date(event.date);
      const now = new Date();

      switch (filterStatus) {
        case 'active':
          return matchesSearch && eventDate >= now;
        case 'past':
          return matchesSearch && eventDate < now;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-500">Create and manage your events</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                    hover:bg-indigo-700 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 
                     focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Events</option>
            <option value="active">Active Events</option>
            <option value="past">Past Events</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {format(new Date(event.date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(event.date), 'h:mm a')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{event.venue}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {event.participants.length} / {event.max_participants}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${new Date(event.date) >= new Date()
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'}`}
                    >
                      {new Date(event.date) >= new Date() ? 'Active' : 'Past'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
               onClick={() => setShowCreateModal(false)} />
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white w-full max-w-2xl mx-auto rounded-xl shadow-xl">
              <CreateEventForm 
                onSuccess={() => {
                  setShowCreateModal(false);
                  fetchEvents();
                }}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
               onClick={() => setShowEditModal(false)} />
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white w-full max-w-3xl mx-auto rounded-xl shadow-xl">
              {/* Header */}
              <div className="p-6 border-b bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg shadow-lg">
                      <Edit2 className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                      Edit Event
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500 ml-12">
                  Update event details and settings
                </p>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <EditEventForm
                  event={selectedEvent}
                  initialEvent={selectedEvent}
                  onSuccess={() => {
                    setShowEditModal(false);
                    fetchEvents();
                  }}
                  onCancel={() => setShowEditModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

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

export default Events; 