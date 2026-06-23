import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Group as PanelGroup, Panel } from "react-resizable-panels";

// UI Components
import Footer from "@/pages/(sistem)/(hometabs)/components/Footer";
import Sidebar from "@/pages/(sistem)/(hometabs)/home/components/layout/Sidebar";

// Sidebars Components
import UserSiderBar from "@/pages/(sistem)/(hometabs)/components/UserSidebar";
import SideBarButtons from "@/pages/(sistem)/(hometabs)/components/SidebarButtons";


// Stores
import useTabStore from "@/core/store/useTabStore";
import useInterfaceStore from "@/core/store/useInterfaceStore";

export default function LayoutHomeTabs() {
  const sideBarIsOpen = useInterfaceStore((state) => state.sideBarIsOpen);
  const setSidebarIsOpenExplicit = useInterfaceStore((state) => state.setSidebarIsOpenExplicit)

  const [sidebar, setSidebar] = useState<string>()

  const collection = useTabStore((state) => state.collection.id);

  const [width, setWidth] = useState(window.innerWidth);

  const minSize: string = collection
    ? "10%"
    : width <= 800
      ? "40%"
      : width <= 1200
        ? "30%"
        : width <= 1600
          ? "20%"
          : "20%";

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  type sidebars = "user"| "collection" | "" | null

  const handleSetSideBar = (side: sidebars) => {
    if(side === null) return setSidebar("")
    if(side === sidebar) {
      setSidebarIsOpenExplicit(false)
      setSidebar("")
    }
    if(!sideBarIsOpen) setSidebarIsOpenExplicit(true)
    setSidebar(side)
  }

  const SideBarComponent = () => {
    switch(sidebar){
      case "user":
        return <UserSiderBar />
      case "collection":
        return <Sidebar />
      case "":
        return <Sidebar />
      default:
        return <Sidebar />
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex w-full h-full">
        <SideBarButtons handleSetSideBar={handleSetSideBar} />
        <PanelGroup orientation="horizontal" disabled={!collection}>
          {sideBarIsOpen && (
            <Panel
              defaultSize={"20%" as any}
              maxSize={"80%" as any}
              minSize={minSize}
              collapsible={true}
            >
              <SideBarComponent />
            </Panel>
          )}
          {/* <Separator /> */}
          <Panel minSize={"50%" as any}>
            {/* <Collections /> */}
            <Outlet />
          </Panel>
        </PanelGroup>
      </div>
      <Footer />
    </div>
  );
}
