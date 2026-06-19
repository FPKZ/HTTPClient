import React from "react";
import { Outlet } from "react-router-dom";
import TitleBar from "@/components/TitleBar";

export default function Layout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#1e1e1e]">
      <TitleBar />
      <div className="flex-1 min-h-0 w-full">
        <Outlet />
      </div>
    </div>
  );
}
