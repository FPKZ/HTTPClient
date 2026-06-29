import React from "react";
import { Outlet } from "react-router-dom";
import TitleBar from "@/components/TitleBar";
import NovaCollectionModal from "@/components/modals/NovaCollectionModal";

export default function LayoutSistem() {
  return (
    <div className="flex flex-col h-screen overflow-hidden text-text-primary">
      <TitleBar />
      <div className="flex-1 min-h-0 w-full bg-linear-to-t from-bg-bg-app via-bg-app to-brand/10">
        <Outlet />
      </div>
      <NovaCollectionModal />
    </div>
  );
}
