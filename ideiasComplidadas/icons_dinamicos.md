# Implementação de Ícones Dinâmicos nos Workspaces

Este documento descreve o plano e os passos recomendados para implementar ícones dinâmicos nos Workspaces do **Volt API Client**.

A abordagem selecionada consiste em armazenar uma **string identificadora** (nome do ícone do Lucide ou um Emoji nativo) no banco de dados SQLite. Isso permite excelente performance, flexibilidade de customização de cores no front-end e baixíssimo custo de armazenamento.

---

## 🛠️ Passo a Passo da Implementação

### 1. Atualizar o Schema do Banco de Dados (SQLite + Drizzle ORM)

No arquivo [workspaces.schema.ts](file:///c:/Users/felip/Documents/Prefeitura/HTTPClient/electron/db/schema/workspaces.schema.ts), adicione as colunas `icon` e `iconColor` à tabela de `workspaces`.

```typescript
// electron/db/schema/workspaces.schema.ts

export const workspaces = sqliteTable('workspaces', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    ownerId: text('owner_id').notNull().references(() => profiles.id),
    
    // Novas colunas para ícone e cor personalizados
    icon: text('icon').default('lucide:Box'),          // Ex: "lucide:Folder" ou "🚀"
    iconColor: text('icon_color').default('#FFC107'),  // Ex: Hexadecimal ou classe de cor
    
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
```

*Nota: Lembre-se de rodar as migrations ou recalcular o banco local após essa alteração.*

---

### 2. Atualizar as Interfaces e Tipos (TypeScript)

No arquivo de definição da entidade de workspaces [workspace.ts](file:///c:/Users/felip/Documents/Prefeitura/HTTPClient/types/entities/workspace.ts), atualize a interface para refletir as novas colunas que serão retornadas pela consulta da tabela `workspaces`:

```typescript
// types/entities/workspace.ts
import { Workspaces } from "../../electron/db/schema/workspaces.schema"
import { User } from "./user"

export interface Workspace extends Omit<Workspaces, 'createdAt'> {
  collectionsId?: string[]
  collectionsCount?: number
  users: (Omit<User, 'email'> & { email?: string })[]
  // Caso o tipo inferido "Workspaces" acima não inclua automaticamente as novas colunas
  icon?: string | null
  iconColor?: string | null
}
```

---

### 3. Criar o Componente de Ícone Dinâmico no Front-end

Para otimizar o empacotamento (build/bundle) e evitar carregar milhares de ícones do Lucide que não serão usados no app, criaremos um componente que mapeia um conjunto controlado de ícones corporativos/úteis, além de aceitar Emojis do sistema.

Crie o arquivo `src/components/ui/WorkspaceIcon.tsx` (ou na pasta que preferir para componentes utilitários):

```tsx
// src/components/ui/WorkspaceIcon.tsx
import React from "react";
import * as Lucide from "lucide-react";

interface WorkspaceIconProps {
  iconString?: string | null;
  color?: string | null;
  size?: number;
  className?: string;
}

// Mapeamento de ícones do Lucide permitidos/disponibilizados para os Workspaces
export const AVAILABLE_WORKSPACE_ICONS = {
  Box: Lucide.Box,
  Folder: Lucide.Folder,
  Terminal: Lucide.Terminal,
  Globe: Lucide.Globe,
  Database: Lucide.Database,
  Cpu: Lucide.Cpu,
  Layers: Lucide.Layers,
  Settings: Lucide.Settings,
  Code: Lucide.Code,
  Shield: Lucide.Shield,
  Zap: Lucide.Zap,
  Bookmark: Lucide.Bookmark,
};

export type AllowedIcons = keyof typeof AVAILABLE_WORKSPACE_ICONS;

export default function WorkspaceIcon({
  iconString = "lucide:Box",
  color,
  size = 20,
  className = "",
}: WorkspaceIconProps) {
  if (!iconString) return null;

  // Se for um ícone mapeado do Lucide React (começando com 'lucide:')
  if (iconString.startsWith("lucide:")) {
    const iconName = iconString.replace("lucide:", "") as AllowedIcons;
    const IconComponent = AVAILABLE_WORKSPACE_ICONS[iconName] || Lucide.Box;

    return (
      <IconComponent
        size={size}
        style={{ color: color || "currentColor" }}
        className={className}
      />
    );
  }

  // Se não começar com 'lucide:', renderiza como Emoji nativo (texto Unicode)
  return (
    <span
      className={`select-none leading-none flex items-center justify-center ${className}`}
      style={{ fontSize: `${size}px` }}
    >
      {iconString}
    </span>
  );
}
```

---

### 4. Atualizar a Exibição no Card do Workspace

No arquivo [WorkspaceCard.tsx](file:///c:/Users/felip/Documents/Prefeitura/HTTPClient/src/pages/\(sistem\)/\(hometabs\)/workspaces/WorkspaceCard.tsx), atualize a área do ícone estático para utilizar o novo componente de ícone dinâmico.

```tsx
// src/pages/(sistem)/(hometabs)/workspaces/WorkspaceCard.tsx
import WorkspaceIcon from "@/components/ui/WorkspaceIcon";
// ... outros imports

export default function WorkspaceCard({
    index,
    workspace
}:{
    index: number,
    workspace: Workspace,
}){
    const { activeWorkspace } = useWorkspacesStore();
    const navigate = useNavigate();

    const isActive = activeWorkspace?.id === workspace.id;

    // Valores dinâmicos salvos no workspace
    const icon = workspace.icon || "lucide:Box";
    const iconColor = workspace.iconColor || "#FFC107"; 

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
            onClick={() => {}}
        >
            <div className="flex gap-3 items-start w-full">
                {/* Substituição do bloco estático do ícone Box */}
                <div className="shrink-0 mt-1 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 transition-all duration-200">
                    <WorkspaceIcon 
                        iconString={icon} 
                        color={isActive ? undefined : iconColor}
                        size={20}
                        className={isActive ? "text-brand" : ""}
                    />
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
            {/* ... Resto do Card */}
         </div>
    );
}
```

---

## 🎨 Sugestão para a Tela de Edição / Criação de Workspace
Quando você criar a tela para o usuário criar ou editar o Workspace, você pode disponibilizar um seletor de ícones simples contendo:
1. Uma paleta de cores para definir o `iconColor`.
2. Uma lista clicável com os ícones de `AVAILABLE_WORKSPACE_ICONS` (salvando como `"lucide:NomeDoIcone"`).
3. Um input de texto pequeno para que o usuário insira qualquer Emoji do próprio teclado do sistema operacional (salvando o próprio Emoji cru, ex: `"🚀"`).
