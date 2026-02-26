import { useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import icons from "../assets/icons";
import { ArrowRight } from "lucide-react";

/**
 * Página de login
 * @returns {JSX.Element}
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const { fullLogo } = icons();

  const handleLogin = () => {
    navigate("/");
  };

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
                  htmlFor="email"
                  className="text-[#cecece]/70 transition-colors duration-200 group-focus-within/input:text-[#ffffff]!"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="
                    rounded border border-[#313131]!
                    bg-[#181818]! hover:bg-[#121212]! focus:bg-[#121212]!
                    p-2 outline-none
                  "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1 group/input">
                <label
                  htmlFor="password"
                  className="text-[#cecece]/70 transition-colors duration-200 group-focus-within/input:text-[#ffffff]!"
                >
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  className="
                    rounded border border-[#313131]!
                    bg-[#181818]! hover:bg-[#121212]! focus:bg-[#121212]!
                    p-2 outline-none
                  "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                className="
                bg-[#ffc107]/90!
                hover:bg-[#ffc107]/60!
                focus:bg-[#ffc107]/60!
                text-zinc-900!
                border-0 px-4 py-2 rounded mt-3
              "
                onClick={handleLogin}
              >
                Entrar
              </Button>
            </div>
            <div className="flex gap-2 p-2 justify-between text-[0.7rem] text-[#cecece]/70">
              <div>
                <p className="m-0">
                  Não tem uma conta?{" "}
                  <a href="#" className="link-warning">
                    Cadastre-se
                  </a>
                </p>
              </div>
              <div>
                <p className="m-0">
                  Esqueceu sua senha?{" "}
                  <a href="#" className="link-warning">
                    Recuperar senha
                  </a>
                </p>
              </div>
            </div>
            <div className="flex justify-center pt-2 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-px bg-[#313131]!"></div>
                <p className="m-0 text-xs text-[#cecece]">ou</p>
                <div className="w-10 h-px bg-[#313131]!"></div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between px-3 gap-3 text-zinc-900! font-bold">
              {[
                { img: "google.svg", alt: "Google", size: "w-8 h-8", text: "Entrar com o Google", action: handleLogin },
                { img: "/github-brands-solid-full(1).svg", alt: "GitHub", size: "w-8 h-8", text: "Entrar com o GitHub", action: handleLogin },
              ].map((item, index) => (
                <div
                  key={index}
                  className="
                  w-full p-1.5
                  flex items-center justify-between gap-2 bg-white!
                  cursor-pointer rounded-full
                  active:opacity-100 hover:opacity-80 focus:opacity-80 transition-opacity duration-200"
                  onClick={item.action}
                >
                  <img
                    src={item.img}
                    alt={item.alt}
                    className={item.size}
                  />
                  <p className="m-0 text-sm">{item.text}</p>
                  <div className="w-8 h-8 flex items-center justify-center">
                    <ArrowRight size={16} strokeWidth={4} />
                  </div>
                </div>
              ))}
              <div
                className="
                  w-full flex items-center justify-between
                  bg-zinc-900! hover:bg-zinc-800! focus:bg-zinc-800! transition-colors duration-200
                  text-zinc-100!
                  text-sm! font-bold!
                  border-0 p-1.5 rounded-full!
                  cursor-pointer
                "
                onClick={handleLogin}
              >
                <img src="google.svg" alt="Google" className="w-8 h-8 invisible" />
                Entrar sem conta
                <div className="w-8 h-8 flex items-center justify-center">
                  <ArrowRight size={16} strokeWidth={4} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <div className="position-absolute bottom-0 end-0 px-2">
        <span
          className="text-xs text-[#cecece]"
          onClick={() => window.electronAPI?.openActionLogger()}
        >
          {import.meta.env.VITE_APP_VERSION}
        </span>
      </div>
    </div>
  );
}
