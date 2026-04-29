Este é o **Plano Diretor de Arquitetura Final**, consolidando todas as estratégias de resiliência, performance e sincronização que discutimos. Este roteiro transforma seu projeto em uma aplicação de classe mundial, preparada para escala e colaboração em tempo real.
## 1. Visão Geral da Arquitetura "Dual-Engine"
O sistema operará com dois motores de persistência trabalhando em harmonia, mediadores pelo estado global do Zustand.
 * **Motor Local (SQLite):** Focado em latência zero, cache de ativos (imagens) e funcionamento offline total.
 * **Motor Nuvem (Supabase):** Focado em colaboração, backup e sincronização entre múltiplos dispositivos.
## 2. Refatoração de Dados e Modelagem Relacional
### Estrutura de Tabelas (Local e Nuvem)
Para garantir a integridade, o SQLite local e o PostgreSQL (Supabase) compartilharão o mesmo esquema:
| Tabela | Responsabilidade |
|---|---|
| **profiles** | Dados do usuário: id, name, avatar_local_path (SQLite), avatar_url (Nuvem). |
| **workspaces** | Grupos de trabalho: id, name, owner_id. |
| **workspace_members** | Controle de acesso: workspace_id, user_id, role (viewer/editor/admin). |
| **collections** | Grupos de rotas: id, workspace_id, name, order_index, storage_type, owner_id (opcional no local para uso anônimo). |
| **requests** | A rota em si: id, collection_id, method, url, body, headers, is_dirty, order_index. |
## 3. Fluxo Profissional de Autenticação e Sessão
### Inicialização (O "Boot" do App)
 1. **Leitura do Disco:** O Electron lê o access_token e refresh_token do armazenamento seguro (electron-store).
 2. **Verificação de Rede:** * **Online:** O app valida o token no Supabase. Se o perfil mudou (ex: nova foto), o Back-end baixa a imagem e atualiza o SQLite.
   * **Offline:** O app valida a existência do token local e carrega o perfil do usuário diretamente do SQLite, incluindo o caminho da imagem no HD.
### Login Social (OAuth)
 1. O React aciona o Back-end.
 2. O Electron abre o navegador padrão do sistema (Google/GitHub).
 3. O **Deep Linking** (seuapp://auth-callback) captura o retorno, troca o código pela sessão e salva no disco.
## 4. Estratégia de Sincronização e Offline-First
### Uso Anônimo e Transição de Login
O app funciona 100% offline para usuários não logados (coleções salvas com `owner_id = null`).
Ao realizar o login, o sistema deve detectar coleções "órfãs" e apresentar um prompt de sincronização:
* O usuário pode optar por sincronizar **todas** as coleções locais para a nuvem.
* O usuário pode **selecionar individualmente** quais coleções deseja sincronizar, mantendo as demais estritamente locais.

### Escrita em Duas Etapas
Toda alteração feita pelo usuário segue este fluxo:
 1. **Zustand (Instantâneo):** O estado na memória muda e a UI reage.
 2. **SQLite (Permanência Local):** O Electron escreve a mudança no banco local em milissegundos. Se a coleção possuir um `owner_id` e houver alterações, marca a linha com `is_dirty = true`.
 3. **Supabase (Sincronização):** 
   * Se online e com `owner_id` definido: O dado é enviado via SDK.
   * Se offline e com `owner_id` definido: Aguarda a conexão (is_dirty) e dispara o envio assim que o sinal retornar.
## 5. Colaboração em Tempo Real
 * **Presença (Presence):** Usar os Canais do Supabase para mostrar quem está online e qual rota está editando através de metadados efêmeros.
 * **Prevenção de Sobrescrita (Yjs):** Integrar o Yjs para mesclagem inteligente de textos (Body, Headers) sem necessidade de uma API centralizada para resolver conflitos.
 * **RBAC (Role-Based Access Control):** Utilizar a tabela workspace_members para habilitar ou desabilitar botões de edição no React baseando-se no cargo do usuário logado.
## 6. Refatoração e Princípios SOLID
 * **S (Single Responsibility):** O componente de árvore de arquivos apenas exibe dados; a lógica de busca (fetch) fica em hooks customizados.
 * **O (Open/Closed):** O sistema de armazenamento será uma interface. Se você quiser adicionar suporte ao Docker ou outra nuvem no futuro, basta criar um novo provedor.
 * **L (Liskov Substitution):** As coleções "locais" e "nuvem" devem se comportar da mesma forma para o Zustand.
 * **I (Interface Segregation):** O Preload do Electron deve expor apenas as funções estritamente necessárias (window.api).
 * **D (Dependency Inversion):** O Front-end não depende diretamente do SQLite, mas sim de uma API exposta pelo Electron que pode ou não usar o SQLite por baixo.
## 7. Módulo de Monetização e Limites (SaaS Ready)
Para que o sistema seja escalável e permita cobrança futura, a lógica de limites deve ser tratada como um **Serviço de Governança** que atua tanto no Front quanto no Back.
### A. Estrutura de Tabelas para Planos
No seu Supabase, você adicionará estas tabelas para controlar o acesso:
| Tabela | Função |
|---|---|
| **plans** | Define os pacotes (ex: free, pro, enterprise) e seus respectivos limites (integers). |
| **subscriptions** | Vincula o user_id a um plan_id e armazena o status do pagamento. |
| **usage_cache** | (Opcional/Performance) Um resumo rápido do uso atual do usuário para evitar COUNT(*) pesados. |
### B. Implementação do "Gatekeeper" (Porteiro)
 1. **Sincronização de Permissões:** Ao fazer login, o Electron baixa os limites do plano do usuário e os salva no SQLite. Isso garante que as travas funcionem **offline**.
 2. **Validação em Duas Camadas:**
   * **No React:** O botão de "Convidar" ou "Novo Workspace" fica desabilitado se o limite foi atingido (Melhora a UX).
   * **No Supabase (RLS/Functions):** O banco de dados rejeita a inserção se o limite for violado. Isso impede que usuários técnicos tentem burlar as travas via console ou API externa.
## 8. Resumo Final do Plano de Ação (Checklist de Execução)
Este é o resumo consolidado de tudo o que desenhamos. Siga esta ordem para garantir uma construção sólida:
### Fase 1: Infraestrutura e Segurança
 * [ ] **Deep Linking:** Configurar o protocolo seuapp:// no Electron.
 * [ ] **Autenticação Supabase:** Implementar Login Social (Navegador) e Email/Senha (Interno).
 * [ ] **Persistência de Sessão:** Salvar tokens de forma segura no disco para login offline.
### Fase 2: Camada de Dados Offline-First
 * [ ] **SQLite Relacional:** Migrar do JSON para better-sqlite3 com tabelas normalizadas.
 * [ ] **Sync Engine:** Criar a lógica de "Dirty Flags" para sincronizar dados locais com o Supabase quando a internet voltar.
 * [ ] **Asset Cache:** Implementar o download automático de avatares de usuários para o HD local.
### Fase 3: Colaboração e UX Profissional
 * [ ] **Real-time (Presence):** Exibir quem está online em cada workspace na árvore de arquivos.
 * [ ] **Concorrência (Yjs):** Adicionar suporte a edições simultâneas sem conflitos.
 * [ ] **Purga de Dados:** Garantir que dados de nuvem sejam deletados ao deslogar, mantendo apenas os dados locais.
### Fase 4: Governança e Negócio
 * [ ] **Tabelas de Planos:** Estruturar limites de workspaces e membros.
 * [ ] **Paywalls:** Adicionar bloqueios na interface baseados no plano do usuário.
## 10. Consideração Final: Princípios de Manutenção
Para que este sistema não se torne um "monstro" difícil de cuidar:
 1. **Logs:** Implemente um sistema de logs simples no Electron para debugar falhas de sincronização.
 2. **Testes de Conexão:** O app deve ser resiliente a trocas rápidas de rede (ex: Wi-Fi para 4G).
 3. **Modularização:** Mantenha a lógica do Supabase e do SQLite em arquivos separados, para que o seu Zustand apenas chame um "DataProvider" genérico.
Com este plano, você tem em mãos o projeto de um software extremamente robusto, que resolve o problema do usuário (API Client), oferece performance (Offline-First) e já nasce preparado para ser um negócio (SaaS).
**Deseja que eu detalhe o script SQL inicial para a criação dessas tabelas de planos e workspaces, ou prefere focar em alguma das fases específicas da checklist?**