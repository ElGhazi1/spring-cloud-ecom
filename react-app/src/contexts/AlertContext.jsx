import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const addAlert = useCallback((type, title, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const newAlert = { id, type, title, message };

    setAlerts(prev => [...prev, newAlert]);

    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }

    return id;
  }, [removeAlert]);

  const success = useCallback((title, message, duration) => {
    return addAlert('success', title, message, duration);
  }, [addAlert]);

  const error = useCallback((title, message, duration) => {
    return addAlert('error', title, message, duration);
  }, [addAlert]);

  const warning = useCallback((title, message, duration) => {
    return addAlert('warning', title, message, duration);
  }, [addAlert]);

  const info = useCallback((title, message, duration) => {
    return addAlert('info', title, message, duration);
  }, [addAlert]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getVariant = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <AlertContext.Provider value={{ success, error, warning, info, removeAlert }}>
      {children}

      {/* Alert Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className="animate-in slide-in-from-right-full duration-300"
          >
            <Alert
              variant={getVariant(alert.type)}
              onClose={() => removeAlert(alert.id)}
            >
              {getIcon(alert.type)}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

