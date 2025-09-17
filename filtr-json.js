const fs = require('fs');
const path = require('path');

// Získání argumentů z příkazové řádky
const [inputFile, outputFile] = process.argv.slice(2);

if (!inputFile || !outputFile) {
  const scriptName = path.basename(__filename);
  console.error(`Použití: node ${scriptName} vstup.json výstup.json`);
  process.exit(1);
}

try {
  // Načtení a parsování vstupního souboru
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  if (!Array.isArray(data)) {
    throw new Error('Vstupní soubor musí obsahovat pole objektů.');
  }

  // Odstranění klíčů z každého objektu
  const cleanedData = data.map(obj => {
    const { ['Autor']: _, ['Informace o zdroji a kontaktní osoba']: __, ...rest } = obj;
    return rest;
  });

  // Zápis do výstupního souboru
  fs.writeFileSync(outputFile, JSON.stringify(cleanedData, null, 2), 'utf8');
  console.log(`Hotovo! Výsledek byl uložen do ${outputFile}`);
} catch (err) {
  console.error('Chyba:', err.message);
  process.exit(1);
}
