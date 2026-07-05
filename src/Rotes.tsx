import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import useCollectionStore from "@/core/store/useCollectionStore";
import { useAuthGuard } from "@/core/hooks/useAuthGuard";

// Rotas
import UpdatePage from "@/pages/update";
import ResizableDemo from "@/pages/(sistem)/(protected)/demo";
import LoginPage from "@/pages/(auth)/login";
import Home from "@/pages/(sistem)/(hometabs)/home";
import RegisterPage from "@/pages/(auth)/cadastro";
import RecuperarSenha from "@/pages/(auth)/recuperar-senha";
import Perfil from "@/pages/(sistem)/(protected)/perfil";
import Workspaces from "@/pages/(sistem)/(hometabs)/workspaces";

//Layouts
import LayoutSistem from "@/pages/LayoutSistem";
import LayoutHomeTabs from "@/pages/(sistem)/(hometabs)/LayoutHomeTabs";

// Guards
import GuestRoute from "@/components/routes/GuestRoute";
import UserRedrect from "@/components/routes/UserRedrect";

export default function Rotes() {
  const location = useLocation();
  const resetCollection = useCollectionStore((state) => state.resetCollection);

  // Orquestra redirecionamentos de auth e sincronização IPC → Zustand
  useAuthGuard();
  const paths = ["/home", "/demo", "/perfil"];
  useEffect(() => {
    // A coleção só deve existir na memória enquanto estivermos na página Home.
    if (!paths.includes(location.pathname)) {
      // resetCollection();
    }
  }, [location.pathname, resetCollection]);

  return (
    <Routes>
      {/* Rotas de visitante: redireciona para /uploadPage se já logado */}
      <Route element={<LayoutSistem />}>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<RecuperarSenha />} />
        </Route>

        {/* Rotas COM Layout (TitleBar) — acessíveis com ou sem conta */}
        <Route element={<LayoutHomeTabs />}>
          <Route path="/home" element={<Home />} />
        </Route>

        <Route element={<UserRedrect />}>
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/workspaces" element={<Workspaces.Page />} />
          <Route path="/workspace/:id" element={<Workspaces.Edit />} />
        </Route>
      </Route>

      {/* Rotas SEM Layout */}
      <Route path="/update" element={<UpdatePage />} />
      <Route path="/action-logger" element={<ResizableDemo />} />
    </Routes>
  );
}
