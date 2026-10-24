import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./auth/AuthProvider";
import { ToastContainer } from 'react-toastify';

import { Home } from "./home/Home";
import { Install } from "./install/Install";
import { News } from "./news/News";
import { Competitive } from "./competitive/Competitive";
import Dashboard from "./pages/dashboard/Dashboard";
import { Layout } from "./layout/Layout";
import Login from "./pages/Login";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/install" element={<Install />} />
            <Route path="/news" element={<News />} />
            <Route path="/competitive" element={<Competitive />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
        <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          limit={5}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
