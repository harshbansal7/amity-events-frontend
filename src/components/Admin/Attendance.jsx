import { useState, useEffect } from "react";
import {
  getEvents,
  getEventParticipants,
  markAttendance,
  getCurrentUserId,
} from "../../services/api";
import { format } from "date-fns";
import { Search, Filter, CheckCircle, XCircle, Save } from "lucide-react";
import Toast from "../UI/Toast";

const Attendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, present, absent
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const currentUserId = getCurrentUserId();
  const [apiError, setApiError] = useState("");

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      const userEvents = data.filter(
        (event) => event.creator_id === currentUserId,
      );
      setEvents(userEvents);
      if (userEvents.length > 0) {
        setSelectedEvent(userEvents[0]);
        await fetchParticipants(userEvents[0]._id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setError("Failed to fetch events");
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId) => {
    try {
      const event = events.find((e) => e._id === eventId);
      if (!event || event.creator_id !== currentUserId) {
        setApiError("Unauthorized to view these participants");
        return;
      }

      setApiError("");
      setLoading(true);
      const data = await getEventParticipants(eventId);
      setParticipants(data);
    } catch (error) {
      setApiError("Failed to fetch participants");
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

  const handleAttendanceToggle = (enrollmentNumber) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.enrollment_number === enrollmentNumber) {
          return { ...p, attendance: !p.attendance, modified: true };
        }
        return p;
      }),
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      // Verify this is user's event before saving attendance
      if (!selectedEvent || selectedEvent.creator_id !== currentUserId) {
        setError("Unauthorized to mark attendance for this event");
        return;
      }
      const modifiedAttendance = participants
        .filter((p) => p.modified)
        .map((p) => ({
          enrollment_number: p.enrollment_number,
          attendance: p.attendance,
        }));

      if (modifiedAttendance.length === 0) {
        setError("No attendance changes to save");
        return;
      }

      await markAttendance(selectedEvent._id, modifiedAttendance);
      setSuccess("Attendance saved successfully");
      setHasUnsavedChanges(false);

      // Clear modification flags
      setParticipants((prev) => prev.map((p) => ({ ...p, modified: false })));
    } catch (error) {
      setError("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.enrollment_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    switch (filterStatus) {
      case "present":
        return matchesSearch && participant.attendance;
      case "absent":
        return matchesSearch && !participant.attendance;
      default:
        return matchesSearch;
    }
  });

  const stats = {
    total: participants.length,
    present: participants.filter((p) => p.attendance).length,
    absent: participants.filter((p) => !p.attendance).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Attendance Management
          </h1>
          <p className="text-gray-500">Mark and track event attendance</p>
        </div>
        {hasUnsavedChanges && (
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                      hover:bg-indigo-700 transition-colors duration-200"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        )}
      </div>

      {/* Event Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <select
          value={selectedEvent?._id || ""}
          onChange={(e) => {
            if (
              hasUnsavedChanges &&
              !window.confirm("You have unsaved changes. Continue anyway?")
            ) {
              return;
            }
            const event = events.find((evt) => evt._id === e.target.value);
            setSelectedEvent(event);
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 
                   focus:ring-indigo-500 focus:border-indigo-500"
        >
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.name} - {format(new Date(event.date), "MMM d, yyyy")}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-sm font-medium text-gray-500">
            Total Participants
          </div>
          <div className="mt-1 text-2xl font-semibold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-sm font-medium text-green-500">Present</div>
          <div className="mt-1 text-2xl font-semibold">{stats.present}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-sm font-medium text-red-500">Absent</div>
          <div className="mt-1 text-2xl font-semibold">{stats.absent}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mt-6">
        {/* Search and Filter Controls - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 
                       focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Participants</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>

        {/* Table with horizontal scroll */}
        <div className="relative rounded-lg border border-gray-200 bg-white">
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
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="sticky right-0 bg-gray-50 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParticipants.map((participant) => (
                  <tr
                    key={participant.enrollment_number}
                    className="hover:bg-gray-50"
                  >
                    <td className="sticky left-0 bg-white px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {participant.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.enrollment_number}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.branch}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.year}
                    </td>
                    <td className="sticky right-0 bg-white px-4 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() =>
                          handleAttendanceToggle(participant.enrollment_number)
                        }
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                          ${
                            participant.attendance
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          } transition-colors
                          ${participant.modified ? "ring-2 ring-indigo-500" : ""}`}
                      >
                        {participant.attendance ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Present
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Absent
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {apiError && (
        <Toast
          message={apiError}
          type="error"
          onClose={() => setApiError("")}
        />
      )}
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess("")}
        />
      )}
    </div>
  );
};

export default Attendance;
