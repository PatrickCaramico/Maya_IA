# Maya — Trick Gamer 112

Sistema operacional de produção de conteúdo do canal, baseado na especificação `MAYA_SistemaOperacional_V4.2.md`.

## Estrutura do projeto

```
src/        → frontend (React + Vite + TypeScript)
server/     → backend seguro (Node + Express) — guarda a chave de API
```

## Como rodar localmente

Você precisa rodar **duas coisas ao mesmo tempo**: o frontend (Vite) e o backend seguro (Express). São dois terminais separados.

### 1. Instalar dependências (uma vez só)

```bash
npm install
```

### 2. Configurar a chave de API do backend

```bash
cp server/.env.example server/.env
```

Abra `server/.env` e cole sua chave real da Anthropic em `ANTHROPIC_API_KEY`. Esse arquivo já está no `.gitignore` — ele nunca deve ser enviado pro GitHub.

### 3. Rodar o backend (terminal 1)

```bash
npm run server
```

Isso sobe o servidor seguro em `http://localhost:8787`. Ele é quem realmente conversa com a API da Anthropic — sua chave nunca aparece no navegador.

### 4. Rodar o frontend (terminal 2)

```bash
npm run dev
```

Abre em `http://localhost:5173`. O Vite já está configurado para redirecionar as chamadas `/api/...` para o backend na porta 8787 (veja `vite.config.ts`).

### 5. Configurar a Maya para usar o backend

Dentro do site, abra **Configurações → Motor de Inteligência Artificial** e escolha **"Backend Seguro (Recomendado)"**. Deixe a URL como `/api`. Pronto — a partir daí a Maya usa a IA de verdade, com a chave protegida no servidor.

> Se não configurar nada, a Maya funciona no **Motor Simulado**, sem precisar de chave nem do backend — bom para testar a navegação entre etapas sem gastar créditos de API.

## Build de produção

```bash
npm run build
```

Gera os arquivos estáticos do frontend em `dist/`. O backend (`server/`) precisa ser publicado separadamente (Railway, Render, Fly.io, um VPS, etc.) — ele não faz parte do build do Vite. Em produção, ajuste `ALLOWED_ORIGIN` no `.env` do servidor para o domínio real do site, e aponte `backendUrl` nas Configurações da Maya para a URL pública do backend.

## Documentação completa

- `MAYA_SistemaOperacional_V4.2.md` — especificação de comportamento (etapas, estados, Consciência)
- `MAYA_Documentacao_Implementacao.md` — arquitetura, modelagem de dados e identidade visual
