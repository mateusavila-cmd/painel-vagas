const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Inicializando o banco de dados SQLite com o Prisma...');

try {
  const projectDir = path.resolve(__dirname, '..');

  console.log('1. Gerando o Prisma Client...');
  execSync('npx prisma generate', { cwd: projectDir, stdio: 'inherit' });

  console.log('\n2. Aplicando migrations versionadas no SQLite (prisma/dev.db)...');
  execSync('npx prisma migrate deploy', { cwd: projectDir, stdio: 'inherit' });

  console.log('\n3. Semeando dados iniciais e usuário Admin...');
  execSync('npx ts-node --compiler-options "{\\"module\\":\\"CommonJS\\"}" prisma/seed.ts', { cwd: projectDir, stdio: 'inherit' });

  console.log('\n✅ Banco de Dados SQLite criado e alimentado com sucesso!');
} catch (error) {
  console.error('\n❌ Erro ao configurar banco de dados. Certifique-se de ter executado "npm install" primeiro.');
  process.exit(1);
}
