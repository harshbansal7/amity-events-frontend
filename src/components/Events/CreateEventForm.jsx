import { useState, useEffect, useRef } from "react";
import { createEvent, getCurrentUserEmail } from "../../services/api";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
} from "@mui/material";
import useRotatingMessage from "../../hooks/useRotatingMessage";
import { Plus, Minus, Settings } from "lucide-react";
import ApprovalModal from "../UI/ApprovalModal";
import { Info } from "react-feather";

// Custom field types
const FIELD_TYPES = {
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  SELECT: "select",
};

const CreateEventForm = ({ onSuccess, onCancel }) => {
  const userEmail = getCurrentUserEmail();
  const [formData, setFormData] = useState({
    name: "",
    custom_slug: "",
    date: new Date(),
    duration_days: 0,
    duration_hours: 0,
    duration_minutes: 0,
    max_participants: "",
    venue: "",
    description: "",
    prizes: "",
    allow_external: false,
    use_existing_code: false,
    existing_event_code: "",
    image: null,
    custom_fields: [],
  });

  // New state for custom field editing
  const [customFieldInput, setCustomFieldInput] = useState({
    name: "",
    type: FIELD_TYPES.STRING,
    required: false,
    options: "", // For select type, comma-separated options
  });

  // Edit mode for existing fields
  const [editingFieldIndex, setEditingFieldIndex] = useState(-1);

  const [touched, setTouched] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  // New state for approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const maxParticipantsRef = useRef(null);
  const durationDaysRef = useRef(null);
  const durationHoursRef = useRef(null);
  const durationMinutesRef = useRef(null);

  const rotatingMessage = useRotatingMessage("createEvent");

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
    };

    const inputElements = [
      maxParticipantsRef.current,
      durationDaysRef.current,
      durationHoursRef.current,
      durationMinutesRef.current,
    ];
    inputElements.forEach((inputElement) => {
      if (inputElement) {
        inputElement.addEventListener("wheel", handleWheel, { passive: false });
      }
    });

    return () => {
      inputElements.forEach((inputElement) => {
        if (inputElement) {
          inputElement.removeEventListener("wheel", handleWheel);
        }
      });
    };
  }, []);

  const validateForm = () => {
    const errors = {};

    // Required field validations
    if (!formData.name?.trim()) {
      errors.name = "Event name is required";
    }

    if (!formData.venue?.trim()) {
      errors.venue = "Venue is required";
    }

    if (!formData.max_participants) {
      errors.max_participants = "Maximum participants is required";
    } else if (parseInt(formData.max_participants) <= 0) {
      errors.max_participants = "Maximum participants must be greater than 0";
    }

    // Date validation
    const selectedDate = new Date(formData.date);
    const now = new Date();
    if (selectedDate < now) {
      errors.date = "Event date cannot be in the past";
    }

    // Duration validation
    const totalDuration =
      (parseInt(formData.duration_days) || 0) * 24 * 60 +
      (parseInt(formData.duration_hours) || 0) * 60 +
      (parseInt(formData.duration_minutes) || 0);
    if (totalDuration <= 0) {
      errors.duration = "Event must have a duration";
    }

    // Event code validation for external events
    if (
      formData.allow_external &&
      formData.use_existing_code &&
      !formData.existing_event_code
    ) {
      errors.existing_event_code =
        "Event code is required when using existing code";
    }

    // Validate slug
    if (formData.custom_slug?.trim()) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(formData.custom_slug)) {
        errors.custom_slug =
          "Slug can only contain lowercase letters, numbers, and hyphens";
      }
    }

    // Custom fields validation
    const duplicateFields = formData.custom_fields.filter(
      (field, index) => formData.custom_fields.indexOf(field) !== index,
    );
    if (duplicateFields.length > 0) {
      errors.custom_fields = "Duplicate custom fields are not allowed";
    }

    return errors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validateForm();
    setValidationErrors(errors);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set the actual file for form submission
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
    setImagePreview(null);
    // Reset the file input
    const fileInput = document.getElementById("image-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      // Create FormData object for multipart/form-data submission
      const formDataToSend = new FormData();

      // Add all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (key === "image" && formData[key]) {
          formDataToSend.append("image", formData[key]);
        } else if (key === "custom_fields") {
          // Stringify the enhanced custom fields array
          formDataToSend.append("custom_fields", JSON.stringify(formData[key]));
        } else if (key === "date") {
          formDataToSend.append("date", formData[key].toISOString());
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Make API call with FormData
      const response = await createEvent(formDataToSend);

      // Debug logs to check the response
      // console.log("Event creation response:", response);
      // console.log("Approval status:", response.approval_status);

      // Store the response to use after modal is closed
      const eventResponse = response;

      // Check if the event is pending approval
      if (response.approval_status === "pending") {
        // console.log("Setting show approval modal to true");
        setShowApprovalModal(true);
        // Don't call onSuccess yet, it will be called after the modal is closed
      } else {
        // If not pending approval, call onSuccess immediately
        if (onSuccess) {
          onSuccess(eventResponse);
        }
      }
    } catch (err) {
      console.error("Error creating event:", err);
      // Display specific field errors if they exist in the response
      if (err.response?.data?.fieldErrors) {
        const fieldErrors = err.response.data.fieldErrors;
        const errorMessages = Object.keys(fieldErrors)
          .map((field) => `${field}: ${fieldErrors[field]}`)
          .join(", ");
        setError(`Validation errors: ${errorMessages}`);
      } else {
        setError(err.response?.data?.message || "Failed to create event");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses =
      "mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200";
    const validClasses =
      "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500";
    const errorClasses =
      "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50";

    return `${baseClasses} ${
      touched[fieldName] && validationErrors[fieldName]
        ? errorClasses
        : validClasses
    }`;
  };

  // Add these theme overrides if needed
  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: "#6366f1", // indigo-500
      },
      "&.Mui-focused fieldset": {
        borderColor: "#4f46e5", // indigo-600
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#4f46e5", // indigo-600
    },
  };

  const handleAddCustomField = () => {
    if (!customFieldInput.name.trim()) {
      setError("Custom field name cannot be empty");
      return;
    }

    // Don't allow duplicates
    if (
      formData.custom_fields.some(
        (field) => field.name === customFieldInput.name.trim(),
      )
    ) {
      setError("This custom field name already exists");
      return;
    }

    const newField = {
      name: customFieldInput.name.trim(),
      type: customFieldInput.type,
      required: customFieldInput.required,
      ...(customFieldInput.type === FIELD_TYPES.SELECT && {
        options: customFieldInput.options
          .split(",")
          .map((opt) => opt.trim())
          .filter(Boolean),
      }),
    };

    if (editingFieldIndex >= 0) {
      // Update existing field
      const updatedFields = [...formData.custom_fields];
      updatedFields[editingFieldIndex] = newField;
      setFormData((prev) => ({
        ...prev,
        custom_fields: updatedFields,
      }));
      setEditingFieldIndex(-1);
    } else {
      // Add new field
      setFormData((prev) => ({
        ...prev,
        custom_fields: [...prev.custom_fields, newField],
      }));
    }

    // Reset input
    setCustomFieldInput({
      name: "",
      type: FIELD_TYPES.STRING,
      required: false,
      options: "",
    });
    setError("");
  };

  const handleEditCustomField = (field, index) => {
    setCustomFieldInput({
      name: field.name,
      type: field.type || FIELD_TYPES.STRING,
      required: field.required || false,
      options: field.options ? field.options.join(",") : "",
    });
    setEditingFieldIndex(index);
  };

  const handleRemoveCustomField = (index) => {
    setFormData((prev) => ({
      ...prev,
      custom_fields: prev.custom_fields.filter((_, i) => i !== index),
    }));
    if (editingFieldIndex === index) {
      setEditingFieldIndex(-1);
      setCustomFieldInput({
        name: "",
        type: FIELD_TYPES.STRING,
        required: false,
        options: "",
      });
    }
  };

  // Store the response from the API call
  const [createdEventResponse, setCreatedEventResponse] = useState(null);

  const handleApprovalModalClose = () => {
    // console.log("Modal close handler called");
    setShowApprovalModal(false);

    // Now call onSuccess after modal is closed
    if (onSuccess && createdEventResponse) {
      onSuccess(createdEventResponse);
    }

    // If there's no onSuccess or we want to always close the form
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="p-8 border-b bg-white/50 backdrop-blur-sm rounded-t-2xl relative">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Create Event
          </h2>
        </div>
        <p className="mt-2 text-gray-600">
          Fill in the details to create a new event
        </p>
      </div>

      {/* Form Content */}
      <div className="p-8 overflow-y-auto relative">
        <p className="text-gray-400/60 text-sm italic text-center mb-4">
          {rotatingMessage}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Image Section */}
            <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Event Image
                </h3>
              </div>

              {/* Image Upload */}
              <div className="space-y-2 bg-white/70 p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <label className="block text-sm font-medium text-gray-700">
                  Event Image
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-lg transition-all duration-200"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() =>
                      document.getElementById("image-upload").click()
                    }
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer 
                      hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors duration-200"
                  >
                    <PhotoCamera className="mx-auto h-12 w-12 text-gray-400" />
                    <span className="mt-2 block text-sm text-gray-600">
                      Click to upload event image
                    </span>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Basic Details Section */}
            <div className="bg-white/70 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Basic Details
                </h3>
              </div>

              <TextField
                label="Event Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                onBlur={() => handleBlur("name")}
                required
                variant="outlined"
                fullWidth
                className={getInputClassName("name")}
                sx={{
                  ...textFieldStyle,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    },
                  },
                }}
                error={touched.name && !!validationErrors.name}
                helperText={touched.name && validationErrors.name}
              />

              {/* Custom URL Slug */}
              <div className="space-y-2">
                <TextField
                  label="Custom URL Slug (Optional)"
                  value={formData.custom_slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      custom_slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  onBlur={() => handleBlur("custom_slug")}
                  variant="outlined"
                  fullWidth
                  placeholder="my-awesome-event"
                  className="bg-white/50"
                  sx={textFieldStyle}
                  error={touched.custom_slug && !!validationErrors.custom_slug}
                  helperText={
                    touched.custom_slug && validationErrors.custom_slug
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
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        A custom URL slug makes your event link more memorable
                        and shareable. For example, your event will be
                        accessible at:{" "}
                        <strong>
                          /events/{formData.custom_slug || "my-awesome-event"}
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

              {/* Date and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-r from-indigo-50/30 to-blue-50/30 p-4 rounded-xl">
                <TextField
                  label="Date"
                  type="datetime-local"
                  value={new Date(
                    formData.date.getTime() -
                      formData.date.getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .slice(0, 16)}
                  onChange={(e) =>
                    setFormData({ ...formData, date: new Date(e.target.value) })
                  }
                  onBlur={() => handleBlur("date")}
                  required
                  variant="outlined"
                  className="bg-white/50 rounded-xl shadow-sm"
                  sx={textFieldStyle}
                  error={touched.date && !!validationErrors.date}
                  helperText={touched.date && validationErrors.date}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TextField
                    type="number"
                    label="Days"
                    inputRef={durationDaysRef}
                    value={formData.duration_days}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_days: e.target.value,
                      })
                    }
                    required
                    slotProps={{ htmlInput: { min: 0 } }}
                    variant="outlined"
                    fullWidth
                    sx={textFieldStyle}
                  />
                  <TextField
                    type="number"
                    label="Hours"
                    inputRef={durationHoursRef}
                    value={formData.duration_hours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_hours: e.target.value,
                      })
                    }
                    required
                    slotProps={{ htmlInput: { min: 0, max: 23 } }}
                    variant="outlined"
                    fullWidth
                    sx={textFieldStyle}
                  />
                  <TextField
                    type="number"
                    label="Minutes"
                    inputRef={durationMinutesRef}
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_minutes: e.target.value,
                      })
                    }
                    required
                    slotProps={{ htmlInput: { min: 0, max: 59 } }}
                    variant="outlined"
                    fullWidth
                    sx={textFieldStyle}
                  />
                </div>
              </div>

              {/* Venue and Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="Venue"
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                  onBlur={() => handleBlur("venue")}
                  required
                  variant="outlined"
                  fullWidth
                  sx={textFieldStyle}
                  error={touched.venue && !!validationErrors.venue}
                  helperText={touched.venue && validationErrors.venue}
                />

                <TextField
                  type="number"
                  label="Maximum Participants"
                  inputRef={maxParticipantsRef}
                  value={formData.max_participants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_participants: e.target.value,
                    })
                  }
                  onBlur={() => handleBlur("max_participants")}
                  required
                  slotProps={{ htmlInput: { min: 0, max: 100000 } }}
                  variant="outlined"
                  fullWidth
                  sx={textFieldStyle}
                  error={
                    touched.max_participants &&
                    !!validationErrors.max_participants
                  }
                  helperText={
                    touched.max_participants &&
                    validationErrors.max_participants
                  }
                />
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="bg-white/70 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Additional Details
                </h3>
              </div>

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                onBlur={() => handleBlur("description")}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                className="bg-white/50"
                sx={textFieldStyle}
                error={touched.description && !!validationErrors.description}
                helperText={touched.description && validationErrors.description}
              />
            </div>

            {/* Prizes Section */}
            <div className="bg-white/70 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Prizes</h3>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-yellow-400" />
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
                value={formData.prizes}
                onChange={(e) =>
                  setFormData({ ...formData, prizes: e.target.value })
                }
                onBlur={() => handleBlur("prizes")}
                variant="outlined"
                fullWidth
                placeholder="First Prize, Second Prize, Third Prize"
                className="bg-white/50"
                sx={textFieldStyle}
                error={touched.prizes && !!validationErrors.prizes}
                helperText={touched.prizes && validationErrors.prizes}
              />
            </div>

            {/* External Event Options Section */}
            <div className="bg-white/70 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  External Registration
                </h3>
              </div>

              {/* External Event Option */}
              <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-xl border border-indigo-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <input
                  type="checkbox"
                  id="allow_external"
                  checked={formData.allow_external}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allow_external: e.target.checked,
                    })
                  }
                  onBlur={() => handleBlur("allow_external")}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div>
                  <label
                    htmlFor="allow_external"
                    className="font-medium text-gray-700 block"
                  >
                    Allow External Participants
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Enable this to allow non-Amity participants to register
                  </p>
                </div>
              </div>

              {formData.allow_external && (
                <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 rounded-xl border border-blue-100/50 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="use_existing_code"
                      checked={formData.use_existing_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          use_existing_code: e.target.checked,
                        })
                      }
                      onBlur={() => handleBlur("use_existing_code")}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="use_existing_code"
                      className="font-medium text-gray-700"
                    >
                      Use Existing Event Code
                    </label>
                  </div>

                  {formData.use_existing_code ? (
                    <div>
                      <label
                        htmlFor="existing_event_code"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Enter Existing Event Code
                      </label>
                      <input
                        type="text"
                        id="existing_event_code"
                        value={formData.existing_event_code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            existing_event_code: e.target.value.toUpperCase(),
                          })
                        }
                        onBlur={() => handleBlur("existing_event_code")}
                        className={getInputClassName("existing_event_code")}
                        placeholder="Enter event code"
                        maxLength={6}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-blue-800">
                      A new event code will be generated automatically
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Custom Fields Section */}
            <div className="bg-white/70 rounded-xl p-6 shadow-sm space-y-4">
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
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 100-2 1 1 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Custom fields allow you to collect specific information
                      from participants during registration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Custom Fields List */}
                {formData.custom_fields.length > 0 && (
                  <div className="space-y-2">
                    {formData.custom_fields.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-700">
                            {field.name}
                          </span>
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
                      onChange={(e) =>
                        setCustomFieldInput((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter field name"
                      fullWidth
                      size="small"
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Field Type</InputLabel>
                      <Select
                        value={customFieldInput.type}
                        onChange={(e) =>
                          setCustomFieldInput((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
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
                      onChange={(e) =>
                        setCustomFieldInput((prev) => ({
                          ...prev,
                          options: e.target.value,
                        }))
                      }
                      placeholder="Option 1, Option 2, Option 3"
                      fullWidth
                      size="small"
                    />
                  )}

                  <FormControlLabel
                    control={
                      <Switch
                        checked={customFieldInput.required}
                        onChange={(e) =>
                          setCustomFieldInput((prev) => ({
                            ...prev,
                            required: e.target.checked,
                          }))
                        }
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
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 text-red-700">
              <h4 className="font-bold text-lg flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.625-1.516 2.625H3.72c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 11-2 0 1 1 11-2 0zm-1-8a1 1 00-1 1v3a1 1 002 0V6a1 1 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Disclaimer
              </h4>
              <div className="space-y-2 mt-2">
                <p className="flex items-center text-sm">
                  <span className="mr-2">⚠️</span>
                  Think before you type—inappropriate content here could land
                  you in hot water.
                </p>
                <p className="flex items-center text-sm">
                  <span className="mr-2">✅</span>
                  Honesty is the best policy—false info will only cause trouble
                  (for you).
                </p>
                <p className="flex items-center text-sm">
                  <span className="mr-2">🚫</span>
                  Scamming? Not on our watch. Any misuse of this form is a
                  strict no-go.
                </p>
                <p className="flex items-center text-sm">
                  <span className="mr-2">⭐</span>
                  Quality matters. Low-effort entries may disappear without a
                  trace.
                </p>
                <p className="flex items-center text-sm">
                  <span className="mr-2">📝</span>
                  Do not add Google Form links or any other external links in
                  the description.
                </p>
              </div>

              {/* Fun section */}
              {/* <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 flex items-center">
                
                Just so you know!
                </h4>
                <p className="mt-2 text-blue-700">
                  Each event created will be reviewed within 24 hours. If the event is approved, you will receive an email notification.
                </p>
              </div> */}

              {/* Signed by section */}
              <div className="mt-4 pt-3 border-t border-red-200 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <span className="font-medium">
                  By submitting, you accept these terms
                </span>
                <div className="mt-2 sm:mt-0 text-right">
                  <span className="text-sm text-red-600">Signed By:</span>
                  <div className="font-semibold">{userEmail}</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-4 p-6 border-t bg-white/50 backdrop-blur-sm rounded-b-2xl relative">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="px-6 py-2.5 text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 
            hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl
            transform hover:-translate-y-0.5
            transition-all duration-200 font-medium shadow-lg hover:shadow-xl 
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Creating...</span>
            </>
          ) : (
            "Create Event"
          )}
        </button>
      </div>

      {/* Approval Modal debugging */}
      {/* {console.log("Rendering component, showApprovalModal =", showApprovalModal)} */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={handleApprovalModalClose}
        eventName={formData.name}
      />
    </div>
  );
};

export default CreateEventForm;
