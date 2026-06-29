import { Box, Dot, EllipsisVertical, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function SidebarWorkspaces() {

  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full flex-1 min-h-0 text-sm">
      <div className="flex flex-col gap-3 w-full p-3 pt-2 bg-zinc-900 ">
        <input type="text" placeholder="Buscar Workspace" className="w-full py-1 px-2 bg-zinc-950 text-zinc-200 border border-zinc-700" />
        <button
          className="flex items-center justify-center py-1 gap-2 bg-yellow-600 hover:bg-yellow-600/50 transition-colors cursor-pointer"
        >
          <PlusCircle size={16} strokeWidth={3} />
          <span>Novo Workspace</span>
        </button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col border-t border-zinc-700 bg-zinc-950/60 w-full">
        <div className="flex flex-col gap-2 p-2 w-full flex-1 min-h-0 overflow-y-auto">
          {Array.from({ length: 8 }).map((_, index) => {
            const isActive = index === 1;
            const usersMock = [
              {
                id: 1,
                name: "Usuario 1",
                isActive: true,
                isOwner: true,
              },
              {
                id: 2,
                name: "Usuario 2",
                isActive: false,
                isOwner: false,
              },
              {
                id: 3,
                name: "Usuario 3",
                isActive: true,
                isOwner: false,
              },
              {
                id: 4,
                name: "Usuario 4",
                isActive: false,
                isOwner: false,
              },
              {
                id: 5,
                name: "Usuario 5",
                isActive: true,
                isOwner: false,
              },
              {
                id: 6,
                name: "Usuario 6",
                isActive: false,
                isOwner: false,
              },
              {
                id: 7,
                name: "Usuario 7",
                isActive: true,
                isOwner: false,
              },
              {
                id: 8,
                name: "Usuario 8",
                isActive: false,
                isOwner: false,
              },
              {
                id: 9,
                name: "Usuario 9",
                isActive: true,
                isOwner: false,
              },
              {
                id: 10,
                name: "Usuario 10",
                isActive: false,
                isOwner: false,
              },
            ]
            return (
            <div 
              key={index} 
              className={`
                flex flex-col items-center p-2.5 group
                rounded border border-zinc-700 hover:border-yellow-500/10
                hover:bg-yellow-500/5 
                transition-colors cursor-pointer
              ${isActive ? "bg-yellow-500/5 border-yellow-500/30! border" : ""}`}
              onClick={() => navigate('/workspaces')}
            >
              <div className="flex items-center gap-3 w-full p-0">
                <div className="flex flex-col items-center text-zinc-300">
                    <Box className={`fill-zinc-300 group-hover:fill-yellow-400 group-hover:text-yellow-400 ${isActive ? "fill-yellow-500! text-yellow-500" : ""}`} strokeWidth={2.5} size={8} />
                    <div className="flex">
                      <Box className={`fill-zinc-300 group-hover:fill-yellow-400 group-hover:text-yellow-400 ${isActive ? "fill-yellow-500! text-yellow-500" : ""}`} strokeWidth={2.5} size={8} />
                      <Box className={`fill-zinc-300 group-hover:fill-yellow-400 group-hover:text-yellow-400 ${isActive ? "fill-yellow-500! text-yellow-500" : ""}`} strokeWidth={2.5} size={8} />
                    </div>
                </div>
                <span className={`w-full text-zinc-400 font-bold ${isActive ? "text-white!" : ""}`}>{`Workspace ${index + 1}`}</span>
                {/* {index === 1 && <span className="flex items-center justify-center text-[0.5rem] text-yellow-500 font-bold px-2 py-1 bg-yellow-500/50 backdrop-blur-lg rounded-full">ACTIVE</span>} */}
                {isActive && <Dot className="fill-yellow-500 text-yellow-500" strokeWidth={10} size={20} />}
              </div>
              <div className={`text-zinc-400/70 text-[0.7rem] font-bold w-full my-2 px-1 line-clamp-2 ${isActive ? "text-zinc-400/90!" : ""}`}>
                Descrição do Workspace estara neste campo para ajudar a reconhecer qual o workspace esta acessando
              </div>
              <div className={`flex justify-between w-full border-t border-zinc-700/60 pt-2 ${isActive ? "border-yellow-500/50!" : ""}`}>
                <div className="flex items-center relative text-[0.6rem]">
                  {usersMock.map((user, index) => {
                    
                    if(index === usersMock.length - 1) {
                      return <span className="text-zinc-200/70 font-bold absolute left-10">+{usersMock.length - 3}</span>
                    }

                    if(index < 3) {
                      
                      return (
                        <div 
                          key={index} 
                          className={`flex items-center justify-center rounded-full w-5 h-5 p-1 border border-yellow-500 bg-yellow-800 text-zinc-400 font-bold ${index > 0 ? `absolute left-${index * 2}` : ""} `}>
                            {index + 1}
                          </div>
                      )
                    }
                })}
                </div>
                <div className="w-full flex justify-end">
                    <EllipsisVertical size={16} strokeWidth={2} className={`text-zinc-400/70 ${isActive ? "text-white!" : ""}`} />
                </div>
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}