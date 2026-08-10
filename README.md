# Sistema de Gerenciamento de Oportunidades & Landing Pages Dinâmicas

Sistema web completo para gestão de recrutamento e seleção, com painel administrativo privado e landing pages públicas dinâmicas de alta conversão para oportunidades de trabalho.

---

## 🚀 Tecnologias Utilizadas

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Estilização**: Tailwind CSS + Lucide Icons + Google Fonts (Inter)
- **Banco de Dados & ORM**: Prisma ORM v5.22.0 (Postgres via Vercel Storage/Neon, mesmo banco em desenvolvimento e produção)
- **Autenticação**: Cookies HTTP-Only com JWT (`jose`), senhas com hash (`bcryptjs`)
- **Validação & Segurança**: Zod, proteção de rotas via Middleware Next.js
- **Exportação de Dados**: Geração de CSV compatível com Excel (UTF-8 BOM)

---

## 📋 Funcionalidades Principais

### PARTE 1 - Painel Administrativo (`/admin`)
- **Autenticação & Controle de Acesso**:
  - Login seguro por e-mail e senha.
  - Níveis de Acesso:
    - `ADMIN`: Visualiza todas as oportunidades, todos os candidatos e gerencia usuários do sistema.
    - `RECRUITER`: Visualiza apenas as oportunidades atribuídas a ele e seus respectivos candidatos.
- **Gerenciamento de Oportunidades**:
  - Cadastro completo: Título, Empresa, Localização (Remoto/Presencial), Tipo de contratação (CLT, PJ, Temporário, etc.), Descrição, Requisitos e Salário (opcional).
  - Geração automática de URL amigável e única (ex: `/oportunidade/desenvolvedor-frontend-sp-8f3a`).
  - Botão de **Copiar Link** da Landing Page em 1 clique com notificação de confirmação.
  - Alternância instantânea de status (Ativar/Desativar oportunidade).
- **Gerenciamento de Candidatos**:
  - Filtros dinâmicos por Oportunidade e por Status (`Novo`, `Em análise`, `Entrevista agendada`, `Aprovado`, `Rejeitado`).
  - Busca por nome do candidato ou telefone/WhatsApp.
  - Modal com detalhes e área para **notas internas do RH**.
  - Exportação direta da lista filtrada para **CSV/Excel**.
  - **Dashboard com Métricas**: Total de oportunidades ativas, candidatos cadastrados, média por oportunidade e lista de inscrições recentes.
- **Gerenciamento de Usuários (Apenas Admin)**:
  - Cadastro de recrutadores/admins com atribuição visual de oportunidades específicas.

### PARTE 2 - Landing Page Pública (`/oportunidade/[slug]`)
- **Página Dinâmica da Oportunidade**:
  - Design moderno, responsivo (Mobile First) e otimizado para rápido carregamento (tráfego de anúncios Meta/Instagram Ads).
  - Exibição de todos os dados cadastrados no painel.
  - Botão destacado: **"Quero me candidatar"**.
  - Tratamento para oportunidades desativadas: Exibe aviso de *"Oportunidade encerrada"*.
- **Formulário de Candidatura**:
  - Campos: Nome completo e WhatsApp com DDD (máscara dinâmica `(XX) XXXXX-XXXX` e validação).
  - Tela de confirmação com mensagem personalizada:
    > *"Recebemos seu interesse! Nossa equipe entrará em contato pelo WhatsApp em até 24 horas."*
- **Regras de Negócio e Segurança RH**:
  - ❌ NÃO exibe número nem link direto de WhatsApp do RH na página.
  - ❌ NÃO envia mensagens automáticas à pessoa candidata.
  - ✅ O fluxo é 100% controlado pelo recrutador dentro do painel administrativo.

---

## 🗄️ Estrutura do Banco de Dados (Prisma Schema)

O esquema do banco de dados possui 3 coleções/tabelas principais:

### 1. `User` (Usuários do Sistema)
- `id`: String (`cuid()`) - Chave primária
- `name`: String - Nome do usuário
- `email`: String (Único) - E-mail de login
- `passwordHash`: String - Senha criptografada com `bcryptjs`
- `role`: Enum (`ADMIN` | `RECRUITER`) - Nível de permissão
- `active`: Boolean - Se o usuário tem permissão de login
- `createdAt` / `updatedAt`: Data de criação e atualização

### 2. `Job` (Oportunidades)
- `id`: String (`cuid()`) - Chave primária
- `title`: String - Título da oportunidade
- `slug`: String (Único) - Identificador amigável da URL pública
- `company`: String - Nome da empresa contratante
- `location`: String - Localização ou "Remoto"
- `type`: String - Tipo de contratação (CLT, PJ, etc.)
- `description`: String - Descrição detalhada
- `requirements`: String - Requisitos e qualificações
- `salary`: String (Opcional) - Faixa salarial
- `active`: Boolean - Status (`true` = ativa na LP; `false` = encerrada)
- `viewsCount`: Int - Quantidade de visualizações na Landing Page
- `createdById`: String - FK para o usuário criador
- `assignedUsers`: Relação n:n com `User` (Recrutadores responsáveis)

### 3. `Candidate` (Inscrições de Candidatos)
- `id`: String (`cuid()`) - Chave primária
- `name`: String - Nome completo do candidato
- `whatsapp`: String - Telefone/WhatsApp formatado com DDD
- `notes`: String (Opcional) - Notas internas adicionadas pelo RH
- `status`: Enum (`NOVO`, `EM_ANALISE`, `ENTREVISTA`, `APROVADO`, `REJEITADO`)
- `createdAt`: DateTime - Data e hora da inscrição
- `jobId`: String - FK para a Oportunidade correspondente

---

## ⚡ Como Configurar e Rodar Localmente

### 1. Requisitos Prévios
- **Node.js** v18+ instalado
- **npm** v9+ instalado

### 2. Clonar ou Acessar a Pasta do Projeto
```bash
cd painel-vagas
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar Variáveis de Ambiente
O projeto usa Postgres (Neon, via Vercel Storage) tanto em produção quanto em desenvolvimento local. Puxe as credenciais do projeto Vercel (rode no seu próprio terminal, não em ferramentas de terceiros):
```bash
npx vercel env pull .env.vercel --environment=production
```
Copie `POSTGRES_PRISMA_URL` e `POSTGRES_URL_NON_POOLING` desse arquivo para o seu `.env` (veja `.env.example` para o formato completo):
```env
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
JWT_SECRET="sua-chave-secreta-super-segura-rh-vagas-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3005"
```

### 5. Criar o Banco de Dados e Executar o Seed (Primeiro Usuário Admin)
Rode o comando de inicialização:
```bash
npm run setup:db
```

> 🔑 **Credenciais Criadas Automaticamente:**
> - **Admin**: E-mail `admin@empresa.com` | Senha `admin123`
> - **Recrutador**: E-mail `recrutador@empresa.com` | Senha `recrutador123`

### 6. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Abra o navegador em:
- **Painel Administrativo**: [http://localhost:3005/admin/login](http://localhost:3005/admin/login)
- **Exemplo de Landing Page Pública**: [http://localhost:3005/oportunidade/desenvolvedor-frontend-react-nextjs-sp-01](http://localhost:3005/oportunidade/desenvolvedor-frontend-react-nextjs-sp-01)

### 7. Alterando o Schema do Banco (`prisma/schema.prisma`)
O projeto usa **Prisma Migrate** com migrations versionadas em `prisma/migrations/` (commitadas no git). Sempre que alterar o schema:
```bash
npm run migrate:dev
```
Isso cria uma nova migration revisável e aplica no seu `dev.db` local. Nunca use `prisma db push` no dia a dia — ele não deixa histórico e pode ser destrutivo.

Para o processo de deploy em produção (Vercel + Postgres), incluindo o passo a passo seguro para não perder dados reais, veja **[DEPLOY.md](./DEPLOY.md)**.
