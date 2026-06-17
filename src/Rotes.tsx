import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import useTabStore from "@/core/store/useTabStore";
import { useAuthGuard } from "@/core/hooks/useAuthGuard";

// Rotas
import UpdatePage from "@/pages/update";
import ResizableDemo from "@/pages/(sistem)/(protected)/demo";
import Layout from "@/pages/(sistem)";
import LoginPage from "@/pages/(auth)/login";
import Home from "@/pages/(sistem)/(protected)/home";
import UploadPage from "@/pages/(sistem)/(public)/upload";
import RegisterPage from "@/pages/(auth)/cadastro";
import RecuperarSenha from "@/pages/(auth)/recuperar-senha";
import Perfil from "@/pages/(sistem)/(protected)/perfil";

// Guards
import GuestRoute from "@/components/routes/GuestRoute";
import UserRedrect from "@/components/routes/UserRedrect";

export default function Rotes() {
  const location = useLocation();
  const resetCollection = useTabStore((state) => state.resetCollection);

  // Orquestra redirecionamentos de auth e sincronização IPC → Zustand
  useAuthGuard();
  const paths = ['/home', '/demo', '/perfil'];
  useEffect(() => {
    // A coleção só deve existir na memória enquanto estivermos na página Home.
    if (!paths.includes(location.pathname)) {
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
        <Route element={<UserRedrect />} >
          <Route path="/perfil" element={<Perfil />} />
        </Route>

      </Route>

      {/* Rotas SEM Layout */}
      <Route path="/update" element={<UpdatePage />} />
      <Route path="/action-logger" element={<ResizableDemo />} />
    </Routes>
  );
}
