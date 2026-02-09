import { formatSize } from "../../../lib/utils";
import ResultRequestLog from "@/components/ResultRequestLog";

export default function Response({logs, activeResponseView, updateTabUiState, activeTab}) {
    return (
        <div className="flex-1 h-full border-t border-zinc-700! bg-zinc-950 flex flex-col overflow-hidden">
            <div className="px-2 py-1.5 border-b border-zinc-800! flex justify-between items-center bg-zinc-900/30 shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[0.65rem]! font-black tracking-widest text-zinc-500 uppercase shrink-0">
                    Response
                </span>
                {logs.length > 0 && (
                    <>
                    <span className="text-zinc-700 font-bold shrink-0">•</span>
                    <div className="flex items-center gap-2 shrink-0">
                        <div
                        className={`w-1.5 h-1.5 rounded-full ${
                            logs[logs.length - 1].isError
                            ? "bg-red-500"
                            : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                        }`}
                        />
                        <span
                        className={`${
                            logs[logs.length - 1].isError
                            ? "text-red-500"
                            : "text-green-400"
                        } text-[0.7rem]! font-bold`}
                        >
                        {logs[logs.length - 1].status}{" "}
                        {logs[logs.length - 1].statusText}
                        </span>
                    </div>
                    {logs[logs.length - 1].responseTime !== undefined && (
                        <span className="text-zinc-600 text-[0.65rem]! font-medium ml-1 shrink-0">
                        {logs[logs.length - 1].responseTime} ms
                        </span>
                    )}
                    {logs[logs.length - 1].responseSize !== undefined && (
                        <span className="text-zinc-600 text-[0.65rem]! font-medium shrink-0">
                        {formatSize(logs[logs.length - 1].responseSize)}
                        </span>
                    )}
                    </>
                )}
                </div>

                {/* Seletor de Abas Global */}
                <div className="flex bg-zinc-900/80 rounded-lg! p-0.5 border border-zinc-800! ml-4 shrink-0">
                {["json", "preview", "headers"].map((tab) => (
                    <button
                    key={tab}
                    onClick={() =>
                        updateTabUiState(activeTab.id, {
                        activeResponseView: tab,
                        })
                    }
                    className={`px-2.5 py-1 rounded-md! text-[0.6rem]! font-bold uppercase transition-all! ${
                        activeResponseView === tab
                        ? "bg-zinc-800 text-yellow-500 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    >
                    {tab}
                    </button>
                ))}
                </div>
            </div>

            {/* Conteúdo do Log */}
            <div className="flex-1 p-0 overflow-hidden bg-[#010101]">
                <ResultRequestLog logs={logs} activeView={activeResponseView} />
            </div>
        </div>
    );
}