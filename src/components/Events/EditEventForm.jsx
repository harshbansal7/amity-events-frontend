import { useState } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { updateEvent } from "../../services/api";
import { TextField, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Switch, Checkbox } from "@mui/material";
import {
  Camera,
  X as XIcon,
  Calendar,
  FileText,
  AlertCircle,
  Plus,
  Minus,
  Info,
  Settings,
} from "lucide-react";
import { Info as FeatherInfo } from "react-feather";

// Custom field types
const FIELD_TYPES = {
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  SELECT: "select"
};

const EditEventForm = ({ initialEvent, event, onSuccess, onCancel }) => {
  // Convert custom_fields from string to array if needed
  const initialCustomFields = (() => {
    if (!initialEvent.custom_fields) return [];
    if (Array.isArray(initialEvent.custom_fields))
      return initialEvent.custom_fields;
    if (typeof initialEvent.custom_fields === "string") {
      return initialEvent.custom_fields
        .split(",")
        .filter((field) => field.trim());
    }
    return [];
  })();

  const [editedEvent, setEditedEvent] = useState({
    name: initialEvent.name,
    custom_slug: initialEvent.custom_slug || "",
    date: initialEvent.date ? new Date(initialEvent.date) : new Date(),
    duration_days: initialEvent.duration?.days || 0,
    duration_hours: initialEvent.duration?.hours || 0,
    duration_minutes: initialEvent.duration?.minutes || 0,
    max_participants: initialEvent.max_participants,
    venue: initialEvent.venue,
    description: initialEvent.description || "",
    prizes: Array.isArray(initialEvent.prizes)
      ? initialEvent.prizes.join(", ")
      : initialEvent.prizes || "",
    image: null,
    image_url: initialEvent.image_url || null,
    has_image_been_changed: false,
    custom_fields: initialCustomFields,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFieldInput, setCustomFieldInput] = useState({
    name: "",
    type: FIELD_TYPES.STRING,
    required: false,
    options: "" // For select type, comma-separated options
  });

  // Edit mode for existing fields
  const [editingFieldIndex, setEditingFieldIndex] = useState(-1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();

      Object.keys(editedEvent).forEach((key) => {
        if (key === "custom_fields") {
          formData.append("custom_fields", JSON.stringify(editedEvent.custom_fields));
        } else if (key === "date") {
          formData.append("date", editedEvent.date.toISOString());
        } else if (key !== "image_url") {
          formData.append(key, editedEvent[key]);
        }
      });

      await updateEvent(event._id, formData);
      onSuccess();
    } catch (err) {
      // Display specific field errors if they exist in the response
      if (err.response?.data?.fieldErrors) {
        const fieldErrors = err.response.data.fieldErrors;
        const errorMessages = Object.keys(fieldErrors)
          .map((field) => `${field}: ${fieldErrors[field]}`)
          .join(", ");
        setError(`Validation errors: ${errorMessages}`);
      } else {
        setError(err.response?.data?.error || "Failed to update event");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedEvent({
        ...editedEvent,
        image: file,
        image_url: URL.createObjectURL(file),
        has_image_been_changed: true,
      });
    }
  };

  const handleRemoveImage = () => {
    setEditedEvent({
      ...editedEvent,
      image: null,
      image_url: null,
      has_image_been_changed: true,
    });
  };

  const handleAddCustomField = () => {
    if (!customFieldInput.name.trim()) {
      setError("Custom field name cannot be empty");
      return;
    }

    // Don't allow duplicates
    if (editedEvent.custom_fields.some(field => field.name === customFieldInput.name.trim()) && editingFieldIndex === -1) {
      setError("This custom field name already exists");
      return;
    }

    const newField = {
      name: customFieldInput.name.trim(),
      type: customFieldInput.type,
      required: customFieldInput.required,
      ...(customFieldInput.type === FIELD_TYPES.SELECT && {
        options: customFieldInput.options.split(',').map(opt => opt.trim()).filter(Boolean)
      })
    };

    if (editingFieldIndex >= 0) {
      // Update existing field
      const updatedFields = [...editedEvent.custom_fields];
      updatedFields[editingFieldIndex] = newField;
      setEditedEvent(prev => ({
        ...prev,
        custom_fields: updatedFields
      }));
      setEditingFieldIndex(-1);
    } else {
      // Add new field
      setEditedEvent(prev => ({
        ...prev,
        custom_fields: [...prev.custom_fields, newField]
      }));
    }

    // Reset input
    setCustomFieldInput({
      name: "",
      type: FIELD_TYPES.STRING,
      required: false,
      options: ""
    });
    setError("");
  };

  const handleEditCustomField = (field, index) => {
    setCustomFieldInput({
      name: field.name,
      type: field.type || FIELD_TYPES.STRING,
      required: field.required || false,
      options: field.options ? field.options.join(',') : ''
    });
    setEditingFieldIndex(index);
  };

  const handleRemoveCustomField = (index) => {
    setEditedEvent(prev => ({
      ...prev,
      custom_fields: prev.custom_fields.filter((_, i) => i !== index)
    }));
    if (editingFieldIndex === index) {
      setEditingFieldIndex(-1);
      setCustomFieldInput({
        name: "",
        type: FIELD_TYPES.STRING,
        required: false,
        options: ""
      });
    }
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "0.75rem",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      transition: "all 0.2s",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
      },
    },
  };

  // Validate the slug
  const validateSlug = (custom_slug) => {
    if (!custom_slug) return true; // Empty slug is valid (will use default ID)
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(custom_slug);
  };

  return (
    <div className="relative">
      {/* <div className="sticky top-0 z-[100] bg-white border-b">
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Event</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update event details and manage settings
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div> */}

      <div className="p-6 space-y-6">
        {/* Image Upload Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Event Banner
              </h3>
            </div>
            {editedEvent.image_url && (
              <button
                onClick={handleRemoveImage}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {editedEvent.image_url ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-50">
              <img
                src={editedEvent.image_url}
                alt="Event banner"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-gray-50 transition-all cursor-pointer bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        {/* Basic Event Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Event Details
            </h3>
          </div>

          <TextField
            label="Event Name"
            value={editedEvent.name}
            onChange={(e) =>
              setEditedEvent({ ...editedEvent, name: e.target.value })
            }
            required
            fullWidth
            variant="outlined"
            className="bg-white/50"
            sx={textFieldStyle}
          />

          {/* Custom URL Slug */}
          <div className="space-y-2">
            <TextField
              label="Custom URL Slug (Optional)"
              value={editedEvent.custom_slug}
              onChange={(e) =>
                setEditedEvent({
                  ...editedEvent,
                  custom_slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-"),
                })
              }
              variant="outlined"
              fullWidth
              placeholder="my-awesome-event"
              className="bg-white/50"
              sx={textFieldStyle}
              error={!validateSlug(editedEvent.custom_slug)}
              helperText={
                !validateSlug(editedEvent.custom_slug)
                  ? "Slug can only contain lowercase letters, numbers, and hyphens"
                  : ""
              }
            />
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    A custom URL slug makes your event link more memorable and
                    shareable. For example, your event will be accessible at:{" "}
                    <strong>
                      /events/{editedEvent.custom_slug || "my-awesome-event"}
                    </strong>{" "}
                    instead of a random ID.
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Only use lowercase letters, numbers, and hyphens.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Event Date & Time"
                value={editedEvent.date}
                onChange={(newDate) =>
                  setEditedEvent({ ...editedEvent, date: newDate })
                }
                className="bg-white/50"
                sx={textFieldStyle}
                slotProps={{
                  textField: {
                    required: true,
                    inputProps: {
                      placeholder: "dd/mm/yyyy hh:mm am/pm",
                    },
                  },
                }}
                format="dd/MM/yyyy hh:mm a"
              />
            </LocalizationProvider>
            <TextField
              label="Venue"
              value={editedEvent.venue}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, venue: e.target.value })
              }
              required
              variant="outlined"
              className="bg-white/50"
              sx={textFieldStyle}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextField
              type="number"
              label="Days"
              value={editedEvent.duration_days}
              onChange={(e) =>
                setEditedEvent({
                  ...editedEvent,
                  duration_days: e.target.value,
                })
              }
              variant="outlined"
              className="bg-white/50"
              sx={textFieldStyle}
            />
            <TextField
              type="number"
              label="Hours"
              value={editedEvent.duration_hours}
              onChange={(e) =>
                setEditedEvent({
                  ...editedEvent,
                  duration_hours: e.target.value,
                })
              }
              variant="outlined"
              className="bg-white/50"
              sx={textFieldStyle}
            />
            <TextField
              type="number"
              label="Minutes"
              value={editedEvent.duration_minutes}
              onChange={(e) =>
                setEditedEvent({
                  ...editedEvent,
                  duration_minutes: e.target.value,
                })
              }
              variant="outlined"
              className="bg-white/50"
              sx={textFieldStyle}
            />
            <TextField
              type="number"
              label="Maximum Participants"
              value={editedEvent.max_participants}
              onChange={(e) =>
                setEditedEvent({
                  ...editedEvent,
                  max_participants: e.target.value,
                })
              }
              required
              variant="outlined"
              className="bg-white/50"
              sx={textFieldStyle}
            />
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Additional Details
            </h3>
          </div>

          <TextField
            label="Description"
            value={editedEvent.description}
            onChange={(e) =>
              setEditedEvent({ ...editedEvent, description: e.target.value })
            }
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            className="bg-white/50"
            sx={textFieldStyle}
          />

          <div className="bg-white/70 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <FeatherInfo className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Prizes</h3>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FeatherInfo className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please enter upto 3 prizes in a comma-separated format. It
                    is not necessary to mention all 3, you can write a single
                    value in-case you only have a first prize. For example:
                    "First Prize, Second Prize, Third Prize".
                  </p>
                </div>
              </div>
            </div>
            <TextField
              label="Prizes (comma-separated)"
              value={editedEvent.prizes}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, prizes: e.target.value })
              }
              variant="outlined"
              fullWidth
              placeholder="First Prize, Second Prize, Third Prize"
              className="bg-white/50"
              sx={textFieldStyle}
            />
          </div>
        </div>

        {/* Custom Fields Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              Custom Fields
            </h3>
          </div>

          {/* Info box about custom fields */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Custom fields allow you to collect specific information from
                  participants during registration.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Custom Fields List */}
            {editedEvent.custom_fields.length > 0 && (
              <div className="space-y-2">
                {editedEvent.custom_fields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-700">{field.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {field.type}
                        </span>
                        {field.required && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditCustomField(field, index)}
                        className="p-1 hover:bg-blue-100 rounded-full text-blue-600 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(index)}
                        className="p-1 hover:bg-red-100 rounded-full text-red-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Custom Field Form */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Field Name"
                  value={customFieldInput.name}
                  onChange={(e) => setCustomFieldInput(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter field name"
                  fullWidth
                  size="small"
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    value={customFieldInput.type}
                    onChange={(e) => setCustomFieldInput(prev => ({ ...prev, type: e.target.value }))}
                    label="Field Type"
                  >
                    <MenuItem value={FIELD_TYPES.STRING}>Text</MenuItem>
                    <MenuItem value={FIELD_TYPES.NUMBER}>Number</MenuItem>
                    <MenuItem value={FIELD_TYPES.BOOLEAN}>Yes/No</MenuItem>
                    <MenuItem value={FIELD_TYPES.SELECT}>Select</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {customFieldInput.type === FIELD_TYPES.SELECT && (
                <TextField
                  label="Options (comma-separated)"
                  value={customFieldInput.options}
                  onChange={(e) => setCustomFieldInput(prev => ({ ...prev, options: e.target.value }))}
                  placeholder="Option 1, Option 2, Option 3"
                  fullWidth
                  size="small"
                />
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={customFieldInput.required}
                    onChange={(e) => setCustomFieldInput(prev => ({ ...prev, required: e.target.checked }))}
                  />
                }
                label="Required field"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                           transition-colors flex items-center space-x-2"
                >
                  {editingFieldIndex >= 0 ? (
                    <>
                      <Settings className="w-4 h-4" />
                      <span>Update Field</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Field</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 mt-8 -mx-6 -mb-6 px-6 py-4 bg-white/80 backdrop-blur-sm border-t flex justify-end space-x-4 z-[100]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2.5 text-gray-700 bg-white hover:bg-gray-50 rounded-xl 
                   transition-all duration-200 font-medium shadow-sm hover:shadow-md
                   border border-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 
                    hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl
                    transform hover:-translate-y-0.5
                    transition-all duration-200 font-medium shadow-lg hover:shadow-xl 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    min-w-[120px]"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Saving...</span>
            </div>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};

export default EditEventForm;
