import React, { createContext, useState } from 'react';

export const NotificationContext = createContext({
  hasNew: false,
  setHasNew: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [hasNew, setHasNew] = useState(false);

  return (
    <NotificationContext.Provider value={{ hasNew, setHasNew }}>
      {children}
    </NotificationContext.Provider>
  );
};
