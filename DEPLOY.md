# Deploy em Produção (VPS)

## Regra de ouro

**Nunca rode `prisma db push` ou `prisma migrate dev` em produção.** Esses comandos comparam o schema com o banco e podem alterar/recriar tabelas para "sincronizar", o que pode apagar dados. Em produção, o único comando permitido é:

```bash
npm run migrate:deploy
```

Ele apenas aplica as migrations novas (arquivos SQL já revisados em `prisma/migrations/`) e nunca reseta ou recria o que já existe.

---

## Fluxo ao alterar o schema (sempre local, nunca direto na VPS)

1. Edite `prisma/schema.prisma`.
2. Rode:
   ```bash
   npm run migrate:dev
   ```
   Isso cria uma nova pasta versionada em `prisma/migrations/<timestamp>_nome/migration.sql` e aplica no seu `dev.db` local. Se a mudança puder causar perda de dados (ex: remover uma coluna com valores), o Prisma avisa **antes** de aplicar — pare e avalie nesse momento, não force.
3. Revise o SQL gerado (arquivo `migration.sql`) — é isso que vai rodar na produção.
4. Faça commit da pasta `prisma/migrations/` junto com o `schema.prisma`. Isso é o "versionamento" dos commits: cada mudança de banco vira um arquivo rastreável no git, na ordem certa.

---

## Primeiro deploy na VPS

1. `git clone` do repositório na VPS.
2. Crie o `.env` de produção (nunca é commitado — veja `.env.example`):
   ```env
   DATABASE_URL="file:./prisma/prod.db"
   JWT_SECRET="<gere um segredo forte, diferente do de desenvolvimento>"
   NEXT_PUBLIC_APP_URL="https://seu-dominio.com.br"
   ```
   Use um nome de arquivo diferente do `dev.db` (ex: `prod.db`) para nunca confundir os dois ambientes.
3. `npm install`
4. `npm run migrate:deploy` — cria todas as tabelas do zero a partir do histórico de migrations.
5. (Opcional, só na primeira vez, banco ainda vazio) `npm run db:seed` para criar o usuário Admin inicial. **Não rode isso em um banco que já tem candidatos/vagas reais** — ele foi feito para popular um ambiente vazio.
6. `npm run build`
7. Suba o processo (PM2, systemd, screen/tmux — o que vocês já usam para manter o `npm start` no ar).

---

## Deploys seguintes (a cada atualização via `git pull`)

1. **Backup antes de tudo:**
   ```bash
   cp prisma/prod.db prisma/prod.db.backup-$(date +%Y%m%d%H%M%S)
   ```
2. `git pull`
3. `npm install` (só se o `package.json` mudou)
4. `npm run migrate:deploy` — aplica somente as migrations novas; não toca no que já existe
5. `npm run build`
6. Reinicie o processo Node

Se algo der errado depois do `migrate:deploy`, o backup do passo 1 permite restaurar o arquivo `.db` anterior e investigar com calma.

---

## Se uma mudança de schema for destrutiva

Se o `migrate:dev` avisar sobre perda de dados (ex: apagar uma coluna que tem valores), prefira quebrar em duas migrations em vez de uma só:

1. Uma migration que só adiciona o novo campo (nullable ou com default).
2. Um passo separado (script ou manual) para migrar/copiar os dados existentes para o novo formato.
3. Só depois, uma migration final removendo o campo antigo.

Isso evita perder informação de candidatos e vagas já cadastrados em produção.
