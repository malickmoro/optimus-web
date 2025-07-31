import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Payment from "../Payment/Payment";
import Form from "../../components/Form";

const HomePage = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="flex min-h-screen w-full justify-center bg-slate-900 pt-8">
            <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto items-start justify-center gap-8 px-2 sm:px-4">
              {/* Uncomment below to show ImageArea on large screens */}
              {/* <div className="hidden md:block w-full md:w-1/2 flex items-center justify-center"><ImageArea /></div> */}
              <div className="w-full md:w-1/2 flex items-center justify-center">
                <Form />
              </div>
            </div>
          </main>
        }
      />
      <Route
        path="/payment/*"
        element={
          <AnimatePresence>
            <Payment />
          </AnimatePresence>
        }
      />
    </Routes>
  );
};

export default HomePage;
