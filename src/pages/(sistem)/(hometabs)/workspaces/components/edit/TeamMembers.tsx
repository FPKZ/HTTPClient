import { useWorkspaceEditContext } from "../../context/WorkspaceEditContext";
import { UserPlus, UserMinus } from "lucide-react";

export default function TeamMembers() {
  const {
    workspace,
    handleInviteMember,
    handleChangeMemberRole,
    handleRemoveMember,
  } = useWorkspaceEditContext();

  if (!workspace) return null;

  const handleQuickInvite = () => {
    const mockNames = [
      "Lucas Almeida",
      "Gabriela Rocha",
      "Felipe Santos",
      "Mariana Lima",
      "Roberto Albuquerque",
    ];
    // Filtra quem ainda não está no time
    const uninvited = mockNames.filter(
      (name) => !workspace.users?.some((u) => u.name === name)
    );
    const nameToInvite = uninvited.length > 0
      ? uninvited[0]
      : mockNames[Math.floor(Math.random() * mockNames.length)] + ` (${(workspace.users?.length || 0) + 1})`;
      
    const email = `${nameToInvite.toLowerCase().replace(/\s+/g, ".")}@volt-ide.com`;
    handleInviteMember(nameToInvite, email);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header da Seção */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Membros do Time
        </span>
        
        <button
          type="button"
          onClick={handleQuickInvite}
          className="
            flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover
            transition-colors cursor-pointer outline-none
          "
        >
          <UserPlus size={14} strokeWidth={2.5} />
          <span>CONVIDAR</span>
        </button>
      </div>

      {/* Lista de Membros */}
      <div className="flex flex-col gap-2.5">
        {workspace.users?.map((member, idx) => {
          // O primeiro membro ou o dono (id === ownerId ou index === 0) é Admin
          const isOwner = member.id === workspace.ownerId || idx === 0;
          const memberRole = (member as any).role || (isOwner ? "admin" : "viewer");

          return (
            <div
              key={member.id || idx}
              className="
                flex items-center justify-between p-3 rounded-md border select-none
                bg-[#111113] border-zinc-800/80 hover:bg-[#141416]
                transition-all duration-200
              "
            >
              {/* Informações do Membro */}
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                {/* Avatar Circular */}
                <div
                  className="
                    flex items-center justify-center rounded-full w-8 h-8 shrink-0 select-none
                    bg-zinc-800 border border-zinc-950 text-[0.75rem] font-bold text-zinc-300
                    overflow-hidden relative
                  "
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span>{member.name?.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-zinc-100 font-bold text-[0.875rem] leading-tight truncate">
                    {member.name} {isOwner && <span className="text-zinc-500 font-medium text-xs">(Você)</span>}
                  </span>
                  <span className="text-zinc-500 text-[0.7rem] mt-0.5 leading-none truncate">
                    {member.email || `${member.name.toLowerCase().replace(/\s+/g, ".")}@volt-ide.com`}
                  </span>
                </div>
              </div>

              {/* Roles e Ações */}
              <div className="flex items-center gap-2.5 shrink-0">
                {isOwner ? (
                  <span
                    className="
                      border border-brand/20 bg-brand/5 text-brand
                      text-[9px] font-extrabold px-2.5 py-0.5 rounded tracking-widest uppercase
                    "
                  >
                    Admin
                  </span>
                ) : (
                  <>
                    {/* Seletor de Cargo */}
                    <select
                      value={memberRole}
                      onChange={(e) =>
                        handleChangeMemberRole(member.id, e.target.value as any)
                      }
                      className="
                        bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded
                        px-2 py-1 outline-none focus:border-brand/40 cursor-pointer
                      "
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Visualizador</option>
                    </select>

                    {/* Botão de Remover Membro */}
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      title="Remover Membro"
                      className="
                        p-1 rounded text-zinc-650 hover:text-rose-400 hover:bg-zinc-900
                        transition-all duration-150 cursor-pointer outline-none
                      "
                    >
                      <UserMinus size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
