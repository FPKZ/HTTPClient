import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import icon from '../../assets/icon1.png';

const TitleBar = () => {
  const handleMinimize = () => window.electronAPI.minimize();
  const handleMaximize = () => window.electronAPI.maximize();
  const handleClose = () => window.electronAPI.close();

  return (
    <div className="titlebar titlebar-drag-region d-flex justify-content-between align-items-center" style={{ backgroundColor: '#1e1e1e', height: '35px', color: 'white' }}>
      <div className="titlebar-left d-flex align-items-center gap-2 ms-2">
        <img src={icon} alt="Icon" style={{ width: '20px', height: '20px' }} /> 
        <span className="fw-bold">HTTPClient</span>
      </div>

      <div className="window-controls d-flex no-drag h-100">
        <button onClick={handleMinimize} className="btn-control h-100">
          —
        </button>
        <button onClick={handleMaximize} className="btn-control h-100">
          ⬜
        </button>
        <button onClick={handleClose} className="btn-control hover-red h-100">
          ✕
        </button>
      </div>
      <style>{`
        .titlebar {
          -webkit-app-region: drag;
          user-select: none;
        }
        .no-drag {
          -webkit-app-region: no-drag;
        }
        .btn-control {
          background: transparent;
          border: none;
          color: white;
          width: 36px;
          height: 28px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
        .btn-control:hover {
          background: rgba(255,255,255,0.1);
        }
        .hover-red:hover {
          background: #e81123 !important;
        }
      `}</style>
    </div>
  );
};

export default TitleBar;
