import React, { useState, useEffect } from 'react';
import { getEvents, downloadParticipantsPDF, downloadParticipantsExcel } from '../../services/api';
import { format } from 'date-fns';
import { 
  FileText, 
  FileSpreadsheet,
  Download,
  Filter,
  CheckSquare
} from 'lucide-react';
import Toast from '../UI/Toast';

const Reports = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFields, setSelectedFields] = useState({
    name: true,
    enrollment_number: true,
    amity_email: true,
    phone_number: true,
    branch: true,
    year: true,
    registered_at: true,
    attendance: true
  });

  const fields = [
    { id: 'name', label: 'Name' },
    { id: 'enrollment_number', label: 'Enrollment Number' },
    { id: 'amity_email', label: 'Email' },
    { id: 'phone_number', label: 'Phone Number' },
    { id: 'branch', label: 'Branch' },
    { id: 'year', label: 'Year' },
    { id: 'registered_at', label: 'Registration Date' },
    { id: 'attendance', label: 'Attendance Status' }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
        if (data.length > 0) {
          setSelectedEvent(data[0]);
        }
      } catch (error) {
        setError('Failed to fetch events');
      }
    };

    fetchEvents();
  }, []);

  const handleExport = async (format) => {
    try {
      setLoading(true);
      const selectedFieldsList = Object.entries(selectedFields)
        .filter(([_, isSelected]) => isSelected)
        .map(([fieldName]) => fieldName);

      if (selectedFieldsList.length === 0) {
        setError('Please select at least one field to export');
        return;
      }

      const downloadFn = format === 'pdf' ? downloadParticipantsPDF : downloadParticipantsExcel;
      const fileExt = format === 'pdf' ? 'pdf' : 'xlsx';
      
      const blob = await downloadFn(selectedEvent._id, { fields_printed: selectedFieldsList });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedEvent.name}-participants.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(`Failed to generate ${format.toUpperCase()} report`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Generate and download event reports</p>
      </div>

      {/* Event Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
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

      {/* Field Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Select Fields to Include</h3>
          <p className="text-sm text-gray-500">Choose which information to include in the report</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {fields.map(field => (
            <div key={field.id} className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedFields(prev => ({
                  ...prev,
                  [field.id]: !prev[field.id]
                }))}
                className={`flex items-center justify-center w-5 h-5 rounded border 
                  ${selectedFields[field.id] 
                    ? 'bg-indigo-600 border-indigo-600' 
                    : 'border-gray-300 hover:border-indigo-500'
                  } transition-colors`}
              >
                {selectedFields[field.id] && (
                  <CheckSquare className="h-4 w-4 text-white" />
                )}
              </button>
              <label className="text-sm text-gray-700">{field.label}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Export Options</h3>
          <p className="text-sm text-gray-500">Download the report in your preferred format</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => handleExport('pdf')}
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 
                     bg-red-50 text-red-700 rounded-lg hover:bg-red-100 
                     transition-colors duration-200 border border-red-200"
          >
            <FileText className="w-5 h-5" />
            <span>{loading ? 'Generating...' : 'Export as PDF'}</span>
          </button>

          <button
            onClick={() => handleExport('excel')}
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 
                     bg-green-50 text-green-700 rounded-lg hover:bg-green-100 
                     transition-colors duration-200 border border-green-200"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>{loading ? 'Generating...' : 'Export as Excel'}</span>
          </button>
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

export default Reports; 