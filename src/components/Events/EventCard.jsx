import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  registerForEvent,
  deleteEvent,
  getCurrentUserId,
  unregisterFromEvent,
} from "../../services/api";
import EditEventForm from "./EditEventForm";
import Toast from "../UI/Toast";
import ShareModal from "../UI/ShareModal";
import {
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Trophy,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
  Key,
  Share2,
  X,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
// import AdminTools from './AdminTools';

const EventCard = ({
  event,
  onRegister,
  onDelete,
  onUnregister,
  showDetailsModal = false,
  onCloseModal,
}) => {
  const navigate = useNavigate();
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUnregisterDialog, setOpenUnregisterDialog] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const currentUserId = getCurrentUserId();
  const isCreator = currentUserId === event.creator_id;
  const [showDetailsModalState, setShowDetailsModalState] =
    useState(showDetailsModal);
  const detailsModalRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Check if participants is a number (for non-creators) or array (for creators)
  const participantCount = Array.isArray(event.participants)
    ? event.participants.length
    : event.participants;

  const isRegistered = Array.isArray(event.participants)
    ? event.participants.some((p) => p.enrollment_number === getCurrentUserId())
    : event.is_registered;

  // Helper function to parse custom fields
  const getCustomFields = () => {
    if (!event.custom_fields) return [];
    if (Array.isArray(event.custom_fields)) return event.custom_fields;
    if (typeof event.custom_fields === "string") {
      return event.custom_fields.split(",").filter((field) => field.trim());
    }
    return [];
  };

  const handleRegisterClick = () => {
    const customFields = getCustomFields();
    // Initialize custom field values
    const initialValues = {};
    customFields.forEach((field) => {
      initialValues[field] = "";
    });
    setCustomFieldValues(initialValues);
    setShowRegistrationModal(true);
  };

  const handleRegisterSubmit = async () => {
    try {
      setIsRegistering(true);

      // Create the request data
      const requestData = {
        custom_field_values: JSON.stringify(customFieldValues),
      };

      await registerForEvent(event._id, requestData);
      if (onRegister) onRegister();
      setShowRegistrationModal(false);
    } catch (error) {
      console.error("Failed to register:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setIsUnregistering(true);
      await unregisterFromEvent(event._id);
      if (onUnregister) {
        onUnregister();
      } else if (onRegister) {
        onRegister();
      }
      setOpenUnregisterDialog(false);
    } catch (error) {
      console.error("Failed to unregister:", error);
    } finally {
      setIsUnregistering(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(event._id);
      setOpenDeleteDialog(false);
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const isPastEvent = () => {
    const eventDate = new Date(event.date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to beginning of the day (12 AM)
    return eventDate < currentDate;
  };

  const formatDuration = (duration) => {
    const parts = [];
    if (duration.days)
      parts.push(`${duration.days} day${duration.days > 1 ? "s" : ""}`);
    if (duration.hours)
      parts.push(`${duration.hours} hr${duration.hours > 1 ? "s" : ""}`);
    if (duration.minutes) parts.push(`${duration.minutes} min`);
    return parts.join(" ");
  };

  const formatDate = (date) => format(new Date(date), "dd MMM yyyy");
  const formatFullDate = (date) => format(new Date(date), "EEEE, dd MMMM yyyy");
  const formatTime = (date) => format(new Date(date), "h:mm a");

  // Handle keyboard events for modal
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showDetailsModalState) {
        handleCloseModal();
      }
    };

    if (showDetailsModalState) {
      document.addEventListener("keydown", handleEscape);
      // Lock body scroll
      document.body.style.overflow = "hidden";
      // Focus the modal
      closeButtonRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showDetailsModalState]);

  // Add effect to handle prop changes
  useEffect(() => {
    setShowDetailsModalState(showDetailsModal);
  }, [showDetailsModal]);

  // Update the close modal handler
  const handleCloseModal = () => {
    setShowDetailsModalState(false);
    if (onCloseModal) {
      onCloseModal();
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleViewDetails = () => {
    // Instead of just setting state, navigate to the event details URL
    navigate(`/events/${event._id}`);
  };

  return (
    <div className="relative group">
      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
        {/* Admin Tools */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          {/* Share button - visible to everyone */}
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Share2 className="text-gray-600 hover:text-indigo-600 w-5 h-5" />
          </button>

          {/* Edit and Delete - only visible to creator */}
          {isCreator && (
            <>
              <button
                onClick={() => setOpenEditForm(true)}
                className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <Edit2 className="text-indigo-600 w-5 h-5" />
              </button>
              <button
                onClick={() => setOpenDeleteDialog(true)}
                className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <Trash2 className="text-red-600 w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Event Image */}
        <div className="relative h-48">
          <img
            src={event.image_url || "/assets/default-event.jpg"}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
            <div className="flex items-center flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {formatDate(event.date)}
              </span>
              {isRegistered && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3" />
                  Registered
                </span>
              )}
              {event.allow_external && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  External Allowed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {/* Event Code (if external) */}
            {event.allow_external && (
              <div className="flex items-center space-x-3 text-gray-600 bg-indigo-50 p-3 rounded-lg">
                <Key className="w-5 h-5 flex-shrink-0 text-indigo-600" />
                <div>
                  <p className="text-xs text-indigo-600 font-medium">
                    Event Code
                  </p>
                  <p className="text-sm font-mono font-bold">
                    {event.event_code}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3 text-gray-600">
              <CalendarDays className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">{formatFullDate(event.date)}</p>
                <p className="text-xs text-gray-500">
                  {formatTime(event.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-600">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{formatDuration(event.duration)}</p>
            </div>

            <div className="flex items-start space-x-3 text-gray-600">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{event.venue}</p>
            </div>

            <div className="flex items-center space-x-3 text-gray-600">
              <Users className="w-5 h-5 flex-shrink-0" />
              <div className="text-sm">
                <span
                  className={
                    participantCount >= event.max_participants
                      ? "text-red-600 font-medium"
                      : ""
                  }
                >
                  {participantCount}
                </span>
                <span className="mx-1">/</span>
                <span>{event.max_participants}</span>
                <span className="ml-1">participants</span>
                {event.max_participants - participantCount <=
                  Math.ceil(event.max_participants * 0.1) &&
                  participantCount < event.max_participants && (
                    <span className="text-red-600 font-medium ml-2">
                      Last few slots left!!
                    </span>
                  )}
              </div>
            </div>

            {event.prizes && (
              <div className="flex items-start space-x-3 text-gray-600">
                <Trophy className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  {event.prizes.split(",").map((prize, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-4 text-xs text-indigo-600 font-medium">
                        {index + 1}
                        {index === 0
                          ? "st"
                          : index === 1
                            ? "nd"
                            : index === 2
                              ? "rd"
                              : "th"}
                      </span>
                      <span>{prize.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Registration Status */}
          <div className="pt-4 border-t">
            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={handleViewDetails}
                className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-300
                  bg-gray-100 text-gray-700 hover:bg-gray-200 
                  flex items-center justify-center space-x-2"
              >
                <Info className="w-4 h-4" />
                <span>View Details</span>
              </button>
              {isRegistered ? (
                <button
                  onClick={() => setOpenUnregisterDialog(true)}
                  disabled={isPastEvent() || isUnregistering}
                  className="flex-1 py-2 px-4 rounded-lg font-medium 
                    text-red-600 border-2 border-red-200
                    hover:bg-red-50 disabled:opacity-50 
                    transition-colors duration-200"
                >
                  {isUnregistering ? "Unregistering..." : "Unregister"}
                </button>
              ) : (
                <button
                  onClick={() => setShowRegistrationModal(true)}
                  disabled={
                    isPastEvent() ||
                    participantCount >= event.max_participants ||
                    isRegistering
                  }
                  className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-300
                    bg-indigo-600 text-white hover:bg-indigo-700 
                    disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isPastEvent()
                    ? "Event Ended"
                    : participantCount >= event.max_participants
                      ? "Full"
                      : isRegistering
                        ? "Registering..."
                        : "Register Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {openDeleteDialog && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenDeleteDialog(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 relative z-[201]">
            <h3 className="text-xl font-semibold mb-4">Delete Event</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setOpenDeleteDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Combined Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 z-[250] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <Dialog
              open={showRegistrationModal}
              onClose={() => setShowRegistrationModal(false)}
              className="relative z-[250]"
            >
              <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                aria-hidden="true"
              />

              <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                    Register for {event.name}
                  </Dialog.Title>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      {getCustomFields().length > 0
                        ? "Please provide the following optional information for your registration"
                        : "Are you sure you want to register for this event?"}
                    </p>

                    {getCustomFields().map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {field}
                        </label>
                        <input
                          type="text"
                          value={customFieldValues[field] || ""}
                          onChange={(e) =>
                            setCustomFieldValues((prev) => ({
                              ...prev,
                              [field]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder={`Enter ${field.toLowerCase()}`}
                        />
                      </div>
                    ))}

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowRegistrationModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 
                                 bg-white border border-gray-300 rounded-lg 
                                 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleRegisterSubmit}
                        disabled={isRegistering}
                        className="px-4 py-2 text-sm font-medium text-white 
                                 bg-indigo-600 rounded-lg hover:bg-indigo-700
                                 disabled:opacity-50"
                      >
                        {isRegistering ? "Registering..." : "Register"}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </div>
            </Dialog>
          </div>
        </div>
      )}

      {/* Unregistration Confirmation Modal */}
      {openUnregisterDialog && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[250]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenUnregisterDialog(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 relative z-[250]">
            <h3 className="text-xl font-semibold mb-4">
              Unregister from Event
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unregister from {event.name}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setOpenUnregisterDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                No
              </button>
              <button
                onClick={handleUnregister}
                disabled={isUnregistering}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {isUnregistering ? "Unregistering..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {openEditForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenEditForm(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-[201]">
            <div className="sticky top-0 z-[100] p-6 border-b bg-white/50 backdrop-blur-sm rounded-t-2xl relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg shadow-lg">
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Edit Event
                  </h2>
                </div>
                <button
                  onClick={() => setOpenEditForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <EditEventForm
                initialEvent={event}
                event={event}
                onSuccess={() => {
                  setOpenEditForm(false);
                  onRegister();
                }}
                onCancel={() => setOpenEditForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showDetailsModalState && (
        <div className="fixed inset-0 z-[205] overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setShowDetailsModalState(false);
              if (onCloseModal) onCloseModal();
            }}
          />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-3xl mx-auto bg-white rounded-xl shadow-xl">
              {/* Close button */}
              <button
                onClick={() => {
                  setShowDetailsModalState(false);
                  if (onCloseModal) onCloseModal();
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500 
                         hover:bg-gray-100 rounded-full z-[10]"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Share button - Adding in details modal */}
              <button
                onClick={handleShare}
                className="absolute top-4 right-14 p-2 text-gray-400 hover:text-gray-500 
                         hover:bg-gray-100 rounded-full z-[10]"
              >
                <Share2 className="w-6 h-6" />
              </button>

              {/* Modal content */}
              <div className="overflow-y-auto max-h-[90vh]">
                <div className="relative">
                  {/* Header Image */}
                  <div
                    className="h-48 sm:h-64 relative"
                    role="img"
                    aria-label={`Cover image for ${event.name}`}
                  >
                    <img
                      src={event.image_url || "/assets/default-event.jpg"}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Title Section */}
                  <div className="space-y-2">
                    <h2
                      id="event-details-title"
                      className="text-2xl font-bold text-gray-900"
                    >
                      {event.name}
                    </h2>
                    <div role="list" className="flex flex-wrap gap-2">
                      <span
                        role="listitem"
                        className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                      >
                        {formatFullDate(event.date)}
                      </span>
                      {event.allow_external && (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            External Participants Allowed
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 font-mono">
                            Code: {event.event_code}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* External Registration Info */}
                  {event.allow_external && (
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Key className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            External Registration
                          </h4>
                          <p className="text-sm text-gray-600">
                            This event allows external participants to register
                            using the event code:
                          </p>
                          <div className="mt-2 bg-white/50 px-4 py-2 rounded-lg inline-block">
                            <code className="text-lg font-mono font-bold text-indigo-600">
                              {event.event_code}
                            </code>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Share this code with external participants to allow
                            them to register.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <section
                    aria-labelledby="event-description"
                    className="prose max-w-none"
                  >
                    <h3
                      id="event-description"
                      className="text-lg font-semibold text-gray-900"
                    >
                      About This Event
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {event.description}
                    </p>
                  </section>

                  {/* Details Grid */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    role="complementary"
                    aria-label="Event details"
                  >
                    {/* Time & Duration */}
                    <section
                      aria-labelledby="time-duration"
                      className="space-y-4"
                    >
                      <h3
                        id="time-duration"
                        className="text-lg font-semibold text-gray-900"
                      >
                        Time & Duration
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-gray-600">
                          <CalendarDays className="w-5 h-5" />
                          <div>
                            <p className="text-sm font-medium">
                              {formatFullDate(event.date)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatTime(event.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600">
                          <Clock className="w-5 h-5" />
                          <span className="text-sm">
                            {formatDuration(event.duration)}
                          </span>
                        </div>
                      </div>
                    </section>

                    {/* Location & Capacity */}
                    <section
                      aria-labelledby="location-capacity"
                      className="space-y-4"
                    >
                      <h3
                        id="location-capacity"
                        className="text-lg font-semibold text-gray-900"
                      >
                        Location & Capacity
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 text-gray-600">
                          <MapPin className="w-5 h-5 mt-0.5" />
                          <span className="text-sm">{event.venue}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600">
                          <Users className="w-5 h-5" />
                          <div className="text-sm">
                            <span
                              className={
                                participantCount >= event.max_participants
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {participantCount}
                            </span>
                            <span className="mx-1">/</span>
                            <span>{event.max_participants}</span>
                            <span className="ml-1">participants</span>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Prizes Section */}
                  {event.prizes && (
                    <section
                      aria-labelledby="prizes-section"
                      className="space-y-4"
                    >
                      <h3
                        id="prizes-section"
                        className="text-lg font-semibold text-gray-900"
                      >
                        Prizes
                      </h3>
                      <div
                        role="list"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                      >
                        {event.prizes.split(",").map((prize, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl"
                          >
                            <div className="text-xs font-semibold text-indigo-600 mb-1">
                              {index === 0
                                ? "1st Prize"
                                : index === 1
                                  ? "2nd Prize"
                                  : index === 2
                                    ? "3rd Prize"
                                    : `${index + 1}th Prize`}
                            </div>
                            <div className="text-sm text-gray-800 font-medium">
                              {prize.trim()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Registration Status */}
                  <section
                    aria-label="Registration status"
                    className="pt-6 border-t"
                  >
                    {isRegistered ? (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Registered
                          </span>
                        </span>
                        <button
                          onClick={() => setOpenUnregisterDialog(true)}
                          disabled={isPastEvent() || isUnregistering}
                          className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          {isUnregistering ? "Unregistering..." : "Unregister"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowRegistrationModal(true)}
                        disabled={
                          isPastEvent() ||
                          participantCount >= event.max_participants ||
                          isRegistering
                        }
                        className="w-full py-2 px-4 rounded-lg font-medium transition-colors duration-300
                          bg-indigo-600 text-white hover:bg-indigo-700 
                          disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isPastEvent()
                          ? "Event Ended"
                          : participantCount >= event.max_participants
                            ? "Full"
                            : isRegistering
                              ? "Registering..."
                              : "Register Now"}
                      </button>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        event={event}
      />

      {/* Share Toast Notification - can be removed if using ShareModal instead */}
      {showShareToast && (
        <Toast
          message="Event link copied to clipboard!"
          type="success"
          onClose={() => setShowShareToast(false)}
        />
      )}
    </div>
  );
};

export default EventCard;
