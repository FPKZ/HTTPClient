import React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "@/lib/utils";

/**
 * ContextMenu
 * Componente genérico para menus de contexto (botão direito).
 */

export interface ContextMenuItem {
  icon?: React.ReactNode;
  label?: string;
  onClick?: (e: Event) => void;
  className?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  subMenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
}

export default function ContextMenu({ children, items }: ContextMenuProps) {
  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger asChild>
        {children}
      </ContextMenuPrimitive.Trigger>

      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content className="min-w-[180px] bg-zinc-900 border border-zinc-700! p-1 rounded-sm shadow-2xl z-50!">
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <ContextMenuPrimitive.Separator
                  key={`sep-${index}`}
                  className="h-px bg-zinc-700! m-1"
                />
              );
            }

            if (item.subMenu && item.subMenu.length > 0) {
              return (
                <ContextMenuPrimitive.Sub key={index}>
                  <ContextMenuPrimitive.SubTrigger className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 rounded transition-colors data-[state=open]:bg-zinc-800 select-none">
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                    <span className="ml-auto text-zinc-500 text-[10px]">▶</span>
                  </ContextMenuPrimitive.SubTrigger>
                  <ContextMenuPrimitive.Portal>
                    <ContextMenuPrimitive.SubContent className="min-w-[180px] bg-zinc-900 border border-zinc-700! p-1 rounded-sm shadow-2xl z-50! animate-in fade-in slide-in-from-left-1 duration-100">
                      {item.subMenu.map((sub, sIdx) => {
                        if (sub.separator) {
                          return (
                            <ContextMenuPrimitive.Separator
                              key={`sep-${sIdx}`}
                              className="h-px bg-zinc-700! m-1"
                            />
                          );
                        }
                        return (
                          <ContextMenuPrimitive.Item
                            key={sIdx}
                            disabled={sub.disabled}
                            onSelect={(e) => {
                              if (!sub.disabled && sub.onClick) {
                                sub.onClick(sub.disabled ? undefined : (e as any));
                              }
                            }}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 rounded transition-colors",
                              sub.disabled && "opacity-50",
                              sub.className
                            )}
                          >
                            {sub.icon && <span className="shrink-0">{sub.icon}</span>}
                            <span className="flex-1">{sub.label}</span>
                          </ContextMenuPrimitive.Item>
                        );
                      })}
                    </ContextMenuPrimitive.SubContent>
                  </ContextMenuPrimitive.Portal>
                </ContextMenuPrimitive.Sub>
              );
            }

            return (
              <ContextMenuPrimitive.Item
                key={index}
                disabled={item?.disabled}
                onSelect={(e) => {
                  if (!item.disabled && item.onClick) {
                    item.onClick(e);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 rounded transition-colors",
                  item?.disabled && "opacity-50",
                  item.className
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-[10px] text-zinc-500 font-semibold tracking-widest pl-4">
                    {item.shortcut}
                  </span>
                )}
              </ContextMenuPrimitive.Item>
            );
          })}
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  );
}
