import { useWorkspaceEditContext } from "../../context/WorkspaceEditContext";

export default function ActivityChart() {
  const { activityData } = useWorkspaceEditContext();

  return (
    <div className="flex flex-col gap-3 shrink-0">
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
        Atividade (7D)
      </span>
      
      {/* Container do Gráfico */}
      <div
        className="
          w-full sm:w-56 h-[106px] rounded-xl border p-4 flex items-end justify-between
          bg-[#0e0e10] border-zinc-800/80 shadow-md shadow-black/25
        "
      >
        <div className="flex items-end justify-between w-full h-full gap-2 px-1">
          {activityData.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-amber-950/20 rounded-t-md h-full relative overflow-hidden"
            >
              <div
                className="
                  absolute bottom-0 left-0 right-0 rounded-t-sm
                  bg-brand/90 hover:bg-brand transition-all duration-300
                "
                style={{ height: `${value}%` }}
                title={`Dia ${index + 1}: ${value}% de atividade`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
