import { ArrowLeft } from "lucide-react";
import useUserStore from "@/core/store/useUserStore";

export default function Perfil() {
    const user = useUserStore((state) => state.user);
    if (!user) {
        window.history.back();
        return null;
    }
    return (
        <div className="flex flex-col h-screen border-r border-[#313131] relative p-0">
            <div
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-[#ffb117]/90! rounded absolute top-1 left-1"
                onClick={() => window.history.back()}
            >
                <ArrowLeft size={18} strokeWidth={3} />
                <span>Voltar</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4">
                <div
                    className={`w-30 h-30 rounded-full flex items-center justify-center ${!user.avatarUrl && "bg-[#ffc107]"} overflow-hidden cursor-pointer`}
                >
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full" />
                    ) : (
                        <span className="text-[3rem] font-extrabold">{user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}</span>
                    )}
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[1rem] font-extrabold">
                        {user?.name || "Usuário"}
                    </span>
                    <span className="text-[0.8rem] text-zinc-500">
                        {user?.email}
                    </span>
                </div>
            </div>
        </div>
    );
}