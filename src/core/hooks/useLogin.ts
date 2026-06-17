import { useState, useEffect } from "react";
import useUserStore from "@/core/store/useUserStore";
import { useForm } from "@/core/hooks/useForm";

/**
 * useLogin
 *
 * Responsabilidade única: orquestrar o fluxo de autenticação.
 * - NÃO gerencia redirecionamento (responsabilidade do useAuthGuard).
 * - Estado de `loading` é controlado pelo backend via evento IPC `auth:loading`.
 * - Em caso de falha total do IPC (catch), o loading é resetado localmente como fallback.
 */
const useLogin = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const setUser = useUserStore((state) => state.setUser);

  const {
    formValue,
    setFormValue,
    erros,
    setErros,
    validated,
    setValidated,
    handleChange,
    validate,
    resetForm,
  } = useForm(
    { email: "", password: "" },
    {
      validators: {
        email: (value: string) =>
          !value.includes("@") ? "E-mail inválido" : null,
        password: (value: string) =>
          value.length < 6 ? "A senha deve ter no mínimo 6 caracteres" : null,
      },
    }
  );

  /**
   * Login por e-mail/senha.
   * Loading é gerenciado pelo backend via auth:loading.
   * Redirecionamento pós-login é responsabilidade do useAuthGuard.
   */
  const handleLogin = async () => {
    try {
      if (!validate()) return;

      // Loading controlado pelo backend (auth:loading IPC).
      // Não chamamos setLoading(true) aqui para evitar duplicidade.
      const response = await window.electronAPI.login(
        formValue.email,
        formValue.password
      );

      if (response.success && response.user) {
        setUser(response.user); // useAuthGuard detecta a mudança e redireciona
        setSuccess(true);
      } else {
        setErros({ geral: response.error || "Erro ao realizar login" });
      }
    } catch (err: any) {
      setErros({ geral: err.message || "Erro inesperado" });
      // Fallback: se o IPC falhar antes de emitir auth:loading=false
      setLoading(false);
    }
  };

  /**
   * Login social (Google / GitHub).
   * O fluxo é assíncrono: o usuário autentica no browser e o Main
   * envia `auth:success` via IPC quando concluído.
   * useAuthGuard escuta esse evento e cuida do redirecionamento.
   */
  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      setError(null);
      // Loading controlado pelo backend (auth:loading IPC).
      const result = await window.electronAPI.socialLogin(provider);

      if (result.error) {
        setError(result.error);
        setLoading(false); // Fallback se backend não enviou auth:loading=false
      }
      // Sucesso: aguarda auth:success IPC → useAuthGuard → setUser → redirect
    } catch (err: any) {
      setError(err.message || "Erro de conexão");
      setLoading(false); // Fallback
    }
  };

  /**
   * Cancela o processo de autenticação social em andamento.
   */
  const handleCancelAuth = async () => {
    try {
      await window.electronAPI.cancelAuth();
    } catch (err: any) {
      console.error("Erro ao cancelar autenticação:", err);
    }
  };

  // Sincroniza o estado de loading com o evento IPC do backend
  useEffect(() => {
    const removeLoader = window.electronAPI.ipcRenderer.on(
      "auth:loading",
      (state: boolean) => {
        setLoading(state);
      }
    );
    // Recebe erros de autenticação emitidos pelo backend (timeout, cancelamento, falha OAuth)
    const removeError = window.electronAPI.ipcRenderer.on(
      "auth:error",
      (message: string) => {
        setError(message);
        setLoading(false);
      }
    );
    return () => {
      removeLoader();
      removeError();
    };
  }, []);

  return {
    formValue,
    setFormValue,
    erros,
    setErros,
    validated,
    setValidated,
    handleChange,
    validate,
    resetForm,
    loading,
    error,
    success,
    handleLogin,
    handleSocialLogin,
    handleCancelAuth,
    setLoading,
    setError,
    setSuccess,
  };
};

export default useLogin;
