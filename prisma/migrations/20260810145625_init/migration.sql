-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'RECRUITER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'CLT',
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "salary" TEXT,
    "benefits" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "approvalStatus" TEXT NOT NULL DEFAULT 'APROVADA',
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Job_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "whatsappContactedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobId" TEXT NOT NULL,
    CONSTRAINT "Candidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LandingContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroBadgeLabel" TEXT,
    "trustBadge1" TEXT,
    "trustBadge2" TEXT,
    "ctaHeaderLabel" TEXT NOT NULL,
    "ctaPrimaryLabel" TEXT NOT NULL,
    "ctaSecondaryLabel" TEXT NOT NULL,
    "sectionSobreTitle" TEXT,
    "sectionRequisitosTitle" TEXT,
    "sectionBeneficiosTitle" TEXT,
    "resumoTitle" TEXT,
    "sobreTitle" TEXT,
    "preRequisitosTitle" TEXT,
    "vantagensTitle" TEXT,
    "comoFuncionaTitle" TEXT,
    "depoimentosTitle" TEXT,
    "faqTitle" TEXT,
    "safetyNote" TEXT,
    "responseTimeTitle" TEXT,
    "responseTimeText" TEXT,
    "ctaFinalTitle" TEXT,
    "ctaFinalSubtitle" TEXT,
    "closedTitle" TEXT NOT NULL,
    "closedMessage" TEXT NOT NULL,
    "closedFooterNote" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "LandingFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LandingFeature_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "LandingContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LandingStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LandingStep_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "LandingContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LandingTestimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LandingTestimonial_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "LandingContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LandingFaq" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LandingFaq_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "LandingContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AssignedJobs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AssignedJobs_A_fkey" FOREIGN KEY ("A") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AssignedJobs_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LandingContent_category_key" ON "LandingContent"("category");

-- CreateIndex
CREATE UNIQUE INDEX "_AssignedJobs_AB_unique" ON "_AssignedJobs"("A", "B");

-- CreateIndex
CREATE INDEX "_AssignedJobs_B_index" ON "_AssignedJobs"("B");

