import { Outlet } from "react-router-dom";
import { Group as PanelGroup, Panel } from "react-resizable-panels";

// UI Components
import { EllipsisVertical } from "lucide-react";
import Footer from "@/pages/(sistem)/(hometabs)/components/Footer";
import Sidebar from "@/pages/(sistem)/(hometabs)/home/components/layout/Sidebar";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { MenuItem } from "@/components/DropdownMenu";

// Sidebars Components
import UserSiderBar from "@/pages/(sistem)/(hometabs)/components/UserSidebar";
import SideBarButtons from "@/pages/(sistem)/(hometabs)/components/SidebarButtons";
import Workspace from "@/pages/(sistem)/(hometabs)/workspaces";

//hooks
import useSideBar from "@/core/hooks/useSideBar";
import NovoItemModal from "@/components/modals/NovoItemModal";

const SIDEBAR_MAP = {
  user: <UserSiderBar />,
  collections: <Sidebar />,
  workspaces: <Workspace.Sidebar />,
} as const;

export default function LayoutHomeTabs() {
  const { sidebar, collection, resize, modal, Buttons } = useSideBar();

  const { sideBarIsOpen, activeSidebar, SidebarMenu } = sidebar;
  const { minSize } = resize;
  const { modalConfig, setModalConfig, handleModalAdd, getModalProps } = modal;

  return (
    <div className="h-full flex flex-col">
      <div className="flex w-full h-full overflow-hidden">
        <SideBarButtons />
        <PanelGroup orientation="horizontal" >
          {sideBarIsOpen && (
            <Panel
              defaultSize={"20%" as any}
              maxSize={"80%" as any}
              minSize={"15%" as any}
              collapsible={true}
              className="flex flex-col h-full overflow-hidden border-r border-border-base bg-bg-panel"
            >
              <div className="flex justify-between bg-bg-panel border-b border-border-base py-1.5 px-3 shrink-0">
                <div className="flex w-full items-center text-sm font-bold text-text-secondary uppercase">
                  {activeSidebar}
                </div>
                {SidebarMenu.length > 0 && (
                  <Dropdown.Root>
                    <Dropdown.Trigger asChild>
                      <div className="py-1 hover:bg-bg-hover group data-[state=open]:bg-bg-hover rounded cursor-pointer transition-colors duration-200">
                        <EllipsisVertical size={16} className="text-text-secondary" />
                      </div>
                    </Dropdown.Trigger>
                    <Dropdown.Content
                      sideOffset={10}
                      side="bottom"
                      align="start"
                      className="min-w-55 bg-bg-panel border border-border-base shadow-md p-1 rounded-sm z-60! text-text-primary"
                    >
                    {SidebarMenu?.map((item, index) => (
                        <MenuItem
                          key={index}
                          index={index}
                          item={item}
                        />
                      ))}
                    </Dropdown.Content>
                  </Dropdown.Root>
                )}
              </div>
              {activeSidebar ? SIDEBAR_MAP[activeSidebar] ?? null : null}
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
      <NovoItemModal
        {...getModalProps()}
        open={modalConfig.open}
        onOpenChange={(open: boolean) => setModalConfig({ ...modalConfig, open })}
        onAdd={handleModalAdd}
      />
    </div>
  );
}
