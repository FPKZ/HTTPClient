import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useUserStore from "@/core/store/useUserStore";
import type { User } from "../../../types/entities/user";

const GUEST_ROUTES = ["/login", "/register", "/forgot-password"];
const POST_LOGIN_ROUTE = "/home";
const POST_LOGOUT_ROUTE = "/login";

/**
 * useAuthGuard
 *
 * Orquestra dois comportamentos:
 *
 * 1. SYNC — Escuta o evento IPC `auth:success` emitido pelo Main após
 *    qualquer fluxo de autenticação (OAuth, deep link) e atualiza o Zustand.
 *
 * 2. GUARD — Observa mudanças no estado de autenticação e redireciona:
 *    - Usuário LOGADO tentando acessar rota de convidado → POST_LOGIN_ROUTE
 *    - Usuário DESLOGADO (estava logado) → POST_LOGOUT_ROUTE
 *
 * O sistema é acessível sem conta. A guarda NÃO bloqueia rotas para
 * usuários anônimos — apenas reage a transições de estado.
 */
export const useAuthGuard = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  // Ref para detectar transição de logado → deslogado (logout)
  const prevUserRef = useRef<User | null>(user);

  // 1. SYNC: recebe usuário autenticado via IPC (fluxo OAuth / deep link)
  useEffect(() => {
    const removeListener = window.electronAPI.ipcRenderer.on(
      "auth:success",
      (userData: User) => {
        setUser(userData);
        console.log(userData)
      }
    );
    return () => removeListener();
  }, [setUser]);

  // 2. GUARD: redireciona ao logar em rota de convidado
  useEffect(() => {
    if (user && GUEST_ROUTES.includes(location.pathname)) {
      navigate(POST_LOGIN_ROUTE, { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // 3. GUARD: redireciona ao deslogar
  useEffect(() => {
    if (prevUserRef.current && !user) {
      navigate(POST_LOGOUT_ROUTE, { replace: true });
    }
    prevUserRef.current = user;
  }, [user, navigate]);
};
