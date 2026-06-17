import React from "react";
import { Container, Button } from "react-bootstrap";
import icons from "@/assets/icons";
import { ArrowRight } from "lucide-react";
import useRegister from "@/core/hooks/useRegister";
import { useNavigate } from "react-router-dom";
import PasswordField from "@/pages/(auth)/components/PasswordField";

/**
 * Página de cadastro
 * @returns {JSX.Element}
 */
export default function RegisterPage() {
    const { 
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
    } = useRegister();

    const navigate = useNavigate();
    const { fullLogo } = icons();

    return (
        <div className="d-flex flex-col h-100 position-relative overflow-hidden">
            <Container
                fluid
                className="d-flex flex-col p-3 h-full mb-4"
                style={{ overflow: "hidden", maxWidth: "27rem" }}
            >
                <div className="my-auto w-full flex flex-col min-h-0 max-h-full">
                <div className="flex shrink-0 flex-col justify-center gap-2 text-sm">
                    <div className="flex justify-center mb-4">{fullLogo()}</div>
                    <div className="flex flex-col gap-2 border border-[#313131]! bg-[#1b1b1b]! shadow-sm p-10 rounded-lg">
                    <div className="flex flex-col gap-1 group/input">
                        <label
                        htmlFor="name"
                        className="text-[#cecece]/70 transition-colors duration-200 group-focus-within/input:text-[#ffffff]!"
                        >
                        Nome
                        </label>
                        <input
                        type="text"
                        id="name"
                        placeholder="João..."
                        className="
                            rounded border border-[#313131]!
                            bg-[#181818]! hover:bg-[#121212]! focus:bg-[#121212]!
                            p-2 outline-none
                        "
                        value={formValue.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1 group/input">
                        <label
                        htmlFor="email"
                        className="text-[#cecece]/70 transition-colors duration-200 group-focus-within/input:text-[#ffffff]!"
                        >
                        Email
                        </label>
                        <input
                        type="email"
                        id="email"
                        placeholder="exemple@gmail.com"
                        className="
                            rounded border border-[#313131]!
                            bg-[#181818]! hover:bg-[#121212]! focus:bg-[#121212]!
                            p-2 outline-none
                        "
                        value={formValue.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        />
                    </div>
                    <PasswordField
                        label="Senha"
                        name="password"
                        value={formValue.password || ""}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder="Senha"
                        required
                        // isInvalid={validated && !!erros.senha}
                        // error={erros.senha}
                    />
                    <PasswordField
                        label="Confirmar senha"
                        name="confirmPassword"
                        value={formValue.confirmPassword || ""}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        placeholder="Confirmar senha"
                        required
                        // isInvalid={validated && !!erros.senha}
                        // error={erros.senha}
                    />

                    <Button
                        className="
                        bg-[#ffc107]/90!
                        hover:bg-[#ffc107]/60!
                        focus:bg-[#ffc107]/60!
                        text-zinc-900!
                        border-0 px-4 py-2 rounded mt-3
                    "
                        onClick={handleRegister}
                    >
                        Registrar
                    </Button>

                    {/* {erros && <p className="text-red-500">{erros}</p>} */}
                    {success && <p className="text-green-500">Login realizado com sucesso!</p>}
                    </div>
                    <div className="flex gap-2 p-2 justify-center text-[0.7rem] text-[#cecece]/70">
                    <div>
                        <p className="m-0">
                        Já possui uma conta?{" "}
                        <a onClick={() => navigate("/login")} className="link-warning cursor-pointer">
                            Faça login
                        </a>
                        </p>
                    </div>
                    </div>
                </div>
                </div>
            </Container>

            <div className="position-absolute bottom-0 end-0 px-2">
                <span
                className="text-xs text-[#cecece] cursor-pointer"
                onClick={() => (window as any).electronAPI?.openActionLogger()}
                >
                {(import.meta as any).env.VITE_APP_VERSION}
                </span>
            </div>
            </div>
    );
}