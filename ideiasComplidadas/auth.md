Para o seu projeto Electron + Vite + React com requisitos de autenticação social (Google/GitHub), funcionamento offline e sincronização de dados entre dispositivos com suporte a equipes, a arquitetura ideal é uma abordagem **Local-First**.

Aqui está o roteiro técnico e as tecnologias recomendadas para implementar isso:

### 1. Stack Tecnológica Recomendada

- **Backend & Auth:** [Supabase](https://supabase.com/). Ele já resolve Google/GitHub OAuth, criação de contas por e-mail e possui um sistema de permissões robusto (RLS - Row Level Security) para as equipes.
- **Sincronização Offline-First:** [PowerSync](https://www.powersync.com/) ou [RxDB](https://rxdb.info/).
  - **PowerSync** é excelente se você quer manter o modelo SQL (SQLite local sincronizado com Postgres no Supabase). Ele cuida de toda a complexidade de "sincronizar quando houver internet".
  - **Banco de Dados Local:** SQLite (via `better-sqlite3` no processo Main do Electron).

  ***

### 2. Implementando Autenticação Social no Electron

O maior desafio no Electron é o redirecionamento após o login no browser. Você deve usar **Deep Linking** (Protocolos Customizados).

#### Passo A: Registrar o protocolo no `main.js` (ou `index.ts`)

````javascript
import { app, shell } from 'electron';
import path from 'path';

// Registrar o protocolo (ex: meu-app://)
if (process.defaultApp) {
if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('meu-app', process.execPath, [path.resolve(process.argv[1])]);
}
} else {
    app.setAsDefaultProtocolClient('meu-app');
}

// Lidar com o link vindo do browser (Windows/Linux)
app.on('second-instance', (event, commandLine) => {
    const url = commandLine.pop();
    if (url) handleAuthCallback(url);
});

// Lidar com o link vindo do browser (macOS)
app.on('open-url', (event, url) => {
    handleAuthCallback(url);
});
````

#### Passo B: Configurar o Supabase
No dashboard do Supabase, em **Authentication > URL Configuration**, adicione o seu protocolo como um link permitido:
*   `meu-app://auth-callback`

No seu código React, ao chamar o login:
```javascript
    const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
        options: {
            redirectTo: 'meu-app://auth-callback',
        },
    });
```

---

### 3. Sincronização e Uso Offline (PowerSync)
O PowerSync criará uma cópia local do banco de dados (SQLite) no PC do usuário.
1.  **Offline:** O usuário lê e grava no SQLite local instantaneamente.
2.  **Online:** O PowerSync detecta a conexão e envia as mudanças para o Supabase e baixa atualizações de outros PCs.
3.  **Histórico:** Como os dados estão no Supabase vinculados ao `user_id`, ao logar em outro PC, o PowerSync baixa automaticamente todo o histórico.

---

### 4. Funcionalidade de Equipes e Coleções
Para permitir que equipes colaborem, você deve estruturar o banco de dados no Supabase usando **Row Level Security (RLS)**.

#### Estrutura de Tabelas Sugerida:
*   `profiles`: Dados do usuário.
*   `teams`: `id`, `name`, `owner_id`.
*   `team_members`: `team_id`, `user_id`, `role` (admin, editor, viewer).
*   `collections`: `id`, `team_id` (opcional), `user_id`, `data`.

#### Exemplo de Regra RLS (PostgreSQL):
Esta regra permite que um usuário veja uma coleção apenas se ele for dono dela **ou** se ele pertencer à equipe vinculada àquela coleção:
```sql
CREATE POLICY "Usuários podem ver coleções da sua equipe"
ON collections
FOR SELECT
USING (
    auth.uid() = user_id OR
    team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
);
```

### 5. Resumo do Fluxo de Trabalho
1.  **Início:** O usuário abre o app. Se não houver internet, ele usa os dados cacheados localmente.
2.  **Login:** O app abre o navegador padrão para Google/GitHub. Após o sucesso, o navegador chama `meu-app://auth-callback?session=...`. O Electron captura isso e faz o login.
3.  **Equipes:** O usuário cria uma equipe e "convida" outros usuários (adicionando o e-mail deles na tabela `team_members`).
4.  **Compartilhamento:** Ao mover uma "Coleção" para uma "Equipe", a coluna `team_id` é preenchida. Graças ao PowerSync, todos os membros dessa equipe receberão essa coleção em seus respectivos PCs automaticamente na próxima vez que ficarem online.

### Dica de Performance com Vite:
Como o Electron tem dois processos (Main e Renderer), certifique-se de que as bibliotecas de banco de dados nativas (como `better-sqlite3`) sejam tratadas como `external` no seu arquivo `electron.vite.config.js` para evitar erros de compilação.
