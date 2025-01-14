// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import "./index.css";
import HomePage from './pages/Home/Home';
import Payment from './pages/Payment/Payment';
import { WhatsAppWidget } from 'react-whatsapp-widget';
import 'react-whatsapp-widget/dist/index.css';
import CompanyIcon from './assets/img/pee.svg?url';


const App = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  const setDimensions = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };

  useEffect(() => {
    setDimensions();
  }, [window.innerWidth]);

  return (<>

    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
    <WhatsAppWidget
      phoneNumber="233552767658"
      replyTimeText="Typically replies instantly"
      companyName="The Plutus Home"
      inputPlaceHolder="Reply"
      message="Any way I could help you?"
      
      />
  </>

  );
};

export default App;
