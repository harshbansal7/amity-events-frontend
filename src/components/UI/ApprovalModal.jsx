import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react';

const ApprovalModal = ({ isOpen, onClose, eventName }) => {
  // Add debug logs
//   console.log("ApprovalModal rendered with isOpen:", isOpen, "eventName:", eventName);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose} // Close when clicking the backdrop
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-scaleIn"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the modal itself
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close modal"
        >
          <XCircle className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Event Pending Approval</h3>
        </div>

        {/* Content */}
        <div className="space-y-4 text-gray-600">
          <p>
            Your event <span className="font-semibold text-gray-800">{eventName}</span> has been submitted and is pending approval.
          </p>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="font-medium text-amber-800">
              All new events require administrator approval before they become visible to other users.
            </p>
          </div>
          <p>
            The approval process typically takes <span className="font-semibold">up to 24 hours</span>. You'll receive an email notification once your event has been approved.
          </p>
          <p className="text-sm">
            If your event hasn't been approved within 24 hours, please contact <a href="mailto:harshbansal.contact@gmail.com" className="text-blue-600 hover:underline">harshbansal.contact@gmail.com</a> for assistance.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;