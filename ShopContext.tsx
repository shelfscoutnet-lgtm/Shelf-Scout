import React, { createContext, useContext, useState } from 'react';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Initialize missing properties
the cartItemCount = 0;
  const [primaryStore, setPrimaryStore] = useState();
  const [userCoords, setUserCoords] = useState(null);
  const [priceAlerts, setPriceAlerts] = useState([]);

  // Helper functions
  const updateCartItemQuantity = (id, quantity) => {
    // Implement function to update cart item quantity
  };

  const removeFromCart = (id) => {
    // Implement function to remove item from cart
  };

  const addPriceAlert = (alert) => {
    // Implement function to add price alert
  };

  const removePriceAlert = (alertId) => {
    // Implement function to remove price alert
  };

  return (
    <ShopContext.Provider 
      value={{
        cartItemCount,
        primaryStore,
        updateCartItemQuantity,
        removeFromCart,
        priceAlerts,
        addPriceAlert,
        removePriceAlert,
        userCoords,
        setPrimaryStore,
        setUserCoords,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);