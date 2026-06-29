
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
        <div className="w-full h-full flex flex-col gap-6 items-center justify-center bg-bg-app text-text-secondary">
            <div className="flex flex-col w-1/3">
                <div className="flex flex-col items-center justify-center mb-5">
                    {roundIcon()}
                    <p className="text-xl mt-3 font-bold text-text-primary">Volt API Client</p>
                    <p className="text-text-muted text-xs mt-3">Selecione uma coleção para começar</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full font-bold text-sm">
                    <button className="btn-primary">
                        <Plus size={15} strokeWidth={3} />
                        New Collection
                    </button>
                    <button className="btn-secondary">
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