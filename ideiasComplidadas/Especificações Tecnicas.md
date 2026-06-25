# Especificação Técnica: VOLT "Offline-First" & Colaborativo

## 1. Visão Geral
Sistema desktop para testes de API construído com **Electron, React, Vite e Zustand**. O objetivo é ser ultra-performático, funcionar sem internet (Offline-First) e permitir colaboração em tempo real (Cloud-Sync) via Supabase.

## 2. Princípios de Engenharia (Mandatários)
- **SOLID & Clean Architecture**: Separação clara entre Main Process (Back-end/Node) e Renderer Process (Front-end/React).
- **Inversão de Dependência**: O Front-end não acessa o disco diretamente; ele utiliza uma API abstrata via Preload.
- **Single Source of Truth**: O Zustand é o mestre do estado na memória.
- **Atomicidade**: Dados devem ser salvos de forma relacional para evitar corrupção de arquivos JSON gigantes.

## 3. Stack Tecnológica
- **Front-end**: React, Zustand (Estado), Yjs (CRDT para edição simultânea).
- **Back-end (Electron)**: Node.js, `better-sqlite3` (Persistência local).
- **Cloud/BaaS**: Supabase (Auth, PostgreSQL, Realtime, Storage).
- **Protocolos**: IPC (Electron), WebSockets (Supabase Realtime), Deep Linking (`seuapp://`).

## 4. Modelagem de Dados Relacional (Schema)
O SQLite e o PostgreSQL devem compartilhar este esquema:
- **profiles**: `id (uuid)`, `name`, `avatar_local_path`, `avatar_url`.
- **workspaces**: `id`, `name`, `owner_id`.
- **workspace_members**: `workspace_id`, `user_id`, `role` (admin/editor/viewer).
- **collections**: `id`, `workspace_id`, `name`, `order_index`, `storage_type` ('local' | 'cloud'), `owner_id` (Opcional no banco local para permitir uso anônimo/offline sem login).
- **requests**: `id`, `collection_id`, `folder_id`, `method`, `url`, `body` (lazy), `headers` (lazy), `params` (lazy), `auth` (lazy), `is_dirty` (boolean para sync), `order_index`.

## 5. Fluxos de Trabalho (Regras de Implementação)

### 5.1 Autenticação & Sessão
- **OAuth (Google/GitHub)**: Deve ser feito via navegador externo usando Deep Linking para retornar o token ao Electron.
- **Persistência**: Tokens de sessão devem ser salvos de forma segura no disco pelo Processo Main.
- **Logout (Purga)**: Ao deslogar, deletar do SQLite todos os dados onde `storage_type === 'cloud'`. Manter apenas dados `local`.

### 5.2 Persistência & Sync (Offline-First)
- **Escrita Local/Anônima**: Coleções criadas sem usuário logado têm `owner_id = null` e funcionam 100% offline.
- **Transição de Login**: Ao fazer login, o sistema deve detectar coleções locais sem dono e exibir um prompt perguntando se deseja sincronizar. O usuário deve ter a opção de sincronizar **todas** ou **escolher individualmente** quais coleções irão para a nuvem.
- **Sync Engine**: O Back-end deve monitorar a conexão. Ao detectar sinal, varrer o SQLite por registros `is_dirty === true` (que possuam `owner_id` vinculado) e sincronizar.
- **Escrita Granular de Requisições**: Salvamentos locais são síncronos e granulares por ID de requisição, modificando apenas o registro correspondente no SQLite (e marcando `is_dirty` para sync), sem reescrever a árvore da Coleção. Os dados mais pesados (body, headers, params, auth) são carregados do banco sob demanda (lazy loading) quando a aba correspondente é focada.
- **Preservação de Abas por Coleção (UI State)**: O estado das abas abertas e ativas de cada Coleção é armazenado de forma persistente diretamente no Zustand (LocalStorage do Chromium). Ao alternar de Coleção, o estado de abas anterior é salvo e o da nova coleção é carregado instantaneamente.


### 5.3 Colaboração Real-time
- **Presença**: Usar Supabase Presence para indicar usuários ativos e rotas em edição.
- **Conflitos**: Usar Yjs para mesclar alterações no corpo (body) e headers das requisições em tempo real.

### 5.4 Limites & SaaS (Futuro)
- Implementar checagem de limites de Workspaces e Membros baseada no plano do usuário salvo no SQLite/Supabase.
- Bloquear ações no Front-end (Zustand) e no Banco (RLS) se os limites forem atingidos.

## 6. Regras para o Agente de IA (Instruções de Implementação)
1. **Não use JSON para salvar coleções**: Migre imediatamente para a estrutura relacional do SQLite.
2. **Priorize IPC Assíncrono**: Nunca trave a UI do React aguardando respostas lentas do disco ou rede.
3. **Segurança de API**: Requisições HTTP reais de teste devem ser feitas pelo Node.js (Back-end) para evitar problemas de CORS.
4. **Tratamento de Imagens**: Baixe avatares de usuários para o disco local e referencie o caminho do arquivo no banco para carregamento offline instantâneo.