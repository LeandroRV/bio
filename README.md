# bio

Portfólio pessoal estático de Leandro Ribeiro Vieira: HTML, CSS e JavaScript (módulos ES) com Supabase para o mural de recados, formulário de contato e contadores de cliques.

## Estrutura

```
index.html          marcação da página
assets/style/       CSS e guia de estilo
assets/images/      avatar e favicon
src/config.js       URL e chave pública (anon) do Supabase
src/utils.js        funções puras (esc, timeAgo, setBusy)
src/app.js          lógica da página e acesso ao Supabase
tests/              testes das funções puras
```

## Desenvolvimento

```bash
npm install
npm start          # http://localhost:8000
npm run lint       # ESLint
npm run format     # Prettier
npm test           # node:test
```

## Supabase

Tabelas: `guestbook`, `contact_messages`, `click_counters`; função RPC `increment_click`.

A chave `anon` em `src/config.js` é pública por design e não é um segredo. A proteção dos dados depende das políticas RLS de cada tabela, que devem ser revisadas no painel do Supabase.
