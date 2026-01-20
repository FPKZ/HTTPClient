import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "../lib/utils";

/**
 * DropdownMenuComponent
 * Componente genérico para menus suspenso.
 * Recebe conteúdo do botão e itens do menu.
 * @param {React.ReactNode} buttonContent - Conteúdo do botão.
 * @param {Array<{
 *  icon?: React.ReactNode;
 *  label: string;
 *  onClick: () => void;
 *  className?: string;
 *  shortcut?: string;
 *  disabled?: boolean;
 *  separator?: boolean;
 * }>} items - Itens do menu.
 */

export default function DropdownMenuComponent({ buttonContent, items }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center justify-center p-1.5 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer outline-none">
          {buttonContent}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-zinc-900 border border-zinc-700! p-1 rounded-sm shadow-2xl z-50!"
          sideOffset={5}
          align="end"
        >
          {items.map((item, index) => {
            return item.separator ? (
              <DropdownMenu.Separator
                key={`sep-${index}`}
                className="h-px bg-zinc-700! m-1"
              />
            ) : (
              <DropdownMenu.Item
                key={index}
                disabled={item?.disabled}
                onClick={item.onClick}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs! font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 rounded transition-colors",
                  item?.disabled && "opacity-50 cursor-not-allowed",
                  item.className,
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-[10px] text-zinc-500 font-semibold tracking-widest pl-4">
                    {item.shortcut}
                  </span>
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
