import { createContext, useState } from "react";
import PropTypes from 'prop-types';

const ContextVariables = createContext({});

export const ContextVariablesProvider = ({ children }) => {
  const domain = import.meta.env.VITE_BACKEND_URL;
  const apiKey = import.meta.env.VITE_API_KEY;
  const cediRate = parseFloat(import.meta.env.VITE_CEDI_RATE);
  const merchantId = import.meta.env.VITE_MERCHANT_ID;
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

ContextVariablesProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ContextVariables;
