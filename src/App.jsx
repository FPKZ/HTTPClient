import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import Home from "./pages/Home";
import UpdatePage from "./pages/UpdatePage";
import Layout from "./pages/layout";

// Components
import Dialog from "./components/Dialog";
import useDialogStore from "./store/useDialogStore";
import GlobalContextMenu from "./components/GlobalContextMenu";

function App() {
  const navigate = useNavigate();
  const showDialog = useDialogStore((state) => state.showDialog);

  useEffect(() => {
    // Listener para navegação
    const removeNavListener = window.electronAPI.ipcRenderer.on(
      "navigate-to",
      (path) => {
        navigate(path);
      },
    );

    // Listener para diálogos globais vindos do backend
    const removeDialogListener = window.electronAPI.ipcRenderer.on(
      "show-dialog",
      async (params) => {
        console.log("[App] Recebido evento show-dialog:", params);
        // params: { title, description, options: [{ label, value, variant }] }
        const result = await showDialog(params);
        console.log("[App] Dialog resolvido com resultado:", result);

        // Envia a resposta de volta para o backend se necessário
        if (params.id) {
          window.electronAPI.ipcRenderer.send(
            `dialog-response-${params.id}`,
            result,
          );
        }
      },
    );

    return () => {
      if (removeNavListener) removeNavListener();
      if (removeDialogListener) removeDialogListener();
    };
  }, [navigate, showDialog]);

  return (
    <div className="d-flex flex-column h-screen">
      <GlobalContextMenu>
        <Dialog />
        <Routes>
          <Route
            path="/upload"
            element={
              <Layout>
                <UploadPage />
              </Layout>
            }
          />
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route path="/update" element={<UpdatePage />} />
        </Routes>
      </GlobalContextMenu>
    </div>
  );
}

export default App;
