import { Routes, Route } from "react-router-dom";
import UpdatePage from "./pages/UpdatePage";
import ResizableDemo from "./pages/ResizableDemo";
import Layout from "./pages/layout";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import Home from "./pages/Home";

export default function Rotes() {
  return (
    <Routes>
      {/* Rotas COM Layout (TitleBar) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/demo" element={<ResizableDemo />} />
      </Route>

      {/* Rotas SEM Layout */}
      <Route path="/update" element={<UpdatePage />} />
      <Route path="/action-logger" element={<ResizableDemo />} />
    </Routes>
  );
}
