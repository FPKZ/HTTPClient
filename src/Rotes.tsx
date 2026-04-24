import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import useTabStore from "./store/useTabStore";
import UpdatePage from "./pages/UpdatePage";
import ResizableDemo from "./pages/ResizableDemo";
import Layout from "./pages/layout";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import UploadPage from "./pages/UploadPage";

export default function Rotes() {
  const location = useLocation();
  const resetCollection = useTabStore((state) => state.resetCollection);

  useEffect(() => {
    // A coleção só deve existir na memória enquanto estivermos na página Home.
    if (location.pathname !== "/home") {
      resetCollection();
    }
  }, [location.pathname, resetCollection]);

  return (
    <Routes>
      {/* Rotas COM Layout (TitleBar) */}
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        {/* UploadPage como rota padrão e /uploadPage */}
        <Route path="/" element={<UploadPage />} />
        <Route path="/uploadPage" element={<UploadPage />} />
        <Route path="/demo" element={<ResizableDemo />} />
      </Route>

      {/* Rotas SEM Layout */}
      <Route path="/update" element={<UpdatePage />} />
      <Route path="/action-logger" element={<ResizableDemo />} />
    </Routes>
  );
}
