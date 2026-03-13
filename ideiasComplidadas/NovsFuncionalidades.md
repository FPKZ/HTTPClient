# Arquitetura: Sistema de Usuários e Sincronização Nuvem

Este documento descreve as mudanças necessárias para implementar um sistema completo de usuários, workspaces colaborativos e sincronização de dados (offline e tempo real) no projeto HTTPClient.

A arquitetura recomendada é **Local-First**, utilizando preferencialmente **Supabase** (para Auth e DB/Realtime) conjugado com uma estratégia de persistência local (IndexedDB) para funcionamento offline.

## Sugestões Adicionais para o Sistema (Análise)

Além dos requisitos solicitados, sugerimos incluir:

1.  **Resolução de Conflitos (CRDT ou Last-Write-Wins):** Como usuários podem editar offline, é crucial ter uma estratégia de merge para evitar sobrescrever dados cegamente.
2.  **Audit Logs (Histórico de Ações):** Em uma área colaborativa, é importante saber quem apagou ou editou um request.
3.  **Permissões Granulares:** Além do papel no Workspace, permitir restringir edições apenas a pastas ou coleções específicas dentro do workspace.
4.  **Soft Delete (Lixeira):** Nunca excluir fisicamente collections do banco, usar uma flag `deleted_at`. Isso facilita a sincronização offline, indicando ao app local que uma coleção foi apagada na nuvem.

## 1. Estrutura de Banco de Dados (PostgreSQL Sugerido)

Aqui detalhamos o esquema relacional no lado do Servidor.

### Tabela `users`

Armazena a identidade do usuário.

- `id` (UUID, PK) -> mapeado do serviço de Autenticação.
- `email` (String, Único)
- `display_name` (String)
- `avatar_url` (String)
- `created_at` (Timestamp)

### Tabela `user_settings`

Configurações isoladas do usuário.

- `user_id` (UUID, PK, FK -> users.id)
- `auto_save_enabled` (Boolean) - _Default `true`_
- `default_workspace_id` (UUID, FK -> workspaces.id) - Workspace a carregar por padrão
- `updated_at` (Timestamp)

### Tabela `workspaces`

Agrupa coleções e membros. Cada usuário também pode ter um "Workspace Pessoal" implícito ou explícito.

- `id` (UUID, PK)
- `name` (String)
- `owner_id` (UUID, FK -> users.id)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Tabela `workspace_members`

Relacionamento entre usuários e workspaces (N:N).

- `workspace_id` (UUID, PK, FK -> workspaces.id)
- `user_id` (UUID, PK, FK -> users.id)
- `role` (Enum: `owner`, `admin`, `editor`, `viewer`)
- `joined_at` (Timestamp)

### Tabela `collections`

Entidade primária dos dados de API. Se `workspace_id` for nulo, a coleção é privada do usuário `owner_id`.

- `id` (UUID, PK)
- `workspace_id` (UUID, FK -> workspaces.id, Permitir Nulo)
- `owner_id` (UUID, FK -> users.id)
- `name` (String)
- `data` (JSONB) - O conteúdo completo da coleção (requests, folders), ou dividi-lo em tabelas filhas caso queira relacional. Para offline-first, um JSON estruturado ou armazenamento como "documento" é mais simples de sincronizar.
- `last_modified_by` (UUID, FK -> users.id)
- `updated_at` (Timestamp) - _Crucial para sincronização de mudanças_
- `deleted_at` (Timestamp, Opcional) - _Soft delete_

## 2. Estrutura de Dados (Front-end / App Types)

No lado do cliente (Typescript), a estrutura atual deve evoluir para suportar sincronismo. Os modelos podem ser parecidos com estes:

```typescript
export type AuthProvider = "local" | "google" | "github";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  autoSave: boolean;
  provider: AuthProvider;
}

export type PermissionRole = "owner" | "admin" | "editor" | "viewer";

// Modificação do modelo atual de Workspace
export interface WorkspaceState {
  id: string;
  name: string;
  role: PermissionRole; // O papel do uário logado neste WS
  members: Array<{ userId: string; role: PermissionRole; name: string }>;
  isSyncing: boolean;
}

export interface CollectionSyncMeta {
  isDirty: boolean; // Precisa subir pro servidor?
  lastSyncAt?: number;
  syncError?: string;
  deleted?: boolean;
}

// Em volta de cada Collection, adicionamos o meta:
export interface LocalCollection extends CollectionData {
  _sync: CollectionSyncMeta;
}
```

## 3. Fluxo de Tráfego de Dados

Para garantir um funcionamento fluído tanto online como offline:

### Login e Persistência

1. O usuário faz o login via OAuth (Google/Github) ou Email no sistema nativo.
2. O sistema de Auth do provedor emite um token (JWT + Refresh Token) com um longo prazo de validade.
3. Este token é criptografado e salvo de forma segura no _electron store_ (ou Keychain). Assim, se o usuário fechar o app, na próxima abertura o próprio Electron tenta um refresh silencioso mantendo o usuário logado (até o timeout / logoff manual).

### Salvamento (Save)

Quando `auto_save_enabled = true`:

1. Quando o usuário modifica algo na Collection, o sistema salva **localmente** (ex: no SQLite interno ou IndexedDB).
2. Marca um flag na coleção `_sync.isDirty = true`.
3. Dispara uma rotina de Backgroud Sync.
4. **Se online**: A rotina manda para a API/DB (Nuven). Recebe um `OK`. Atualiza a data no servidor, e remove a flag `isDirty` local, e salva uma cópia limpa.
5. **Se offline**: A chamada falha ou nem ocorre. O registro continua no banco local marcado como `isDirty`.

### Reconexão e Offline Recovery

1. O Electron monitora o evento global de conectividade (`navigator.onLine` e/ou IPC).
2. Na transição de _offline_ para _online_, uma rotina lê todas as entidades que estão marcadas no banco local como `isDirty`.
3. As alterações são despachadas sequencialmente em batch para o servidor. Um header de timestamp base é mandado para não sobrepor mudanças de outros usuários acidentalmente.

### Sincronização em Tempo Real (Workspaces)

Um usuário em um Workspace requer ver o que seus colegas estão fazendo em tempo real:

1. Ao abrir o aplicativo e montar o workspace atual, o app abre uma conexão WebSocket num "room/channel" do Workspace, com seu token de autorização.
2. Sempre que a tabela `collections` filtrada pelo `workspace_id` muda (no servidor), um payload contendo o diff ou a coleção modificada desce pelo WebSocket (eventos como `INSERT`, `UPDATE`, `DELETE`).
3. O cliente do Workspace que recebe a alteração atualiza o banco local _sem acionar a flag isDirty_ e atualiza o estado da tela instantâneamente.
4. Caso a alteração atinja uma aba/coleção que u usuário está mexendo exatamente agora, o UI deve mesclar as alterações de forma pacífica ou informar que "Um usuário atualizou este item".

## 4. Plano de Implementação Resumido (Etapas)

1. **Backend & DB**: Provisionar ambiente Supabase, criar tabelas sugeridas com RLS protegendo acesso de coleções por `workspace_id`.
2. **Autenticação**: Integrar `supabase-js`, habilitando sessão persistente (com uso de custom storage adaptado para Electron para que tokens perdurem). Google/Github integrations.
3. **Core Local-First**: Criar gerenciador de sincronia. Interceptar métodos `save()` das collections (para injetar no IndexedDB local antes de tentar mandar rede) e criar Fila de Processamento background.
4. **Workspaces UI**: Criar telas de gerência de Workspace, convidar membros por email, criar role de membros.
5. **Tempo Real**: Integrar assinatura em um canal de workspace (`supabase.channel('public:collections').on(...)`) para aplicar modificações na Store global do React ativamente.

---

Vá para a notificação quando quiser validar esta proposta.
