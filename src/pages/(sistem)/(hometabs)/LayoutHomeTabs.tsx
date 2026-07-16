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
import useLayoutListeners from "@/core/hooks/useLayoutListeners";
import NovoItemModal from "@/components/modals/NovoItemModal";
import { useState } from "react";
import type { DropdownMenuItem } from "@/components/DropdownMenu";

const SIDEBAR_MAP = {
  user: <UserSiderBar />,
  collections: <Sidebar />,
  workspaces: <Workspace.Sidebar />,
} as const;

/**
 * SidebarMenuDropdown
 * Controla abertura via onClick para evitar que o Radix abra
 * no pointerdown e dispare imediatamente o primeiro item.
 */
function SidebarMenuDropdown({ items }: { items: DropdownMenuItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown.Root open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger asChild>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          data-state={open ? "open" : "closed"}
          className="py-1 hover:bg-bg-hover group data-[state=open]:bg-bg-hover rounded cursor-pointer transition-colors duration-200"
        >
          <EllipsisVertical size={16} className="text-text-secondary" />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          // onOpenAutoFocus={(e) => e.preventDefault()}
          sideOffset={10}
          side="bottom"
          align="start"
          className="min-w-55 bg-bg-panel border border-border-base shadow-md p-1 rounded-sm z-60! text-text-primary"
        >
          {items.map((item: any, index) => {
            if (item.subMenu && item.subMenu.length > 0) {
              return (
                <Dropdown.Sub key={index}>
                  <Dropdown.SubTrigger className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-text-secondary outline-none cursor-pointer hover:bg-bg-hover hover:text-text-primary rounded select-none">
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                    <span className="ml-auto text-[10px]">▶</span>
                  </Dropdown.SubTrigger>
                  <Dropdown.Portal>
                    <Dropdown.SubContent className="min-w-[170px] bg-bg-panel border border-border-base shadow-md p-1 rounded-sm z-60! text-text-primary">
                      {item.subMenu.map((sub: any, sIdx: number) => {
                        if (sub.separator) {
                          return <div key={`sep-${sIdx}`} className="h-px bg-border-base my-1" />;
                        }
                        return (
                          <Dropdown.Item
                            key={sIdx}
                            disabled={sub.disabled}
                            onSelect={() => {
                              if (!sub.disabled && sub.onClick) {
                                sub.onClick();
                              }
                            }}
                            className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-text-secondary outline-none cursor-pointer hover:bg-bg-hover hover:text-text-primary rounded ${sub.disabled ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            {sub.icon && <span className="shrink-0">{sub.icon}</span>}
                            <span className="flex-1">{sub.label}</span>
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.SubContent>
                  </Dropdown.Portal>
                </Dropdown.Sub>
              );
            }
            return (
              <MenuItem
                key={index}
                index={index}
                item={item}
              />
            );
          })}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

export default function LayoutHomeTabs() {
  const { sidebar, collection, resize, modal, Buttons } = useSideBar();

  // Executa os listeners IPC e efeitos colaterais de subscrição
  useLayoutListeners(collection);

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
              minSize={"200px" as any}
              collapsible={true}
              className="flex flex-col h-full overflow-hidden border-r border-border-base bg-bg-panel @container"
            >
              <div className="flex justify-between bg-bg-panel border-b border-border-base py-1.5 px-3 shrink-0">
                <div className="flex w-full items-center text-sm font-bold text-text-secondary uppercase">
                  {activeSidebar}
                </div>
                {SidebarMenu.length > 0 && (
                  <SidebarMenuDropdown items={SidebarMenu} />
                )}

              </div>
              {activeSidebar ? SIDEBAR_MAP[activeSidebar] ?? null : null}
            </Panel>
          )}
          {/* <Separator /> */}
          <Panel minSize={"50%" as any}>
            <div className="@container w-full h-full">
              {/* <Collections /> */}
              <Outlet />
            </div>
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
