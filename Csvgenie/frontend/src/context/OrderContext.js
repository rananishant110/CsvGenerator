import React, { createContext, useContext, useReducer } from 'react';

const OrderContext = createContext();

const initialState = {
  isProcessing: false,
  results: null,
  error: null,
  catalogStats: null,
  uploadProgress: 0
};

const orderReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload, error: null };
    case 'SET_RESULTS':
      return { ...state, results: action.payload, isProcessing: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isProcessing: false };
    case 'SET_CATALOG_STATS':
      return { ...state, catalogStats: action.payload };
    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const value = {
    ...state,
    dispatch
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
