import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ClipboardList, 
  FileSpreadsheet, 
  FileText, 
  UserMinus,
  Settings,
  X,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getEventParticipants,
  downloadParticipantsPDF,
  downloadParticipantsExcel,
  removeParticipant,
  markAttendance
} from '../../services/api';
import Toast from '../UI/Toast';

const ParticipantsModal = ({ event, onClose, onParticipantRemoved }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);

  React.useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const data = await getEventParticipants(event._id);
        setParticipants(data);
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [event._id]);

  const handleRemoveParticipant = async (enrollmentNumber) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      try {
        await removeParticipant(event._id, enrollmentNumber);
        setParticipants(participants.filter(p => p.enrollment_number !== enrollmentNumber));
        if (onParticipantRemoved) onParticipantRemoved();
      } catch (error) {
        console.error('Failed to remove participant:', error);
      }
    }
  };

  const handleAttendanceChange = async (enrollmentNumber, currentStatus) => {
    try {
      setMarkingAttendance(true);
      await markAttendance(event._id, enrollmentNumber, !currentStatus);
      setParticipants(participants.map(p => 
        p.enrollment_number === enrollmentNumber 
          ? {...p, attendance: !currentStatus}
          : p
      ));
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    } finally {
      setMarkingAttendance(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="inline-block w-full transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[90vw] sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800">Event Participants</h3>
                <p className="text-gray-600 mt-1">{event.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-600">Loading participants...</p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amity Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <tr key={participant.enrollment_number} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{participant.enrollment_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{participant.branch}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{participant.year}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{participant.amity_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{participant.phone_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAttendanceChange(
                              participant.enrollment_number,
                              participant.attendance
                            )}
                            disabled={markingAttendance}
                            className={`px-3 py-1 rounded-full text-sm font-medium 
                              ${participant.attendance 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              } transition-colors`}
                          >
                            {participant.attendance ? 'Present' : 'Absent'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleRemoveParticipant(participant.enrollment_number)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const FieldSelectionModal = ({ onClose, onConfirm, title }) => {
  const fields = [
    { id: 'name', label: 'Name' },
    { id: 'enrollment_number', label: 'Enrollment Number' },
    { id: 'amity_email', label: 'Amity Email' },
    { id: 'phone_number', label: 'Phone Number' },
    { id: 'branch', label: 'Branch' },
    { id: 'year', label: 'Year' },
    { id: 'registered_at', label: 'Registration Date' },
    { id: 'attendance', label: 'Attendance Status' }
  ];

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

  const handleToggleField = (fieldId) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const handleConfirm = () => {
    const selectedFieldsList = Object.entries(selectedFields)
      .filter(([_, isSelected]) => isSelected)
      .map(([fieldName]) => fieldName);
    onConfirm(selectedFieldsList);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative bg-white rounded-lg w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Select the fields you want to include in the export:
              </p>
              
              {fields.map(field => (
                <div key={field.id} className="flex items-center">
                  <button
                    onClick={() => handleToggleField(field.id)}
                    className={`flex items-center justify-center w-5 h-5 rounded border 
                      ${selectedFields[field.id] 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'border-gray-300 hover:border-indigo-500'
                      } transition-colors mr-3`}
                  >
                    {selectedFields[field.id] && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </button>
                  <label className="text-gray-700">{field.label}</label>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const AdminTools = ({ event, onParticipantRemoved }) => {
  const [participants, setParticipants] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showFieldSelection, setShowFieldSelection] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [error, setError] = useState(null);

  const handleViewParticipants = () => {
    setShowParticipants(true);
    setShowMenu(false);
  };

  const handleExport = async (selectedFields) => {
    try {
      const participants = await getEventParticipants(event._id);
      if (!participants || participants.length === 0) {
        setError('Cannot generate report: No participants registered for this event');
        return;
      }

      const downloadFn = exportType === 'pdf' ? downloadParticipantsPDF : downloadParticipantsExcel;
      const fileExt = exportType === 'pdf' ? 'pdf' : 'xlsx';
      
      const fields_printed = selectedFields.map(field => field);

      const blob = await downloadFn(event._id, { fields_printed });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.name}-participants.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Failed to download ${exportType.toUpperCase()}:`, error);
      setError(`Failed to generate ${exportType.toUpperCase()} report. Please try again.`);
    } finally {
      setShowFieldSelection(false);
      setExportType(null);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Settings className="text-gray-600 w-6 h-6" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              <button
                onClick={handleViewParticipants}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                View Participants
              </button>
              <button
                onClick={() => {
                  setExportType('pdf');
                  setShowFieldSelection(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </button>
              <button
                onClick={() => {
                  setExportType('excel');
                  setShowFieldSelection(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Download Excel
              </button>
            </div>
          </div>
        )}
      </div>

      {showParticipants && (
        <ParticipantsModal
          event={event}
          onClose={() => setShowParticipants(false)}
          onParticipantRemoved={onParticipantRemoved}
        />
      )}

      {showFieldSelection && (
        <FieldSelectionModal
          title={`Select Fields for ${exportType.toUpperCase()} Export`}
          onClose={() => {
            setShowFieldSelection(false);
            setExportType(null);
          }}
          onConfirm={handleExport}
        />
      )}

      {error && (
        <Toast
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </>
  );
};

export default AdminTools; 