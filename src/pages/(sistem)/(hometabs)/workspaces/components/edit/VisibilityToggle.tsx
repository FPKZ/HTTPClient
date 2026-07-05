import { useWorkspaceEditContext } from "../../context/WorkspaceEditContext";

export default function VisibilityToggle() {
  const { isPublic, handleToggleVisibility } = useWorkspaceEditContext();

  return (
    <div
      className="
        flex items-center justify-between p-4 rounded-lg border
        bg-[#0c0c0e]/80 border-zinc-800/80 max-w-lg w-full mt-4
      "
    >
      <div className="flex flex-col gap-0.5 min-w-0 pr-4">
        <span className="font-bold text-sm text-white">
          Visibilidade Pública
        </span>
        <span className="text-zinc-500 text-xs truncate">
          Visível para membros de outros times.
        </span>
      </div>

      <button
        type="button"
        onClick={handleToggleVisibility}
        className={`
          w-11 h-6 rounded-full relative flex items-center shrink-0
          transition-colors duration-250 cursor-pointer outline-none border border-transparent
          ${isPublic ? "bg-brand" : "bg-zinc-850"}
        `}
      >
        <span
          className={`
            w-4 h-4 rounded-full bg-[#121214] transition-all duration-250 absolute
            ${isPublic ? "left-[24px]" : "left-[3px] bg-zinc-500"}
          `}
        />
      </button>
    </div>
  );
}
