
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const getToastStyles = (type: 'success' | 'error' | 'info') => {
    const baseStyles = {
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '500',
      padding: '16px 20px',
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          background: '#10B981',
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25), 0 10px 10px -5px rgba(16, 185, 129, 0.04)',
        };
      case 'error':
        return {
          ...baseStyles,
          background: '#EF4444',
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.25), 0 10px 10px -5px rgba(239, 68, 68, 0.04)',
        };
      case 'info':
        return {
          ...baseStyles,
          background: '#3B82F6',
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.25), 0 10px 10px -5px rgba(59, 130, 246, 0.04)',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 left-0 w-full pointer-events-none z-[9999] flex justify-center">
        <div className="flex flex-col items-center space-y-2 mt-4">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto animate-in slide-in-from-top-2 duration-500"
              style={getToastStyles(toast.type)}
              onClick={() => removeToast(toast.id)}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useCustomToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useCustomToast must be used within a ToastProvider');
  }
  return context;
};
