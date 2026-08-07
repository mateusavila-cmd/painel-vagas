import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Semeando o banco de dados com dados iniciais...')

  // Limpa banco de dados antes do seed em ambiente dev
  await prisma.candidate.deleteMany({})
  await prisma.job.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.landingContent.deleteMany({}) // cascade remove features/steps/testimonials/faqs

  // Criptografa senhas
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const recruiterPasswordHash = await bcrypt.hash('recrutador123', 10)

  // 1. Criar usuário Admin
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador Principal',
      email: 'admin@empresa.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      active: true,
    },
  })

  // 2. Criar usuário Recrutador de teste
  const recruiterUser = await prisma.user.create({
    data: {
      name: 'Juliana Recrutadora',
      email: 'recrutador@empresa.com',
      passwordHash: recruiterPasswordHash,
      role: 'RECRUITER',
      active: true,
    },
  })

  console.log(`✅ Usuário Admin criado: admin@empresa.com (Senha: admin123)`)
  console.log(`✅ Usuário Recrutador criado: recrutador@empresa.com (Senha: recrutador123)`)

  // 2.1 Conteúdo editável da Landing Page - Categoria CLT
  await prisma.landingContent.create({
    data: {
      category: 'CLT',
      heroSubtitle: 'Oportunidade CLT aberta em {empresa}',
      ctaHeaderLabel: 'Quero me candidatar',
      ctaPrimaryLabel: 'Quero me candidatar',
      ctaSecondaryLabel: 'Enviar Currículo / WhatsApp',
      sectionSobreTitle: 'Sobre a Oportunidade',
      sectionRequisitosTitle: 'Requisitos e Desejáveis',
      sectionBeneficiosTitle: 'Benefícios Oferecidos',
      resumoTitle: 'Resumo da Oportunidade',
      safetyNote: 'Processo seletivo seguro e direto com o RH',
      responseTimeTitle: 'Retorno Rápido',
      responseTimeText: 'Nossa equipe avalia todas as candidaturas e entra em contato via WhatsApp em até 24 horas úteis.',
      depoimentosTitle: 'O que dizem nossos colaboradores',
      faqTitle: 'Perguntas Frequentes',
      closedTitle: 'Oportunidade Encerrada',
      closedMessage: 'As candidaturas para a oportunidade de {cargo} na empresa {empresa} foram encerradas.',
      closedFooterNote: 'Agradecemos o interesse. Fique atento a novas oportunidades em nossos canais de recrutamento.',
      faqs: {
        create: [
          { question: 'Como funciona o processo seletivo?', answer: 'Nossa equipe analisa seu perfil e entra em contato pelo WhatsApp para os próximos passos, normalmente em até 24 horas úteis.', order: 0 },
          { question: 'Posso me candidatar a mais de uma oportunidade?', answer: 'Sim, você pode se candidatar a quantas oportunidades tiver interesse e perfil compatível.', order: 1 },
          { question: 'Preciso enviar currículo?', answer: 'Não é obrigatório neste primeiro contato. Nossa equipe solicita informações adicionais se necessário.', order: 2 },
        ],
      },
    },
  })

  // 2.2 Conteúdo editável da Landing Page - Categoria Prestador de Serviço
  await prisma.landingContent.create({
    data: {
      category: 'PRESTADOR',
      heroTitle: 'Aumente sua renda prestando serviços em {empresa}',
      heroSubtitle: '{cargo} com liberdade para escolher seus turnos. Cadastro simples, sem burocracia, com oportunidades de diária direto no seu WhatsApp.',
      heroBadgeLabel: 'Pagamento por diária',
      trustBadge1: '+5.000 diárias repassadas',
      trustBadge2: 'Acesso rápido a novos turnos',
      ctaHeaderLabel: 'Cadastrar meu perfil',
      ctaPrimaryLabel: 'Quero receber diárias no WhatsApp',
      ctaSecondaryLabel: 'Cadastrar meu perfil para diárias',
      vantagensTitle: 'Por que se cadastrar como parceiro?',
      comoFuncionaTitle: 'Como funciona a parceria',
      sobreTitle: 'Sobre a Rotina Operacional',
      preRequisitosTitle: 'Pré-requisitos para ativação',
      depoimentosTitle: 'Quem já é parceiro conta como é',
      faqTitle: 'Perguntas frequentes',
      ctaFinalTitle: 'Cadastro simples e rápido',
      ctaFinalSubtitle: 'Garanta seu perfil ativo para as próximas oportunidades de diária em {empresa}.',
      closedTitle: 'Cadastro Encerrado',
      closedMessage: 'As oportunidades de diária para {cargo} na {empresa} foram encerradas por enquanto.',
      closedFooterNote: 'Fique de olho em nossos canais para novas oportunidades de diária em breve.',
      features: {
        create: [
          { title: 'Transparência nos repasses', description: 'Visibilidade clara do valor de cada diária antes de você aceitar o turno.', order: 0 },
          { title: 'Liberdade de escolha', description: 'Aceite apenas os turnos e dias que fizerem sentido para a sua rotina.', order: 1 },
          { title: 'Grandes centros logísticos', description: 'Presença nos maiores pavilhões e centros de operação da região.', order: 2 },
          { title: 'Suporte ao parceiro', description: 'Equipe de suporte operacional disponível para te ajudar em campo.', order: 3 },
        ],
      },
      steps: {
        create: [
          { title: 'Cadastre seu perfil', description: 'Preencha seus dados em menos de 2 minutos, sem burocracia.', order: 0 },
          { title: 'Receba convites no WhatsApp', description: 'Fique de olho nas oportunidades de diária disponíveis para você.', order: 1 },
          { title: 'Preste o serviço e receba', description: 'Compareça no turno escolhido e receba o repasse referente à diária.', order: 2 },
        ],
      },
      testimonials: {
        create: [
          { name: 'Roberto S.', role: 'Parceiro de Operações', text: 'Consigo escolher os dias que quero trabalhar. O valor da diária fica claro antes de eu aceitar o turno.', order: 0 },
          { name: 'Adriana M.', role: 'Parceira de Operações', text: 'Cadastro foi rápido e em poucos dias já recebi meu primeiro convite de diária pelo WhatsApp.', order: 1 },
          { name: 'Everton L.', role: 'Parceiro de Operações', text: 'Uso pra complementar minha renda nos dias de folga. O repasse é sempre no valor combinado.', order: 2 },
        ],
      },
      faqs: {
        create: [
          { question: 'Preciso ter experiência prévia?', answer: 'Não é obrigatório. A maioria das rotinas operacionais tem treinamento rápido no local no início do turno.', order: 0 },
          { question: 'Como escolho meus dias e turnos para prestação de serviço?', answer: 'Após a ativação do seu cadastro, você recebe os convites de diárias disponíveis pelo WhatsApp e escolhe apenas os turnos que fizerem sentido para você.', order: 1 },
          { question: 'Como funciona o cadastro e ativação do meu perfil?', answer: 'Você preenche seus dados básicos neste formulário. Nossa equipe entra em contato pelo WhatsApp para concluir a ativação do seu cadastro.', order: 2 },
          { question: 'Posso prestar serviço em mais de um turno na semana?', answer: 'Sim. Você pode aceitar quantas oportunidades de diária quiser, de acordo com a sua disponibilidade.', order: 3 },
        ],
      },
    },
  })

  console.log('✅ Conteúdo padrão das landing pages (CLT e Prestador) criado com sucesso!')

  // 3. Criar Oportunidades Exemplo
  const vaga1 = await prisma.job.create({
    data: {
      title: 'Desenvolvedor Frontend React / Next.js',
      slug: 'desenvolvedor-frontend-react-nextjs-sp-01',
      company: 'Tech Solutions',
      location: 'São Paulo - SP (Híbrido)',
      type: 'CLT',
      category: 'CLT',
      salary: 'R$ 7.000,00 - R$ 9.000,00',
      benefits: 'Vale-refeição, Vale-transporte, Plano de saúde, Plano odontológico, Gympass',
      description: `Buscamos um Desenvolvedor Frontend proativo para liderar o desenvolvimento da nossa plataforma web responsiva.

Principais responsabilidades:
- Construir interfaces modernas, limpas e acessíveis em React e Next.js.
- Otimizar performance de carregamento e experiência do usuário (SEO / Core Web Vitals).
- Colaborar diretamente com o time de UI/UX e backend.`,
      requirements: `- Experiência sólida com React, Next.js e TypeScript
- Domínio de Tailwind CSS e consumo de APIs REST
- Conhecimento em controle de versão (Git)`,
      active: true,
      createdById: adminUser.id,
      assignedUsers: {
        connect: [{ id: adminUser.id }, { id: recruiterUser.id }],
      },
    },
  })

  const vaga2 = await prisma.job.create({
    data: {
      title: 'Analista de Vendas Internas (SDR)',
      slug: 'analista-de-vendas-internas-sdr-remoto-02',
      company: 'Comercial Global',
      location: 'Remoto',
      type: 'PJ',
      category: 'PRESTADOR',
      salary: 'R$ 3.500,00 + Comissões',
      description: `Estamos expandindo nossa equipe comercial e procurando um Analista de Vendas Internas focado em prospecção qualificada de clientes B2B.

Funções:
- Qualificação de leads recebidos pelo marketing
- Agendamento de reuniões para o time de executivos de conta
- Atualização e gestão de CRM`,
      requirements: `- Experiência prévia em prospecção B2B ou atendimento ao cliente
- Boa comunicação verbal e escrita
- Facilidade com ferramentas de comunicação e CRM`,
      active: true,
      createdById: adminUser.id,
      assignedUsers: {
        connect: [{ id: adminUser.id }],
      },
    },
  })

  const vaga3 = await prisma.job.create({
    data: {
      title: 'Operador de Pavilhão Logístico',
      slug: 'operador-de-pavilhao-logistico-guarulhos-03',
      company: 'HD Serviços',
      location: 'Guarulhos - SP',
      type: 'Diária',
      category: 'PRESTADOR',
      salary: 'R$ 150,00 - R$ 180,00 por diária',
      description: `Rotina operacional em um dos maiores centros logísticos da região, com atividades de separação, conferência e movimentação de mercadorias.

O que você vai fazer:
- Separação e conferência de pedidos
- Movimentação de mercadorias dentro do pavilhão
- Apoio às rotinas operacionais do turno`,
      requirements: `- Maior de 18 anos
- Documentos pessoais em dia
- Disponibilidade para rotinas operacionais`,
      active: true,
      createdById: adminUser.id,
      assignedUsers: {
        connect: [{ id: adminUser.id }, { id: recruiterUser.id }],
      },
    },
  })

  // 4. Criar Candidatos Exemplo para Oportunidade 1
  await prisma.candidate.createMany({
    data: [
      {
        name: 'Carlos Eduardo Silva',
        whatsapp: '(11) 98765-4321',
        jobId: vaga1.id,
        notes: 'Excelente perfil no GitHub. Agendada primeira conversa.',
        status: 'ENTREVISTA',
        createdAt: new Date(Date.now() - 86400000 * 2), // 2 dias atrás
      },
      {
        name: 'Mariana Oliveira',
        whatsapp: '(21) 99123-4567',
        jobId: vaga1.id,
        notes: 'Aguardando validação do teste técnico.',
        status: 'EM_ANALISE',
        createdAt: new Date(Date.now() - 86400000 * 1), // 1 dia atrás
      },
      {
        name: 'Lucas Ferreira',
        whatsapp: '(31) 97890-1234',
        jobId: vaga2.id,
        notes: 'Candidatura recebida pelo anúncio do Instagram.',
        status: 'NOVO',
        createdAt: new Date(),
      },
      {
        name: 'Patricia Nascimento',
        whatsapp: '(11) 96543-2109',
        jobId: vaga3.id,
        notes: 'Cadastro enviado pelo anúncio do Instagram, aguardando ativação.',
        status: 'NOVO',
        createdAt: new Date(),
      },
    ],
  })

  console.log('✅ Dados de exemplo semeados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
