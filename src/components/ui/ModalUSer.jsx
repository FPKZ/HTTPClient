import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut } from "lucide-react";

export default function ModalUser({ children }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-[180px] bg-zinc-900 border border-zinc-700! p-2 rounded-sm shadow-2xl z-50!">
          <div className="flex flex-col items-center gap-2 p-1 my-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ffc107]">
              <span className="text-[1rem] font-extrabold">LF</span>
            </div>
            <div className="text-[0.8rem] text-zinc-300">
              <p className="font-bold m-0">Luis Felipe</p>
            </div>
          </div>
          {[
            { label: "Item 1", onClick: () => {} },
            { label: "Item 2", onClick: () => {} },
          ].map((item, index) => (
            <DropdownMenu.Item
              key={index}
              className="
                px-2 py-1 flex items-center
                text-[0.8rem] font-normal text-zinc-300 
                data-highlighted:text-zinc-100 data-highlighted:font-bold
                data-highlighted:bg-zinc-800! 
                rounded cursor-pointer outline-none
              "
              onClick={item.onClick}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Item
            className="
                p-1 mt-2 flex items-center justify-center gap-2
                text-[0.8rem] font-bold text-red-500 
                data-highlighted:text-zinc-100 data-highlighted:font-extrabold
                data-highlighted:bg-red-500/90! 
                rounded cursor-pointer outline-none
                group
            "
            onClick={() => {}}
          >
            Sair
            <LogOut size={13} className="stroke-3 group-hover:stroke-4" />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
