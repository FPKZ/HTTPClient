import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import Home from './pages/Home';
import UpdatePage from './pages/UpdatePage';
import Layout from './pages/layout';
import { useEffect } from 'react';

function App() {

  const navigate = useNavigate();

  useEffect(() => {
    const removeListener = window.electronAPI.ipcRenderer.on('navigate-to', (path) => {
      navigate(path);
    });
    return () => {
      if (removeListener) removeListener();
    };
  }, [navigate]);

  return (
    <div className="d-flex flex-column h-screen">
      <Routes>
        <Route path="/upload" element={<Layout><UploadPage /></Layout>} />
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/update" element={<UpdatePage />} />
        {/* <Route path="/" element={<Navigate to="/upload" replace />} /> */}
      </Routes>
    </div>
  );
}

export default App;
