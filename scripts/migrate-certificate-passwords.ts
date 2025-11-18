/**
 * Script de migração: Converte senhas de certificado de bcrypt para AES-256-CBC
 * 
 * ATENÇÃO: Este script DEVE ser executado ANTES de usar o novo sistema de criptografia
 * 
 * Problema: As senhas dos certificados foram armazenadas com bcrypt (hash unidirecional)
 * Solução: Como não é possível descriptografar bcrypt, este script:
 * 1. Lista todas as empresas com certificado cadastrado
 * 2. Instrui o administrador a re-fazer o upload dos certificados
 * 
 * Uso:
 * npm run ts-node scripts/migrate-certificate-passwords.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando empresas com certificado digital...\n');

  const companies = await prisma.company.findMany({
    where: {
      certificadoDigitalPath: {
        not: null,
      },
    },
    select: {
      id: true,
      numero: true,
      razaoSocial: true,
      nomeFantasia: true,
      certificadoDigitalPath: true,
      certificadoDigitalSenha: true,
    },
  });

  if (companies.length === 0) {
    console.log('✅ Nenhuma empresa com certificado encontrada. Nada a fazer.');
    return;
  }

  console.log(`📋 Encontradas ${companies.length} empresa(s) com certificado:\n`);

  for (const company of companies) {
    console.log(`  • ${company.razaoSocial || company.nomeFantasia} (${company.numero})`);
    console.log(`    ID: ${company.id}`);
    console.log(`    Certificado: ${company.certificadoDigitalPath}`);
  }

  console.log('\n⚠️  AÇÃO NECESSÁRIA:');
  console.log('\nDevido à mudança no sistema de criptografia (bcrypt → AES-256-CBC),');
  console.log('é necessário RE-FAZER o upload dos certificados digitais para todas');
  console.log('as empresas listadas acima.\n');
  console.log('Instruções:');
  console.log('1. Acesse o sistema como administrador');
  console.log('2. Para cada empresa listada, faça upload do certificado A1 novamente');
  console.log('3. Use o endpoint: POST /companies/{id}/certificate');
  console.log('4. Envie o arquivo .pfx e a senha do certificado\n');

  console.log('💡 Alternativa automática (se você tem acesso às senhas):');
  console.log('Você pode limpar os certificados atuais executando:\n');
  console.log('   await prisma.company.updateMany({');
  console.log('     where: { certificadoDigitalPath: { not: null } },');
  console.log('     data: {');
  console.log('       certificadoDigitalSenha: null,');
  console.log('     }');
  console.log('   });\n');
  console.log('Isso forçará o re-upload dos certificados no próximo uso.\n');

  // Opcionalmente, você pode automatizar a limpeza:
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('Deseja limpar as senhas agora? (s/N): ', async (answer: string) => {
    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
      console.log('\n🔄 Limpando senhas dos certificados...');
      
      const result = await prisma.company.updateMany({
        where: {
          certificadoDigitalSenha: {
            not: null,
          },
        },
        data: {
          certificadoDigitalSenha: null,
        },
      });

      console.log(`✅ ${result.count} senha(s) limpa(s) com sucesso!`);
      console.log('Os certificados precisarão ser re-enviados com a senha correta.\n');
    } else {
      console.log('\n❌ Operação cancelada. As senhas permanecerão no banco.');
      console.log('Faça o re-upload manualmente quando necessário.\n');
    }

    readline.close();
    await prisma.$disconnect();
  });
}

main()
  .catch((error) => {
    console.error('❌ Erro ao executar migração:', error);
    process.exit(1);
  });
