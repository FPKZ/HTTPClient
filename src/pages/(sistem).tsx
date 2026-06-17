import React from "react";
import { Outlet } from "react-router-dom";
import TitleBar from "@/components/TitleBar";

export default function Layout() {
  return (
    <div className="d-flex flex-column vh-100 overflow-hidden bg-[#1e1e1e]">
      <TitleBar />
      <div className="flex-1 min-h-0 w-100">
        <Outlet />
      </div>
    </div>
  );
}
