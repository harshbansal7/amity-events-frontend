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
      className="fixed bottom-4 right-4 z-[300]"
    >
      <div className={`rounded-lg shadow-xl p-4 flex items-center space-x-3 
        backdrop-blur-sm
        ${type === 'error' 
          ? 'bg-red-50/90 text-red-800 border border-red-200/50' 
          : 'bg-blue-50/90 text-blue-800 border border-blue-200/50'}`}>
        <AlertCircle className={`w-5 h-5 ${type === 'error' ? 'text-red-400' : 'text-blue-400'}`} />
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className={`p-1 rounded-full transition-colors ${
            type === 'error' 
              ? 'hover:bg-red-100/80' 
              : 'hover:bg-blue-100/80'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Toast; 