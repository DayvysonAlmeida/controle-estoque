// src/contexts/NotificationProvider.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import Notification from '../components/Notification/Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ message, severity });

    // A notificação desaparece automaticamente após 6 segundos
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  }, []);
  
  const handleClose = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Notification 
          message={notification.message}
          severity={notification.severity}
          onClose={handleClose}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);