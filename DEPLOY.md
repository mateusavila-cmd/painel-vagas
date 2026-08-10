# Deploy em Produção (Vercel + Postgres/Neon)

## Arquitetura

- **Hospedagem**: Vercel (deploy automático a cada push no branch de produção)
- **Banco de dados**: Postgres gerenciado pela Vercel (Neon por baixo dos panos)
- **Migrations**: Prisma Migrate, versionadas em `prisma/migrations/` e commitadas no git

## Regra de ouro

**Nunca rode `prisma db push` ou `prisma migrate dev` contra o banco de produção.** O único comando que deve tocar produção é:

```bash
npx prisma migrate deploy
```

Ele só aplica as migrations novas (arquivos SQL já revisados em `prisma/migrations/`) e nunca reseta ou recria o que já existe.

---

## Como o deploy funciona

O script `build` do `package.json` já inclui a aplicação das migrations:

```json
"build": "prisma generate && prisma migrate deploy && next build"
```

Ou seja: **todo deploy na Vercel (`git push` no branch de produção) aplica automaticamente as migrations pendentes antes de compilar o Next.js.** Não precisa rodar nada manualmente para migrar o banco em produção — só precisa ter feito o passo abaixo antes de dar push.

⚠️ **Atenção a Preview Deployments**: se os Preview Deployments (branches/PRs) estiverem configurados para usar o mesmo banco de Production (verifique em Vercel → Storage → seu Postgres → Projects conectados), qualquer branch com uma migration nova vai aplicá-la no banco de produção ao gerar o preview, mesmo antes do merge. Se isso for um risco, crie um banco de Preview separado (Neon suporta branches de banco) ou desative migrations automáticas em preview.

---

## Variáveis de ambiente necessárias

Já configuradas no projeto Vercel automaticamente quando o Postgres foi criado (Storage → Postgres):

- `POSTGRES_PRISMA_URL` — conexão via pooler (pgbouncer), usada em runtime pela aplicação
- `POSTGRES_URL_NON_POOLING` — conexão direta, usada pelo Prisma Migrate

Além dessas, defina manualmente em Vercel → Settings → Environment Variables:

- `JWT_SECRET` — um segredo forte, **diferente** do usado em desenvolvimento local
- `NEXT_PUBLIC_APP_URL` — a URL pública do domínio em produção

## Ambiente local (desenvolvimento)

Para desenvolver localmente apontando para o mesmo Postgres:

```bash
npx vercel env pull .env.vercel --environment=production
```

Copie as linhas `POSTGRES_PRISMA_URL` e `POSTGRES_URL_NON_POOLING` desse arquivo para o seu `.env` (veja `.env.example`). Rode esse comando no **seu próprio terminal**, fora de qualquer sessão de agente/sandbox — connection strings de banco são segredos e não devem transitar por ferramentas que possam registrá-las em log.

---

## Fluxo ao alterar o schema

1. Edite `prisma/schema.prisma`.
2. Rode localmente:
   ```bash
   npm run migrate:dev
   ```
   Isso cria uma nova pasta versionada em `prisma/migrations/<timestamp>_nome/migration.sql` e aplica no banco apontado pelo seu `.env` local. Se a mudança puder causar perda de dados (ex: remover uma coluna com valores), o Prisma avisa **antes** de aplicar — pare e avalie, não force.
3. Revise o SQL gerado — é isso que vai rodar em produção no próximo deploy.
4. Faça commit da pasta `prisma/migrations/` junto com o `schema.prisma` e dê push. O deploy da Vercel aplica a migration automaticamente (ver seção acima).

---

## Se uma mudança de schema for destrutiva

Se o `migrate:dev` avisar sobre perda de dados (ex: apagar uma coluna que tem valores), prefira quebrar em duas migrations em vez de uma só:

1. Uma migration que só adiciona o novo campo (nullable ou com default).
2. Um passo separado (script ou manual) para migrar/copiar os dados existentes para o novo formato.
3. Só depois, uma migration final removendo o campo antigo.

## Seed de dados (`npm run db:seed`)

O `prisma/seed.ts` **apaga todos os usuários, vagas e candidatos antes de recriar os dados de demonstração**. É seguro rodar apenas uma vez, logo após criar o banco (para ter o primeiro usuário Admin). **Nunca rode em um banco de produção que já tem candidatos/vagas reais** — ele vai apagá-los.

## Backup

Bancos gerenciados (Neon/Vercel Postgres) fazem backup automático point-in-time, mas antes de qualquer migration arriscada em produção vale exportar um dump manual pelo dashboard da Vercel/Neon como segurança extra.
