import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/useUserStore";
import { useForm } from "../useForm";

/**
 * Hook de Registro
 */

const useRegister = () => {
    const [loading, setLoading] = useState(false);
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
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    },{
        transformers: {
            name: (value: string) => value.trim(),
        },
        validators: {
            name: (value: string) => value.length < 3 ? "O nome deve ter no mínimo 3 letras" : null,
            email: (value: string) => !value.includes("@") ? "E-mail inválido" : null,
            password: (value: string) => value.length < 6 ? "A senha deve ter no mínimo 6 caracteres" : null,
            confirmPassword: (value: string) => value !== formValue.password ? "As senhas não coincidem" : null,
        },
    });

    const handleRegister = async () => {
        try {
            if (!validate()) {
                return;
            }
            setLoading(true);
            console.log(formValue);
            const response = await window.electronAPI.register({email: formValue.email, password: formValue.password, name: formValue.name});
            console.log(response);
            if (response.success) {
                setUser(response.user);
                setSuccess(true);
                // navigate("/home");
            } else {
                setErros({ geral: response.error || "Erro ao realizar registro" });
            }
        } catch (err: any) {
            setErros({ geral: err.message || "Erro inesperado" });
        } finally {
            // setLoading(false);
        }
    };

    return {
        formValue,
        setFormValue,
        setErros,
        validated,
        setValidated,
        handleChange,
        validate,
        resetForm,
        loading,
        erros,
        success,
        handleRegister,
    };
};

export default useRegister;
