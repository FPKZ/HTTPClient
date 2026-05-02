import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore";

/**
 * Hook de Registro
 */

const useRegister = () => {
    const [name, setName] = useState("")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await window.electronAPI.register(email, password, name);
      
      if (response.success) {
        setUser(response.user);
        setSuccess(true);
        navigate("/home");
      } else {
        setError(response.error || "Erro ao realizar registro");
      }
    } catch (err: any) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    password,
    confirmPassword,
    loading,
    error,
    success,
    handleRegister,
    setEmail,
    setPassword,
    setConfirmPassword,
    setError,
  };
};

export default useRegister;
