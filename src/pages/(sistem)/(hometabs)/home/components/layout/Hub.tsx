
// Store
import { useUserStore } from "@/core/store";

// Hooks
import useHistory from "@/core/hooks/useHistory";

// Ui
import icons from "@/assets/icons"
import HistoryList from "../history/HistoryList";
import { FilePlus, Plus } from "lucide-react";



export default function Hub(){
    const { roundIcon } = icons()

    const {
        history,
        handleLoadHistory,
        handleDeleteHistoryItem,
        handleDeleteAllHistory,
    } = useHistory();

    const user = useUserStore((state) => state.user);

    return(
        <div className="w-full h-full flex flex-col gap-6 items-center justify-center bg-zinc-900 text-gray-500">
            <div className="flex flex-col w-1/3">
                <div className="flex flex-col items-center justify-center mb-5">
                    {roundIcon()}
                    <p className="text-xl mt-3 font-bold text-white">Volt API Client</p>
                    <p className="text-gray-400 text-xs mt-3">Selecione uma coleção para começar</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full font-bold text-sm">
                    <button 
                        className="
                            flex gap-2 p-2 px-4 justify-center items-center
                            bg-yellow-600 
                            text-zinc-900 
                            hover:text-zinc-100
                            transition-all duration-200
                            cursor-pointer
                        "
                    >
                        <Plus size={15} strokeWidth={3} />
                        New Collection
                    </button>
                    <button 
                        className="
                            flex gap-2 p-2 px-4 justify-center items-center
                            bg-zinc-800 
                            text-zinc-400 
                            hover:text-zinc-100
                            transition-all duration-200
                            cursor-pointer
                        "
                    >
                        <FilePlus size={15} strokeWidth={3} />
                        Import Collection
                    </button>
                </div>
            </div>

            <div className="flex w-8/11 gap-6 p-4">
                <div className="flex flex-col w-full">
                    <HistoryList
                        history={history}
                        onLoad={handleLoadHistory}
                        onDelete={handleDeleteHistoryItem}
                        onAllDelete={handleDeleteAllHistory}
                    />
                </div>
                {
                    user && (
                        <div className="flex w-4/6">
                            <HistoryList
                                history={history}
                                onLoad={handleLoadHistory}
                                onDelete={handleDeleteHistoryItem}
                                onAllDelete={handleDeleteAllHistory}
                            />
                        </div>
                    )
                }
            </div>
        </div>
    )
}