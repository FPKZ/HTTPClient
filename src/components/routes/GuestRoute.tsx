import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "@/core/store/useUserStore";

/**
 * GuestRoute
 * Wrapper para rotas exclusivas de visitantes (login, register, forgot-password).
 * Se o usuário já estiver autenticado, redireciona para /uploadPage.
 * Caso contrário, renderiza a rota normalmente.
 */
export default function GuestRoute() {
  const user = useUserStore((state) => state.user);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
