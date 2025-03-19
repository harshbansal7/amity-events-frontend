import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Toast = ({ message, type = "error", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 right-4 z-[300]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <div
          className={`rounded-xl shadow-xl p-4 flex items-center space-x-3 
          backdrop-blur-sm max-w-md
          ${
            type === "error"
              ? "bg-red-50/90 text-red-800 border border-red-200/50"
              : type === "success"
                ? "bg-green-50/90 text-green-800 border border-green-200/50"
                : "bg-blue-50/90 text-blue-800 border border-blue-200/50"
          }`}
        >
          {type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          )}

          <p className="text-sm font-medium flex-1">{message}</p>

          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${
              type === "error"
                ? "hover:bg-red-100/80"
                : type === "success"
                  ? "hover:bg-green-100/80"
                  : "hover:bg-blue-100/80"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export default Toast;
