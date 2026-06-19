import { ArrowLeft } from "lucide-react";
import useUserStore from "@/core/store/useUserStore";

export default function Perfil() {
    const user = useUserStore((state) => state.user);
    console.log(user)
    if (!user) {
        window.history.back();
        return null;
    }
    return (
        <div className="flex items-center justify-center w-full h-full relative p-2 px-30!">
            <div className="flex flex-col w-full h-full gap-2">
                <div
                    className="
                        flex items-center 
                        w-fit gap-2 p-2 
                        cursor-pointer 
                        rounded
                        font-semibold!
                        group
                        hover:text-yellow-400
                        hover:bg-gray-200/10
                        hover:-translate-x-1.5 hover:scale-102
                        transition-all duration-300
                        
                    "
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft size={18} strokeWidth={3} />
                    <span>Voltar</span>
                </div>

                <div className="flex h-full! rounded border border-gray-600/30! overflow-hidden">
                    <div className="w-[20rem] h-full! bg-zinc-400/20 flex flex-col items-start">
                        {["Perfil", "Configurações", "Logout"].map((title, index) => (
                            <div key={index} className="w-full px-6 py-3 cursor-pointer hover:bg-zinc-400/30">
                                {title}
                            </div>
                        ))}
                    </div>
                    <div className="w-full p-8">
                        <div className="w-full p-10 flex items-center justify-center">
                            <div
                                className={`w-45 h-45 rounded-full flex items-center justify-center ${!user.avatarUrl && "bg-[#ffc107]"} overflow-hidden cursor-pointer`}
                            >
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-full" />
                                ) : (
                                    <span className="text-[3rem] font-extrabold">{user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[1rem] font-extrabold">
                                Nome:
                            </span>
                            <input type="text" value={user?.name} className="w-full p-2! bg-gray-600/10! border border-gray-600/30! rounded" />
                            <span className="text-[1rem] font-extrabold mt-4">
                                Email:
                            </span>
                            <input type="text" value={user?.email} className="w-full p-2! bg-gray-600/10! border border-gray-600/30! rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}