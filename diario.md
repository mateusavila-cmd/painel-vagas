# 📔 Diário de Desenvolvimento e Registro de Decisões - Painel de Oportunidades RH

## 1. Escopo e Objetivos do Projeto

O objetivo deste projeto foi desenvolver um sistema web completo, moderno e de alta performance para gerenciamento de processos seletivos e captação rápida de candidatos através de landing pages dinâmicas.

### O sistema é composto por duas partes principais:
1. **Painel Administrativo Privado (`/admin`)**:
   - Autenticação e controle de acesso baseado em funções (`ADMIN` vs `RECRUITER`).
   - Gerenciamento de oportunidades (criação, edição, ativação/desativação e geração de links).
   - Gerenciamento de candidatos (filtros por oportunidade/status, busca por nome/telefone, notas internas privadas e exportação em CSV/Excel).
   - Dashboard com estatísticas e métricas de conversão.
   - Gestão de usuários e permissões (exclusivo para perfil Admin).
2. **Landing Pages Dinâmicas Públicas (`/oportunidade/[slug]`)**:
   - Páginas de alta conversão otimizadas para tráfego pago (Instagram/Meta Ads).
   - Layout responsivo (mobile-first).
   - Modal de candidatura rápida com máscara de WhatsApp e validação.
   - Respeito rigoroso à regra de negócio: NENHUM número de WhatsApp ou link direto do RH é exibido publicamente.

---

## 2. Arquitetura e Tecnologias Escolhidas

- **Next.js 14 (App Router)** + **TypeScript**: Permite suporte nativo a rotas dinâmicas, renderização no lado do servidor (SSR) para SEO e alta performance.
- **Tailwind CSS + Lucide Icons**: Estilização moderna e responsiva com micro-animações e componentes reutilizáveis.
- **Prisma ORM v5.22.0 + SQLite**: Banco de dados SQLite armazenado localmente em `prisma/dev.db` (fácil de rodar sem dependências pagas externas) com facilidade de migração para PostgreSQL/Supabase.
- **Autenticação JWT (`jose`) & `bcryptjs`**: Sessão baseada em cookies HTTP-Only e criptografia de senhas.
- **Zod**: Validação estrita de esquemas no frontend e nas APIs REST.

---

## 3. Linha do Tempo de Desenvolvimento

### Etapa 1: Planejamento & Arquitetura
- Criação da estrutura de pastas, configuração do TypeScript, Tailwind CSS e criação do `implementation_plan.md`.

### Etapa 2: Modelagem e Banco de Dados
- Criação das entidades `User`, `Job` e `Candidate` no `prisma/schema.prisma`.
- Desenvolvimento do script de seed (`prisma/seed.ts`) com conta Admin inicial (`admin@empresa.com` / `admin123`) e oportunidades de demonstração.

### Etapa 3: Desenvolvimento da API REST & Autenticação
- Rotas de login (`/api/auth/login`), logout e validação de sessão.
- Endpoints de CRUD para Oportunidades, Candidatos, Exportação CSV e Usuários.
- Implementação do `middleware.ts` para proteção das rotas do painel admin.

### Etapa 4: Interfaces do Painel Administrativo
- Login glassmorphism.
- Dashboard estatístico com indicadores e atalhos.
- Gestão de Oportunidades com botão de copiar link em 1 clique (Toast feedback).
- Gestão de Candidatos com alteração de status inline e modal de notas privadas.
- Gestão de Usuários e atribuição flexível de oportunidades.

### Etapa 5: Landing Page Pública
- Renderização dinâmica em `/oportunidade/[slug]`.
- Form Modal de candidatura com máscara `(XX) XXXXX-XXXX`.
- Tela de confirmação com a mensagem solicitada.
- Suporte visual para Oportunidades Encerradas.

### Etapa 6: Refatoração Visual "Midnight Aurora" — Landing do Prestador (07/08/2026)
- Intervenção **100% visual** na `PublicLandingPrestador.tsx` e no `CandidateFormModal.tsx`: nenhum texto do copy foi alterado (validado por script comparando 57 strings semeadas contra o HTML renderizado) e nenhuma lógica de backend foi criada.
- Atmosfera fixa imersiva: auroras em deriva lenta (`animate-drift-a/b`), grid tecnológico com máscara, grain cinematográfico (SVG inline) e hairlines luminosas na navbar/footer.
- Tipografia de display **Sora** (`next/font/google`, variável `--font-display`) aplicada em títulos e CTAs; Inter mantido no corpo.
- Microinterações: `card-sheen` (varredura de luz no hover), orbes de cor por card, scroll-reveal (`IntersectionObserver` + classes `.reveal`), halo pulsante (`animate-ping-slow`) nos CTAs e nós numerados, `border-beam` (borda cônica rotativa via `@property`) no CTA final.
- Mobile-first: "Como funciona" virou timeline vertical no mobile (conectores em gradiente), barra CTA fixa com safe-area e touch targets ≥ 52px; `prefers-reduced-motion` desativa todas as animações decorativas.
- Paleta de conversão preservada: fundo slate-950 + azul corporativo, CTAs âmbar→laranja com `shadow-cta`/`shadow-cta-lg` e glow pulsante.

---

## 4. Registro de Erros Ocorridos e Soluções (Troubleshooting)

### 🚨 Erro 1: Erro de Permissão no Terminal Windows (`opening NUL for ACL write: Access is denied`)
- **Ocorrência**: Ao tentar rodar comandos assíncronos diretamente pelo agente no terminal host Windows.
- **Causa**: Restrições de ACL de sistema no ambiente host ao tentar redirecionar a saída para `NUL`.
- **Solução**: Criou-se o script Node.js `scripts/setup-db.js` (`npm run setup:db`), orientando a execução direta pelo terminal do próprio usuário.

---

### 🚨 Erro 2: Conflito de Porta e Servidor Inacessível (`ERR_CONNECTION_REFUSED`)
- **Ocorrência**: Ao tentar acessar o sistema no navegador, este exibia `ERR_CONNECTION_REFUSED`.
- **Causa**: A porta 3000 estava sendo utilizada por outro processo na máquina e o servidor dev ainda não havia sido iniciado no terminal.
- **Solução**:
  1. Alterou-se o `package.json` para rodar na porta **`3005`**:
     ```json
     "dev": "next dev -p 3005",
     "start": "next start -p 3005"
     ```
  2. Atualizaram-se as variáveis de ambiente `.env` (`NEXT_PUBLIC_APP_URL="http://localhost:3005"`) e a documentação.

---

### 🚨 Erro 3: Incompatibilidade de Versões do Prisma CLI
- **Ocorrência**: Mensagem `Command failed: npx prisma generate` durante a execução do setup.
- **Causa**: Incompatibilidade entre a versão global do Prisma (5.22.0) e a versão local declarada no `package.json` (5.10.2).
- **Solução**: Atualizou-se o `package.json` para fixar `@prisma/client: ^5.22.0` e `prisma: ^5.22.0`.

---

### 🚨 Erro 4: Incompatibilidade de Enum no Prisma com Conector SQLite (`Error Code P1012`)
- **Ocorrência**: Ao executar `npx prisma db push`, o Prisma retornou:
  > *`Error validating: You defined the enum Role / CandidateStatus. But the current connector does not support enums.`*
- **Causa**: O conector `sqlite` do Prisma não possui suporte a blocos `enum` nativos do schema (recurso disponível em PostgreSQL/MySQL).
- **Solução**:
  1. Atualizou-se o `prisma/schema.prisma`, substituindo os blocos `enum` por campos do tipo `String` com valores padrão (`"RECRUITER"` e `"NOVO"`).
  2. Mantiveram-se os tipos em TypeScript e validações Zod no código da aplicação, garantindo segurança de tipos sem quebrar a migração do banco SQLite.

---

### 🔄 Alteração Solicitada: Substituição Global do Termo "Vaga" por "Oportunidade"
- **Ocorrência**: Solicitação para remover referências ao termo "vaga" em todo o sistema.
- **Ações Realizadas**:
  1. Alteração de todos os títulos, botões, tabelas, modais, headers e sidebars para usar "Oportunidade / Oportunidades".
  2. Atualização das rotas públicas para `/oportunidade/[slug]`, com redirecionamento mantido em `/vaga/[slug]`.
  3. Atualização dos cabeçalhos do CSV e arquivos de documentação (`README.md` e `walkthrough.md`).

### 🛠️ Correção de Tipos Pré-existentes (07/08/2026)
- **Ocorrência**: `next build` falhava com dois erros de tipagem anteriores à Etapa 6: `dashboard/page.tsx:166` (StatusBadge recebendo `string`) e `api/auth/login/route.ts:44` (`role: string` incompatível com `'ADMIN' | 'RECRUITER'`).
- **Causa**: consequência da migração enum→String do SQLite (Erro 4 acima) — o Prisma devolve `string` nesses campos.
- **Solução**: ajustes puramente de tipos, sem mudança de comportamento: `StatusBadge` passou a aceitar `(string & {})` (casos fora do switch já retornavam `null`) e o login usa `user.role as UserSessionPayload['role']`.

### 🚨 Erro 5: Travamento do PC deixou cache `.next` corrompido e servidor dev quebrado (07/08/2026)
- **Ocorrência**: após o computador travar no meio de uma sessão, a landing `/oportunidade/[slug]` retornava HTTP 500 com `Cannot find module './vendor-chunks/lucide-react.js'`, e `npm run build` falhava com `EPERM` ao renomear a DLL do Prisma.
- **Causa**: o travamento interrompeu a escrita do cache de build (`.next`), e o servidor dev sobrevivente (porta 3005) segurava o lock da `query_engine-windows.dll.node`.
- **Solução**:
  1. Encerrar o servidor dev órfão (identificado via `netstat -ano | findstr :3005`).
  2. Remover o cache `.next` corrompido (regenerável).
  3. Reiniciar com `npm run dev`.
- **Verificação**: `next build` completo (18 rotas, tipos OK) e páginas CLT e PRESTADOR respondendo HTTP 200 com o design da Etapa 6 renderizado. **Nenhum código-fonte foi alterado — a Etapa 6 sobreviveu intacta ao travamento.**

### 🚨 Erro 6: Texto claro ilegível no navegador do cliente (fundos claros sob texto claro) (07/08/2026)
- **Ocorrência**: no navegador do cliente, seções da Landing do Prestador renderizavam com fundo claro e texto branco ilegível, persistindo em aba anônima e com hard refresh. Em renderização headless limpa o problema não se reproduzia.
- **Diagnóstico (refinado em duas etapas)**:
  1. Primeiro suspeitou-se do `backdrop-filter` (seções com `backdrop-blur` claras vs. hero escuro): removeu-se o blur de todas as superfícies de conteúdo e as seções alternadas ganharam fundo escuro próprio (`bg-slate-900/40`). Corrigiu as seções com blur, mas as seções **transparentes** (ex.: "Como funciona") continuaram claras.
  2. Conclusão real: no navegador/GPU do cliente, o `background` do elemento raiz (`bg-slate-950`) não é amostrado por trás de conteúdo transparente quando há layer `position: fixed` + `overflow-x-clip` no mesmo contexto — áreas sem fundo próprio exibiam o canvas claro.
- **Solução (100% CSS, copy intacto)**:
  1. Atmosfera movida de `fixed` na raiz para `absolute` **dentro do `<main>`** (mesmo contexto de composição do conteúdo).
  2. `<main>` (estado ativo e encerrado) recebeu fundo próprio `bg-slate-950` — nenhuma seção depende mais de o fundo da raiz "vazar" por transparência.
  3. Mantido do passo anterior: sem `backdrop-blur` em seções/cards/chips (as bases translúcidas agora compõem sobre fundo escuro local); navbar/footer/barra mobile/painel do CTA final conservam blur com bases escuras 80–90%.
- **Verificação**: screenshot headless com análise de pixels — todas as seções com luminância 6–23 (escuras), atmosfera preservada. Aguardando confirmação visual no navegador do cliente.

---

## 5. Como Executar o Projeto Atualizado

No terminal da sua máquina:

```bash
cd c:\Users\mateu\.gemini\antigravity-ide\scratch\painel-vagas
npm install
npm run setup:db
npm run dev
```

Acesse no navegador:
- 🔒 **Painel RH**: [http://localhost:3005/admin/login](http://localhost:3005/admin/login)
  - Admin: `admin@empresa.com` (Senha: `admin123`)
  - Recrutador: `recrutador@empresa.com` (Senha: `recrutador123`)
- 🚀 **Landing Page**: [http://localhost:3005/oportunidade/desenvolvedor-frontend-react-nextjs-sp-01](http://localhost:3005/oportunidade/desenvolvedor-frontend-react-nextjs-sp-01)
