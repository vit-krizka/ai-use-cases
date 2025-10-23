const nunjucks = require('nunjucks');
const { format } = require('date-fns');
const fs = require('fs');
const path = require('path');

// Vstupní a výstupní složky
const inputDir = 'templates';
const outputDir = '.';
// Nastavení šablonového adresáře
const env = nunjucks.configure('templates', { autoescape: true });

env.addFilter('date', function(dateInput, formatStr) {
  const date = dateInput === 'now' ? new Date() : new Date(dateInput);
  return format(date, formatStr);
});

env.addGlobal('menuLink', function(name, url, output) {
    if(url === output)
        return `<li><a href="${url}" aria-current="page">${name}</a></li>`;
    return `<li><a href="${url}">${name}</a></li>`;
});

// Projdi všechny soubory v adresáři templates
fs.readdirSync(inputDir).forEach(file => {
  if (path.extname(file) === '.njk') {
    const templatePath = path.join(inputDir, file);
    const outputFilename = path.basename(file, '.njk') + '.html';
    const outputPath = path.join(outputDir, outputFilename);

    // Data pro šablonu
    const data = {
        output: outputFilename
    };

    // Vykresli a ulož
    const rendered = nunjucks.render(file, data);
    fs.writeFileSync(outputPath, rendered);
    console.log(`Vygenerováno: ${outputFilename}`);
  }
});
