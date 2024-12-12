import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return createPortal(
    <div 
      className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 flex items-center space-x-2 z-[300]"
    >
      <div className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 
        ${type === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
        <AlertCircle className={`w-5 h-5 ${type === 'error' ? 'text-red-400' : 'text-blue-400'}`} />
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-red-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Toast; 