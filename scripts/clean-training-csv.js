const fs = require('fs');

const path = 'client/src/data/training_data.csv';
let content = fs.readFileSync(path, 'utf8');

// Replace verified_correction entries that have boilerplate wording
const lines = content.split(/\r?\n/);
const updated = lines.map((line, idx) => {
  if (idx === 0) return line;
  if (!line.trim()) return line;

  // Remove boilerplate like "Canine presenting with...", "Feline presenting with...", "Equine presenting with..."
  let cleaned = line
    .replace(/Canine presenting with 2-day history of lethargy, anorexia, acute vomiting, and diarrhea/g, "Dog lethargic, not eating, vomiting, and diarrhea for 2 days")
    .replace(/Canine presenting with acute vomiting, diarrhea, lethargy, and anorexia for 48 hours/g, "Dog vomiting, diarrhea, lethargic, and anorexic for 48 hours")
    .replace(/Feline presenting with stranguria, vocalization, and hematuria with frequent unproductive posturing in litter box/g, "Cat straining in litter box, crying, hematuria, and small drops of urine")
    .replace(/Male feline presenting with severe stranguria, dysuria, vocalization in litter box, suspected acute urethral obstruction/g, "Male cat blocked, cannot pee, crying in litter box")
    .replace(/Equine presenting with acute severe colic, persistent ground-pawing, rolling, diaphoresis, and spontaneous nasogastric reflux/g, "Horse pawing ground, rolling, sweating, and reflux through nostril")
    .replace(/Equine presenting with violent colic, rolling, flank kicking, and absent borborygmi on abdominal auscultation/g, "Horse violent colic, rolling, kicking at abdomen, no gut sounds")
    .replace(/Canine juvenile presenting with acute severe hematochezia, projectile vomiting, profound lethargy, and dehydration/g, "Puppy with severe bloody diarrhea, projectile vomiting, dehydrated, and depressed")
    .replace(/Canine juvenile presenting with suspected viral enteritis: hemorrhagic diarrhea, vomiting, marked lethargy, and anorexia/g, "Pup with parvo signs, bloody diarrhea, vomiting, lethargy, and anorexia")
    .replace(/[A-Za-z]+ presenting with (?:acute )?/g, "")
    .replace(/[A-Za-z]+ presenting following /g, "Following ");

  return cleaned;
});

fs.writeFileSync(path, updated.join('\n'), 'utf8');
fs.writeFileSync('client/public/training_data.csv', updated.join('\n'), 'utf8');
console.log('Cleaned training_data.csv and public/training_data.csv');

