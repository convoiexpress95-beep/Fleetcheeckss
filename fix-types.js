import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const mobileAppDir = process.argv[2] || 'c:\\Users\\mahdi\\OneDrive\\Documents\\app-syncer-main\\mobile-app';

const files = [
  'src\\screens\\MarketplaceScreen.tsx',
  'src\\screens\\FacturationScreen.tsx'
];

files.forEach(file => {
  const filePath = join(mobileAppDir, file);
  console.log(`Correction des types dans ${file}...`);
  
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Correction des paramètres onChangeText
    content = content.replace(/onChangeText=\{(\w+) => /g, 'onChangeText={(text: string) => ');
    content = content.replace(/onChangeText=\{\(text\) =>/g, 'onChangeText={(text: string) =>');
    
    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} corrigé`);
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${file}:`, error.message);
  }
});

console.log('Correction des types terminée !');