import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import { AuthProvider } from "./auth/AuthProvider";
import { ToastContainer } from 'react-toastify';

import { Home } from "./home/Home";
import { Install } from "./install/Install";
import { News } from "./news/News";
import { Competitive } from "./competitive/Competitive";
import Dashboard from "./pages/dashboard/Dashboard";
import { Layout } from "./layout/Layout";
import Login from "./pages/Login";
import Whitelist from "./pages/dashboard/pages/Whitelist";
import BuildIDs from "./pages/dashboard/pages/BuildIDs";
import Users from "./pages/dashboard/pages/Users";
import Seasons from "./pages/dashboard/pages/Seasons";

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
            <Route path="/dashboard" element={<Dashboard />}>
                <Route
                    index
                    element={<Navigate to="whitelist" replace />}
                />
                <Route path="whitelist" element={<Whitelist />} />
                <Route path="build" element={<BuildIDs />} />
                <Route path="users" element={<Users />} />
                <Route path="seasons" element={<Seasons />} />
            </Route>
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
