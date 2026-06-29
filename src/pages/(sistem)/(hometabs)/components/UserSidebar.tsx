import useUserStore from "@/core/store/useUserStore";
import { useThemeStore } from "@/core/store";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LogOut, Sun, Moon } from "lucide-react";

export default function UserSiderBar() {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="w-full flex flex-col h-full relative transition-all duration-300">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col">
          <div className="flex flex-col items-center justify-center my-4 gap-2">
            {/* {fullLogo()} */}
            {user ? (
              <>
                <div
                  className={`w-30 h-30 rounded-full flex items-center justify-center ${!user.avatarUrl && "bg-brand"} overflow-hidden cursor-pointer`}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full" />
                  ) : (
                    <span className="text-[3rem] font-extrabold text-brand-text">
                      {user.name
                        ? user.name.substring(0, 2).toUpperCase()
                        : "US"}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[1rem] font-extrabold text-text-primary">
                    {user.name || "Usuário"}
                  </span>
                  <span className="text-[0.8rem] text-text-secondary">
                    {user.email}
                  </span>
                </div>
              </>
            ) : (
              <div className="px-3 flex flex-col gap-3">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[1rem] font-extrabold text-text-primary">
                    Fazer login!
                  </span>
                  <span className="text-[0.7rem] text-center text-text-secondary">
                    Fazer login para acessar todos os recursos do sistema!
                  </span>
                </div>
                <div className="flex w-full px-1">
                  <div
                    className="
                          flex items-center justify-between w-full p-1
                          bg-brand hover:bg-bg-active text-brand-text hover:text-text-primary
                          border border-brand hover:border-border-base
                          rounded 
                          font-bold
                          cursor-pointer transition-colors duration-200
                        "
                    onClick={() => navigate("/login")}
                  >
                    <div></div>
                    <span>Ir para Login</span>
                    <ArrowRight size={18} strokeWidth={3} />
                  </div>
                </div>
              </div>
            )}
            
            <div className="w-full border-t border-border-base my-4 pt-4 px-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Tema</span>
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg bg-bg-hover hover:bg-bg-active border border-border-base transition-all duration-200 cursor-pointer flex items-center justify-center"
                  title="Alternar Tema"
                >
                  {theme === "dark" ? (
                    <Sun size={15} className="text-brand" />
                  ) : (
                    <Moon size={15} className="text-text-primary" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {user && (
        <div className="mt-auto w-full py-3 px-4 border-t border-[#313131] shrink-0">
          <div
            className="
                  p-1 w-full flex items-center justify-center gap-2
                  text-[1rem] font-bold text-[#cecece]
                  bg-red-500/90 hover:bg-red-500/80 active:bg-red-500/70 transition-colors
                  rounded cursor-pointer outline-none
                  group
                "
            onClick={async () => {
              // Realiza o logout; useAuthGuard detecta user → null e redireciona
              await window.electronAPI.logout();
              useUserStore.getState().clearUser();
            }}
          >
            <span className="pt-0.5">Sair</span>
            <LogOut size={15} className="stroke-3" />
          </div>
        </div>
      )}
    </div>
  );
}