const fs = require('fs');
const https = require('https');

// Leggi i file SVG
const svg192 = fs.readFileSync('icon-192.svg', 'utf8');
const svg512 = fs.readFileSync('icon-512.svg', 'utf8');

// Usa un servizio online per convertire SVG a PNG
// Alternativa: usa sharp o canvas se disponibili

console.log('✅ File SVG creati!');
console.log('');
console.log('Per convertire in PNG, puoi:');
console.log('1. Aprire icon-192.svg e icon-512.svg in un browser');
console.log('2. Fare screenshot o usare un tool online come:');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('   - https://svgtopng.com/');
console.log('');
console.log('Oppure installare sharp: npm install sharp');
