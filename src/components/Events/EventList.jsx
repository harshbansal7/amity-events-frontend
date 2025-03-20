import { useState, useEffect } from "react";
import { getEvents, isExternalUser, getEvent } from "../../services/api";
import EventCard from "./EventCard";
import CreateEventForm from "./CreateEventForm";
import { CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useRotatingMessage from "../../hooks/useRotatingMessage";
import { useParams, useNavigate } from "react-router-dom";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isExternal, setIsExternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { eventId } = useParams();
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);
  const rotatingMessage = useRotatingMessage("eventList");
  const noEventsMessage = useRotatingMessage("noEvents");
  const navigate = useNavigate();

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
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle direct navigation to an event via URL
  const loadEventDetails = async () => {
    if (!eventId) return;

    // First look for the event in the already loaded events
    if (events.length > 0) {
      const event = events.find((e) => e._id === eventId);
      if (event) {
        setSelectedEventForModal(event);
        return;
      }
    }

    // If not found in local state, try to fetch it directly
    try {
      const event = await getEvent(eventId);
      if (event) {
        setSelectedEventForModal(event);
      }
    } catch (error) {
      console.error("Failed to fetch event details:", error);
      // Silently fail and just show the event list
    }
  };

  useEffect(() => {
    fetchEvents();
    setIsExternal(isExternalUser());
  }, []);

  useEffect(() => {
    loadEventDetails();
  }, [eventId, events]);

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedEventForModal(null);
    // Update the URL to remove the event ID without full page refresh
    navigate("/events", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <CircularProgress />
      </div>
    );
  }

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set to beginning of the day (12 AM)
  const upcomingEvents = events.filter(
    (event) => new Date(event.date) >= currentDate,
  );
  const pastEvents = events.filter(
    (event) => new Date(event.date) < currentDate,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Campus Events
          </h2>
          <p className="mt-2 text-gray-600">
            Discover and participate in exciting events at Amity
          </p>
          <p className="mt-1 text-gray-400/60 text-sm italic">
            {rotatingMessage}
          </p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
              <h3 className="text-2xl font-semibold text-gray-800">
                Upcoming Events
              </h3>
            </div>
            <div className="flex items-center space-x-4">
              {/* Add filter/sort options here if needed */}
            </div>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-lg">No upcoming events</p>
              <p className="text-gray-400/60 text-sm mt-2 italic">
                {noEventsMessage}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-300">
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
              <h3 className="text-2xl font-semibold text-gray-700">
                Past Events
              </h3>
            </div>
          </div>
          {pastEvents.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center relative z-[10]">
              <p className="text-gray-500">No past events to show</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 
                         opacity-80 hover:opacity-100 transition-opacity duration-300"
            >
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
        {!isExternal && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full 
                    bg-gradient-to-r from-indigo-600 to-blue-600 
                    hover:from-indigo-700 hover:to-blue-700 
                    text-white shadow-lg hover:shadow-xl 
                    transition-all duration-300 
                    flex items-center justify-center
                    transform hover:scale-110
                    z-[90]
                    sm:w-auto sm:h-auto sm:px-4 sm:py-3 sm:rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <AddIcon />
              <span className="hidden sm:inline">Create Event</span>
            </div>
          </button>
        )}
        {showCreateModal && (
          <div className="fixed inset-0 z-[200] overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowCreateModal(false)}
            />
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="relative bg-white w-full max-w-2xl mx-auto rounded-lg shadow-xl">
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
        {selectedEventForModal && (
          <EventCard
            event={selectedEventForModal}
            onRegister={fetchEvents}
            onDelete={fetchEvents}
            showDetailsModal={true}
            onCloseModal={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default EventList;
