import { createContext, useEffect, useState } from "react";

const ContextVariables = createContext({});

export const ContextVariablesProvider = ({ children }) => {
  const domain = import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
  const apiKey = import.meta.env.VITE_API_KEY || process.env.REACT_APP_API_KEY;
  const cediRate = parseFloat(import.meta.env.VITE_CEDI_RATE) || parseFloat(process.env.REACT_APP_CEDI_RATE);
  const merchantId = import.meta.env.VITE_MERCHANT_ID || process.env.REACT_APP_MERCHANT_ID;
  const [toggleMode, setToggleMode] = useState(false);
  const [allCoins, setAllCoins] = useState([]);
 

  return (
    <ContextVariables.Provider
      value={{
        domain,
        apiKey,
        cediRate,
        merchantId,
        toggleMode,
        setToggleMode,
        allCoins,
        setAllCoins,
      }}
    >
      {children}
    </ContextVariables.Provider>
  );
};

export default ContextVariables;
