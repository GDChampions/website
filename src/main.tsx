import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";

import { Home } from "./home/Home";
import { Install } from "./install/Install";
import { News } from "./news/News";
import { Competitive } from "./competitive/Competitive";
import Dashboard from "./pages/dashboard/Dashboard";
import { Layout } from "./layout/Layout";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/install" element={<Install />} />
          <Route path="/news" element={<News />} />
          <Route path="/competitive" element={<Competitive />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>,
);
