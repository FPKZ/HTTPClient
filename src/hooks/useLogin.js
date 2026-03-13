import { useState } from "react";
import { useNavigate } from "react-router-dom";


/**
 * Hook de Login
 */

const useLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await window.electronAPI.login(email, password);
            if (response.success) {
                setSuccess(true);
            } else {
                setError(response.error);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
            navigate("/");
        }
    };

    return {
        email,
        password,
        loading,
        error,
        success,
        handleLogin,
        setEmail,
        setPassword,
        setLoading,
        setError,
        setSuccess,
    };
};

export default useLogin;