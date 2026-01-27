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
 *  subMenu?: Array<any>; // Adicionado para submenus
 * }>} items - Itens do menu.
 */

const MenuItem = ({ item, index }) => {
  if (item.separator) {
    return (
      <DropdownMenu.Separator
        key={`sep-${index}`}
        className="h-px bg-zinc-700! m-1"
      />
    );
  }

  const commonItemClasses = cn(
    "flex items-center gap-2 px-3 py-2 text-xs! font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 data-[state=open]:bg-zinc-800 rounded transition-colors w-full",
    item?.disabled && "opacity-50 cursor-not-allowed",
    item.className,
  );

  const itemContent = (
    <>
      {item.icon && <span className="shrink-0">{item.icon}</span>}
      <span className="flex-1 text-left">{item.label}</span>
      {item.shortcut && (
        <span className="ml-auto text-[10px] text-zinc-500 font-semibold tracking-widest pl-4">
          {item.shortcut}
        </span>
      )}
    </>
  );

  if (item.subMenu) {
    return (
      <DropdownMenu.Sub key={`sub-${index}`}>
        <DropdownMenu.SubTrigger className={commonItemClasses}>
          {itemContent}
          <span className="ml-auto text-zinc-500">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
            >
              <path
                d="M6.1584 3.1356C6.35366 2.94034 6.67024 2.94034 6.8655 3.1356L10.7039 6.97401C10.8992 7.16927 10.8992 7.48585 10.7039 7.68112L6.8655 11.5195C6.67024 11.7148 6.35366 11.7148 6.1584 11.5195C5.96314 11.3243 5.96314 11.0077 6.1584 10.8124L9.64322 7.32757L6.1584 3.84273C5.96314 3.64747 5.96314 3.33089 6.1584 3.1356Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </span>
        </DropdownMenu.SubTrigger>
        <DropdownMenu.Portal>
          <DropdownMenu.SubContent
            className="min-w-[180px] bg-zinc-900 border border-zinc-700! p-1 rounded-sm shadow-2xl z-[60]!"
            sideOffset={2}
            alignOffset={-5}
          >
            {item.subMenu.map((subItem, subIndex) => (
              <MenuItem
                key={`sub-item-${subIndex}`}
                item={subItem}
                index={subIndex}
              />
            ))}
          </DropdownMenu.SubContent>
        </DropdownMenu.Portal>
      </DropdownMenu.Sub>
    );
  }

  return (
    <DropdownMenu.Item
      key={index}
      disabled={item?.disabled}
      onClick={item.onClick}
      className={commonItemClasses}
    >
      {itemContent}
    </DropdownMenu.Item>
  );
};

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
          {items.map((item, index) => (
            <MenuItem key={index} item={item} index={index} />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
