// App.js
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import "./index.css";
import HomePage from './pages/Home/Home';
import { WhatsAppWidget } from 'react-whatsapp-widget';
import 'react-whatsapp-widget/dist/index.css';
import { ContextVariablesProvider } from './context/ContextVariables';


const App = () => {
  // const [setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      // setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (<>
    <ContextVariablesProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
    <WhatsAppWidget
      phoneNumber="233552767658"
      replyTimeText="Typically replies instantly"
      companyName="King Plutus"
      inputPlaceHolder="Reply"
      message="What's up my gee?"
      
      />
      </ContextVariablesProvider>
  </>

  );
};

export default App;
