// App.js
import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import "./index.css";
import HomePage from './pages/Home/Home';
import { WhatsAppWidget } from 'react-whatsapp-widget';
import 'react-whatsapp-widget/dist/index.css';


const App = () => {
  const [setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
