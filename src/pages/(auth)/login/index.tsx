import React from "react";
import Icons from "@/assets/Icons";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useLogin from "@/core/hooks/useLogin";
import ButtonAuth from "@/pages/(auth)/components/ButtonAuth";

/**
 * Página de login
 * @returns {JSX.Element}
 */
export default function LoginPage() {
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
    loading,
    error,
    success,
    handleLogin,
    handleSocialLogin,
    handleCancelAuth,
    setLoading,
    setError,
    setSuccess,
  } = useLogin();

  const navigate = useNavigate();
  const { fullLogo } = Icons();

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Overlay de Loading para OAuth */}
      {loading && (
        <div className="absolute w-full h-full bg-[#000000]/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            {/* Ícone de Raio animado */}
            <div className="relative">
              <div className="w-20 h-20 bg-[#1E1E1E] rounded-2xl flex items-center justify-center shadow-2xl border border-gray-700 animate-pulse">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 60 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M40 10L15 45H35L25 70L55 30H35L40 10Z"
                    fill="#FFC107"
                  />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-[#FFC107]/20 blur-lg rounded-2xl -z-10 animate-pulse"></div>
            </div>

            <div className="text-center flex flex-col gap-2">
              <h2 className="text-[#FFC107] font-bold text-xl tracking-tight">
                Sincronizando conta...
              </h2>
              <p className="text-[#cecece]/70 text-sm max-w-[18rem]">
                Conclua a autenticação no seu navegador para continuar.
              </p>
            </div>

            <button
              onClick={handleCancelAuth}
              className="
                mt-4 px-6 py-2 rounded-full
                bg-[#313131] hover:bg-[#414141] text-white
                text-sm font-semibold transition-all duration-200
                border border-[#414141] hover:border-[#515151]
                shadow-lg active:scale-95
              "
            >
              Cancelar Login
            </button>
          </div>
        </div>
      )}

      <div
        className="flex flex-col p-3 h-full mb-4 mx-auto w-full"
        style={{ overflow: "hidden", maxWidth: "27rem" }}
      >
        <div className="my-auto w-full flex flex-col min-h-0 max-h-full">
          <div className="flex shrink-0 flex-col justify-center gap-2 text-sm">
            <div className="flex justify-center mb-4">{fullLogo()}</div>
            <div className="flex flex-col gap-2 border border-[#313131] bg-[#1b1b1b] shadow-sm p-10 rounded-lg">
              <div className="flex flex-col gap-1 group/input">
                <label
                  htmlFor="email"
                  className="text-[#cecece]/70 transition-colors duration-200 group-focus-within/input:text-[#ffffff]"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="
                    rounded border border-[#313131]
                    bg-[#181818] hover:bg-[#121212] focus:bg-[#121212]
                    p-2 outline-none
                  "
                  value={formValue.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1 group/input">
                <label
                  htmlFor="password"
                  className="text-[#cecece]/70 transition-colors duration-200 group-focus-within/input:text-[#ffffff]"
                >
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  className="
                    rounded border border-[#313131]
                    bg-[#181818] hover:bg-[#121212] focus:bg-[#121212]
                    p-2 outline-none
                  "
                  value={formValue.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
              </div>

              <button
                className={`
                bg-[#ffc107]/90
                hover:bg-[#ffc107]/60
                focus:bg-[#ffc107]/60
                text-zinc-900
                font-semibold
                border-0 px-4 py-2 rounded mt-3
                cursor-pointer transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                onClick={handleLogin}
                disabled={loading}
              >
                Entrar
              </button>

              {erros?.geral && (
                <p className="text-red-500 text-sm m-0">{erros.geral}</p>
              )}
              {error && <p className="text-red-500 text-sm m-0">{error}</p>}
              {success && (
                <p className="text-green-500 text-sm m-0">
                  Login realizado com sucesso!
                </p>
              )}
            </div>
            <div className="flex gap-2 p-2 justify-between text-[0.7rem] text-[#cecece]/70">
              <div>
                <p className="m-0">
                  Não tem uma conta?{" "}
                  <a
                    onClick={() => navigate("/register")}
                    className="text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    Cadastre-se
                  </a>
                </p>
              </div>
              <div>
                <p className="m-0">
                  Esqueceu sua senha?{" "}
                  <a className="text-amber-400 hover:text-amber-300 cursor-pointer">
                    Recuperar senha
                  </a>
                </p>
              </div>
            </div>
            <div className="flex justify-center pt-2 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-px bg-[#313131]"></div>
                <p className="m-0 text-xs text-[#cecece]">ou</p>
                <div className="w-10 h-px bg-[#313131]"></div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between px-3 gap-3 text-zinc-900 font-bold">
              {[
                {
                  img: "google.svg",
                  alt: "Google",
                  size: "w-8 h-8",
                  text: "Entrar com o Google",
                  action: () => handleSocialLogin("google"),
                },
                {
                  img: "/github-brands-solid-full(1).svg",
                  alt: "GitHub",
                  size: "w-8 h-8",
                  text: "Entrar com o GitHub",
                  action: () => handleSocialLogin("github"),
                },
                {
                  text: "Entrar sem conta",
                  action: () => navigate("/home"),
                },
              ].map((item, index) => (
                <ButtonAuth.Root
                  key={index}
                  bg={item.alt ? "white" : "default"}
                  color={item.alt ? "white" : "default"}
                  hover={item.alt ? "whiteActive" : "defaultActive"}
                  className="justify-between"
                  onClick={item.action}
                >
                  <ButtonAuth.Icon
                    img={item.img}
                    alt={item.alt}
                    invisible={item.img ? false : true}
                  />
                  <ButtonAuth.Content>{item.text}</ButtonAuth.Content>
                </ButtonAuth.Root>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 px-2">
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
