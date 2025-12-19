import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import Home from './pages/Home';
import TitleBar from './components/TitleBar';
import { useEffect } from 'react';

function App() {

  const navigate = useNavigate();

  useEffect(() => {
    navigate('/upload');
  }, []);

  return (
    <div className="d-flex flex-column vh-100">
      <TitleBar />
      <Routes>
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/" element={<Home />} />

        {/* <Route path="/" element={<Navigate to="/upload" replace />} /> */}
      </Routes>
    </div>
  );
}

export default App;
