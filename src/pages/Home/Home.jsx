import React from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Payment from "../Payment/Payment";
import ImageArea from "../../components/ImageArea";
import Form from "../../components/Form";

const HomePage = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="flex min-h-screen flex-col items-center justify-center w-full max-w-7xl text-white">
            <div className="flex md:flex-row flex-col w-full">
              <ImageArea />
              <Form />
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
