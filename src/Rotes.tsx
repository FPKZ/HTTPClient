import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import useTabStore from "./store/useTabStore";
import { useAuthGuard } from "./hooks/useAuthGuard";

// Rotas
import UpdatePage from "./pages/UpdatePage";
import ResizableDemo from "./pages/ResizableDemo";
import Layout from "./pages/layout";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import UploadPage from "./pages/UploadPage";
import RegisterPage from "./pages/RegisterPage";
import RecuperarSenha from "./pages/RecuperarSenha";

// Guards
import GuestRoute from "./components/routes/GuestRoute";

export default function Rotes() {
  const location = useLocation();
  const resetCollection = useTabStore((state) => state.resetCollection);

  // Orquestra redirecionamentos de auth e sincronização IPC → Zustand
  useAuthGuard();

  useEffect(() => {
    // A coleção só deve existir na memória enquanto estivermos na página Home.
    if (location.pathname !== "/home") {
      resetCollection();
    }
  }, [location.pathname, resetCollection]);

  return (
    <Routes>
      {/* Rotas de visitante: redireciona para /uploadPage se já logado */}
      <Route element={<Layout />}>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<RecuperarSenha />} />
        </Route>

        {/* Rotas COM Layout (TitleBar) — acessíveis com ou sem conta */}
        <Route path="/home" element={<Home />} />
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
