import { Box } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Workspace } from "@/types";
import useWorkspacesStore from "@/core/store/slices/useWorkspacesStore";

export default function WorkspaceCard({
    index,
    workspace
}:{
    index: number,
    workspace: Workspace,
}){
    const { activeWorkspace } = useWorkspacesStore()
    const navigate = useNavigate()

    const isActive = activeWorkspace?.id === workspace.id

    return (
         <div 
            className={`
            flex flex-col justify-between p-4 group
            rounded border transition-all duration-200 cursor-pointer
            bg-[#161616] hover:bg-[#1b1b1b]
            ${isActive 
              ? "border-brand/40 shadow-md shadow-black/20" 
              : "border-zinc-800 hover:border-zinc-700"
            }`}
            onClick={() => navigate(`/workspace/${workspace.id}`)}
        >
            <div className="flex gap-3 items-start w-full">
                <div className="flex flex-col items-center text-zinc-300 shrink-0 mt-1">
                    <Box className={`fill-zinc-300 group-hover:fill-brand-hover group-hover:text-brand-hover ${isActive ? "fill-brand/80! text-brand/80" : ""}`} strokeWidth={2.5} size={8} />
                    <div className="flex">
                        <Box className={`fill-zinc-300 group-hover:fill-brand-hover group-hover:text-brand-hover ${isActive ? "fill-brand/80! text-brand/80" : ""}`} strokeWidth={2.5} size={8} />
                        <Box className={`fill-zinc-300 group-hover:fill-brand-hover group-hover:text-brand-hover ${isActive ? "fill-brand/80! text-brand/80" : ""}`} strokeWidth={2.5} size={8} />
                    </div>
                </div>
                <div className="flex flex-col gap-0.5 w-full min-w-0">
                    <span className={`font-bold text-[0.85rem] leading-none truncate group-hover:text-brand-hover ${isActive ? "text-brand/80" : "text-zinc-100"}`}>
                        {workspace.name}
                    </span>
                    <span className="text-zinc-400 text-[0.7rem] leading-tight line-clamp-2 mt-1">
                        {workspace.description}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center w-full mt-4">
                <div className="flex items-center -space-x-1.5">
                    {workspace.users.slice(0, 2).map((user) => (
                        <div 
                            key={user.id} 
                            className="flex items-center justify-center rounded-full w-5 h-5 bg-amber-950/60 border border-zinc-900 text-brand text-[0.55rem] font-bold overflow-hidden relative z-10"
                            title={user.name}
                        >
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.name.substring(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                    ))}
                    {workspace.users.length > 2 && (
                        <div 
                            className="flex items-center justify-center rounded-full w-5 h-5 bg-zinc-800 border border-zinc-900 text-zinc-400 text-[0.55rem] font-bold relative z-0"
                        >
                            +{workspace.users.length - 2}
                        </div>
                    )}
                </div>

                {isActive ? (
                    <div className="flex items-center gap-1.5 text-[0.6rem] font-bold text-brand uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                        Active
                    </div>
                ) : (
                    <span className="text-zinc-500 text-[0.6rem] font-bold uppercase tracking-wider">
                        Private
                    </span>
                )}
            </div>
        </div>
    )
}