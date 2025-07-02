
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

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info', duration = 3000) => {
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

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 left-0 w-full pointer-events-none z-[9999] flex justify-center">
        <div className="flex flex-col items-center space-y-2 mt-4">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`
                pointer-events-auto px-6 py-3 rounded-lg shadow-lg text-white font-medium
                animate-in slide-in-from-top-2 duration-300
                ${toast.type === 'success' ? 'bg-green-500' : 
                  toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
              `}
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
