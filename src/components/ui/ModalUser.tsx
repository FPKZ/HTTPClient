import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogIn, LogOut } from "lucide-react";
import { useMenuGeral } from "@/core/hooks/useMenuGeral";
import { MenuItem } from "../DropdownMenu";
import useUserStore from "@/core/store/useUserStore";
import { useNavigate } from "react-router-dom";

interface ModalUserProps {
  children: React.ReactNode;
}

export default function ModalUser({ children }: ModalUserProps) {
  const { userMenu } = useMenuGeral();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate()
  // console.log(user)
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="w-50 bg-zinc-900 border border-zinc-700! p-2 m-2 rounded-sm shadow-2xl z-50!">
          {user ? (
            <div className="flex flex-col items-center gap-2 p-1 my-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ffc107]">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-[1rem] font-extrabold">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                  </span>
                )}
              </div>
              <div className="text-[0.8rem] text-zinc-300">
                <p className="font-bold m-0">{user?.name || "Usuário"}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 my-2">
              <span className="text-[1rem] font-extrabold">
                Fazer login!
              </span>
              <span className="text-[0.7rem] text-center text-zinc-400">
                Fazer login para acessar todos os recursos do sistema!
              </span>
            </div>
          )}
          {user && userMenu.map((item, index) => (
            <MenuItem
              key={index}
              item={item}
              index={index}
            />
          ))}
          <MenuItem 
            item={{
              separator: true,
            }}
            index={100}
          />
          {user ? (
            <DropdownMenu.Item
              className="
                  p-1 mt-2 flex items-center justify-center gap-2
                  text-[0.8rem] font-bold text-red-500 
                  data-highlighted:text-zinc-100 data-highlighted:font-extrabold
                  data-highlighted:bg-red-500/90! 
                  rounded cursor-pointer outline-none
                  group
                  transition-all duration-200 ease-in-out
              "
              onClick={async () => {
                // Realiza o logout; useAuthGuard detecta user → null e redireciona
                await window.electronAPI.logout();
                useUserStore.getState().clearUser();
              }}
            >
              Sair
              <LogOut size={13} className="stroke-3 group-hover:stroke-4" />
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item
              className="
                  p-1 mt-2 flex items-center justify-center gap-2
                  text-[0.8rem] font-bold 
                  bg-yellow-500
                  data-highlighted:text-zinc-100
                  data-highlighted:bg-yellow-500/70! 
                  rounded cursor-pointer outline-none
                  group
                  transition-all duration-300 ease-in-out
              "
              onClick={() => navigate("/login")}
            >
              <LogIn size={13} strokeWidth={3} />
              Login
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
