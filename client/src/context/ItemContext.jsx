import React, { createContext, useContext, useState } from 'react';

const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'

  return (
    <ItemContext.Provider value={{ dbStatus, setDbStatus }}>
      {children}
    </ItemContext.Provider>
  );
};

export const useItemContext = () => useContext(ItemContext);
