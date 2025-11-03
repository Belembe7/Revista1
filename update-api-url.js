/**
 * Script para atualizar a URL da API no frontend/App.js
 * 
 * Uso:
 *   node update-api-url.js "https://seu-backend.onrender.com"
 *   node update-api-url.js "http://localhost:8000"  (para desenvolvimento local)
 */

const fs = require('fs');
const path = require('path');

// Obter a URL da linha de comando
const newApiUrl = process.argv[2];

if (!newApiUrl) {
  console.error('❌ Erro: URL da API não fornecida!');
  console.log('\n📝 Uso:');
  console.log('   node update-api-url.js "https://seu-backend.onrender.com"');
  console.log('   node update-api-url.js "http://localhost:8000"');
  process.exit(1);
}

// Validar URL básica
try {
  new URL(newApiUrl);
} catch (e) {
  console.error('❌ Erro: URL inválida!');
  console.log('   Exemplo válido: https://seu-backend.onrender.com');
  process.exit(1);
}

// Caminho do arquivo App.js
const appJsPath = path.join(__dirname, 'frontend', 'App.js');

if (!fs.existsSync(appJsPath)) {
  console.error('❌ Erro: frontend/App.js não encontrado!');
  process.exit(1);
}

// Ler o arquivo
let content = fs.readFileSync(appJsPath, 'utf8');

// Padrões para encontrar a linha da API_BASE_URL
const patterns = [
  // Padrão 1: const API_BASE_URL = '...'
  /const\s+API_BASE_URL\s*=\s*['"`][^'"`]+['"`];?\s*\/\/.*/g,
  // Padrão 2: const API_BASE_URL = ...
  /const\s+API_BASE_URL\s*=\s*['"`][^'"`]+['"`];?/g,
];

let updated = false;

// Tentar substituir usando os padrões
for (const pattern of patterns) {
  if (pattern.test(content)) {
    content = content.replace(pattern, (match) => {
      // Extrair o comentário se existir
      const commentMatch = match.match(/\/\/.*$/);
      const comment = commentMatch ? commentMatch[0] : '';
      
      // Determinar se usa aspas simples, duplas ou template
      const quoteChar = match.includes("'") ? "'" : match.includes('"') ? '"' : '`';
      
      // Criar nova linha
      const newLine = `const API_BASE_URL = ${quoteChar}${newApiUrl}${quoteChar};${comment ? ' ' + comment : ''}`;
      updated = true;
      return newLine;
    });
    
    if (updated) break;
  }
}

if (!updated) {
  console.error('❌ Erro: Não foi possível encontrar a linha da API_BASE_URL no arquivo!');
  console.log('   Verifique se o arquivo frontend/App.js contém:');
  console.log("   const API_BASE_URL = '...';");
  process.exit(1);
}

// Escrever o arquivo atualizado
fs.writeFileSync(appJsPath, content, 'utf8');

console.log('✅ URL da API atualizada com sucesso!');
console.log(`   Nova URL: ${newApiUrl}`);
console.log('\n📝 Próximos passos:');
console.log('   1. Reinicie o Expo: cd frontend && npm start');
console.log('   2. Ou reinicie o servidor Expo');
