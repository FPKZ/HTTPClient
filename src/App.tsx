import React from "react";
import Rotes from "./Rotes";

// Components
import Dialog from "./components/Dialog";
import GlobalContextMenu from "./components/GlobalContextMenu";
import usePreload from "./services/usePreload";

function App() {
  usePreload();
  
  return (
    <div className="d-flex flex-column h-screen">
      <GlobalContextMenu>
        <Dialog />
        <Rotes />
      </GlobalContextMenu>
    </div>
  );
}

export default App;
