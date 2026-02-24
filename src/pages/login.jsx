import React, { useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useTabStore from "../store/useTabStore";

// Components
import DropZone from "../components/DropZone";
import HistoryList from "../components/history/HistoryList";
import ImportCollectionModal from "../components/modals/ImportCollectionModal";
import NovaCollectionModal from "../components/modals/NovaCollectionModal";
import icons from "../assets/icons";

// Hooks
import { useQuickExit } from "../hooks/useQuickExit";
import { useHistory } from "../hooks/useHistory";

/**
 * Página de login
 * @returns {JSX.Element}
 */
export default function loginPage() {

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
            <div className="flex justify-center mb-4" onClick={() => navigate(-1)}>
              {fullLogo()}
            </div>
            <div className="flex flex-col gap-2 border border-[#313131]! bg-[#1b1b1b]! shadow-sm p-10 rounded-lg">
              <div className="flex flex-col gap-1">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" className="rounded border border-[#313131]! bg-[#181818]! p-2 outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password">Senha</label>
                <input type="password" id="password" className="rounded border border-[#313131]! bg-[#181818]! p-2 outline-none" />
              </div>

              <Button className="bg-[#ffc107]/90! text-zinc-900! border-0 px-4 py-2 rounded" onClick={() => navigate("/")}>
                Entrar
              </Button>
            </div>
            {/* <div className="flex flex-col items-center justify-center">
              <p>Não tem uma conta? <a href="#">Cadastre-se</a></p>
              <p>Esqueceu sua senha? <a href="#">Recuperar senha</a></p>
            </div> */}
            <div className="flex justify-center">
              <p>ou</p>
            </div>
            <div className="flex justify-center">
              <Button className="bg-white! text-zinc-900! font-semibold! border-0 px-4 py-2 rounded-lg!" onClick={() => navigate("/")}>
                <div className="flex items-center gap-2">
                  <img src="google-favicon.ico" alt="" />
                  Entrar com Google
                </div>
              </Button>
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