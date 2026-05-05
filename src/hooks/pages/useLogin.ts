import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/useUserStore";
import { useForm } from "../useForm";

/**
 * Hook de Login
 */

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
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
    } = useForm({
        email: "",
        password: "",
    },{
        validators: {
            email: (value: string) => !value.includes("@") ? "E-mail inválido" : null,
            password: (value: string) => value.length < 6 ? "A senha deve ter no mínimo 6 caracteres" : null,
        },
    });

  const handleLogin = async () => {
    try {
      if (!validate()) {
        return;
      }
      setLoading(true);
      const response = await window.electronAPI.login(formValue.email, formValue.password);
      
      if (response.success) {
        setUser(response.user); // Salva o usuário no Zustand
        setSuccess(true);
        navigate("/uploadPage");
      } else {
        setErros({ geral: response.error || "Erro ao realizar login" });
      }
    } catch (err: any) {
      setErros({ geral: err.message || "Erro inesperado" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.socialLogin(provider);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.user) {
        setUser(result.user);
        setSuccess(true);
        navigate("/uploadPage");
      }
      // Se não houver user agora, não é erro. 
      // O app vai esperar o deep link que será capturado pelo usePreload.
    } catch (err: any) {
      setError(err.message || "Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

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
    setLoading,
    setError,
    setSuccess,
  };
};

export default useLogin;
