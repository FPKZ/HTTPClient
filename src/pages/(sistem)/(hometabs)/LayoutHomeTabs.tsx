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
import { useState, useEffect } from "react";
import type { DropdownMenuItem } from "@/components/DropdownMenu";
import useInterfaceStore from "@/core/store/useInterfaceStore";
import useTabStore from "@/core/store/useTabStore";

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

  const { sideBarIsOpen, activeSidebar, SidebarMenu } = sidebar;
  const { minSize } = resize;
  const { modalConfig, setModalConfig, handleModalAdd, getModalProps } = modal;

  useEffect(() => {
    // Se o aplicativo iniciar e tiver uma coleção carregada,
    // garante que a sidebar esteja aberta e exibindo as coleções
    if (collection) {
      useInterfaceStore.setState({
        sideBarIsOpen: true,
        activeSidebar: "collections",
      });
    }

    const unsubscribeMethods: (() => void)[] = [];

    if ((window as any).electronAPI) {
      const api = (window as any).electronAPI;

      // WebSocket Status Listener
      if (api.onWsStatus) {
        const unsub = api.onWsStatus((data: any) => {
          const tabStore = useTabStore.getState();
          tabStore.updateTabConnectionStatus(data.requestId, data.status);
          
          let logMsg = "";
          if (data.status === "connected") {
            logMsg = `--- Conectado com sucesso ---`;
          } else if (data.status === "connecting") {
            logMsg = `--- Conectando... ---`;
          } else if (data.status === "disconnected") {
            logMsg = `--- Desconectado ${data.error ? `(Erro: ${data.error})` : (data.reason ? `(Razão: ${data.reason})` : "")} ---`;
          }

          tabStore.appendTabLog(data.requestId, {
            status: "INFO",
            statusText: data.status,
            data: logMsg,
            isError: !!data.error,
            headers: {},
            responseTime: 0,
            responseSize: 0,
            contentType: "text/plain",
          });
        });
        unsubscribeMethods.push(unsub);
      }

      // WebSocket Message Listener
      if (api.onWsMessage) {
        const unsub = api.onWsMessage((msg: any) => {
          const tabStore = useTabStore.getState();
          tabStore.appendTabLog(msg.requestId, {
            status: msg.type === "incoming" ? "RECV" : "SEND",
            statusText: msg.type.toUpperCase(),
            data: msg.data,
            headers: {},
            responseTime: 0,
            responseSize: typeof msg.data === "string" ? msg.data.length : 0,
            contentType: "application/json",
          });
        });
        unsubscribeMethods.push(unsub);
      }

      // SSE Status Listener
      if (api.onSseStatus) {
        const unsub = api.onSseStatus((data: any) => {
          const tabStore = useTabStore.getState();
          tabStore.updateTabConnectionStatus(data.requestId, data.status);
          
          let logMsg = "";
          if (data.status === "connected") {
            logMsg = `--- Stream SSE Aberto ---`;
          } else if (data.status === "connecting") {
            logMsg = `--- Abrindo conexão SSE... ---`;
          } else if (data.status === "disconnected") {
            logMsg = `--- Stream SSE Fechado ${data.error ? `(Erro: ${data.error})` : ""} ---`;
          }

          tabStore.appendTabLog(data.requestId, {
            status: "INFO",
            statusText: data.status,
            data: logMsg,
            isError: !!data.error,
            headers: {},
            responseTime: 0,
            responseSize: 0,
            contentType: "text/plain",
          });
        });
        unsubscribeMethods.push(unsub);
      }

      // SSE Message Listener
      if (api.onSseMessage) {
        const unsub = api.onSseMessage((event: any) => {
          const tabStore = useTabStore.getState();
          tabStore.appendTabLog(event.requestId, {
            status: `SSE: ${event.event}`,
            statusText: "EVENT",
            data: event.data,
            headers: { id: event.id || "" },
            responseTime: 0,
            responseSize: event.data?.length || 0,
            contentType: "text/plain",
          });
        });
        unsubscribeMethods.push(unsub);
      }

      // HTTP Streaming Incremental (onLog)
      if (api.onLog) {
        const unsub = api.onLog((data: any) => {
          if (data && data.status === "downloading") return;

          const tabStore = useTabStore.getState();
          if (data && data.isIncremental) {
            tabStore.appendTabLog(data.requestId, data);
          }
        });
        unsubscribeMethods.push(unsub);
      }
    }

    return () => {
      unsubscribeMethods.forEach((unsub) => unsub());
    };
  }, [collection]);

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
